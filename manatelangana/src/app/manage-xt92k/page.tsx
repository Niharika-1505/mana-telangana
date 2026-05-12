'use client'
import { useEffect, useState } from 'react'
import { supabase, Ward, IssueType } from '@/lib/supabase'
import Header from '@/components/shared/Header'
import ReportsTab from '@/components/admin/ReportsTab'
import WardsTab from '@/components/admin/WardsTab'
import IssueTypesTab from '@/components/admin/IssueTypesTab'
import VolunteersTab from '@/components/admin/VolunteersTab'
import MpsTab from '@/components/admin/MpsTab'
import MlasTab from '@/components/admin/MlasTab'
import WardMembersTab from '@/components/admin/WardMembersTab'
import ContributionsTab from '@/components/admin/ContributionsTab'
import { BarChart3, Map, Tag, LogOut, Loader2, Heart, Landmark, Users, MapPin, GitPullRequest } from 'lucide-react'

type Tab = 'reports' | 'wards' | 'issues' | 'volunteers' | 'mps' | 'mlas' | 'ward_members' | 'contributions'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('reports')
  const [wards, setWards] = useState<Ward[]>([])
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])

  useEffect(() => {
    fetch('/api/manage-xt92k/check')
      .then(r => { if (r.ok) { setAuthed(true); loadSharedData() } })
      .finally(() => setCheckingAuth(false))
  }, [])

  async function loadSharedData() {
    const [{ data: wardData }, { data: typeData }] = await Promise.all([
      supabase.from('wards').select('*').order('ward_number'),
      supabase.from('issue_types').select('*').order('sort_order'),
    ])
    if (wardData) setWards(wardData)
    if (typeData) setIssueTypes(typeData)
  }

  async function login() {
    setLoginLoading(true)
    try {
      const res = await fetch('/api/manage-xt92k/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) { setAuthed(true); loadSharedData() }
      else if (res.status === 500) alert('Server error: ADMIN_PASSWORD env var not set in Vercel.')
      else if (res.status === 429) alert('Too many attempts. Try again in 15 minutes.')
      else alert('Wrong password')
    } finally {
      setLoginLoading(false)
    }
  }

  async function logout() {
    await fetch('/api/manage-xt92k/logout', { method: 'POST' })
    setAuthed(false)
    setPassword('')
  }

  if (checkingAuth) {
    return (
      <>
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </main>
      </>
    )
  }

  if (!authed) {
    return (
      <>
        <Header />
        <main className="max-w-sm mx-auto px-4 py-20">
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="te text-sm text-slate-400 mb-6">నిర్వాహకుల డాష్‌బోర్డ్</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Admin password"
              className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl text-sm mb-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
            <button onClick={login} disabled={loginLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loginLoading && <Loader2 size={16} className="animate-spin" />}
              Login
            </button>
          </div>
        </main>
      </>
    )
  }

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: 'reports',      label: 'Reports',       icon: <BarChart3 size={16} /> },
    { id: 'wards',        label: 'Wards',         icon: <Map size={16} /> },
    { id: 'ward_members', label: 'Ward Members',  icon: <MapPin size={16} /> },
    { id: 'issues',       label: 'Issue Types',   icon: <Tag size={16} /> },
    { id: 'volunteers',   label: 'Volunteers',    icon: <Heart size={16} /> },
    { id: 'mlas',         label: 'MLAs',          icon: <Landmark size={16} /> },
    { id: 'mps',          label: 'MPs',           icon: <Users size={16} /> },
    { id: 'contributions',label: 'Contributions', icon: <GitPullRequest size={16} /> },
  ]

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-green-600" size={24} />
            Admin Dashboard
          </h1>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'reports'       && <ReportsTab wards={wards} issueTypes={issueTypes} />}
        {activeTab === 'wards'         && <WardsTab />}
        {activeTab === 'ward_members'  && <WardMembersTab />}
        {activeTab === 'issues'        && <IssueTypesTab />}
        {activeTab === 'volunteers'    && <VolunteersTab />}
        {activeTab === 'mlas'          && <MlasTab />}
        {activeTab === 'mps'           && <MpsTab />}
        {activeTab === 'contributions' && <ContributionsTab />}
      </main>
    </>
  )
}
