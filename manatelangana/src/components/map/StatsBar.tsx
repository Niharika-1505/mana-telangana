'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'

type Stats = { total: number; open: number; resolved: number; inProgress: number }

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, resolved: 0, inProgress: 0 })
  const { t } = useLang()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('reports').select('status')
      if (!data) return
      setStats({
        total:      data.length,
        open:       data.filter(r => r.status === 'open').length,
        resolved:   data.filter(r => r.status === 'resolved').length,
        inProgress: data.filter(r => r.status === 'in_progress').length,
      })
    }
    load()
    const channel = supabase.channel('reports-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const cards = [
    { num: stats.total,      labelKey: 'stats_total'      as const, color: 'text-green-400' },
    { num: stats.open,       labelKey: 'stats_open'       as const, color: 'text-red-400' },
    { num: stats.resolved,   labelKey: 'stats_resolved'   as const, color: 'text-green-400' },
    { num: stats.inProgress, labelKey: 'stats_inprogress' as const, color: 'text-amber-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ num, labelKey, color }) => (
        <div key={labelKey} className="stat-card hover:border-green-800 transition-colors">
          <div className={`stat-num ${color}`}>{num}</div>
          <div className="stat-label">{t(labelKey)}</div>
        </div>
      ))}
    </div>
  )
}
