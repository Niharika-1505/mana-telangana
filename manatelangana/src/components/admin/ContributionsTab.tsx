'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Check, X, Search, ChevronDown } from 'lucide-react'

type Contribution = {
  id: string
  ward_number: number | null
  ward_name_en: string | null
  mandal_en: string | null
  municipality_en: string | null
  district_en: string | null
  state_en: string | null
  councillor_name: string | null
  councillor_party: string | null
  contributor_fingerprint: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
}

const STATUS_CLS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${STATUS_CLS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export default function ContributionsTab() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<string>('pending')
  const [expandedId, setExpandedId]       = useState<string | null>(null)
  const [editingNotes, setEditingNotes]   = useState<string | null>(null)
  const [notesValue, setNotesValue]       = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('ward_contributions')
      .select('*')
      .order('created_at', { ascending: false })
    setContributions(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const path = status === 'approved'
      ? '/api/admin/contributions/approve'
      : '/api/admin/contributions/reject'
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) { toast.error('Update failed'); return }
    setContributions(p => p.map(c => c.id === id ? { ...c, status } : c))
    toast.success(`Contribution ${status}`)
  }

  async function saveNotes(id: string) {
    const res = await fetch('/api/admin/contributions/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, admin_notes: notesValue.trim() || null }),
    })
    if (!res.ok) { toast.error('Save failed'); return }
    setContributions(p => p.map(c => c.id === id ? { ...c, admin_notes: notesValue.trim() || null } : c))
    toast.success('Notes saved')
    setEditingNotes(null)
  }

  const pendingCount = contributions.filter(c => c.status === 'pending').length

  const filtered = contributions.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        (c.ward_name_en || '').toLowerCase().includes(s) ||
        (c.mandal_en || '').toLowerCase().includes(s) ||
        (c.councillor_name || '').toLowerCase().includes(s) ||
        (c.district_en || '').toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ward, mandal, councillor…" className="filter-select pl-7 text-xs w-56" />
        </div>
        <div className="flex gap-1">
          {['pending', 'approved', 'rejected', ''].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === s
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-700'
              }`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'pending' && pendingCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 flex-1">{filtered.length} contributions</span>
      </div>

      {filtered.length === 0 && !loading ? (
        <div className="card p-10 text-center text-slate-400 text-sm">
          {statusFilter === 'pending' ? 'No pending contributions — all caught up!' : 'No contributions found'}
        </div>
      ) : (
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/6" />
                  <div className="h-4 bg-slate-100 rounded w-1/5" />
                </div>
              </div>
            ))
          ) : filtered.map(c => {
            const isExpanded = expandedId === c.id
            const isEditingThisNote = editingNotes === c.id
            return (
              <div key={c.id} className="card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {c.ward_number && (
                          <span className="text-xs font-mono text-slate-400">Ward {c.ward_number}</span>
                        )}
                        <span className="text-sm font-medium text-slate-800">
                          {c.ward_name_en || <span className="text-slate-400 italic">No ward name</span>}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        {c.mandal_en && <span>{c.mandal_en} Mandal</span>}
                        {c.district_en && <span>{c.district_en}</span>}
                        {c.councillor_name && (
                          <span className="text-slate-700">
                            Councillor: <strong>{c.councillor_name}</strong>
                            {c.councillor_party && <span className="ml-1 text-slate-400">({c.councillor_party})</span>}
                          </span>
                        )}
                      </div>
                      {c.admin_notes && !isEditingThisNote && (
                        <div className="mt-1.5 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
                          📝 {c.admin_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {c.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(c.id, 'approved')}
                            className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg transition-colors">
                            <Check size={12} /> Approve
                          </button>
                          <button onClick={() => updateStatus(c.id, 'rejected')}
                            className="flex items-center gap-1 text-xs border border-red-200 hover:bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg transition-colors">
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}
                      {c.status !== 'pending' && (
                        <button onClick={() => updateStatus(c.id, c.status === 'approved' ? 'rejected' : 'approved')}
                          className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-2 py-1.5 rounded-lg transition-colors">
                          {c.status === 'approved' ? 'Undo approve' : 'Undo reject'}
                        </button>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg border border-slate-200 transition-colors">
                        <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      <div><span className="text-slate-400">Municipality:</span> <span className="text-slate-700">{c.municipality_en || '—'}</span></div>
                      <div><span className="text-slate-400">State:</span> <span className="text-slate-700">{c.state_en || '—'}</span></div>
                      <div><span className="text-slate-400">Submitted:</span> <span className="text-slate-700">{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                      <div><span className="text-slate-400">Fingerprint:</span> <span className="font-mono text-slate-500">{c.contributor_fingerprint?.slice(0, 12) ?? '—'}…</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Admin notes</div>
                      {isEditingThisNote ? (
                        <div className="flex gap-2">
                          <input autoFocus type="text" value={notesValue}
                            onChange={e => setNotesValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveNotes(c.id); if (e.key === 'Escape') setEditingNotes(null) }}
                            placeholder="Add a note…"
                            className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-green-500" />
                          <button onClick={() => saveNotes(c.id)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors">
                            Save
                          </button>
                          <button onClick={() => setEditingNotes(null)}
                            className="text-xs text-slate-400 hover:text-slate-600">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingNotes(c.id); setNotesValue(c.admin_notes || '') }}
                          className="text-xs text-green-700 hover:underline">
                          {c.admin_notes ? 'Edit note' : '+ Add note'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
