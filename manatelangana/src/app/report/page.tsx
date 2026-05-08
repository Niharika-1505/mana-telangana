'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase, IssueType, Ward } from '@/lib/supabase'
import { uploadPhoto } from '@/lib/cloudinary'
import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import toast from 'react-hot-toast'
import { Camera, MapPin, Loader2, CheckCircle2, FlaskConical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n'

export default function ReportPage() {
  const router = useRouter()
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
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const [{ data: types }, { data: wardData }] = await Promise.all([
        supabase.from('issue_types').select('*').eq('is_active', true).order('sort_order'),
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
        if (nearest) { setDetectedWard(nearest); setSelectedWard(nearest.id) }
        setLocating(false)
        toast.success('Location detected!')
      },
      () => { toast.error('Could not get location. Please select ward manually.'); setLocating(false) }
    )
  }

  async function handleSubmit() {
    if (!selectedIssue) { toast.error('Please select an issue type'); return }
    if (!selectedWard && !detectedWard) { toast.error('Please select or detect your location'); return }
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
      } as any)

      if (error) throw error

      setSubmitted(true)
      toast.success('Report submitted!')
      setTimeout(() => router.push('/'), 2500)
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
    low: 'report_sev_low',
    medium: 'report_sev_medium',
    high: 'report_sev_high',
  } as const

  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <CheckCircle2 className="mx-auto text-green-400 mb-4" size={64} />
          <h1 className={`text-2xl font-bold text-green-400 mb-2 ${lang === 'te' ? 'te' : ''}`}>{t('report_done_title')}</h1>
          <p className={`text-sm text-[#5a7a5a] ${lang === 'te' ? 'te' : ''}`}>{t('report_done_msg')}</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className={`text-2xl font-bold text-[#e8f5e8] mb-1 ${lang === 'te' ? 'te' : ''}`}>{t('report_title')}</h1>
        <p className="text-base text-[#5a7a5a] mb-8">{t('report_subtitle')}</p>

        {/* Issue Type */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-[#9ab89a] uppercase tracking-widest mb-3">
            {t('report_issue_type')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {issueTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedIssue(type.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                  ${selectedIssue === type.id
                    ? 'border-green-500 bg-green-400/8 text-green-400'
                    : 'border-[#2d442d] bg-[#1e2e1e] text-[#9ab89a] hover:border-green-900'
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
          <div className="text-xs font-semibold text-[#9ab89a] uppercase tracking-widest mb-3">
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
              className="w-full border-2 border-dashed border-[#2d442d] rounded-xl p-8 text-center hover:border-green-800 transition-colors"
            >
              <Camera className="mx-auto text-[#5a7a5a] mb-2" size={32} />
              <div className={`text-sm text-[#9ab89a] ${lang === 'te' ? 'te' : ''}`}>{t('report_photo_tap')}</div>
            </button>
          )}
        </div>

        {/* Location */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-[#9ab89a] uppercase tracking-widest mb-3">
            {t('report_location')}
          </div>
          <button
            onClick={detectLocation}
            disabled={locating}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all mb-3
              ${detectedWard
                ? 'border-green-700 bg-green-400/8'
                : 'border-[#2d442d] bg-[#1e2e1e] hover:border-green-900'
              }`}
          >
            {locating ? <Loader2 size={20} className="text-green-400 animate-spin" /> : <MapPin size={20} className="text-green-400" />}
            <div className="text-left flex-1">
              {detectedWard ? (
                <>
                  <div className={`text-sm font-medium text-green-400 ${lang === 'te' ? 'te' : ''}`}>
                    {wardDisplayName(detectedWard)}
                  </div>
                  <div className="text-xs text-[#9ab89a]">
                    {t('report_mla_label')}: {detectedWard.mla_name} · {t('report_mp_label')}: {detectedWard.mp_name}
                  </div>
                </>
              ) : (
                <div className={`text-sm text-[#9ab89a] ${lang === 'te' ? 'te' : ''}`}>
                  {locating ? t('report_detecting') : t('report_detect')}
                </div>
              )}
            </div>
          </button>

          <select
            value={selectedWard}
            onChange={e => setSelectedWard(e.target.value)}
            className="w-full bg-[#1e2e1e] border border-[#2d442d] text-[#9ab89a] text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-700 mb-3"
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
            className="w-full bg-[#1e2e1e] border border-[#2d442d] text-[#9ab89a] text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-700 placeholder-[#3d5a3d]"
          />
        </div>

        {/* Severity */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-[#9ab89a] uppercase tracking-widest mb-3">
            {t('report_severity')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                  ${severity === s
                    ? s === 'low' ? 'border-green-500 bg-green-400/10 text-green-400'
                      : s === 'medium' ? 'border-amber-500 bg-amber-400/10 text-amber-400'
                      : 'border-red-500 bg-red-400/10 text-red-400'
                    : 'border-[#2d442d] bg-[#1e2e1e] text-[#5a7a5a] hover:border-[#3d5a3d]'
                  }`}
              >
                {s === 'low' ? '🟢' : s === 'medium' ? '🟡' : '🔴'} {t(severityKeys[s])}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-[#9ab89a] uppercase tracking-widest mb-3">
            {t('report_description')}
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('report_desc_ph')}
            rows={3}
            className="w-full bg-[#1e2e1e] border border-[#2d442d] text-[#9ab89a] text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-700 placeholder-[#3d5a3d] resize-none"
          />
        </div>

        {/* Test submission flag */}
        <label className="flex items-center gap-3 card p-4 mb-6 cursor-pointer hover:border-yellow-800 transition-colors">
          <input
            type="checkbox"
            checked={isTest}
            onChange={e => setIsTest(e.target.checked)}
            className="accent-yellow-500 w-4 h-4"
          />
          <div>
            <div className="flex items-center gap-2 text-sm text-[#9ab89a]">
              <FlaskConical size={14} className="text-yellow-400" />
              {t('report_test_label')}
            </div>
            <div className="text-xs text-[#5a7a5a] mt-0.5">{t('report_test_hint')}</div>
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

        <p className="text-center text-xs text-[#3d5a3d] mt-3">
          {t('report_anon_note')}
        </p>
      </main>
      <TransparencyFooter />
    </>
  )
}
