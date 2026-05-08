'use client'
import { Report } from '@/lib/supabase'
import { STATUS_CONFIG, SEVERITY_CONFIG, timeAgo } from '@/lib/utils'
import { X, MapPin, Clock, Camera, Tag, User } from 'lucide-react'

interface Props {
  report: Report
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}

export default function ReportDetailPanel({ report, onClose, onStatusChange }: Props) {
  const ward = report.wards as any
  const issueType = report.issue_types as any
  const status = STATUS_CONFIG[report.status]
  const severity = SEVERITY_CONFIG[report.severity]

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 z-50 overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="font-semibold text-slate-900">Report Detail</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${status?.color} bg-slate-50`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${status?.dot} mr-1.5`} />
              {status?.label}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${severity?.color} bg-slate-50`}>
              {report.severity}
            </span>
            {report.is_test && (
              <span className="text-xs px-2 py-1 rounded-full font-medium text-amber-600 bg-amber-50">
                TEST
              </span>
            )}
            {report.is_duplicate && (
              <span className="text-xs px-2 py-1 rounded-full font-medium text-slate-500 bg-slate-100">
                DUPLICATE
              </span>
            )}
          </div>

          {/* Photo */}
          {report.photo_url && (
            <div>
              <a href={report.photo_url} target="_blank" rel="noreferrer">
                <img
                  src={report.photo_url}
                  alt="Report photo"
                  className="w-full rounded-xl object-cover max-h-64 hover:opacity-90 transition-opacity"
                />
              </a>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Camera size={11} /> Click to open full size
              </p>
            </div>
          )}

          {/* Issue type */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{issueType?.emoji}</span>
              <div>
                <div className="font-medium text-slate-900">{issueType?.name_en}</div>
                <div className="te text-sm text-slate-400">{issueType?.name_te}</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Location
            </div>
            {ward && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ward</span>
                  <span className="text-slate-700">{ward.ward_name_en}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mandal</span>
                  <span className="text-slate-700">{ward.mandal_en}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Constituency</span>
                  <span className="text-slate-700">{ward.constituency_en}</span>
                </div>
              </>
            )}
            {report.landmark && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Landmark</span>
                <span className="text-slate-700 text-right max-w-[60%]">{report.landmark}</span>
              </div>
            )}
            {report.lat && report.lng && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">GPS</span>
                <a
                  href={`https://maps.google.com/?q=${report.lat},${report.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 hover:underline font-mono text-xs"
                >
                  {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                </a>
              </div>
            )}
          </div>

          {/* MLA / MP */}
          {ward && (
            <div className="card p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <User size={12} /> Representatives
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">MLA</span>
                <span className="text-slate-700">{ward.mla_name} <span className="text-slate-400">({ward.mla_party})</span></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">MP</span>
                <span className="text-slate-700">{ward.mp_name}</span>
              </div>
            </div>
          )}

          {/* Description */}
          {report.description && (
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Tag size={12} /> Description
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{report.description}</p>
            </div>
          )}

          {/* Resolution note */}
          {report.resolution_note && (
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Resolution Note</div>
              <p className="text-sm text-slate-700">{report.resolution_note}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="card p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Clock size={12} /> Timeline
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Submitted</span>
              <span className="text-slate-700 font-mono text-xs">{new Date(report.created_at).toLocaleString('en-IN')}</span>
            </div>
            {report.resolved_at && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Resolved</span>
                <span className="text-green-600 font-mono text-xs">{new Date(report.resolved_at).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Upvotes</span>
              <span className="text-slate-700">{report.upvotes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">ID</span>
              <span className="text-slate-400 font-mono text-xs truncate max-w-[60%]">{report.id}</span>
            </div>
          </div>

          {/* Change status */}
          <div className="card p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Change Status</div>
            <div className="grid grid-cols-2 gap-2">
              {(['open', 'in_progress', 'resolved', 'rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(report.id, s); onClose() }}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all capitalize border
                    ${report.status === s
                      ? `${STATUS_CONFIG[s].color} border-current bg-slate-50`
                      : 'text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                    }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
