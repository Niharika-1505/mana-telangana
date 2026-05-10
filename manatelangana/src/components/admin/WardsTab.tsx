'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase, Ward } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, Download, Check, X } from 'lucide-react'

type EditCell = { wardId: string; field: string } | null

const WARD_FIELDS: { key: keyof Omit<Ward, 'id' | 'district'>; label: string; numeric?: boolean }[] = [
  { key: 'ward_number',    label: 'Ward #',        numeric: true },
  { key: 'ward_name_en',   label: 'Name (EN)' },
  { key: 'ward_name_te',   label: 'Name (TE)' },
  { key: 'mandal_en',      label: 'Mandal' },
  { key: 'mandal_te',      label: 'Mandal (TE)' },
  { key: 'constituency_en',label: 'Constituency' },
  { key: 'mla_name',       label: 'MLA Name' },
  { key: 'mla_party',      label: 'MLA Party' },
  { key: 'mp_name',        label: 'MP Name' },
  { key: 'mp_constituency',label: 'MP Constituency' },
  { key: 'lat',            label: 'Lat',           numeric: true },
  { key: 'lng',            label: 'Lng',           numeric: true },
]

const EMPTY_NEW = WARD_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {} as Record<string, string>)

const inputCls = 'bg-white border border-slate-200 text-slate-700 text-xs rounded px-1.5 py-0.5 w-full min-w-[70px] focus:outline-none focus:border-green-500'

