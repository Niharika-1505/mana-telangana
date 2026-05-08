'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface AccountabilityChainProps {
  wardId?: string | null
  lat?: number | null
  lng?: number | null
}

type WardInfo = {
  ward_name_en: string
  mandal_en: string
  ward_councillor: string | null
  councillor_party: string | null
}

type MlaInfo = {
  name_en: string
  party: string | null
  constituency_en: string
}

type MpInfo = {
  id: string
  name_en: string
  party: string | null
  constituency_en: string
}

const PARTY_COLORS: Record<string, string> = {
  INC:   'bg-green-100 text-green-800',
  BJP:   'bg-orange-100 text-orange-800',
  BRS:   'bg-pink-100 text-pink-800',
  AIMIM: 'bg-emerald-100 text-emerald-800',
  IND:   'bg-gray-100 text-gray-600',
}

function PartyBadge({ party }: { party: string | null | undefined }) {
  if (!party) return null
  const cls = PARTY_COLORS[party.toUpperCase()] ?? 'bg-gray-100 text-gray-600'
  return <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cls}`}>{party}</span>
}

function Connector() {
  return (
    <div className="flex justify-center">
      <div style={{ width: 2, height: 20, background: '#1a6b5a' }} />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 animate-pulse">
      <div className="h-2.5 bg-slate-100 rounded w-1/4 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-2/3 mb-1" />
      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
    </div>
  )
}

function ChainCard({ icon, title, name, party, sub }: {
  icon: string
  title: string
  name: string
  party?: string | null
  sub?: string | null
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
      <div className="text-xs text-slate-400 font-medium mb-1">{icon} {title}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-slate-800">{name}</span>
        <PartyBadge party={party} />
      </div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

const SECTION_HEADER = (
  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
    Accountability
  </div>
)

export default function AccountabilityChain({ wardId, lat, lng }: AccountabilityChainProps) {
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(false)
  const [ward, setWard]                 = useState<WardInfo | null>(null)
  const [mla, setMla]                   = useState<MlaInfo | null>(null)
  const [mp, setMp]                     = useState<MpInfo | null>(null)
  const [hasGps, setHasGps]             = useState(false)
  const [fallbackMlas, setFallbackMlas] = useState<MlaInfo[]>([])

  useEffect(() => {
    async function loadChain() {
      setLoading(true)
      setError(false)
      setWard(null); setMla(null); setMp(null)
      setHasGps(false); setFallbackMlas([])

      try {
        if (wardId) {
          const { data: w } = await supabase
            .from('wards')
            .select('ward_name_en, mandal_en, ward_councillor, councillor_party, mla_id, mp_id')
            .eq('id', wardId)
            .single()

          if (!w) { setLoading(false); return }

          setWard({
            ward_name_en:    w.ward_name_en,
            mandal_en:       w.mandal_en,
            ward_councillor: w.ward_councillor ?? null,
            councillor_party: w.councillor_party ?? null,
          })

          const [mlaRes, mpRes] = await Promise.all([
            w.mla_id
              ? supabase.from('mla').select('name_en, party, constituency_en').eq('id', w.mla_id).single()
              : Promise.resolve({ data: null }),
            w.mp_id
              ? supabase.from('mp').select('id, name_en, party, constituency_en').eq('id', w.mp_id).single()
              : Promise.resolve({ data: null }),
          ])

          if (mlaRes.data) setMla(mlaRes.data as MlaInfo)
          if (mpRes.data)  setMp(mpRes.data  as MpInfo)

        } else if (lat != null && lng != null) {
          setHasGps(true)

          const { data: nalgondaMp } = await supabase
            .from('mp')
            .select('id, name_en, party, constituency_en')
            .eq('constituency_en', 'Nalgonda')
            .single()

          if (nalgondaMp) {
            setMp(nalgondaMp as MpInfo)
            const { data: mlas } = await supabase
              .from('mla')
              .select('name_en, party, constituency_en')
              .eq('mp_id', nalgondaMp.id)
              .order('constituency_en')
            setFallbackMlas((mlas ?? []) as MlaInfo[])
          }
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadChain()
  }, [wardId, lat, lng])

  // Loading state
  if (loading) {
    return (
      <div className="card p-4">
        {SECTION_HEADER}
        <SkeletonCard />
        <Connector />
        <SkeletonCard />
        <Connector />
        <SkeletonCard />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="card p-4">
        {SECTION_HEADER}
        <p className="text-xs text-slate-400">Unable to load accountability data</p>
      </div>
    )
  }

  // STATE 4 — nothing known
  if (!ward && !mla && !mp && !hasGps) {
    return (
      <div className="card p-4">
        {SECTION_HEADER}
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-sm text-slate-500 mb-2">
            ℹ️ Accountability data for this area is being compiled
          </p>
          <Link href="/coverage" className="text-xs text-green-700 font-medium hover:underline">
            Help us complete this data →
          </Link>
        </div>
      </div>
    )
  }

  // STATE 3 — GPS only, no ward
  if (!ward && hasGps) {
    return (
      <div className="card p-4">
        {SECTION_HEADER}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-1">
          <div className="text-xs font-medium text-amber-700 mb-0.5">
            ⚠️ Ward details not available for this area yet
          </div>
          <div className="text-xs te text-slate-500">మీ వార్డు వివరాలు త్వరలో</div>
        </div>

        {(mla || fallbackMlas.length > 0) && (
          <>
            <Connector />
            {mla ? (
              <ChainCard icon="🗳" title="MLA" name={mla.name_en} party={mla.party} sub={`${mla.constituency_en} Assembly`} />
            ) : fallbackMlas.length > 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-400 font-medium mb-1">🗳 MLA</div>
                <div className="text-xs text-slate-500">{fallbackMlas.length} MLAs in Nalgonda constituency</div>
              </div>
            ) : null}
          </>
        )}

        {mp && (
          <>
            <Connector />
            <ChainCard icon="🏟" title="MP (Member of Parliament)" name={mp.name_en} party={mp.party} sub={`${mp.constituency_en} Lok Sabha`} />
          </>
        )}

        <div className="mt-3">
          <Link href="/coverage" className="text-xs text-green-700 font-medium hover:underline">
            Contribute ward data →
          </Link>
        </div>
      </div>
    )
  }

  // STATE 1 & 2 — Ward found (full or partial chain)
  return (
    <div className="card p-4">
      {SECTION_HEADER}

      <ChainCard
        icon="📍"
        title="Ward"
        name={ward!.ward_name_en}
        sub={ward!.mandal_en ? `${ward!.mandal_en} Mandal` : null}
      />

      <Connector />

      {ward!.ward_councillor ? (
        <ChainCard
          icon="🏛"
          title="Ward Councillor"
          name={ward!.ward_councillor}
          party={ward!.councillor_party}
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
          <div className="text-xs text-slate-400 font-medium mb-1">🏛 Ward Councillor</div>
          <div className="text-sm text-slate-500 mb-0.5">Data coming soon</div>
          <Link href="/coverage" className="text-xs text-green-700 font-medium hover:underline">
            Know who it is? → Contribute
          </Link>
        </div>
      )}

      {mla && (
        <>
          <Connector />
          <ChainCard
            icon="🗳"
            title="MLA"
            name={mla.name_en}
            party={mla.party}
            sub={`${mla.constituency_en} Assembly`}
          />
        </>
      )}

      {mp && (
        <>
          <Connector />
          <ChainCard
            icon="🏟"
            title="MP (Member of Parliament)"
            name={mp.name_en}
            party={mp.party}
            sub={`${mp.constituency_en} Lok Sabha`}
          />
        </>
      )}
    </div>
  )
}
