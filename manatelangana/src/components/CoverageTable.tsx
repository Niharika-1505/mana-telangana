'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface CoverageRow {
  mandal: string
  district: string
  coverage_status: string
  ward_count: number
}

interface Props {
  compact?: boolean
  showContributeButton?: boolean
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'live':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
          ✅ Live
        </span>
      )
    case 'coming_soon':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          🔄 Coming soon
        </span>
      )
    case 'requested':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          📋 Requested
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          📋 Planned
        </span>
      )
  }
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-32 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-24 animate-pulse" /></td>
      <td className="px-4 py-3 text-center"><div className="h-4 bg-slate-100 rounded w-8 mx-auto animate-pulse" /></td>
      <td className="px-4 py-3 text-center"><div className="h-5 bg-slate-100 rounded-full w-20 mx-auto animate-pulse" /></td>
      <td className="px-4 py-3 text-center"><div className="h-4 bg-slate-100 rounded w-20 mx-auto animate-pulse" /></td>
    </tr>
  )
}

export default function CoverageTable({ compact = false, showContributeButton = true }: Props) {
  const [rows, setRows]       = useState<CoverageRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('wards')
        .select('mandal_en, district, coverage_status')
        .order('district')
        .order('mandal_en')

      if (!data) { setLoading(false); return }

      // Group client-side: one row per (mandal, district, status) combination
      const grouped: Record<string, CoverageRow> = {}
      data.forEach(w => {
        const status = (w.coverage_status as string) || 'live'
        const key = `${w.district}|${w.mandal_en}|${status}`
        if (!grouped[key]) {
          grouped[key] = { mandal: w.mandal_en, district: w.district, coverage_status: status, ward_count: 0 }
        }
        grouped[key].ward_count++
      })

      setRows(Object.values(grouped))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">Mandal / Municipality</th>
              {!compact && <th className="text-left px-4 py-3 font-semibold">District</th>}
              <th className="text-center px-4 py-3 font-semibold">Wards</th>
              <th className="text-center px-4 py-3 font-semibold">Status</th>
              {showContributeButton && <th className="text-center px-4 py-3 font-semibold">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-slate-400 border border-slate-200 rounded-xl">
        No coverage data yet.{' '}
        <Link href="/coverage#contribute" className="text-green-700 font-medium hover:underline">
          Be the first to contribute →
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
            <th className="text-left px-4 py-3 font-semibold">Mandal / Municipality</th>
            {!compact && <th className="text-left px-4 py-3 font-semibold">District</th>}
            <th className="text-center px-4 py-3 font-semibold">Wards</th>
            <th className="text-center px-4 py-3 font-semibold">Status</th>
            {showContributeButton && <th className="text-center px-4 py-3 font-semibold">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{row.mandal}</td>
              {!compact && <td className="px-4 py-3 text-slate-500">{row.district}</td>}
              <td className="px-4 py-3 text-center text-slate-600">{row.ward_count}</td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={row.coverage_status} />
              </td>
              {showContributeButton && (
                <td className="px-4 py-3 text-center">
                  {row.coverage_status === 'live' ? (
                    <Link href="/" className="text-xs text-green-700 font-medium hover:underline">
                      View on Map →
                    </Link>
                  ) : (
                    <Link href="#contribute" className="text-xs text-blue-700 font-medium hover:underline">
                      Contribute →
                    </Link>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
