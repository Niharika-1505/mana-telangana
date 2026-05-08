'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'

type IssueCount = { slug: string; name_en: string; name_te: string; emoji: string; count: number }

export default function IssueBreakdown() {
  const [issues, setIssues] = useState<IssueCount[]>([])
  const { lang, t } = useLang()

  useEffect(() => {
    async function load() {
      const { data: types } = await supabase.from('issue_types').select('*').order('sort_order')
      const { data: reports } = await supabase.from('reports').select('issue_type_id')
      if (!types || !reports) return
      const counts = types.map(tp => ({
        slug: tp.slug, name_en: tp.name_en, name_te: tp.name_te, emoji: tp.emoji,
        count: reports.filter(r => r.issue_type_id === tp.id).length,
      })).sort((a, b) => b.count - a.count)
      setIssues(counts)
    }
    load()
  }, [])

  const colors = [
    'text-red-500','text-amber-500','text-blue-500','text-purple-500',
    'text-sky-500','text-orange-500','text-pink-500','text-green-600',
    'text-teal-500','text-cyan-500','text-violet-500','text-yellow-500',
  ]

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-slate-200">
        {t('breakdown_title')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {issues.map((issue, i) => (
          <div key={issue.slug} className="card p-4 text-center hover:border-green-300 hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
            <div className="text-2xl mb-2">{issue.emoji}</div>
            <div className={`font-mono text-xl font-bold mb-1 ${colors[i % colors.length]}`}>{issue.count}</div>
            <div className={`text-xs text-slate-600 ${lang === 'te' ? 'te' : ''}`}>
              {(lang === 'te' ? issue.name_te : issue.name_en) || issue.name_en}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
