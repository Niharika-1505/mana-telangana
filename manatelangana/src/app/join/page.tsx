'use client'
import { useState } from 'react'
import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { Loader2, CheckCircle2, Heart, Database, Users, Code2, Palette, BarChart3, Handshake, HelpCircle, Map } from 'lucide-react'
import CoverageTable from '@/components/CoverageTable'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'ward_data',   label: 'Ward Data Contributor',         sublabel: 'Help collect / verify ward, mandal & GPS data for Nalgonda',  icon: Database },
  { id: 'activist',    label: 'Local Activist / Ground Verifier', sublabel: 'On-ground verification of whether issues are actually fixed',  icon: Users },
  { id: 'developer',   label: 'Developer',                     sublabel: 'Contribute code to the open-source platform',                  icon: Code2 },
  { id: 'designer',    label: 'Designer',                      sublabel: 'UI/UX improvements, illustrations, or data visualisation',      icon: Palette },
  { id: 'researcher',  label: 'Researcher / Data Analyst',     sublabel: 'Analyse civic data, write reports, track MLA accountability',   icon: BarChart3 },
  { id: 'community',   label: 'Just want to be part of the community', sublabel: 'Spread the word, encourage reporting, support the cause', icon: Handshake },
  { id: 'other',       label: 'Other',                         sublabel: 'Tell us in the message box below',                              icon: HelpCircle },
]

const inputCls = 'w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 placeholder-slate-300'

export default function JoinPage() {
  const { lang, t } = useLang()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('')
  const [message, setMessage] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function toggleRole(id: string) {
    setSelectedRoles(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (!name.trim()) { toast.error('Please enter your name'); return }
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email'); return }
    if (selectedRoles.size === 0) { toast.error('Please select at least one role'); return }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('volunteers').insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        roles: Array.from(selectedRoles),
        area: area.trim() || null,
        message: message.trim() || null,
      })
      if (error) throw error
      setSubmitted(true)
    } catch (err: any) {
      toast.error('Submission failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={56} />
          <h1 className={`text-2xl font-bold text-green-700 mb-3 ${lang === 'te' ? 'te' : ''}`}>
            {t('join_done_title')}
          </h1>
          <p className={`text-sm text-slate-500 leading-relaxed mb-8 ${lang === 'te' ? 'te' : ''}`}>
            {t('join_done_msg')}
          </p>
          <Link href="/" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
            🗺 {t('join_back')}
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
            <Heart size={28} className="text-green-600" />
          </div>
          <h1 className={`text-2xl font-bold text-slate-900 mb-2 ${lang === 'te' ? 'te' : ''}`}>
            {t('join_title')}
          </h1>
          <p className={`text-sm text-slate-500 leading-relaxed ${lang === 'te' ? 'te' : ''}`}>
            {t('join_subtitle')}
          </p>
        </div>

        {/* What's already mapped */}
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
            <Map size={13} /> What's already mapped
          </div>
          <p className="text-sm text-slate-500 mb-4">
            See what ward data we already have and what areas need help most.
          </p>
          <CoverageTable compact showContributeButton={false} />
          <div className="flex flex-wrap gap-3 mt-4">
            <Link href="/coverage" className="btn-secondary text-xs px-4 py-2">
              View Full Coverage →
            </Link>
            <Link href="/coverage#contribute" className="btn-primary text-xs px-4 py-2">
              Contribute Ward Data →
            </Link>
          </div>
        </div>

        {/* Role selection */}
        <div className="card p-5 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            {t('join_role_label')} *
          </div>
          <div className="space-y-2">
            {ROLES.map(role => {
              const selected = selectedRoles.has(role.id)
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all
                    ${selected
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-green-200 hover:bg-green-50/50'
                    }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${selected ? 'text-green-600' : 'text-slate-400'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${selected ? 'text-green-800' : 'text-slate-700'}`}>
                      {role.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-snug">{role.sublabel}</div>
                  </div>
                  <div className={`ml-auto flex-shrink-0 w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center transition-all
                    ${selected ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}
                  >
                    {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contact details */}
        <div className="card p-5 mb-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Your Details
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">{t('join_name')} *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">{t('join_email')} *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">{t('join_phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">{t('join_area')}</label>
            <input
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="e.g. Nalgonda Ward 12, Miryalaguda, Suryapet..."
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">{t('join_message')}</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Your background, skills, availability, or anything you'd like us to know..."
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} />}
          {submitting ? t('join_submitting') : t('join_submit')}
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">
          🔒 Your details are only used to contact you about volunteering. We will never spam or sell your information.
        </p>
      </main>
      <TransparencyFooter />
    </>
  )
}
