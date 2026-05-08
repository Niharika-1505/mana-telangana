'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase, Report, Ward, IssueType } from '@/lib/supabase'
import { timeAgo, STATUS_CONFIG } from '@/lib/utils'
import ReportDetailPanel from './ReportDetailPanel'
import toast from 'react-hot-toast'
import {
  Search, Download, Trash2, ChevronLeft, ChevronRight,
  Copy, FlaskConical, CheckSquare, Square, Flag,
} from 'lucide-react'

const PAGE_SIZE = 25

interface Props {
  wards: Ward[]
  issueTypes: IssueType[]
}

export default function ReportsTab({ wards, issueTypes }: Props) {
  const [allReports, setAllReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [mandalFilter, setMandalFilter] = useState('')
  const [issueFilter, setIssueFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [showTest, setShowTest] = useState(false)
  const [showReporterFixed, setShowReporterFixed] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailReport, setDetailReport] = useState<Report | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [bulkStatus, setBulkStatus] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const mandals = useMemo(() => Array.from(new Set(wards.map(w => w.mandal_en))).sort(), [wards])

  useEffect(() => {
    let cancelled = false
    async function fetchReports() {
      setLoading(true)
      try {
        let query = supabase
          .from('reports')
          .select('*, wards(*), issue_types(*)')
          .order('created_at', { ascending: false })

        if (statusFilter) query = query.eq('status', statusFilter)
        if (severityFilter) query = query.eq('severity', severityFilter)
        if (issueFilter) query = query.eq('issue_type_id', issueFilter)
        if (!showTest) query = (query as any).eq('is_test', false)
        if (showReporterFixed) query = (query as any).not('reporter_says_fixed_at', 'is', null)

        if (mandalFilter) {
          const ids = wards.filter(w => w.mandal_en === mandalFilter).map(w => w.id)
          query = ids.length > 0 ? query.in('ward_id', ids) : (query as any).eq('ward_id', '00000000-0000-0000-0000-000000000000')
        }

        const { data, error } = await query
        if (cancelled) return
        if (error) throw error
        setAllReports(data || [])
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || ''
          if (msg.includes('is_test')) toast.error('Run migration 002 in Supabase to enable test data filter')
          else toast.error('Failed to load reports')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReports()
    setPage(0)
    setSelectedIds(new Set())
    return () => { cancelled = true }
  }, [statusFilter, mandalFilter, issueFilter, severityFilter, showTest, showReporterFixed, refreshKey, wards])

  useEffect(() => { setPage(0) }, [search])

  const filteredReports = useMemo(() => {
    if (!search.trim()) return allReports
    const s = search.toLowerCase()
    return allReports.filter(r =>
      (r.description || '').toLowerCase().includes(s) ||
      (r.landmark || '').toLowerCase().includes(s) ||
      ((r.wards as any)?.ward_name_en || '').toLowerCase().includes(s)
    )
  }, [allReports, search])

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE)
  const pageReports = filteredReports.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const allPageSelected = pageReports.length > 0 && pageReports.every(r => selectedIds.has(r.id))

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allPageSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(pageReports.map(r => r.id)))
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('reports').update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) toast.error('Update failed')
    else setAllReports(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r))
  }

  async function deleteReport(id: string) {
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) toast.error('Delete failed')
    else { toast.success('Report deleted'); setConfirmDeleteId(null); setRefreshKey(k => k + 1) }
  }

  async function markDuplicate(id: string) {
    const q: any = supabase.from('reports')
    const { error } = await q.update({
      is_duplicate: true, status: 'rejected',
      resolution_note: 'Marked as duplicate', updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) toast.error('Failed — run migration 002 first')
    else { toast.success('Marked as duplicate'); setRefreshKey(k => k + 1) }
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Permanently delete ${selectedIds.size} report(s)?`)) return
    const { error } = await supabase.from('reports').delete().in('id', Array.from(selectedIds))
    if (error) toast.error('Bulk delete failed')
    else { toast.success(`${selectedIds.size} reports deleted`); setSelectedIds(new Set()); setRefreshKey(k => k + 1) }
  }

  async function bulkUpdateStatus() {
    if (!bulkStatus || selectedIds.size === 0) return
    const { error } = await supabase.from('reports').update({
      status: bulkStatus,
      resolved_at: bulkStatus === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).in('id', Array.from(selectedIds))
    if (error) toast.error('Bulk update failed')
    else { toast.success(`${selectedIds.size} reports → ${bulkStatus}`); setSelectedIds(new Set()); setBulkStatus(''); setRefreshKey(k => k + 1) }
  }

  async function deleteAllTestData() {
    if (!window.confirm('Delete ALL test submissions permanently?')) return
    const q: any = supabase.from('reports')
    const { error } = await q.delete().eq('is_test', true)
    if (error) toast.error('Failed — run migration 002 first')
    else { toast.success('All test data deleted'); setRefreshKey(k => k + 1) }
  }

  function exportCSV() {
    const headers = ['ID', 'Status', 'Is Test', 'Is Duplicate', 'Issue Type', 'Ward', 'Mandal', 'Severity', 'Description', 'Landmark', 'Lat', 'Lng', 'Upvotes', 'Created At', 'Resolved At']
    const rows = filteredReports.map(r => [
      r.id, r.status,
      (r as any).is_test ? 'Yes' : 'No',
      (r as any).is_duplicate ? 'Yes' : 'No',
      (r.issue_types as any)?.name_en || '',
      (r.wards as any)?.ward_name_en || '',
      (r.wards as any)?.mandal_en || '',
      r.severity,
      (r.description || '').replace(/[\n,]/g, ' '),
      (r.landmark || '').replace(/,/g, ' '),
      r.lat ?? '', r.lng ?? '', r.upvotes, r.created_at, r.resolved_at || '',
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  return (
    <div>
      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search description, landmark, ward..."
            className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          {['open', 'in_progress', 'resolved', 'rejected', 'inactive'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={mandalFilter} onChange={e => setMandalFilter(e.target.value)} className="filter-select">
          <option value="">All Mandals</option>
          {mandals.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={issueFilter} onChange={e => setIssueFilter(e.target.value)} className="filter-select">
          <option value="">All Issues</option>
          {issueTypes.map(tp => <option key={tp.id} value={tp.id}>{tp.emoji} {tp.name_en}</option>)}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="filter-select">
          <option value="">All Severity</option>
          {['low', 'medium', 'high'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Second row: test toggle + bulk + export */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={showTest} onChange={e => setShowTest(e.target.checked)} className="accent-green-600" />
            <FlaskConical size={13} className="text-amber-500" />
            Show test submissions
          </label>
          {showTest && (
            <button
              onClick={deleteAllTestData}
              className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition-colors"
            >
              Bulk delete test data
            </button>
          )}
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={showReporterFixed} onChange={e => setShowReporterFixed(e.target.checked)} className="accent-green-600" />
            <Flag size={13} className="text-green-500" />
            Reporter says fixed
          </label>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-slate-400">{selectedIds.size} selected</span>
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="filter-select text-xs">
                <option value="">Change status…</option>
                {['open', 'in_progress', 'resolved', 'rejected', 'inactive'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              {bulkStatus && (
                <button onClick={bulkUpdateStatus} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg transition-colors">
                  Apply
                </button>
              )}
              <button onClick={bulkDelete} className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition-colors flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors">
            <Download size={13} /> Export CSV ({filteredReports.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2.5">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {allPageSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>
                </th>
                {['Time', 'Issue', 'Ward / Mandal', 'Severity', 'Status', 'Flags', 'Photo', 'Status Action', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">Loading reports…</td></tr>
              ) : pageReports.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">No reports found</td></tr>
              ) : pageReports.map(r => {
                const status = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
                const isSelected = selectedIds.has(r.id)
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 transition-colors cursor-pointer
                      ${isSelected ? 'bg-green-50' : 'hover:bg-slate-50'}
                      ${(r as any).is_test ? 'border-l-2 border-l-amber-400' : ''}
                    `}
                    onClick={() => setDetailReport(r)}
                  >
                    <td className="px-3 py-3" onClick={e => { e.stopPropagation(); toggleSelect(r.id) }}>
                      {isSelected ? <CheckSquare size={14} className="text-green-600" /> : <Square size={14} className="text-slate-300" />}
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-400 whitespace-nowrap">{timeAgo(r.created_at)}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <span>{(r.issue_types as any)?.emoji} {(r.issue_types as any)?.name_en}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-slate-700">{(r.wards as any)?.ward_name_en}</div>
                      <div className="text-slate-400">{(r.wards as any)?.mandal_en}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={r.severity === 'high' ? 'text-red-600' : r.severity === 'medium' ? 'text-amber-600' : 'text-green-600'}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                        <span className={status?.color}>{status?.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {(r as any).is_test && <span title="Test" className="text-amber-500"><FlaskConical size={12} /></span>}
                        {(r as any).is_duplicate && <span title="Duplicate" className="text-slate-400"><Copy size={12} /></span>}
                        {(r as any).reporter_says_fixed_at && (
                          <span title={`Reporter says fixed on ${new Date((r as any).reporter_says_fixed_at).toLocaleDateString('en-IN')}`} className="text-green-500">
                            <Flag size={12} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {r.photo_url && (
                        <a href={r.photo_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-green-600 hover:underline">View</a>
                      )}
                    </td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={r.status}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-green-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button title="Mark as duplicate" onClick={() => markDuplicate(r.id)} className="text-slate-400 hover:text-amber-500 p-1 rounded transition-colors">
                          <Copy size={13} />
                        </button>
                        {confirmDeleteId === r.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => deleteReport(r.id)} className="text-red-600 hover:text-red-700 text-xs font-semibold px-1">Yes</button>
                            <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 hover:text-slate-600 text-xs px-1">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(r.id)} className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          {search ? ' (filtered)' : ''}
          {totalPages > 1 ? ` · page ${page + 1} of ${totalPages}` : ''}
        </span>
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:border-green-400 transition-colors"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:border-green-400 transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {detailReport && (
        <ReportDetailPanel
          report={detailReport}
          onClose={() => setDetailReport(null)}
          onStatusChange={(id, status) => { updateStatus(id, status); setDetailReport(r => r ? { ...r, status: status as any } : null) }}
        />
      )}
    </div>
  )
}
