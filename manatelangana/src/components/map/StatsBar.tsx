'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Stats = { total: number; open: number; resolved: number; inProgress: number }

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, resolved: 0, inProgress: 0 })

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
    // Realtime updates
    const channel = supabase.channel('reports-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const cards = [
    { num: stats.total,      label: 'Total Reports',  labelTe: 'మొత్తం నివేదికలు',    color: 'text-green-400' },
    { num: stats.open,       label: 'Open Issues',    labelTe: 'పెండింగ్ సమస్యలు',    color: 'text-red-400' },
    { num: stats.resolved,   label: 'Resolved',       labelTe: 'పరిష్కరించబడింది',    color: 'text-green-400' },
    { num: stats.inProgress, label: 'In Progress',    labelTe: 'ప్రగతిలో ఉంది',       color: 'text-amber-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ num, label, labelTe, color }) => (
        <div key={label} className="stat-card hover:border-green-800 transition-colors">
          <div className={`stat-num ${color}`}>{num}</div>
          <div className="stat-label">{label}</div>
          <div className="te text-[10px] text-[#5a7a5a] mt-0.5">{labelTe}</div>
        </div>
      ))}
    </div>
  )
}
