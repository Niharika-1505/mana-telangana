'use client'
import { useEffect, useState } from 'react'
import { supabase, Report } from '@/lib/supabase'
import { getFingerprint, STATUS_CONFIG, timeAgo } from '@/lib/utils'
import { useLang } from '@/lib/i18n'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const DISMISS_KEY = 'banner_dismissed_at'
const DISMISS_HOURS = 24

export default function OpenReportsBanner() {
  const { t } = useLang()
  const [reports, setReports] = useState<Report[]>([])
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / 3600000
      if (hoursSince < DISMISS_HOURS) return // still within dismiss window
    }
    loadOpenReports()
  }, [])

  async function loadOpenReports() {
    const fp = getFingerprint()
    if (!fp || fp === 'server') return
    const { data } = await supabase
      .from('reports')
      .select('*, wards(*), issue_types(*)')
      .eq('browser_fingerprint', fp)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
    if (data && data.length > 0) {
      setReports(data)
      setDismissed(false)
    }
  }

  async function markFixed(report: Report) {
    const { error } = await supabase
      .from('reports')
      .update({ reporter_says_fixed_at: new Date().toISOString() })
      .eq('id', report.id)
    if (error) {
      toast.error('Could not save — please try again')
      return
    }
    setConfirmedIds(prev => new Set([...Array.from(prev), report.id]))
    toast.success(t('banner_reporter_thanks'))
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setDismissed(true)
  }

  if (dismissed || reports.length === 0) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-green-800 text-sm mb-0.5">
            {t('banner_title')} ({reports.length})
          </div>
          <div className="text-xs text-green-600 mb-3">{t('banner_subtitle')}</div>

          <div className="space-y-2">
            {reports.map(r => {
              const confirmed = confirmedIds.has(r.id)
              const issueType = r.issue_types as any
              const ward = r.wards as any
              const status = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
              return (
                <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-100 gap-2">
                  <div className="flex items-center gap-2 text-xs min-w-0">
                    <span className="text-lg flex-shrink-0">{issueType?.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-slate-700 font-medium truncate">{issueType?.name_en}</div>
                      <div className="text-slate-400 truncate">
                        {ward?.ward_name_en} · <span className={status?.color}>{status?.label}</span> · {timeAgo(r.created_at)}
                      </div>
                    </div>
                  </div>
                  {confirmed ? (
                    <span className="text-xs text-green-600 flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 size={13} /> Noted
                    </span>
                  ) : (
                    <button
                      onClick={() => markFixed(r)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      {t('banner_fixed_btn')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <p className="text-xs text-green-500 mt-3 italic">{t('banner_device_note')}</p>
        </div>
        <button onClick={dismiss} className="text-green-400 hover:text-green-600 flex-shrink-0" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
