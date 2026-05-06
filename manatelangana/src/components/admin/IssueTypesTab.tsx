'use client'
import { useState, useEffect } from 'react'
import { supabase, IssueType } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Check, X } from 'lucide-react'

type EditCell = { id: string; field: string } | null

const EMPTY_NEW: Omit<IssueType, 'id'> = {
  slug: '', name_en: '', name_te: '', emoji: '', description: '', sort_order: 0, is_active: true,
}

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

    const { error } = await supabase.from('issue_types').update({ [field]: parsed }).eq('id', id)
    if (error) toast.error('Save failed')
    else {
      setTypes(prev => prev.map(t => t.id === id ? { ...t, [field]: parsed } : t))
    }
    setEditCell(null)
  }

  async function toggleActive(type: IssueType) {
    const { error } = await supabase
      .from('issue_types')
      .update({ is_active: !type.is_active })
      .eq('id', type.id)
    if (error) toast.error('Update failed')
    else setTypes(prev => prev.map(t => t.id === type.id ? { ...t, is_active: !t.is_active } : t))
  }

  async function addType() {
    if (!newType.slug || !newType.name_en || !newType.emoji) {
      toast.error('Slug, name, and emoji are required')
      return
    }
    const { error } = await supabase.from('issue_types').insert({
      slug: newType.slug.toLowerCase().replace(/\s+/g, '-'),
      name_en: newType.name_en,
      name_te: newType.name_te,
      emoji: newType.emoji,
      description: newType.description,
      sort_order: newType.sort_order,
      is_active: true,
    })
    if (error) toast.error('Add failed: ' + error.message)
    else {
      toast.success('Issue type added')
      setAdding(false)
      setNewType({ ...EMPTY_NEW })
      loadTypes()
    }
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
        className="bg-[#0f1f0f] border border-green-700 text-[#9ab89a] text-xs rounded px-1.5 py-0.5 w-full focus:outline-none"
      />
    )
  }

  function EditableCell({ typeId, field, value, numeric }: { typeId: string; field: string; value: string | number; numeric?: boolean }) {
    const isEditing = editCell?.id === typeId && editCell?.field === field
    if (isEditing) return <CellInput field={field} numeric={numeric} />
    return (
      <span
        className="cursor-pointer hover:text-green-400 transition-colors"
        onClick={() => startEdit(typeId, field, String(value))}
        title="Click to edit"
      >
        {value || <span className="text-[#3d5a3d] italic">—</span>}
      </span>
    )
  }

  const cols = ['Emoji', 'Name (EN)', 'Name (TE)', 'Slug', 'Order', 'Active', '']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[#5a7a5a]">
          {types.length} issue types · click any cell to edit · Enter to save · Esc to cancel
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs bg-green-800 hover:bg-green-700 text-green-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={14} /> Add Issue Type
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2d442d] bg-[#1e2e1e]">
                {cols.map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[#5a7a5a] uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="border-b border-green-900 bg-green-950/20">
                  {(['emoji', 'name_en', 'name_te', 'slug', 'sort_order'] as const).map(field => (
                    <td key={field} className="px-3 py-2">
                      <input
                        type={field === 'sort_order' ? 'number' : 'text'}
                        placeholder={field}
                        value={(newType as any)[field]}
                        onChange={e => setNewType(prev => ({ ...prev, [field]: field === 'sort_order' ? parseInt(e.target.value) || 0 : e.target.value }))}
                        className="bg-[#0f1f0f] border border-green-700 text-[#9ab89a] text-xs rounded px-1.5 py-0.5 w-full focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-green-400">Active</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button onClick={addType} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                      <button onClick={() => { setAdding(false); setNewType({ ...EMPTY_NEW }) }} className="text-[#5a7a5a] hover:text-red-400"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#5a7a5a]">Loading...</td></tr>
              ) : types.map(t => (
                <tr key={t.id} className={`border-b border-[#1e2e1e] hover:bg-[#1a2a1a] transition-colors ${!t.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-xl">
                    <EditableCell typeId={t.id} field="emoji" value={t.emoji} />
                  </td>
                  <td className="px-4 py-3 text-[#9ab89a]">
                    <EditableCell typeId={t.id} field="name_en" value={t.name_en} />
                  </td>
                  <td className="px-4 py-3 text-[#9ab89a] te">
                    <EditableCell typeId={t.id} field="name_te" value={t.name_te} />
                  </td>
                  <td className="px-4 py-3 text-[#5a7a5a] font-mono">
                    <EditableCell typeId={t.id} field="slug" value={t.slug} />
                  </td>
                  <td className="px-4 py-3 text-[#9ab89a] w-16">
                    <EditableCell typeId={t.id} field="sort_order" value={t.sort_order} numeric />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(t)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        t.is_active ? 'bg-green-900/40 text-green-400 hover:bg-green-900/60' : 'bg-[#2d442d] text-[#5a7a5a] hover:bg-[#3d5a3d]'
                      }`}
                    >
                      {t.is_active ? 'Active' : 'Inactive'}
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
