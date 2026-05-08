'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Search, Download, Upload } from 'lucide-react'

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

export default function WardMembersTab() {
  const [wards, setWards]         = useState<WardRow[]>([])
  const [mlaOptions, setMlaOptions] = useState<MLAOption[]>([])
  const [mpOptions, setMpOptions] = useState<MPOption[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [coverageFilter, setCoverageFilter] = useState('')
  const [mlaFilter, setMlaFilter] = useState('')
  const [editCell, setEditCell]   = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')
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

  async function saveEdit() {
    if (!editCell) return
    const { id, field } = editCell
    const val = editValue.trim() || null
    const { error } = await supabase.from('wards').update({ [field]: val }).eq('id', id)
    if (error) toast.error('Save failed')
    else {
      toast.success('Ward updated')
      setWards(p => p.map(w => w.id === id ? { ...w, [field]: val } : w))
    }
    setEditCell(null)
  }

  function mlaName(id: string | null) {
    if (!id) return null
    return mlaOptions.find(m => m.id === id)?.name_en ?? null
  }

  function mpName(id: string | null) {
    if (!id) return null
    return mpOptions.find(m => m.id === id)?.name_en ?? null
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
    let updated = 0
    for (const r of records) {
      const wardNum = parseInt(r.ward_number)
      if (isNaN(wardNum)) continue
      const update: Record<string, any> = {}
      if (r.ward_councillor !== undefined) update.ward_councillor = r.ward_councillor || null
      if (r.councillor_party !== undefined) update.councillor_party = r.councillor_party || null
      if (r.coverage_status !== undefined) update.coverage_status = r.coverage_status || null
      if (Object.keys(update).length === 0) continue
      const { error } = await supabase.from('wards').update(update).eq('ward_number', wardNum)
      if (!error) updated++
    }
    toast.success(`${updated} wards updated`)
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

  type EditableField = 'ward_councillor' | 'councillor_party' | 'coverage_status' | 'mla_id' | 'mp_id'

  function Cell({ ward, field }: { ward: WardRow; field: EditableField }) {
    const isEditing = editCell?.id === ward.id && editCell?.field === field
    const val = (ward as any)[field]

    if (isEditing) {
      if (field === 'councillor_party') {
        return (
          <select autoFocus value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
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
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
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
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
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
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
            className={`${inputCls} w-full min-w-[130px]`}>
            <option value="">— No MP —</option>
            {mpOptions.map(m => <option key={m.id} value={m.id}>{m.name_en} ({m.constituency_en})</option>)}
          </select>
        )
      }
      return (
        <input autoFocus type="text" value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
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
        const name = mlaName(val)
        return name ? name : <span className="text-slate-300 italic">—</span>
      }
      if (field === 'mp_id') {
        const name = mpName(val)
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

  return (
    <div>
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
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Ward #', 'Name (EN)', 'Name (TE)', 'Mandal', 'Constituency', 'Councillor', 'Party', 'Coverage', 'Linked MLA', 'Linked MP'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">Loading wards…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">No wards found</td></tr>
              ) : filtered.map(ward => (
                <tr key={ward.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-slate-500 font-mono">{ward.ward_number}</td>
                  <td className="px-3 py-2.5 text-slate-700">{ward.ward_name_en}</td>
                  <td className="px-3 py-2.5 text-slate-700 te">{ward.ward_name_te || <span className="text-slate-300 italic">—</span>}</td>
                  <td className="px-3 py-2.5 text-slate-700">{ward.mandal_en || <span className="text-slate-300 italic">—</span>}</td>
                  <td className="px-3 py-2.5 text-slate-700">{ward.constituency_en || <span className="text-slate-300 italic">—</span>}</td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="ward_councillor" /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="councillor_party" /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="coverage_status" /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="mla_id" /></td>
                  <td className="px-3 py-2.5 text-slate-700"><Cell ward={ward} field="mp_id" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
