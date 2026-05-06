'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type IssueCount = { slug: string; name_en: string; name_te: string; emoji: string; count: number }

export default function IssueBreakdown() {
  const [issues, setIssues] = useState<IssueCount[]>([])

  useEffect(() => {
    async function load() {
      const { data: types } = await supabase.from('issue_types').select('*').order('sort_order')
      const { data: reports } = await supabase.from('reports').select('issue_type_id')
      if (!types || !reports) return
      const counts = types.map(t => ({
        slug: t.slug, name_en: t.name_en, name_te: t.name_te, emoji: t.emoji,
        count: reports.filter(r => r.issue_type_id === t.id).length,
      })).sort((a, b) => b.count - a.count)
      setIssues(counts)
    }
    load()
  }, [])

  const colors = ['text-red-400','text-amber-400','text-blue-400','text-purple-400','text-sky-400','text-orange-400','text-pink-400','text-green-400','text-teal-400','text-cyan-400','text-violet-400','text-yellow-400']

  return (
    <div>
      <h2 className="text-base font-semibold text-[#e8f5e8] mb-4 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[#2d442d]">
        Issues by Type · <span className="te text-sm text-[#5a7a5a]">సమస్యల వర్గీకరణ</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {issues.map((issue, i) => (
          <div key={issue.slug} className="card p-4 text-center hover:border-green-800 transition-colors hover:-translate-y-0.5 duration-200">
            <div className="text-2xl mb-2">{issue.emoji}</div>
            <div className={`font-mono text-xl font-bold mb-1 ${colors[i % colors.length]}`}>{issue.count}</div>
            <div className="text-xs text-[#9ab89a]">{issue.name_en}</div>
            <div className="te text-[10px] text-[#5a7a5a]">{issue.name_te}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
