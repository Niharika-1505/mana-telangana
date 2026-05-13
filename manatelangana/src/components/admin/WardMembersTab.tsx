'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Search, Download, Upload, Plus, Trash2, X } from 'lucide-react'

type WardRow = {
  id: string
  ward_number: number
  ward_name_en: string
  ward_name_te: string | null
  mandal_en: string | null
  constituency_en: string | null
  ward_councillor: string | null
  councillor_party: string | null
  mla_id: string | null
  mp_id: string | null
  coverage_status: string | null
}

type MLAOption = { id: string; name_en: string; constituency_en: string }
type MPOption  = { id: string; name_en: string; constituency_en: string }

const COVERAGE_OPTIONS = [
  { value: 'live',         label: '✅ Live' },
  { value: 'coming_soon',  label: '🔄 Coming Soon' },
  { value: 'requested',    label: '📋 Requested' },
]

const PARTIES = ['INC', 'BJP', 'BRS', 'AIMIM', 'TDP', 'IND', 'Other']

const inputCls = 'bg-white border border-slate-200 text-slate-700 text-xs rounded px-1.5 py-0.5 focus:outline-none focus:border-green-500'

const EMPTY_WARD = {
  ward_number: '',
  ward_name_en: '',
  ward_name_te: '',
  mandal_en: '',
  constituency_en: '',
  ward_councillor: '',
  councillor_party: '',
  councillor_phone: '',
  coverage_status: 'live',
  mla_id: '',
  mp_id: '',
}

// ─── Cell is defined outside WardMembersTab so React sees a stable component
// type on every render, preventing the unmount/remount cycle that made
// click-to-edit silently fail.
type EditableField = 'ward_councillor' | 'councillor_party' | 'coverage_status' | 'mla_id' | 'mp_id'

