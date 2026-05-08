'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Check, X, Search } from 'lucide-react'

type MP = {
  id: string
  name_en: string
  name_te: string | null
  party: string | null
  constituency_en: string
  constituency_te: string | null
  lok_sabha_seat_number: number | null
  phone: string | null
  email: string | null
  is_active: boolean
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

const FIELDS: { key: keyof MP; label: string; numeric?: boolean; isParty?: boolean; isTe?: boolean }[] = [
  { key: 'name_en',               label: 'Name (EN)' },
  { key: 'name_te',               label: 'Name (TE)',         isTe: true },
  { key: 'party',                 label: 'Party',             isParty: true },
  { key: 'constituency_en',       label: 'Constituency (EN)' },
  { key: 'constituency_te',       label: 'Constituency (TE)', isTe: true },
  { key: 'lok_sabha_seat_number', label: 'Lok Sabha #',       numeric: true },
  { key: 'phone',                 label: 'Phone' },
  { key: 'email',                 label: 'Email' },
]

const EMPTY = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {} as Record<string, string>)
const inputCls = 'bg-white border border-slate-200 text-slate-700 text-xs rounded px-1.5 py-0.5 focus:outline-none focus:border-green-500'

export default function MpsTab() {
  const [mps, setMps]               = useState<MP[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [partyFilter, setPartyFilter] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editCell, setEditCell]     = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue]   = useState('')
  const [adding, setAdding]         = useState(false)
  const [newMp, setNewMp]           = useState({ ...EMPTY })
  const [deleteConfirm, setDeleteConfirm] = useState<MP | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('mp').select('*').order('constituency_en')
    setMps(data || [])
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
    const { error } = await supabase.from('mp').update({ [field]: val }).eq('id', id)
    if (error) toast.error('Save failed')
    else { toast.success('MP updated'); setMps(p => p.map(m => m.id === id ? { ...m, [field]: val } : m)) }
    setEditCell(null)
  }

  async function toggleActive(mp: MP) {
    const { error } = await supabase.from('mp').update({ is_active: !mp.is_active }).eq('id', mp.id)
    if (error) { toast.error('Update failed'); return }
    setMps(p => p.map(m => m.id === mp.id ? { ...m, is_active: !mp.is_active } : m))
    toast.success(mp.is_active ? 'MP deactivated' : 'MP reactivated')
  }

  async function addMp() {
    if (!newMp.name_en?.trim() || !newMp.constituency_en?.trim()) {
      toast.error('Name (EN) and Constituency are required'); return
    }
    const { error } = await supabase.from('mp').insert({
      name_en: newMp.name_en.trim(), name_te: newMp.name_te || null,
      party: newMp.party || null, constituency_en: newMp.constituency_en.trim(),
      constituency_te: newMp.constituency_te || null,
      lok_sabha_seat_number: newMp.lok_sabha_seat_number ? parseInt(newMp.lok_sabha_seat_number) : null,
      phone: newMp.phone || null, email: newMp.email || null,
    })
    if (error) { toast.error('Add failed: ' + error.message); return }
    toast.success('MP added successfully')
    setAdding(false); setNewMp({ ...EMPTY }); load()
  }

  async function deactivateInstead(mp: MP) {
    const { error } = await supabase.from('mp').update({ is_active: false }).eq('id', mp.id)
    if (error) { toast.error('Update failed'); return }
    setMps(p => p.map(m => m.id === mp.id ? { ...m, is_active: false } : m))
    toast.success('MP deactivated'); setDeleteConfirm(null)
  }

  async function confirmDelete(mp: MP) {
    const { error } = await supabase.from('mp').delete().eq('id', mp.id)
    if (error) { toast.error('Delete failed: ' + error.message); return }
    setMps(p => p.filter(m => m.id !== mp.id))
    toast.success('MP deleted'); setDeleteConfirm(null)
  }

  const parties = Array.from(new Set(mps.map(m => m.party).filter(Boolean) as string[]))
  const filtered = mps.filter(m => {
    if (!showInactive && !m.is_active) return false
    if (partyFilter && m.party !== partyFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return m.name_en.toLowerCase().includes(s) || m.constituency_en.toLowerCase().includes(s)
    }
    return true
  })

  return (
    <div>
      {/* Delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-slate-900 mb-2">Delete MP?</h3>
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
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
          Show inactive
        </label>
        <span className="text-xs text-slate-400 flex-1">{filtered.length} MPs · click any cell to edit</span>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={14} /> Add New MP
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {FIELDS.map(f => (
                  <th key={f.key} className="px-3 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">Active</th>
                <th className="px-3 py-2.5 w-8" />
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="border-b border-green-200 bg-green-50">
                  {FIELDS.map(f => (
                    <td key={f.key} className="px-2 py-2">
                      {f.isParty ? (
                        <select value={newMp[f.key] || ''} onChange={e => setNewMp(p => ({ ...p, [f.key]: e.target.value }))}
                          className={`${inputCls} w-full`}>
                          <option value="">Party</option>
                          {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      ) : (
                        <input type={f.numeric ? 'number' : 'text'} placeholder={f.label}
                          value={newMp[f.key] || ''}
                          onChange={e => setNewMp(p => ({ ...p, [f.key]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addMp()}
                          className={`${inputCls} w-full min-w-[80px]`} />
                      )}
                    </td>
                  ))}
                  <td />
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button onClick={addMp} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                      <button onClick={() => { setAdding(false); setNewMp({ ...EMPTY }) }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan={FIELDS.length + 2} className="px-4 py-10 text-center text-slate-400">Loading MPs…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={FIELDS.length + 2} className="px-4 py-10 text-center text-slate-400">No MPs found</td></tr>
              ) : filtered.map(mp => (
                <tr key={mp.id} className={`border-b border-slate-100 transition-colors ${mp.is_active ? 'hover:bg-slate-50' : 'opacity-50 bg-slate-50'}`}>
                  {FIELDS.map(f => {
                    const isEditing = editCell?.id === mp.id && editCell?.field === f.key
                    const val = (mp as any)[f.key]
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
                          ) : (
                            <input autoFocus type={f.numeric ? 'number' : 'text'} value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
                              onBlur={saveEdit}
                              className={`${inputCls} min-w-[80px]`} />
                          )
                        ) : (
                          <span className="cursor-pointer hover:text-green-600 transition-colors whitespace-nowrap"
                            onClick={() => startEdit(mp.id, f.key as string, val)} title="Click to edit">
                            {f.isParty ? <PartyBadge party={val} />
                              : val != null && val !== '' ? String(val) : <span className="text-slate-300 italic">—</span>}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => toggleActive(mp)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        mp.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                          : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-700'
                      }`}>
                      {mp.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setDeleteConfirm(mp)} className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors">
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