export default function WardsTab() {
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(false)
  const [editCell, setEditCell] = useState<EditCell>(null)
  const [editValue, setEditValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [newWard, setNewWard] = useState({ ...EMPTY_NEW })
  const csvRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadWards() }, [])

  async function loadWards() {
    setLoading(true)
    const { data } = await supabase.from('wards').select('*').order('ward_number')
    setWards(data || [])
    setLoading(false)
  }

  function startEdit(wardId: string, field: string, value: any) {
    setEditCell({ wardId, field })
    setEditValue(value == null ? '' : String(value))
  }

  async function saveEdit() {
    if (!editCell) return
    const { wardId, field } = editCell
    const fieldDef = WARD_FIELDS.find(f => f.key === field)
    let parsed: any = editValue
    if (fieldDef?.numeric) parsed = editValue === '' ? null : parseFloat(editValue)
    if (field === 'ward_number') parsed = parseInt(editValue)

    const res = await fetch('/api/admin/wards/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wards: [{ id: wardId, [field]: parsed }] }),
    })
    if (!res.ok) toast.error('Save failed')
    else setWards(prev => prev.map(w => w.id === wardId ? { ...w, [field]: parsed } : w))
    setEditCell(null)
  }

  async function deleteWard(ward: Ward) {
    const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('ward_id', ward.id)
    const warningMsg = (count || 0) > 0
      ? `Ward "${ward.ward_name_en}" has ${count} report(s). Deleting will orphan those reports. Continue?`
      : `Delete ward "${ward.ward_name_en}"?`
    if (!window.confirm(warningMsg)) return
    const res = await fetch('/api/admin/wards/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ward.id }),
    })
    if (!res.ok) toast.error('Delete failed')
    else { toast.success('Ward deleted'); setWards(prev => prev.filter(w => w.id !== ward.id)) }
  }

  async function addWard() {
    if (!newWard.ward_number || !newWard.ward_name_en) {
      toast.error('Ward number and English name are required')
      return
    }
    const res = await fetch('/api/admin/wards/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wards: [{
        ward_number: parseInt(newWard.ward_number), ward_name_en: newWard.ward_name_en,
        ward_name_te: newWard.ward_name_te, mandal_en: newWard.mandal_en, mandal_te: newWard.mandal_te,
        constituency_en: newWard.constituency_en, mla_name: newWard.mla_name, mla_party: newWard.mla_party,
        mp_name: newWard.mp_name, mp_constituency: newWard.mp_constituency,
        lat: newWard.lat ? parseFloat(newWard.lat) : null,
        lng: newWard.lng ? parseFloat(newWard.lng) : null,
        district: 'Nalgonda',
      }] }),
    })
    if (!res.ok) { const d = await res.json(); toast.error('Add failed: ' + (d.error || res.status)) }
    else { toast.success('Ward added'); setAdding(false); setNewWard({ ...EMPTY_NEW }); loadWards() }
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const text = await file.text()
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) { toast.error('CSV must have a header row and at least one data row'); return }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const required = ['ward_number', 'ward_name_en', 'mandal_en', 'constituency_en', 'mla_name', 'mla_party', 'mp_name', 'mp_constituency']
    const missing = required.filter(c => !headers.includes(c))
    if (missing.length > 0) { toast.error('Missing columns: ' + missing.join(', ')); return }
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {} as Record<string, string>)
    })
    const rows = records.map(r => ({
      ward_number: parseInt(r.ward_number), ward_name_en: r.ward_name_en, ward_name_te: r.ward_name_te || '',
      mandal_en: r.mandal_en, mandal_te: r.mandal_te || '', constituency_en: r.constituency_en,
      mla_name: r.mla_name, mla_party: r.mla_party, mp_name: r.mp_name, mp_constituency: r.mp_constituency,
      lat: r.lat ? parseFloat(r.lat) : null, lng: r.lng ? parseFloat(r.lng) : null, district: 'Nalgonda',
    }))
    const res = await fetch('/api/admin/wards/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wards: rows }),
    })
    if (!res.ok) { const d = await res.json(); toast.error('Upload failed: ' + (d.error || res.status)) }
    else { toast.success(`${rows.length} wards uploaded`); loadWards() }
  }

  function downloadTemplate() {
    const headers = WARD_FIELDS.map(f => f.key).join(',')
    const example = '1,Nalgonda Ward 1,నల్గొండ వార్డు 1,Nalgonda,నల్గొండ,Nalgonda,MLA Name,INC,MP Name,Nalgonda,17.0575,79.2667'
    const csv = `${headers}\n${example}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'wards-template.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  function EditableCell({ ward, field }: { ward: Ward; field: typeof WARD_FIELDS[number] }) {
    const isEditing = editCell?.wardId === ward.id && editCell?.field === field.key
    const value = (ward as any)[field.key]

    if (isEditing) {
      return (
        <input
          autoFocus
          type={field.numeric ? 'number' : 'text'}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
          onBlur={saveEdit}
          className={`${inputCls} min-w-[80px]`}
          step={field.numeric && field.key !== 'ward_number' ? 'any' : undefined}
        />
      )
    }
    return (
      <span
        className="cursor-pointer hover:text-green-600 transition-colors whitespace-nowrap"
        onClick={() => startEdit(ward.id, field.key as string, value)}
        title="Click to edit"
      >
        {value != null && value !== '' ? String(value) : <span className="text-slate-300 italic">—</span>}
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm text-slate-400">
          {wards.length} wards · click any cell to edit · Enter to save · Esc to cancel
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors">
            <Download size={13} /> CSV Template
          </button>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
            <Upload size={13} /> Upload CSV
            <input ref={csvRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={14} /> Add Ward
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {WARD_FIELDS.map(f => (
                  <th key={f.key} className="px-3 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="border-b border-green-200 bg-green-50">
                  {WARD_FIELDS.map(f => (
                    <td key={f.key} className="px-2 py-2">
                      <input
                        type={f.numeric ? 'number' : 'text'}
                        placeholder={f.label}
                        value={newWard[f.key as string]}
                        onChange={e => setNewWard(prev => ({ ...prev, [f.key]: e.target.value }))}
                        step={f.numeric && f.key !== 'ward_number' ? 'any' : undefined}
                        className={inputCls}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button onClick={addWard} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                      <button onClick={() => { setAdding(false); setNewWard({ ...EMPTY_NEW }) }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan={WARD_FIELDS.length + 1} className="px-4 py-8 text-center text-slate-400">Loading wards…</td></tr>
              ) : wards.map(ward => (
                <tr key={ward.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {WARD_FIELDS.map(field => (
                    <td key={field.key} className={`px-3 py-2.5 text-slate-700 ${field.key === 'ward_name_te' || field.key === 'mandal_te' ? 'te' : ''}`}>
                      <EditableCell ward={ward} field={field} />
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => deleteWard(ward)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
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