function Cell({
  ward, field,
  editCell, editValue,
  mlaOptions, mpOptions,
  startEdit, setEditValue, saveEdit, cancelEdit,
}: {
  ward: WardRow
  field: EditableField
  editCell: { id: string; field: string } | null
  editValue: string
  mlaOptions: MLAOption[]
  mpOptions: MPOption[]
  startEdit: (id: string, field: string, value: any) => void
  setEditValue: (v: string) => void
  saveEdit: () => void
  cancelEdit: () => void
}) {
  const isEditing = editCell?.id === ward.id && editCell?.field === field
  const val = (ward as any)[field]

  if (isEditing) {
    if (field === 'councillor_party') {
      return (
        <select autoFocus value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
          className={`${inputCls} w-full`}>
          <option value="">—</option>
          {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )
    }
    if (field === 'coverage_status') {
      return (
        <select autoFocus value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
          className={`${inputCls} w-full min-w-[110px]`}>
          <option value="">—</option>
          {COVERAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    }
    if (field === 'mla_id') {
      return (
        <select autoFocus value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
          className={`${inputCls} w-full min-w-[130px]`}>
          <option value="">— No MLA —</option>
          {mlaOptions.map(m => <option key={m.id} value={m.id}>{m.name_en} ({m.constituency_en})</option>)}
        </select>
      )
    }
    if (field === 'mp_id') {
      return (
        <select autoFocus value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
          className={`${inputCls} w-full min-w-[130px]`}>
          <option value="">— No MP —</option>
          {mpOptions.map(m => <option key={m.id} value={m.id}>{m.name_en} ({m.constituency_en})</option>)}
        </select>
      )
    }
    return (
      <input autoFocus type="text" value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
        onBlur={saveEdit}
        className={`${inputCls} min-w-[90px]`} />
    )
  }

  const display = () => {
    if (field === 'coverage_status') {
      const opt = COVERAGE_OPTIONS.find(o => o.value === val)
      return opt ? opt.label : <span className="text-slate-300 italic">—</span>
    }
    if (field === 'mla_id') {
      const name = mlaOptions.find(m => m.id === val)?.name_en ?? null
      return name ? name : <span className="text-slate-300 italic">—</span>
    }
    if (field === 'mp_id') {
      const name = mpOptions.find(m => m.id === val)?.name_en ?? null
      return name ? name : <span className="text-slate-300 italic">—</span>
    }
    return val != null && val !== '' ? String(val) : <span className="text-slate-300 italic">—</span>
  }

  return (
    <span className="cursor-pointer hover:text-green-600 transition-colors whitespace-nowrap"
      onClick={() => startEdit(ward.id, field, val)} title="Click to edit">
      {display()}
    </span>
  )
}

export default function WardMembersTab() {
  const [wards, setWards]               = useState<WardRow[]>([])
  const [mlaOptions, setMlaOptions]     = useState<MLAOption[]>([])
  const [mpOptions, setMpOptions]       = useState<MPOption[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [coverageFilter, setCoverageFilter] = useState('')
  const [mlaFilter, setMlaFilter]       = useState('')
  const [editCell, setEditCell]         = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue]       = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWard, setNewWard]           = useState({ ...EMPTY_WARD })
  const [deleteConfirm, setDeleteConfirm] = useState<WardRow | null>(null)
  const csvRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: wardData }, { data: mlaData }, { data: mpData }] = await Promise.all([
      supabase.from('wards')
        .select('id, ward_number, ward_name_en, ward_name_te, mandal_en, constituency_en, ward_councillor, councillor_party, mla_id, mp_id, coverage_status')
        .order('ward_number'),
      supabase.from('mla').select('id, name_en, constituency_en').eq('is_active', true).order('constituency_en'),
      supabase.from('mp').select('id, name_en, constituency_en').eq('is_active', true).order('constituency_en'),
    ])
    setWards(wardData || [])
    setMlaOptions(mlaData || [])
    setMpOptions(mpData || [])
    setLoading(false)
  }

  function startEdit(id: string, field: string, value: any) {
    setEditCell({ id, field })
    setEditValue(value == null ? '' : String(value))
  }

  function cancelEdit() {
    setEditCell(null)
  }

  async function saveEdit() {
    if (!editCell) return
    const { id, field } = editCell
    const val = editValue.trim() || null
    const res = await fetch('/api/admin/wards/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wards: [{ id, [field]: val }] }),
    })
    if (!res.ok) toast.error('Save failed')
    else {
      toast.success('Ward updated')
      setWards(p => p.map(w => w.id === id ? { ...w, [field]: val } : w))
    }
    setEditCell(null)
  }

  async function addWard() {
    if (!newWard.ward_number || !newWard.ward_name_en.trim() || !newWard.ward_name_te.trim()) {
      toast.error('Ward number, Name (EN), and Name (TE) are required')
      return
    }
    const payload = {
      ward_number:      parseInt(newWard.ward_number),
      ward_name_en:     newWard.ward_name_en.trim(),
      ward_name_te:     newWard.ward_name_te.trim(),
      mandal_en:        newWard.mandal_en.trim() || null,
      constituency_en:  newWard.constituency_en.trim() || null,
      ward_councillor:  newWard.ward_councillor.trim() || null,
      councillor_party: newWard.councillor_party || null,
      councillor_phone: newWard.councillor_phone.trim() || null,
      coverage_status:  newWard.coverage_status || 'live',
      mla_id:           newWard.mla_id || null,
      mp_id:            newWard.mp_id || null,
    }
    const res = await fetch('/api/admin/wards/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wards: [payload] }),
    })
    if (!res.ok) { const d = await res.json(); toast.error('Add failed: ' + (d.error || res.status)); return }
    toast.success('Ward added')
    setShowAddModal(false)
    setNewWard({ ...EMPTY_WARD })
    load()
  }

  async function confirmDelete(ward: WardRow) {
    const res = await fetch('/api/admin/wards/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ward.id }),
    })
    if (!res.ok) { const d = await res.json(); toast.error('Delete failed: ' + (d.error || res.status)); return }
    setWards(p => p.filter(w => w.id !== ward.id))
    toast.success('Ward deleted')
    setDeleteConfirm(null)
  }

  function downloadTemplate() {
    const headers = 'ward_number,ward_name_en,ward_councillor,councillor_party,coverage_status'
    const example = '1,Nalgonda Ward 1,Councillor Name,INC,live'
    const csv = `${headers}\n${example}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'ward-members-template.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const text = await file.text()
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) { toast.error('CSV must have a header row and at least one data row'); return }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    if (!headers.includes('ward_number')) { toast.error('CSV must include ward_number column'); return }
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {} as Record<string, string>)
    })
    const rows: Record<string, any>[] = []
    for (const r of records) {
      const wardNum = parseInt(r.ward_number)
      if (isNaN(wardNum)) continue
      const row: Record<string, any> = { ward_number: wardNum }
      if (r.ward_councillor !== undefined) row.ward_councillor = r.ward_councillor || null
      if (r.councillor_party !== undefined) row.councillor_party = r.councillor_party || null
      if (r.coverage_status !== undefined) row.coverage_status = r.coverage_status || null
      if (Object.keys(row).length <= 1) continue
      rows.push(row)
    }
    if (rows.length === 0) { toast.error('No valid rows found in CSV'); return }
    const res = await fetch('/api/admin/wards/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wards: rows }),
    })
    if (!res.ok) { const d = await res.json(); toast.error('Upload failed: ' + (d.error || res.status)); return }
    toast.success(`${rows.length} wards updated`)
    load()
  }

  const filtered = wards.filter(w => {
    if (coverageFilter && w.coverage_status !== coverageFilter) return false
    if (mlaFilter && w.mla_id !== mlaFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        w.ward_name_en.toLowerCase().includes(s) ||
        (w.mandal_en || '').toLowerCase().includes(s) ||
        (w.ward_councillor || '').toLowerCase().includes(s)
      )
    }
    return true
  })

  const cellProps = { editCell, editValue, mlaOptions, mpOptions, startEdit, setEditValue, saveEdit, cancelEdit }

  return (
    <div>
      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-slate-900 mb-2">Delete Ward?</h3>
            <p className="text-sm text-slate-500 mb-4">
              Delete <strong>{deleteConfirm.ward_name_en}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:border-slate-400 text-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add ward modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Add Ward</h3>
              <button onClick={() => { setShowAddModal(false); setNewWard({ ...EMPTY_WARD }) }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ward Number <span className="text-red-500">*</span></label>
                <input type="number" value={newWard.ward_number}
                  onChange={e => setNewWard(p => ({ ...p, ward_number: e.target.value }))}
                  className={`${inputCls} w-full`} placeholder="e.g. 42" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Coverage Status</label>
                <select value={newWard.coverage_status}
                  onChange={e => setNewWard(p => ({ ...p, coverage_status: e.target.value }))}
                  className={`${inputCls} w-full`}>
                  {COVERAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Name (EN) <span className="text-red-500">*</span></label>
                <input type="text" value={newWard.ward_name_en}
                  onChange={e => setNewWard(p => ({ ...p, ward_name_en: e.target.value }))}
                  className={`${inputCls} w-full`} placeholder="Ward name in English" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Name (TE) <span className="text-red-500">*</span></label>
                <input type="text" value={newWard.ward_name_te}
                  onChange={e => setNewWard(p => ({ ...p, ward_name_te: e.target.value }))}
                  className={`${inputCls} w-full`} placeholder="వార్డు పేరు తెలుగులో" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Mandal</label>
                <input type="text" value={newWard.mandal_en}
                  onChange={e => setNewWard(p => ({ ...p, mandal_en: e.target.value }))}
                  className={`${inputCls} w-full`} placeholder="Mandal name" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Constituency</label>
                <input type="text" value={newWard.constituency_en}
                  onChange={e => setNewWard(p => ({ ...p, constituency_en: e.target.value }))}
                  className={`${inputCls} w-full`} placeholder="Constituency name" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ward Councillor</label>
                <input type="text" value={newWard.ward_councillor}
                  onChange={e => setNewWard(p => ({ ...p, ward_councillor: e.target.value }))}
                  className={`${inputCls} w-full`} placeholder="Councillor name" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Councillor Party</label>
                <select value={newWard.councillor_party}
                  onChange={e => setNewWard(p => ({ ...p, councillor_party: e.target.value }))}
                  className={`${inputCls} w-full`}>
                  <option value="">—</option>
                  {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Councillor Phone</label>
                <input type="text" value={newWard.councillor_phone}
                  onChange={e => setNewWard(p => ({ ...p, councillor_phone: e.target.value }))}
                  className={`${inputCls} w-full`} placeholder="Phone number" />
              </div>
              <div />
              <div>
                <label className="block text-xs text-slate-500 mb-1">Linked MLA</label>
                <select value={newWard.mla_id}
                  onChange={e => setNewWard(p => ({ ...p, mla_id: e.target.value }))}
                  className={`${inputCls} w-full`}>
                  <option value="">— None —</option>
                  {mlaOptions.map(m => <option key={m.id} value={m.id}>{m.name_en} ({m.constituency_en})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Linked MP</label>
                <select value={newWard.mp_id}
                  onChange={e => setNewWard(p => ({ ...p, mp_id: e.target.value }))}
                  className={`${inputCls} w-full`}>
                  <option value="">— None —</option>
                  {mpOptions.map(m => <option key={m.id} value={m.id}>{m.name_en} ({m.constituency_en})</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowAddModal(false); setNewWard({ ...EMPTY_WARD }) }}
                className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:border-slate-400 text-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={addWard}
                className="flex-1 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Add Ward
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ward or councillor…" className="filter-select pl-7 text-xs w-52" />
        </div>
        <select value={coverageFilter} onChange={e => setCoverageFilter(e.target.value)} className="filter-select">
          <option value="">All Coverage</option>
          {COVERAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={mlaFilter} onChange={e => setMlaFilter(e.target.value)} className="filter-select">
          <option value="">All MLAs</option>
          {mlaOptions.map(m => <option key={m.id} value={m.id}>{m.name_en}</option>)}
        </select>
        <span className="text-xs text-slate-400 flex-1">{filtered.length} wards · click any cell to edit</span>
        <button onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors">
          <Download size={13} /> CSV Template
        </button>
        <label className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
          <Upload size={13} /> Upload CSV
          <input ref={csvRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
        </label>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={14} /> Add Ward
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Ward #', 'Name (EN)', 'Name (TE)', 'Mandal', 'Constituency', 'Councillor', 'Party', 'Coverage', 'Linked MLA', 'Linked MP', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-400">Loading wards…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-400">No wards found</td></tr>
              ) : filtered.map(ward => (
                <tr key={ward.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-slate-500 font-mono">{ward.ward_number}</td>
                  <td className="px-3 py-2.5 text-slate-700">{ward.ward_name_en}</td>
                  <td className="px-3 py-2.5 text-slate-700 te">{ward.ward_name_te || <span className="text-slate-300 italic">—</span>}</td>
                  <td className="px-3 py-2.5 text-slate-700">{ward.mandal_en || <span className="text-slate-300 italic">—</span>}</td>
                  <td className="px-3 py-2.5 text-slate-700">{ward.constituency_en || <span className="text-slate-300 italic">—</span>}</td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="ward_councillor" {...cellProps} /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="councillor_party" {...cellProps} /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="coverage_status" {...cellProps} /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="mla_id" {...cellProps} /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="mp_id" {...cellProps} /></td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setDeleteConfirm(ward)}
                      className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors">
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
