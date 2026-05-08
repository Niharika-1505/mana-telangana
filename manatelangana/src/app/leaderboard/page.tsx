'use client'
import { useEffect, useState } from 'react'
import { supabase, MlaLeaderboard } from '@/lib/supabase'
import { PARTY_COLORS } from '@/lib/utils'
import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useLang } from '@/lib/i18n'

export default function LeaderboardPage() {
  const [data, setData] = useState<MlaLeaderboard[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

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
              {t('lb_title')}
            </h1>
            <p className="text-base text-[#5a7a5a] mt-1">{t('lb_subtitle')}</p>
          </div>
          <div className="text-right text-xs text-[#5a7a5a]">
            <div>{t('lb_updated')}</div>
            <div>{t('lb_district')}</div>
          </div>
        </div>

        {/* Score explanation */}
        <div className="card p-4 mb-6 flex flex-wrap gap-4 text-xs text-[#9ab89a]">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> {t('lb_good')}</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> {t('lb_moderate')}</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /> {t('lb_poor')}</div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_80px_80px_80px_100px] gap-2 px-5 py-3 bg-[#1e2e1e] border-b border-[#2d442d] text-xs font-semibold text-[#5a7a5a] uppercase tracking-widest">
            <div>{t('lb_rank')}</div>
            <div>{t('lb_mla_col')}</div>
            <div className="text-center">{t('lb_issues')}</div>
            <div className="text-center">{t('lb_resolved')}</div>
            <div className="text-center">{t('lb_pending')}</div>
            <div className="text-center">{t('lb_score')}</div>
          </div>

          {loading && (
            <div className="py-12 text-center text-[#5a7a5a] text-sm">{t('lb_loading')}</div>
          )}

          {!loading && data.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#5a7a5a] text-sm">{t('lb_empty')}</p>
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
                <div className="text-xs text-[#5a7a5a] mt-0.5">{mla.constituency_en} {t('lb_constituency')}</div>
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
          <span>{t('lb_note')}</span>
        </div>
      </main>
      <TransparencyFooter />
    </>
  )
}
