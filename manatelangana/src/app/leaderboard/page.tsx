'use client'
import { useEffect, useState } from 'react'
import { supabase, MlaLeaderboard } from '@/lib/supabase'
import { PARTY_COLORS } from '@/lib/utils'
import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function LeaderboardPage() {
  const [data, setData] = useState<MlaLeaderboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: rows } = await supabase.from('mla_leaderboard').select('*')
      if (rows) setData(rows)
      setLoading(false)
    }
    load()
  }, [])

  const rankIcon = (i: number) =>
    i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`

  const scoreColor = (score: number) =>
    score >= 70 ? 'text-green-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'

  const scoreBg = (score: number) =>
    score >= 70 ? 'bg-green-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#e8f5e8] flex items-center gap-2">
              <Trophy className="text-amber-400" size={24} />
              MLA Accountability Leaderboard
            </h1>
            <p className="te text-base text-[#5a7a5a] mt-1">జవాబుదారీతనం · ఎంత వేగంగా సమస్యలు పరిష్కరిస్తున్నారు?</p>
          </div>
          <div className="text-right text-xs text-[#5a7a5a]">
            <div>Updated live</div>
            <div>Nalgonda District · 2026</div>
          </div>
        </div>

        {/* Score explanation */}
        <div className="card p-4 mb-6 flex flex-wrap gap-4 text-xs text-[#9ab89a]">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> Score ≥ 70% — Good</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> Score 40–70% — Moderate</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /> Score &lt; 40% — Needs attention</div>
          <div className="ml-auto te">స్కోర్ = 7 రోజులలో పరిష్కరించిన సమస్యల శాతం</div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1fr_80px_80px_80px_100px] gap-2 px-5 py-3 bg-[#1e2e1e] border-b border-[#2d442d] text-xs font-semibold text-[#5a7a5a] uppercase tracking-widest">
            <div>Rank</div>
            <div>MLA / Constituency</div>
            <div className="text-center">Issues</div>
            <div className="text-center">Resolved</div>
            <div className="text-center">Pending</div>
            <div className="text-center">Score</div>
          </div>

          {loading && (
            <div className="py-12 text-center text-[#5a7a5a] text-sm">Loading leaderboard...</div>
          )}

          {!loading && data.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#5a7a5a] text-sm">No reports yet — be the first to report an issue!</p>
            </div>
          )}

          {data.map((mla, i) => (
            <div
              key={mla.mla_name}
              className="grid grid-cols-[48px_1fr_80px_80px_80px_100px] gap-2 px-5 py-4 border-b border-[#1e2e1e] hover:bg-[#1e2e1e] transition-colors items-center"
            >
              {/* Rank */}
              <div className="font-mono text-lg font-bold text-center">
                {typeof rankIcon(i) === 'string' && ['🥇','🥈','🥉'].includes(rankIcon(i) as string)
                  ? <span className="text-xl">{rankIcon(i)}</span>
                  : <span className={i < 3 ? 'text-amber-400' : 'text-[#5a7a5a]'}>{rankIcon(i)}</span>
                }
              </div>

              {/* MLA info */}
              <div>
                <div className="font-semibold text-[#e8f5e8] text-sm">{mla.mla_name}</div>
                <div className="text-xs text-[#5a7a5a] mt-0.5">{mla.constituency_en} Constituency</div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${PARTY_COLORS[mla.mla_party] || 'bg-gray-800 text-gray-400'}`}>
                  {mla.mla_party}
                </span>
              </div>

              {/* Stats */}
              <div className="text-center font-mono text-base font-bold text-red-400">{mla.total_reports}</div>
              <div className="text-center font-mono text-base font-bold text-green-400">{mla.resolved}</div>
              <div className="text-center font-mono text-base font-bold text-amber-400">{mla.open_issues}</div>

              {/* Score */}
              <div className="flex flex-col items-center gap-1">
                <span className={`font-mono text-sm font-bold ${scoreColor(Number(mla.resolution_score))}`}>
                  {mla.resolution_score}%
                </span>
                <div className="w-16 h-1.5 bg-[#2d442d] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreBg(Number(mla.resolution_score))}`}
                    style={{ width: `${mla.resolution_score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="card p-4 mt-4 flex items-start gap-3 text-xs text-[#5a7a5a]">
          <span className="text-lg">ℹ️</span>
          <span>
            Score = % of issues resolved within 7 days of reporting. Updated in real time as citizens report and issues get resolved.
            Data is entirely citizen-sourced and anonymous.{' '}
            <span className="te">స్కోర్ = 7 రోజులలో పరిష్కరించిన సమస్యల శాతం. డేటా పౌరులు అందించింది.</span>
          </span>
        </div>
      </main>
      <TransparencyFooter />
    </>
  )
}
