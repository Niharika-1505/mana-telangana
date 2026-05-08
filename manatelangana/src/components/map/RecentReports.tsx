'use client'
import { useEffect, useState } from 'react'
import { supabase, Report } from '@/lib/supabase'
import { timeAgo, STATUS_CONFIG } from '@/lib/utils'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'

export default function RecentReports() {
  const [reports, setReports] = useState<Report[]>([])
  const { lang, t } = useLang()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reports')
        .select('*, wards(*), issue_types(*)')
        .order('created_at', { ascending: false })
        .limit(8)
      if (data) setReports(data)
    }
    load()
    const channel = supabase.channel('recent-reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const tagColors: Record<string, string> = {
    garbage:     'bg-red-900/50 text-red-300',
    pothole:     'bg-amber-900/50 text-amber-300',
    drainage:    'bg-blue-900/50 text-blue-300',
    streetlight: 'bg-purple-900/50 text-purple-300',
    waterlogging:'bg-sky-900/50 text-sky-300',
    dumping:     'bg-orange-900/50 text-orange-300',
    stray:       'bg-pink-900/50 text-pink-300',
    tree:        'bg-green-900/50 text-green-300',
    encroachment:'bg-yellow-900/50 text-yellow-300',
    water:       'bg-cyan-900/50 text-cyan-300',
    toilet:      'bg-violet-900/50 text-violet-300',
    'open-drain':'bg-teal-900/50 text-teal-300',
  }

  function issueName(issueType: any) {
    if (!issueType) return ''
    return (lang === 'te' ? issueType.name_te : issueType.name_en) || issueType.name_en
  }

  function wardName(ward: any) {
    if (!ward) return t('recent_mandal')
    return (lang === 'te' ? ward.ward_name_te : ward.ward_name_en) || ward.ward_name_en
  }

  function mandalName(ward: any) {
    if (!ward) return ''
    return (lang === 'te' ? ward.mandal_te : ward.mandal_en) || ward.mandal_en
  }

  return (
    <div className="card overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-[#2d442d]">
        <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-widest">
          {t('recent_title')}
        </div>
      </div>

      <div className="divide-y divide-[#1e2e1e] overflow-y-auto" style={{ maxHeight: '490px' }}>
        {reports.length === 0 && (
          <div className="px-4 py-8 text-center text-[#5a7a5a] text-sm">
            {t('recent_empty')}{' '}
            <Link href="/report" className="text-green-400 hover:underline">{t('recent_first')}</Link>
          </div>
        )}
        {reports.map(r => {
          const slug = (r.issue_types as any)?.slug || 'garbage'
          const status = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
          const ward = r.wards as any
          return (
            <Link key={r.id} href={`/report/${r.id}`} className="block px-4 py-3 hover:bg-[#1e2e1e] transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`issue-tag ${tagColors[slug] || 'bg-gray-800 text-gray-300'}`}>
                  {(r.issue_types as any)?.emoji} {issueName(r.issue_types)}
                </span>
                <span className="text-[10px] text-[#5a7a5a] font-mono shrink-0">{timeAgo(r.created_at)}</span>
              </div>
              <div className="text-sm font-medium text-[#e8f5e8] mb-0.5">
                {r.landmark || wardName(ward) || 'Location pending'}
              </div>
              <div className="text-xs text-[#5a7a5a] mb-1.5">
                {mandalName(ward)} {t('recent_mandal')}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                <span className={`text-[10px] ${status?.color}`}>{status?.label}</span>
                {ward?.mla_name && (
                  <>
                    <span className="text-[#3d5a3d]">·</span>
                    <span className="text-[10px] text-[#5a7a5a] truncate">{t('recent_mla')}: {ward.mla_name}</span>
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
