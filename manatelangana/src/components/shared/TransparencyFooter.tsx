'use client'
import { useEffect, useState } from 'react'
import { supabase, PlatformCost, FundProposal } from '@/lib/supabase'
import { formatPaise } from '@/lib/utils'
import { Heart, ExternalLink } from 'lucide-react'

export default function TransparencyFooter() {
  const [costs, setCosts] = useState<PlatformCost[]>([])
  const [totalCollected, setTotalCollected] = useState(0)
  const [totalContributors, setTotalContributors] = useState(0)
  const [proposals, setProposals] = useState<FundProposal[]>([])
  const [reportCount, setReportCount] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    async function load() {
      const [costsRes, contribRes, proposalRes, reportsRes] = await Promise.all([
        supabase.from('platform_costs').select('*').eq('is_active', true),
        supabase.from('contributions').select('amount_paise').eq('status', 'captured'),
        supabase.from('fund_proposals').select('*').eq('status', 'voting').order('votes', { ascending: false }).limit(3),
        supabase.from('reports').select('id', { count: 'exact', head: true }),
      ])
      if (costsRes.data) setCosts(costsRes.data)
      if (contribRes.data) {
        setTotalCollected(contribRes.data.reduce((s, c) => s + c.amount_paise, 0))
        setTotalContributors(contribRes.data.length)
      }
      if (proposalRes.data) setProposals(proposalRes.data)
      if (reportsRes.count) setReportCount(reportsRes.count)
    }
    load()
  }, [])

  const monthlyTotal = costs.reduce((s, c) => s + c.monthly_paise, 0)
  const annualTotal  = costs.reduce((s, c) => s + c.annual_paise, 0)
  const dailyCost    = Math.round(annualTotal / 365)
  const balance      = totalCollected - annualTotal

  return (
    <footer className="border-t border-[#2d442d] bg-[#0f1a0f] mt-16">
      {/* Transparency bar */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-left"
        >
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#5a7a5a]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Platform running
            </span>
            <span>💻 Monthly cost: <strong className="text-[#9ab89a]">{formatPaise(monthlyTotal)}</strong></span>
            <span>📅 Annual cost: <strong className="text-[#9ab89a]">{formatPaise(annualTotal)}</strong></span>
            <span>⚡ Per day: <strong className="text-[#9ab89a]">{formatPaise(dailyCost)}</strong></span>
            <span>📊 Total reports: <strong className="text-green-400">{reportCount}</strong></span>
            {totalContributors > 0 && (
              <span>🙏 Citizens contributed: <strong className="text-green-400">{formatPaise(totalCollected)}</strong> from {totalContributors} people</span>
            )}
            <span className="ml-auto text-[#3d5a3d] hover:text-[#5a7a5a] transition-colors">
              {showDetails ? '▲ Hide details' : '▼ Show transparency details'}
            </span>
          </div>
        </button>

        {/* Expanded details */}
        {showDetails && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">

            {/* Cost breakdown */}
            <div className="bg-[#1a271a] border border-[#2d442d] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#9ab89a] mb-3 flex items-center gap-2">
                💻 Platform Costs
                <span className="te text-xs text-[#5a7a5a]">వేదిక ఖర్చులు</span>
              </h3>
              <div className="space-y-2">
                {costs.map(c => (
                  <div key={c.id} className="flex justify-between text-xs">
                    <span className="text-[#5a7a5a]">{c.item}</span>
                    <span className={c.monthly_paise === 0 ? 'text-green-400' : 'text-[#9ab89a]'}>
                      {c.monthly_paise === 0 ? 'FREE' : formatPaise(c.monthly_paise) + '/mo'}
                    </span>
                  </div>
                ))}
                <div className="border-t border-[#2d442d] pt-2 flex justify-between text-xs font-semibold">
                  <span className="text-[#9ab89a]">Total / month</span>
                  <span className="text-green-400">{formatPaise(monthlyTotal)}</span>
                </div>
              </div>
            </div>

            {/* Citizen Fund */}
            <div className="bg-[#1a271a] border border-[#2d442d] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#9ab89a] mb-3 flex items-center gap-2">
                🤝 Citizen Fund
                <span className="te text-xs text-[#5a7a5a]">పౌర నిధి</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5a7a5a]">Total collected</span>
                  <span className="text-green-400 font-semibold">{formatPaise(totalCollected)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a7a5a]">Contributors</span>
                  <span className="text-[#9ab89a]">{totalContributors} citizens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a7a5a]">Platform costs</span>
                  <span className="text-[#9ab89a]">− {formatPaise(annualTotal)}</span>
                </div>
                <div className="border-t border-[#2d442d] pt-2 flex justify-between font-semibold">
                  <span className="text-[#9ab89a]">Available for community</span>
                  <span className={balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatPaise(Math.max(0, balance))}
                  </span>
                </div>
              </div>
              <a
                href="/contribute"
                className="mt-3 w-full flex items-center justify-center gap-1.5 bg-green-400/10 border border-green-800 text-green-400 text-xs font-semibold py-2 rounded-lg hover:bg-green-400/20 transition-colors"
              >
                <Heart size={12} />
                Contribute ₹2 · సహాయం చేయండి
              </a>
            </div>

            {/* Community proposals */}
            <div className="bg-[#1a271a] border border-[#2d442d] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#9ab89a] mb-3 flex items-center gap-2">
                🗳 Community Proposals
                <span className="te text-xs text-[#5a7a5a]">ప్రజా ప్రతిపాదనలు</span>
              </h3>
              {proposals.length === 0 ? (
                <p className="text-xs text-[#5a7a5a]">No proposals yet. Be the first to suggest how to use the community fund!</p>
              ) : (
                <div className="space-y-2">
                  {proposals.map(p => (
                    <div key={p.id} className="text-xs border border-[#2d442d] rounded-lg p-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[#9ab89a] font-medium">{p.title}</span>
                        <span className="text-green-400 shrink-0">{p.votes} votes</span>
                      </div>
                      <div className="text-[#5a7a5a] mt-1">{formatPaise(p.amount_paise)}</div>
                    </div>
                  ))}
                </div>
              )}
              <a
                href="/fund"
                className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#1e2e1e] border border-[#2d442d] text-[#9ab89a] text-xs font-medium py-2 rounded-lg hover:border-green-800 transition-colors"
              >
                <ExternalLink size={12} />
                View all proposals
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1e2e1e] py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#3d5a3d]">
          <div className="flex items-center gap-3">
            <span className="te">మన తెలంగాణ</span>
            <span>·</span>
            <span>Open source civic platform</span>
            <span>·</span>
            <span>No ads. No tracking. No login.</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/Niharika-1505/mana-telangana" target="_blank" className="hover:text-[#5a7a5a] transition-colors">GitHub</a>
            <span>·</span>
            <span>manatelangana.org.in</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
