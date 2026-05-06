'use client'
import { useEffect, useState } from 'react'
import { supabase, Report } from '@/lib/supabase'
import { timeAgo, STATUS_CONFIG } from '@/lib/utils'
import Header from '@/components/shared/Header'
import { BarChart3, Users, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

type AdminStats = {
  total: number; open: number; resolved: number; inProgress: number
  todayCount: number; weekCount: number
  byIssue: { name: string; emoji: string; count: number }[]
  byMandal: { mandal: string; count: number }[]
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [updating, setUpdating] = useState<string | null>(null)

  function login() {
    // Simple client-side password check (for basic protection)
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ManaTelangana@2026')) {
      setAuthed(true)
      loadData()
    } else {
      alert('Wrong password')
    }
  }

  async function loadData() {
    const [reportsRes, byIssueRes, byMandalRes] = await Promise.all([
      supabase.from('reports').select('*, wards(*), issue_types(*)').order('created_at', { ascending: false }).limit(50),
      supabase.from('reports').select('issue_type_id, issue_types(name_en, emoji)'),
      supabase.from('reports').select('ward_id, wards(mandal_en)'),
    ])

    if (reportsRes.data) {
      setReports(reportsRes.data)
      const data = reportsRes.data
      const today = new Date(); today.setHours(0,0,0,0)
      const week = new Date(); week.setDate(week.getDate() - 7)

      const issueCounts: Record<string, { name: string; emoji: string; count: number }> = {}
      byIssueRes.data?.forEach((r: any) => {
        const key = r.issue_types?.name_en || 'Unknown'
        if (!issueCounts[key]) issueCounts[key] = { name: key, emoji: r.issue_types?.emoji || '📍', count: 0 }
        issueCounts[key].count++
      })

      const mandalCounts: Record<string, number> = {}
      byMandalRes.data?.forEach((r: any) => {
        const key = r.wards?.mandal_en || 'Unknown'
        mandalCounts[key] = (mandalCounts[key] || 0) + 1
      })

      setStats({
        total: data.length,
        open: data.filter(r => r.status === 'open').length,
        resolved: data.filter(r => r.status === 'resolved').length,
        inProgress: data.filter(r => r.status === 'in_progress').length,
        todayCount: data.filter(r => new Date(r.created_at) >= today).length,
        weekCount: data.filter(r => new Date(r.created_at) >= week).length,
        byIssue: Object.values(issueCounts).sort((a, b) => b.count - a.count),
        byMandal: Object.entries(mandalCounts).map(([mandal, count]) => ({ mandal, count })).sort((a, b) => b.count - a.count),
      })
    }
  }

  async function updateStatus(reportId: string, status: string) {
    setUpdating(reportId)
    const { error } = await supabase.from('reports').update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', reportId)
    if (!error) {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: status as any } : r))
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          open: prev.open + (status === 'open' ? 1 : -1),
          resolved: prev.resolved + (status === 'resolved' ? 1 : -1),
        } : prev)
      }
    }
    setUpdating(null)
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
            <button onClick={login} className="btn-primary w-full">Login</button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="text-green-400" size={24} />
          Admin Dashboard
          <span className="te text-base text-[#5a7a5a] font-normal">· నిర్వాహకుల డాష్‌బోర్డ్</span>
        </h1>

        {stats && (
          <>
            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
              {[
                { icon: AlertCircle, label: 'Total',       val: stats.total,      color: 'text-green-400' },
                { icon: AlertCircle, label: 'Open',        val: stats.open,       color: 'text-red-400' },
                { icon: CheckCircle, label: 'Resolved',    val: stats.resolved,   color: 'text-green-400' },
                { icon: Clock,       label: 'In Progress', val: stats.inProgress, color: 'text-amber-400' },
                { icon: TrendingUp,  label: 'Today',       val: stats.todayCount, color: 'text-blue-400' },
                { icon: TrendingUp,  label: 'This Week',   val: stats.weekCount,  color: 'text-purple-400' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="stat-card">
                  <div className={`stat-num ${color}`}>{val}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* By issue + by mandal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-[#9ab89a] mb-3">Issues by Type</h3>
                <div className="space-y-2">
                  {stats.byIssue.map(i => (
                    <div key={i.name} className="flex items-center gap-2">
                      <span>{i.emoji}</span>
                      <span className="text-xs text-[#9ab89a] flex-1">{i.name}</span>
                      <div className="flex-1 bg-[#2d442d] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-green-400 h-full rounded-full" style={{ width: `${(i.count / stats.total) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-green-400 w-6 text-right">{i.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-sm font-semibold text-[#9ab89a] mb-3">Reports by Mandal</h3>
                <div className="space-y-2">
                  {stats.byMandal.map(m => (
                    <div key={m.mandal} className="flex items-center gap-2">
                      <span className="text-xs text-[#9ab89a] flex-1 truncate">{m.mandal}</span>
                      <div className="flex-1 bg-[#2d442d] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(m.count / stats.total) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-blue-400 w-6 text-right">{m.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reports table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-[#2d442d] text-sm font-semibold text-[#9ab89a]">
            All Reports — Manage Status
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2d442d] bg-[#1e2e1e]">
                  {['Time','Issue','Ward / Mandal','Severity','Status','Photo','Actions'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[#5a7a5a] uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => {
                  const status = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
                  return (
                    <tr key={r.id} className="border-b border-[#1e2e1e] hover:bg-[#1e2e1e] transition-colors">
                      <td className="px-4 py-3 font-mono text-[#5a7a5a] whitespace-nowrap">{timeAgo(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <span>{(r.issue_types as any)?.emoji} {(r.issue_types as any)?.name_en}</span>
                      </td>
                      <td className="px-4 py-3 text-[#9ab89a]">
                        <div>{(r.wards as any)?.ward_name_en}</div>
                        <div className="text-[#5a7a5a]">{(r.wards as any)?.mandal_en}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={r.severity === 'high' ? 'text-red-400' : r.severity === 'medium' ? 'text-amber-400' : 'text-green-400'}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                          <span className={status?.color}>{status?.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.photo_url && (
                          <a href={r.photo_url} target="_blank" className="text-green-400 hover:underline">View</a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          disabled={updating === r.id}
                          onChange={e => updateStatus(r.id, e.target.value)}
                          className="bg-[#1e2e1e] border border-[#2d442d] text-[#9ab89a] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-green-700"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
