'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/shared/Header'
import CoverageTable from '@/components/CoverageTable'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/utils'
import { Loader2, CheckCircle2, MapPin, Link2, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const TELANGANA_DISTRICTS = [
  'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad',
  'Jagitial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal',
  'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad',
  'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri',
  'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad',
  'Peddapalle', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet',
  'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri',
]

const PARTIES = ['INC', 'BJP', 'BRS', 'AIMIM', 'TDP', 'IND', 'Other']

interface Stats {
  districts: number
  mlas: number
  mps: number
  reports: number
  pendingContributions: number
}

const inputCls = 'w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 placeholder-slate-300'

function StatCard({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="stat-card">
      <div className="stat-num text-green-700">
        {value === null ? <span className="text-slate-200 animate-pulse">—</span> : value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function CoveragePage() {
  const [stats, setStats]           = useState<Stats | null>(null)
  const [districts, setDistricts]   = useState<string[]>([])
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    yourName: '',
    wardNumber: '',
    wardName: '',
    councillorName: '',
    councillorParty: '',
    mandal: '',
    municipality: '',
    district: '',
    additionalInfo: '',
  })

  function setField(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // Fetch stats and district list in parallel on mount
  useEffect(() => {
    async function loadStats() {
      const [
        { data: wardDistricts },
        { count: mlaCount },
        { count: mpCount },
        { count: reportCount },
        { count: pendingCount },
      ] = await Promise.all([
        supabase.from('wards').select('district'),
        supabase.from('mla').select('*', { count: 'exact', head: true }),
        supabase.from('mp').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('ward_contributions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      const unique = Array.from(new Set((wardDistricts || []).map((w: any) => w.district).filter(Boolean))).sort()
      setDistricts(unique.length > 0 ? unique : TELANGANA_DISTRICTS)

      setStats({
        districts: unique.length > 0 ? unique.length : TELANGANA_DISTRICTS.length,
        mlas: mlaCount ?? 0,
        mps: mpCount ?? 0,
        reports: reportCount ?? 0,
        pendingContributions: pendingCount ?? 0,
      })
    }
    loadStats()
  }, [])

  async function handleContribute() {
    if (!form.wardNumber && !form.wardName) {
      toast.error('Please enter at least a ward number or ward name')
      return
    }
    if (!form.district) {
      toast.error('Please select a district')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('ward_contributions').insert({
        ward_number:             form.wardNumber ? parseInt(form.wardNumber) : null,
        ward_name_en:            form.wardName.trim() || null,
        mandal_en:               form.mandal.trim() || null,
        municipality_en:         form.municipality.trim() || null,
        district_en:             form.district,
        state_en:                'Telangana',
        councillor_name:         form.councillorName.trim() || null,
        councillor_party:        form.councillorParty || null,
        contributor_fingerprint: getFingerprint(),
        status:                  'pending',
      })
      if (error) throw error
      setFormSubmitted(true)
      setForm({ yourName: '', wardNumber: '', wardName: '', councillorName: '', councillorParty: '', mandal: '', municipality: '', district: '', additionalInfo: '' })
    } catch {
      toast.error('Submission failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* ── SECTION 1: Hero ─────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Ward Coverage
          </h1>
          <p className="te text-lg text-green-700 font-medium mb-3">వార్డు వివరాలు</p>
          <p className="text-base text-slate-500 max-w-2xl leading-relaxed">
            We are progressively adding ward data across Telangana. Here's what's available
            and what's coming next.
          </p>
        </div>

        {/* ── SECTION 3: Stats bar ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard value={stats?.districts ?? null} label="Districts" />
          <StatCard value={stats?.mlas ?? null} label="MLAs mapped" />
          <StatCard value={stats?.mps ?? null} label="MPs mapped" />
          <StatCard value={stats?.reports ?? null} label="Total reports" />
        </div>

        {/* ── SECTION 2: Coverage table ───────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Coverage by Area</h2>
            {stats?.pendingContributions ? (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                {stats.pendingContributions} contribution{stats.pendingContributions !== 1 ? 's' : ''} pending review
              </span>
            ) : null}
          </div>
          <CoverageTable showContributeButton />
        </div>

        {/* ── SECTION 5: How it works ─────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">How accountability works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '📍',
                title: 'Citizens report issues',
                body: 'Anyone can file a report anonymously with a photo and GPS location. No login required.',
              },
              {
                icon: '🔗',
                title: 'We map accountability',
                body: 'Every ward links to a councillor, MLA, and MP. Each report creates a public accountability trail.',
              },
              {
                icon: '📊',
                title: 'Public pressure works',
                body: 'Visible tracking of resolution rates creates pressure on elected representatives to act.',
              },
            ].map(step => (
              <div key={step.title} className="card p-5">
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="font-semibold text-slate-800 text-sm mb-1.5">{step.title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 4: Contribute form ──────────────────────── */}
        <div id="contribute" className="card p-6 scroll-mt-20">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            Know your ward details? Help us!
          </h2>
          <p className="te text-sm text-green-700 mb-5">
            మీ వార్డు వివరాలు తెలుసా? మాకు సహాయం చేయండి!
          </p>

          {formSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle2 size={44} className="text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-green-700 text-base mb-1">Thank you! 🙏</p>
              <p className="text-sm text-slate-500 mb-0.5">
                We will verify and publish this data soon.
              </p>
              <p className="te text-sm text-slate-500 mb-6">
                ధన్యవాదాలు! మేము త్వరలో ఈ వివరాలను ధృవీకరిస్తాము.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="btn-secondary text-sm px-5 py-2"
              >
                Submit another
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Your Name (optional)</label>
                  <input
                    value={form.yourName}
                    onChange={e => setField('yourName', e.target.value)}
                    placeholder="e.g. Ravi Kumar"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ward Number</label>
                  <input
                    type="number"
                    value={form.wardNumber}
                    onChange={e => setField('wardNumber', e.target.value)}
                    placeholder="e.g. 12"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Ward Name</label>
                <input
                  value={form.wardName}
                  onChange={e => setField('wardName', e.target.value)}
                  placeholder="e.g. Nalgonda Ward 12"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Councillor / Ward Member Name</label>
                  <input
                    value={form.councillorName}
                    onChange={e => setField('councillorName', e.target.value)}
                    placeholder="e.g. Smt. Lakshmi Devi"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Councillor Party</label>
                  <select
                    value={form.councillorParty}
                    onChange={e => setField('councillorParty', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select party</option>
                    {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Mandal</label>
                  <input
                    value={form.mandal}
                    onChange={e => setField('mandal', e.target.value)}
                    placeholder="e.g. Nalgonda"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Municipality / Town</label>
                  <input
                    value={form.municipality}
                    onChange={e => setField('municipality', e.target.value)}
                    placeholder="e.g. Nalgonda Municipality"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">District *</label>
                <select
                  value={form.district}
                  onChange={e => setField('district', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select district</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Additional info (optional)</label>
                <textarea
                  value={form.additionalInfo}
                  onChange={e => setField('additionalInfo', e.target.value)}
                  placeholder="Any other details — councillor phone, GPS coordinates, corrections..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <button
                onClick={handleContribute}
                disabled={submitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : '🙏'}
                {submitting ? 'Submitting...' : 'Submit Ward Details'}
              </button>

              <p className="text-xs text-slate-400 text-center">
                🔒 Anonymous · Your data will be reviewed before publishing
              </p>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
