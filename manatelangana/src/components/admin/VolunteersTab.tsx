'use client'
import { useState, useEffect } from 'react'
import { supabase, Volunteer } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Download } from 'lucide-react'

const STATUS_STYLES: Record<Volunteer['status'], string> = {
  new:       'bg-blue-50 text-blue-700',
  contacted: 'bg-amber-50 text-amber-700',
  active:    'bg-green-50 text-green-700',
  inactive:  'bg-slate-100 text-slate-400',
}

const ROLE_LABELS: Record<string, string> = {
  ward_data:  'Ward Data',
  activist:   'Activist',
  developer:  'Developer',
  designer:   'Designer',
  researcher: 'Researcher',
  community:  'Community',
  other:      'Other',
}

export default function VolunteersTab() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editNotes, setEditNotes] = useState<{ id: string; value: string } | null>(null)

  useEffect(() => { loadVolunteers() }, [statusFilter, roleFilter])

  async function loadVolunteers() {
    setLoading(true)
    let query = supabase.from('volunteers').select('*').order('created_at', { ascending: false })
    if (statusFilter) query = query.eq('status', statusFilter)
    if (roleFilter) query = (query as any).contains('roles', [roleFilter])
    const { data, error } = await query
    if (error) toast.error('Failed to load volunteers')
    else setVolunteers(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('volunteers').update({ status }).eq('id', id)
    if (error) toast.error('Update failed')
    else setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: status as any } : v))
  }

  async function saveNotes() {
    if (!editNotes) return
    const { error } = await supabase.from('volunteers').update({ notes: editNotes.value }).eq('id', editNotes.id)
    if (error) toast.error('Save failed')
    else {
      setVolunteers(prev => prev.map(v => v.id === editNotes.id ? { ...v, notes: editNotes.value } : v))
      setEditNotes(null)
    }
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Roles', 'Area', 'Message', 'Status', 'Notes', 'Submitted']
    const rows = volunteers.map(v => [
      v.name, v.email, v.phone || '', v.roles.join('; '), v.area || '',
      (v.message || '').replace(/[\n,]/g, ' '), v.status, (v.notes || '').replace(/[\n,]/g, ' '),
      new Date(v.created_at).toLocaleDateString('en-IN'),
    ])
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `volunteers-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const counts = volunteers.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: 'Total',     value: volunteers.length,      cls: 'text-slate-700' },
          { label: 'New',       value: counts.new || 0,        cls: 'text-blue-600' },
          { label: 'Contacted', value: counts.contacted || 0,  cls: 'text-amber-600' },
          { label: 'Active',    value: counts.active || 0,     cls: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-2 text-center min-w-[80px]">
            <div className={`text-xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          {['new', 'contacted', 'active', 'inactive'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="filter-select">
          <option value="">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Name', 'Email / Phone', 'Roles', 'Area', 'Message', 'Status', 'Notes', 'Date'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Loading volunteers…</td></tr>
              ) : volunteers.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No volunteers yet</td></tr>
              ) : volunteers.map(v => (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 font-medium text-slate-800 whitespace-nowrap">{v.name}</td>
                  <td className="px-3 py-3">
                    <div className="text-slate-700">{v.email}</div>
                    {v.phone && <div className="text-slate-400">{v.phone}</div>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.roles.map(r => (
                        <span key={r} className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                          {ROLE_LABELS[r] || r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-500 max-w-[100px] truncate">{v.area || '—'}</td>
                  <td className="px-3 py-3 text-slate-500 max-w-[180px]">
                    {v.message ? (
                      <span title={v.message} className="line-clamp-2 cursor-help">{v.message}</span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={v.status}
                      onChange={e => updateStatus(v.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${STATUS_STYLES[v.status]}`}
                    >
                      {['new', 'contacted', 'active', 'inactive'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 max-w-[160px]">
                    {editNotes?.id === v.id ? (
                      <div className="flex gap-1">
                        <input
                          autoFocus
                          value={editNotes.value}
                          onChange={e => setEditNotes({ id: v.id, value: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter') saveNotes(); if (e.key === 'Escape') setEditNotes(null) }}
                          onBlur={saveNotes}
                          className="bg-white border border-green-400 rounded px-1.5 py-0.5 text-xs text-slate-700 w-full focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span
                        className="text-slate-500 cursor-pointer hover:text-green-600 transition-colors line-clamp-2"
                        onClick={() => setEditNotes({ id: v.id, value: v.notes || '' })}
                        title="Click to add notes"
                      >
                        {v.notes || <span className="text-slate-300 italic">Add note…</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-400 whitespace-nowrap font-mono">
                    {new Date(v.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
