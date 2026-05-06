'use client'
import { useEffect, useState } from 'react'
import { supabase, Ward, IssueType } from '@/lib/supabase'
import Header from '@/components/shared/Header'
import ReportsTab from '@/components/admin/ReportsTab'
import WardsTab from '@/components/admin/WardsTab'
import IssueTypesTab from '@/components/admin/IssueTypesTab'
import { BarChart3, Map, Tag, LogOut, Loader2 } from 'lucide-react'

type Tab = 'reports' | 'wards' | 'issues'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('reports')
  const [wards, setWards] = useState<Ward[]>([])
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])

  useEffect(() => {
    fetch('/api/admin/check')
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
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthed(true)
        loadSharedData()
      } else {
        alert('Wrong password')
      }
    } finally {
      setLoginLoading(false)
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
    setPassword('')
  }

  if (checkingAuth) {
    return (
      <>
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-green-400" size={32} />
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
            <h1 className="text-xl font-bold mb-2">Admin Dashboard</h1>
            <p className="te text-sm text-[#5a7a5a] mb-6">నిర్వాహకుల డాష్‌బోర్డ్</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Admin password"
              className="w-full bg-[#1e2e1e] border border-[#2d442d] text-[#9ab89a] px-3 py-2.5 rounded-xl text-sm mb-3 focus:outline-none focus:border-green-700"
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
    { id: 'reports', label: 'Reports',     icon: <BarChart3 size={16} /> },
    { id: 'wards',   label: 'Wards',       icon: <Map size={16} /> },
    { id: 'issues',  label: 'Issue Types', icon: <Tag size={16} /> },
  ]

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-green-400" size={24} />
            Admin Dashboard
            <span className="te text-base text-[#5a7a5a] font-normal">· నిర్వాహకుల డాష్‌బోర్డ్</span>
          </h1>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-[#5a7a5a] hover:text-red-400 border border-[#2d442d] hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 border-b border-[#2d442d]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-[#5a7a5a] hover:text-[#9ab89a]'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'reports' && <ReportsTab wards={wards} issueTypes={issueTypes} />}
        {activeTab === 'wards'   && <WardsTab />}
        {activeTab === 'issues'  && <IssueTypesTab />}
      </main>
    </>
  )
}
