'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase, Report, ReportVerification } from '@/lib/supabase'
import { uploadPhoto } from '@/lib/cloudinary'
import { getFingerprint, STATUS_CONFIG, timeAgo } from '@/lib/utils'
import { useLang } from '@/lib/i18n'
import { X, Camera, CheckCircle2, XCircle, Users, MapPin, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  report: Report
  onClose: () => void
}

export default function ReportDetailModal({ report, onClose }: Props) {
  const { t } = useLang()
  const [verifications, setVerifications] = useState<ReportVerification[]>([])
  const [loadingVerif, setLoadingVerif] = useState(true)
  const [verdict, setVerdict] = useState<'fixed' | 'still_broken' | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const issueType = report.issue_types as any
  const ward = report.wards as any
  const status = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]
  const fixedCount = verifications.filter(v => v.verdict === 'fixed').length
  const brokenCount = verifications.filter(v => v.verdict === 'still_broken').length

  useEffect(() => {
    loadVerifications()
  }, [report.id])

  async function loadVerifications() {
    setLoadingVerif(true)
    const { data } = await supabase
      .from('report_verifications')
      .select('*')
      .eq('report_id', report.id)
      .order('created_at', { ascending: false })
    setVerifications(data || [])
    setLoadingVerif(false)
  }

  async function submitVerification() {
    if (!verdict) { toast.error('Please select fixed or still broken'); return }
    setSubmitting(true)
    try {
      let photoUrl: string | null = null
      if (photo) {
        photoUrl = await uploadPhoto(photo, `verify_${report.id}_${Date.now()}`)
      }
      const { error } = await supabase.from('report_verifications').insert({
        report_id: report.id,
        verdict,
        photo_url: photoUrl,
        note: note.trim() || null,
        browser_fingerprint: getFingerprint(),
      })
      if (error) throw error
      setSubmitted(true)
      loadVerifications()
    } catch {
      toast.error('Submission failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet — bottom on mobile, centered on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full md:rounded-2xl">

        {/* Drag handle (mobile only) + header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 pt-3 pb-3 z-10">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 md:hidden" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl flex-shrink-0">{issueType?.emoji}</span>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-sm truncate">{issueType?.name_en}</div>
                <div className={`text-xs flex items-center gap-1 ${status?.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                  {status?.label}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Report photo */}
          {report.photo_url && (
            <a href={report.photo_url} target="_blank" rel="noreferrer">
              <img
                src={report.photo_url}
                alt="Report"
                className="w-full h-48 object-cover rounded-xl hover:opacity-90 transition-opacity"
              />
            </a>
          )}

          {/* Location + time */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} />
            {ward?.ward_name_en}{ward?.mandal_en ? ` · ${ward.mandal_en}` : ''}
            {report.landmark ? ` · ${report.landmark}` : ''}
            <span className="text-slate-300">·</span>
            {timeAgo(report.created_at)}
          </div>

          {/* Description */}
          {report.description && (
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">
              {report.description}
            </p>
          )}

          {/* Community verification summary */}
          <div className="card p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Users size={12} /> {t('verify_community_title')}
            </div>
            {loadingVerif ? (
              <div className="text-xs text-slate-400">Loading...</div>
            ) : verifications.length === 0 ? (
              <div className="text-xs text-slate-400 italic">{t('verify_none')}</div>
            ) : (
              <>
                <div className="flex gap-4 mb-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="font-semibold text-green-700">{fixedCount}</span>
                    <span className="text-slate-400 text-xs">{t('verify_say_fixed')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <XCircle size={14} className="text-red-400" />
                    <span className="font-semibold text-red-600">{brokenCount}</span>
                    <span className="text-slate-400 text-xs">{t('verify_say_broken')}</span>
                  </div>
                </div>
                {/* Verification photos strip */}
                {verifications.filter(v => v.photo_url).length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {verifications.filter(v => v.photo_url).slice(0, 6).map(v => (
                      <a key={v.id} href={v.photo_url!} target="_blank" rel="noreferrer" className="flex-shrink-0">
                        <img
                          src={v.photo_url!}
                          alt="Verification"
                          className="w-14 h-14 object-cover rounded-lg hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                )}
                {/* Verification notes */}
                {verifications.filter(v => v.note).slice(0, 2).map(v => (
                  <div key={v.id} className="text-xs text-slate-500 mt-1.5 italic">
                    "{v.note}" — {timeAgo(v.created_at)}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Submit verification */}
          {submitted ? (
            <div className="card p-5 text-center">
              <CheckCircle2 size={36} className="text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-700 text-sm">{t('verify_thanks')}</div>
              <p className="text-xs text-slate-400 mt-1">Your feedback helps the community track this issue</p>
            </div>
          ) : (
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                {t('verify_title')}
              </div>

              {/* Verdict buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setVerdict('fixed')}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5
                    ${verdict === 'fixed'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 text-slate-500 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                  <CheckCircle2 size={16} /> {t('verify_fixed')}
                </button>
                <button
                  onClick={() => setVerdict('still_broken')}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5
                    ${verdict === 'still_broken'
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50'
                    }`}
                >
                  <XCircle size={16} /> {t('verify_broken')}
                </button>
              </div>

              {/* Photo upload */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setPhoto(f); setPhotoPreview(URL.createObjectURL(f)) }
                }}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative mb-2">
                  <img src={photoPreview} alt="Preview" className="w-full h-28 object-cover rounded-xl" />
                  <button
                    onClick={() => { setPhoto(null); setPhotoPreview('') }}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white text-xs px-2 py-0.5 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:border-green-300 hover:bg-green-50 transition-colors mb-2"
                >
                  <Camera size={16} className="mx-auto text-slate-300 mb-1" />
                  <span className="text-xs text-slate-400">{t('verify_photo_optional')}</span>
                </button>
              )}

              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={t('verify_note_ph')}
                rows={2}
                className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100 resize-none mb-3"
              />

              <button
                onClick={submitVerification}
                disabled={submitting || !verdict}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? t('report_submitting') : t('verify_submit')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
