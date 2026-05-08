'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Check, X, Search, Users } from 'lucide-react'

type MLA = {
  id: string
  name_en: string
  name_te: string | null
  party: string | null
  constituency_en: string
  constituency_te: string | null
  assembly_seat_number: number | null
  phone: string | null
  email: string | null
  mp_id: string | null
  is_active: boolean
}

type MPOption = {
  id: string
  name_en: string
  constituency_en: string
}

const PARTIES = ['INC', 'BJP', 'BRS', 'AIMIM', 'TDP', 'IND', 'Other']

const PARTY_CLS: Record<string, string> = {
  INC: 'bg-green-100 text-green-800', BJP: 'bg-orange-100 text-orange-800',
  BRS: 'bg-pink-100 text-pink-800',   AIMIM: 'bg-emerald-100 text-emerald-800',
}

function PartyBadge({ party }: { party: string | null }) {
  if (!party) return <span className="text-slate-300 italic">—</span>
  const cls = PARTY_CLS[party] || 'bg-gray-100 text-gray-600'
  return <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cls}`}>{party}</span>
}

const FIELDS: { key: keyof MLA; label: string; numeric?: boolean; isParty?: boolean; isMp?: boolean; isTe?: boolean }[] = [
  { key: 'name_en',              label: 'Name (EN)' },
  { key: 'name_te',              label: 'Name (TE)',         isTe: true },
  { key: 'party',                label: 'Party',             isParty: true },
  { key: 'constituency_en',      label: 'Constituency (EN)' },
  { key: 'constituency_te',      label: 'Constituency (TE)', isTe: true },
  { key: 'assembly_seat_number', label: 'Assembly #',        numeric: true },
  { key: 'mp_id',                label: 'MP',                isMp: true },
  { key: 'phone',                label: 'Phone' },
  { key: 'email',                label: 'Email' },
]

const EMPTY = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {} as Record<string, string>)
const inputCls = 'bg-white border border-slate-200 text-slate-700 text-xs rounded px-1.5 py-0.5 focus:outline-none focus:border-green-500'

export default function MlasTab() {
  const [mlas, setMlas]               = useState<MLA[]>([])
  const [mpOptions, setMpOptions]     = useState<MPOption[]>([])
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({})
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [partyFilter, setPartyFilter] = useState('')
  const [mpFilter, setMpFilter]       = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editCell, setEditCell]       = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue]     = useState('')
  const [adding, setAdding]           = useState(false)
  const [newMla, setNewMla]           = useState({ ...EMPTY })
  const [deleteConfirm, setDeleteConfirm] = useState<MLA | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkParty, setBulkParty]     = useState('')
  const [showBulkPanel, setShowBulkPanel] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: mlaData }, { data: mpData }, { data: wardData }, { data: reportData }] = await Promise.all([
      supabase.from('mla').select('*').order('constituency_en'),
      supabase.from('mp').select('id, name_en, constituency_en').order('constituency_en'),
      supabase.from('wards').select('id, mla_id'),
      supabase.from('reports').select('ward_id'),
    ])
    setMlas(mlaData || [])
    setMpOptions(mpData || [])

    // Build mla_id → report count map
    const wardsByMla: Record<string, string[]> = {}
    for (const w of wardData || []) {
      if (w.mla_id) {
        if (!wardsByMla[w.mla_id]) wardsByMla[w.mla_id] = []
        wardsByMla[w.mla_id].push(w.id)
      }
    }
    const reportsByWard: Record<string, number> = {}
    for (const r of reportData || []) {
      reportsByWard[r.ward_id] = (reportsByWard[r.ward_id] || 0) + 1
    }
    const counts: Record<string, number> = {}
    for (const [mlaId, wardIds] of Object.entries(wardsByMla)) {
      counts[mlaId] = wardIds.reduce((sum, wid) => sum + (reportsByWard[wid] || 0), 0)
    }
    setReportCounts(counts)
    setLoading(false)
  }

  function startEdit(id: string, field: string, value: any) {
    setEditCell({ id, field })
    setEditValue(value == null ? '' : String(value))
  }

  async function saveEdit() {
    if (!editCell) return
    const { id, field } = editCell
    const f = FIELDS.find(x => x.key === field)
    let val: any = editValue.trim() || null
    if (f?.numeric) val = editValue === '' ? null : parseInt(editValue)
    if (f?.isMp) val = editValue || null
    const { error } = await supabase.from('mla').update({ [field]: val }).eq('id', id)
    if (error) toast.error('Save failed')
    else { toast.success('MLA updated'); setMlas(p => p.map(m => m.id === id ? { ...m, [field]: val } : m)) }
    setEditCell(null)
  }

  async function toggleActive(mla: MLA) {
    const { error } = await supabase.from('mla').update({ is_active: !mla.is_active }).eq('id', mla.id)
    if (error) { toast.error('Update failed'); return }
    setMlas(p => p.map(m => m.id === mla.id ? { ...m, is_active: !mla.is_active } : m))
    toast.success(mla.is_active ? 'MLA deactivated' : 'MLA reactivated')
  }

  async function addMla() {
    if (!newMla.name_en?.trim() || !newMla.constituency_en?.trim()) {
      toast.error('Name (EN) and Constituency are required'); return
    }
    const { error } = await supabase.from('mla').insert({
      name_en: newMla.name_en.trim(), name_te: newMla.name_te || null,
      party: newMla.party || null, constituency_en: newMla.constituency_en.trim(),
      constituency_te: newMla.constituency_te || null,
      assembly_seat_number: newMla.assembly_seat_number ? parseInt(newMla.assembly_seat_number) : null,
      mp_id: newMla.mp_id || null,
      phone: newMla.phone || null, email: newMla.email || null,
    })
    if (error) { toast.error('Add failed: ' + error.message); return }
    toast.success('MLA added successfully')
    setAdding(false); setNewMla({ ...EMPTY }); load()
  }

  async function deactivateInstead(mla: MLA) {
    const { error } = await supabase.from('mla').update({ is_active: false }).eq('id', mla.id)
    if (error) { toast.error('Update failed'); return }
    setMlas(p => p.map(m => m.id === mla.id ? { ...m, is_active: false } : m))
    toast.success('MLA deactivated'); setDeleteConfirm(null)
  }

  async function confirmDelete(mla: MLA) {
    const { error } = await supabase.from('mla').delete().eq('id', mla.id)
    if (error) { toast.error('Delete failed: ' + error.message); return }
    setMlas(p => p.filter(m => m.id !== mla.id))
    toast.success('MLA deleted'); setDeleteConfirm(null)
  }

  async function applyBulkParty() {
    if (!bulkParty || selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const { error } = await supabase.from('mla').update({ party: bulkParty }).in('id', ids)
    if (error) { toast.error('Bulk update failed'); return }
    setMlas(p => p.map(m => selectedIds.has(m.id) ? { ...m, party: bulkParty } : m))
    toast.success(`Party updated for ${ids.length} MLAs`)
    setSelectedIds(new Set()); setShowBulkPanel(false); setBulkParty('')
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(m => m.id)))
    }
  }

  const parties = Array.from(new Set(mlas.map(m => m.party).filter(Boolean) as string[]))
  const filtered = mlas.filter(m => {
    if (!showInactive && !m.is_active) return false
    if (partyFilter && m.party !== partyFilter) return false
    if (mpFilter && m.mp_id !== mpFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return m.name_en.toLowerCase().includes(s) || m.constituency_en.toLowerCase().includes(s)
    }
    return true
  })

  const mpName = (mpId: string | null) => {
    if (!mpId) return null
    return mpOptions.find(m => m.id === mpId)?.name_en ?? null
  }

  return (
    <div>
      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-slate-900 mb-2">Delete MLA?</h3>
            <p className="text-sm text-slate-500 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.name_en}</strong>?
              Consider deactivating instead to preserve accountability history.
            </p>
            <div className="flex gap-2 mb-2">
              <button onClick={() => deactivateInstead(deleteConfirm)}
                className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:border-amber-400 text-slate-700 transition-colors">
                Deactivate instead
              </button>
              <button onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete permanently
              </button>
            </div>
            <button onClick={() => setDeleteConfirm(null)} className="w-full text-xs text-slate-400 hover:text-slate-600 py-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or constituency…" className="filter-select pl-7 text-xs w-56" />
        </div>
        <select value={partyFilter} onChange={e => setPartyFilter(e.target.value)} className="filter-select">
          <option value="">All Parties</option>
          {parties.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={mpFilter} onChange={e => setMpFilter(e.target.value)} className="filter-select">
          <option value="">All MPs</option>
          {mpOptions.map(mp => <option key={mp.id} value={mp.id}>{mp.name_en} ({mp.constituency_en})</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
          Show inactive
        </label>
        <span className="text-xs text-slate-400 flex-1">{filtered.length} MLAs · click any cell to edit</span>
        {selectedIds.size >= 2 && (
          <button onClick={() => setShowBulkPanel(p => !p)}
            className="flex items-center gap-1.5 text-xs border border-slate-200 hover:border-green-400 text-slate-600 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors">
            <Users size={13} /> Bulk party ({selectedIds.size})
          </button>
        )}
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={14} /> Add New MLA
        </button>
      </div>

      {showBulkPanel && selectedIds.size >= 2 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-xs text-green-800 font-medium">{selectedIds.size} MLAs selected — set party:</span>
          <select value={bulkParty} onChange={e => setBulkParty(e.target.value)} className="filter-select text-xs">
            <option value="">Pick party…</option>
            {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={applyBulkParty} disabled={!bulkParty}
            className="text-xs bg-green-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
            Apply
          </button>
          <button onClick={() => { setShowBulkPanel(false); setSelectedIds(new Set()) }}
            className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2.5 w-8">
                  <input type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll} />
                </th>
                {FIELDS.map(f => (
                  <th key={f.key} className="px-3 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">Reports</th>
                <th className="px-3 py-2.5 text-center text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">Active</th>
                <th className="px-3 py-2.5 w-8" />
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="border-b border-green-200 bg-green-50">
                  <td />
                  {FIELDS.map(f => (
                    <td key={f.key} className="px-2 py-2">
                      {f.isParty ? (
                        <select value={newMla[f.key] || ''} onChange={e => setNewMla(p => ({ ...p, [f.key]: e.target.value }))}
                          className={`${inputCls} w-full`}>
                          <option value="">Party</option>
                          {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      ) : f.isMp ? (
                        <select value={newMla[f.key] || ''} onChange={e => setNewMla(p => ({ ...p, [f.key]: e.target.value }))}
                          className={`${inputCls} w-full min-w-[120px]`}>
                          <option value="">— MP —</option>
                          {mpOptions.map(mp => <option key={mp.id} value={mp.id}>{mp.name_en}</option>)}
                        </select>
                      ) : (
                        <input type={f.numeric ? 'number' : 'text'} placeholder={f.label}
                          value={newMla[f.key] || ''}
                          onChange={e => setNewMla(p => ({ ...p, [f.key]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addMla()}
                          className={`${inputCls} w-full min-w-[80px]`} />
                      )}
                    </td>
                  ))}
                  <td /><td />
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button onClick={addMla} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                      <button onClick={() => { setAdding(false); setNewMla({ ...EMPTY }) }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan={FIELDS.length + 4} className="px-4 py-10 text-center text-slate-400">Loading MLAs…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={FIELDS.length + 4} className="px-4 py-10 text-center text-slate-400">No MLAs found</td></tr>
              ) : filtered.map(mla => (
                <tr key={mla.id} className={`border-b border-slate-100 transition-colors ${mla.is_active ? 'hover:bg-slate-50' : 'opacity-50 bg-slate-50'}`}>
                  <td className="px-3 py-2.5">
                    <input type="checkbox" checked={selectedIds.has(mla.id)} onChange={() => toggleSelect(mla.id)} />
                  </td>
                  {FIELDS.map(f => {
                    const isEditing = editCell?.id === mla.id && editCell?.field === f.key
                    const val = (mla as any)[f.key]
                    return (
                      <td key={f.key} className={`px-3 py-2.5 text-slate-700 ${f.isTe ? 'te' : ''}`}>
                        {isEditing ? (
                          f.isParty ? (
                            <select autoFocus value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={saveEdit}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
                              className={`${inputCls} w-full`}>
                              <option value="">—</option>
                              {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          ) : f.isMp ? (
                            <select autoFocus value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={saveEdit}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
                              className={`${inputCls} w-full min-w-[120px]`}>
                              <option value="">— No MP —</option>
                              {mpOptions.map(mp => <option key={mp.id} value={mp.id}>{mp.name_en}</option>)}
                            </select>
                          ) : (
                            <input autoFocus type={f.numeric ? 'number' : 'text'} value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
                              onBlur={saveEdit}
                              className={`${inputCls} min-w-[80px]`} />
                          )
                        ) : (
                          <span className="cursor-pointer hover:text-green-600 transition-colors whitespace-nowrap"
                            onClick={() => startEdit(mla.id, f.key as string, val)} title="Click to edit">
                            {f.isParty ? <PartyBadge party={val} />
                              : f.isMp ? (
                                  <span className={val ? 'text-slate-700' : 'text-slate-300 italic'}>
                                    {mpName(val) ?? '—'}
                                  </span>
                                )
                              : val != null && val !== '' ? String(val) : <span className="text-slate-300 italic">—</span>}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2.5 text-right text-slate-500">
                    {reportCounts[mla.id] ?? 0}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => toggleActive(mla)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        mla.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                          : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-700'
                      }`}>
                      {mla.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setDeleteConfirm(mla)} className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors">
                      <Trash2 size={13} />
                    </button>
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
