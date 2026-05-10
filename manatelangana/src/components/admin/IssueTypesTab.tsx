'use client'
import { useState, useEffect } from 'react'
import { supabase, IssueType } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Check, X } from 'lucide-react'

type EditCell = { id: string; field: string } | null

const EMPTY_NEW: Omit<IssueType, 'id'> = {
  slug: '', name_en: '', name_te: '', emoji: '', description: '', sort_order: 0, is_active: true,
}

const inputCls = 'bg-white border border-slate-200 text-slate-700 text-xs rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-green-500'

export default function IssueTypesTab() {
  const [types, setTypes] = useState<IssueType[]>([])
  const [loading, setLoading] = useState(false)
  const [editCell, setEditCell] = useState<EditCell>(null)
  const [editValue, setEditValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [newType, setNewType] = useState({ ...EMPTY_NEW })

  useEffect(() => { loadTypes() }, [])

  async function loadTypes() {
    setLoading(true)
    const { data } = await supabase.from('issue_types').select('*').order('sort_order')
    setTypes(data || [])
    setLoading(false)
  }

  function startEdit(id: string, field: string, value: string) {
    setEditCell({ id, field })
    setEditValue(String(value))
  }

  async function saveEdit() {
    if (!editCell) return
    const { id, field } = editCell
    const parsed: any = field === 'sort_order' ? parseInt(editValue) || 0 : editValue

    const res = await fetch('/api/admin/issue-types/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: parsed }),
    })
    if (!res.ok) toast.error('Save failed')
    else setTypes(prev => prev.map(t => t.id === id ? { ...t, [field]: parsed } : t))
    setEditCell(null)
  }

  async function toggleActive(type: IssueType) {
    const res = await fetch('/api/admin/issue-types/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: type.id, is_active: !type.is_active }),
    })
    if (!res.ok) toast.error('Update failed')
    else setTypes(prev => prev.map(t => t.id === type.id ? { ...t, is_active: !t.is_active } : t))
  }

  async function addType() {
    if (!newType.slug || !newType.name_en || !newType.emoji) {
      toast.error('Slug, name, and emoji are required')
      return
    }
    const res = await fetch('/api/admin/issue-types/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: newType.slug.toLowerCase().replace(/\s+/g, '-'),
        name_en: newType.name_en, name_te: newType.name_te, emoji: newType.emoji,
        description: newType.description, sort_order: newType.sort_order, is_active: true,
      }),
    })
    if (!res.ok) { const d = await res.json(); toast.error('Add failed: ' + (d.error || res.status)) }
    else { toast.success('Issue type added'); setAdding(false); setNewType({ ...EMPTY_NEW }); loadTypes() }
  }

  function CellInput({ field, numeric }: { field: string; numeric?: boolean }) {
    if (editCell?.field !== field) return null
    return (
      <input
        autoFocus
        type={numeric ? 'number' : 'text'}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditCell(null) }}
        onBlur={saveEdit}
        className={inputCls}
      />
    )
  }

  function EditableCell({ typeId, field, value, numeric }: { typeId: string; field: string; value: string | number; numeric?: boolean }) {
    const isEditing = editCell?.id === typeId && editCell?.field === field
    if (isEditing) return <CellInput field={field} numeric={numeric} />
    return (
      <span
        className="cursor-pointer hover:text-green-600 transition-colors"
        onClick={() => startEdit(typeId, field, String(value))}
        title="Click to edit"
      >
        {value || <span className="text-slate-300 italic">—</span>}
      </span>
    )
  }

  const cols = ['Emoji', 'Name (EN)', 'Name (TE)', 'Slug', 'Order', 'Active', '']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-400">
          {types.length} issue types · click any cell to edit · Enter to save · Esc to cancel
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={14} /> Add Issue Type
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {cols.map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="border-b border-green-200 bg-green-50">
                  {(['emoji', 'name_en', 'name_te', 'slug', 'sort_order'] as const).map(field => (
                    <td key={field} className="px-3 py-2">
                      <input
                        type={field === 'sort_order' ? 'number' : 'text'}
                        placeholder={field}
                        value={(newType as any)[field]}
                        onChange={e => setNewType(prev => ({ ...prev, [field]: field === 'sort_order' ? parseInt(e.target.value) || 0 : e.target.value }))}
                        className={inputCls}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-green-600 font-medium">Active</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button onClick={addType} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                      <button onClick={() => { setAdding(false); setNewType({ ...EMPTY_NEW }) }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : types.map(tp => (
                <tr key={tp.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!tp.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-xl">
                    <EditableCell typeId={tp.id} field="emoji" value={tp.emoji} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <EditableCell typeId={tp.id} field="name_en" value={tp.name_en} />
                  </td>
                  <td className="px-4 py-3 text-slate-700 te">
                    <EditableCell typeId={tp.id} field="name_te" value={tp.name_te} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">
                    <EditableCell typeId={tp.id} field="slug" value={tp.slug} />
                  </td>
                  <td className="px-4 py-3 text-slate-700 w-16">
                    <EditableCell typeId={tp.id} field="sort_order" value={tp.sort_order} numeric />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(tp)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        tp.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {tp.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
