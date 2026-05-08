'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase, IssueType, Ward } from '@/lib/supabase'
import { uploadPhoto } from '@/lib/cloudinary'
import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import toast from 'react-hot-toast'
import { Camera, MapPin, Loader2, CheckCircle2, FlaskConical, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { getFingerprint } from '@/lib/utils'

function PWAInstallCard() {
  const { t } = useLang()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isInstalled) {
    return (
      <div className="card p-4 mb-4 flex items-center justify-center gap-2 text-sm text-green-600">
        <CheckCircle2 size={16} /> {t('submitted_pwa_installed')}
      </div>
    )
  }

  return (
    <div className="card p-5 mb-4">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Smartphone size={13} /> {t('submitted_pwa_title')}
      </div>
      {deferredPrompt ? (
        <button
          disabled={installing}
          onClick={async () => {
            setInstalling(true)
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') setDeferredPrompt(null)
            setInstalling(false)
          }}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          📲 {t('submitted_pwa_android')}
        </button>
      ) : isIOS ? (
        <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
          <span className="text-xl flex-shrink-0">📲</span>
          <span>{t('submitted_pwa_ios')}</span>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Open this site in Chrome or Safari to get the install option.</p>
      )}
    </div>
  )
}

export default function ReportPage() {
  const { lang, t } = useLang()
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [selectedIssue, setSelectedIssue] = useState<string>('')
  const [selectedWard, setSelectedWard] = useState<string>('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [landmark, setLandmark] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [detectedWard, setDetectedWard] = useState<Ward | null>(null)
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isTest, setIsTest] = useState(false)
  const [wardOutOfRange, setWardOutOfRange] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const [{ data: types }, { data: wardData }] = await Promise.all([
        supabase.from('issue_types').select('*').order('sort_order'),
        supabase.from('wards').select('*').order('mandal_en').order('ward_number'),
      ])
      if (types) setIssueTypes(types)
      if (wardData) setWards(wardData)
    }
    load()
  }, [])

  const mandalGroups = wards.reduce<Record<string, Ward[]>>((acc, ward) => {
    if (!acc[ward.mandal_en]) acc[ward.mandal_en] = []
    acc[ward.mandal_en].push(ward)
    return acc
  }, {})

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Photo must be under 10MB'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function detectLocation() {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        setLat(latitude); setLng(longitude)
        const nearest = wards.reduce((best, w) => {
          if (!w.lat || !w.lng) return best
          const d = Math.hypot(w.lat - latitude, w.lng - longitude)
          return !best || d < Math.hypot((best.lat || 0) - latitude, (best.lng || 0) - longitude) ? w : best
        }, null as Ward | null)
        if (nearest) {
          const distKm = Math.hypot((nearest.lat! - latitude) * 111, (nearest.lng! - longitude) * 88)
          if (distKm > 50) {
            setWardOutOfRange(true)
            setDetectedWard(null)
            setSelectedWard('')
            toast.success('Location detected! No ward found nearby — you can still submit.')
          } else {
            setWardOutOfRange(false)
            setDetectedWard(nearest)
            setSelectedWard(nearest.id)
            toast.success('Location detected!')
          }
        }
        setLocating(false)
      },
      () => { toast.error('Could not get location. Please select ward manually.'); setLocating(false) }
    )
  }

  async function handleSubmit() {
    if (!selectedIssue) { toast.error('Please select an issue type'); return }
    if (!selectedWard && !detectedWard && lat === null) { toast.error('Please select or detect your location'); return }
    if (!photo) { toast.error('Please add a photo as evidence'); return }

    setSubmitting(true)
    try {
      const reportId = crypto.randomUUID()
      const photoUrl = await uploadPhoto(photo, reportId)

      const { error } = await supabase.from('reports').insert({
        id: reportId,
        ward_id: selectedWard || detectedWard?.id,
        issue_type_id: selectedIssue,
        severity,
        photo_url: photoUrl,
        description,
        landmark,
        lat, lng,
        status: 'open',
        upvotes: 1,
        is_test: isTest,
        browser_fingerprint: getFingerprint(),
      } as any)

      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function wardDisplayName(w: Ward) {
    return (lang === 'te' ? w.ward_name_te : w.ward_name_en) || w.ward_name_en
  }

  function mandalDisplayName(mandalEn: string, mandalWards: Ward[]) {
    if (lang !== 'te') return mandalEn
    return mandalWards[0]?.mandal_te || mandalEn
  }

  function issueDisplayName(type: IssueType) {
    return (lang === 'te' ? type.name_te : type.name_en) || type.name_en
  }

  const severityKeys = {
    low: 'report_sev_low', medium: 'report_sev_medium', high: 'report_sev_high',
  } as const

  const inputCls = 'w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 placeholder-slate-300'

  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-4 py-8">
          {/* Success */}
          <div className="text-center mb-6">
            <CheckCircle2 className="mx-auto text-green-500 mb-3" size={56} />
            <h1 className={`text-2xl font-bold text-green-700 mb-1 ${lang === 'te' ? 'te' : ''}`}>
              {t('submitted_title')}
            </h1>
            <p className="text-sm text-slate-400">
              {wardOutOfRange
                ? 'Your report is live on the map. No MLA assigned (location outside known wards).'
                : 'Your report is now live on the public map'}
            </p>
          </div>

          {/* How it works */}
          <div className="card p-5 mb-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              {t('submitted_how_it_works')}
            </div>
            {[
              { icon: '🗺', key: 'submitted_step1' as const },
              { icon: '👤', key: 'submitted_step2' as const },
              { icon: '📢', key: 'submitted_step3' as const },
              { icon: '🤝', key: 'submitted_step4' as const },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm py-1.5">
                <span className="text-base mt-0.5">{step.icon}</span>
                <span className={`text-slate-600 ${lang === 'te' ? 'te' : ''}`}>{t(step.key)}</span>
              </div>
            ))}
          </div>

          {/* Limitations */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-3">
              {t('submitted_limits_title')}
            </div>
            {[
              'submitted_limit1' as const,
              'submitted_limit2' as const,
              'submitted_limit3' as const,
              'submitted_limit4' as const,
            ].map((key, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-700 py-1">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>
                <span className={lang === 'te' ? 'te' : ''}>{t(key)}</span>
              </div>
            ))}
          </div>

          {/* PWA install */}
          <PWAInstallCard />

          {/* Back to map */}
          <Link
            href="/"
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-2"
          >
            🗺 {t('submitted_back')}
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className={`text-2xl font-bold text-slate-900 mb-1 ${lang === 'te' ? 'te' : ''}`}>{t('report_title')}</h1>
        <p className="text-base text-slate-400 mb-8">{t('report_subtitle')}</p>

        {/* Issue Type */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            {t('report_issue_type')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {issueTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedIssue(type.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                  ${selectedIssue === type.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50'
                  }`}
              >
                <span className="text-xl">{type.emoji}</span>
                <div className={`text-sm font-medium ${lang === 'te' ? 'te' : ''}`}>
                  {issueDisplayName(type)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            {t('report_photo')}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              <button
                onClick={() => { setPhoto(null); setPhotoPreview('') }}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
              >{t('report_photo_remove')}</button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <Camera className="mx-auto text-slate-300 mb-2" size={32} />
              <div className={`text-sm text-slate-500 ${lang === 'te' ? 'te' : ''}`}>{t('report_photo_tap')}</div>
            </button>
          )}
        </div>

        {/* Location */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            {t('report_location')}
          </div>
          <button
            onClick={detectLocation}
            disabled={locating}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all mb-3
              ${detectedWard
                ? 'border-green-400 bg-green-50'
                : wardOutOfRange
                ? 'border-amber-400 bg-amber-50'
                : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50'
              }`}
          >
            {locating ? <Loader2 size={20} className="text-green-600 animate-spin" /> : <MapPin size={20} className="text-green-600" />}
            <div className="text-left flex-1">
              {detectedWard ? (
                <>
                  <div className={`text-sm font-medium text-green-700 ${lang === 'te' ? 'te' : ''}`}>
                    {wardDisplayName(detectedWard)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t('report_mla_label')}: {detectedWard.mla_name} · {t('report_mp_label')}: {detectedWard.mp_name}
                  </div>
                </>
              ) : wardOutOfRange ? (
                <>
                  <div className="text-sm font-medium text-amber-700">Location detected</div>
                  <div className="text-xs text-slate-500">Outside known ward boundaries — you can still submit</div>
                </>
              ) : (
                <div className={`text-sm text-slate-500 ${lang === 'te' ? 'te' : ''}`}>
                  {locating ? t('report_detecting') : t('report_detect')}
                </div>
              )}
            </div>
          </button>

          <select
            value={selectedWard}
            onChange={e => setSelectedWard(e.target.value)}
            className={`${inputCls} mb-3`}
          >
            <option value="">{t('report_select_ward')}</option>
            {Object.entries(mandalGroups).sort(([a], [b]) => a.localeCompare(b)).map(([mandal, mandalWards]) => (
              <optgroup key={mandal} label={mandalDisplayName(mandal, mandalWards)}>
                {mandalWards.map(w => (
                  <option key={w.id} value={w.id}>{wardDisplayName(w)}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <input
            value={landmark}
            onChange={e => setLandmark(e.target.value)}
            placeholder={t('report_landmark_ph')}
            className={inputCls}
          />
        </div>

        {/* Severity */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            {t('report_severity')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                  ${severity === s
                    ? s === 'low'    ? 'border-green-400 bg-green-50 text-green-700'
                    : s === 'medium' ? 'border-amber-400 bg-amber-50 text-amber-700'
                    :                  'border-red-400 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
              >
                {s === 'low' ? '🟢' : s === 'medium' ? '🟡' : '🔴'} {t(severityKeys[s])}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            {t('report_description')}
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('report_desc_ph')}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Test submission flag */}
        <label className="flex items-center gap-3 card p-4 mb-6 cursor-pointer hover:border-amber-300 transition-colors">
          <input
            type="checkbox"
            checked={isTest}
            onChange={e => setIsTest(e.target.checked)}
            className="accent-amber-500 w-4 h-4"
          />
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <FlaskConical size={14} className="text-amber-500" />
              {t('report_test_label')}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{t('report_test_hint')}</div>
          </div>
        </label>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : '📤'}
          {submitting ? t('report_submitting') : t('report_submit')}
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">
          {t('report_anon_note')}
        </p>
      </main>
      <TransparencyFooter />
    </>
  )
}
