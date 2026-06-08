'use client'
import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { STATUS_CONFIG, SEVERITY_CONFIG, timeAgo } from '@/lib/utils'
import AccountabilityChain from '@/components/AccountabilityChain'
import Footer from '@/components/Footer'
import { MapPin, CheckCircle2, XCircle, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReportDetailClient({ id }: { id: string }) {
  const [report, setReport]       = useState<any>(null)
  const [notFound, setNotFound]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [fixedCount, setFixedCount]   = useState(0)
  const [brokenCount, setBrokenCount] = useState(0)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reports')
        .select('*, wards(*), issue_types(*)')
        .eq('id', id)
        .single()
      if (!data) { setNotFound(true); setLoading(false); return }
      setReport(data)
      setLoading(false)

      const { data: verifs } = await supabase
        .from('report_verifications')
        .select('verdict')
        .eq('report_id', id)
      if (verifs) {
        setFixedCount(verifs.filter((v: any) => v.verdict === 'fixed').length)
        setBrokenCount(verifs.filter((v: any) => v.verdict === 'still_broken').length)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!report?.lat || !report?.lng || !mapRef.current) return
    let leafletMap: any = null

    async function initMap() {
      const L = (await import('leaflet')).default
      if (!mapRef.current) return
      leafletMap = L.map(mapRef.current, {
        center: [report.lat, report.lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(leafletMap)
      const icon = L.divIcon({
        html: `<div style="background:#ef4444;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      })
      L.marker([report.lat, report.lng], { icon }).addTo(leafletMap)
    }

    initMap()
    return () => { if (leafletMap) leafletMap.remove() }
  }, [report])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast.success('Link copied!'),
      () => toast.error('Could not copy link'),
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading…
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Report not found.</p>
        <Link href="/" className="text-green-600 hover:underline">← Back to Map</Link>
      </div>
    )
  }

  const issueType = report.issue_types as any
  const ward      = report.wards      as any
  const status    = STATUS_CONFIG[report.status   as keyof typeof STATUS_CONFIG]
  const severity  = SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">

        {/* 1 — Back link */}
        <Link href="/" className="text-sm text-green-700 hover:underline flex items-center gap-1">
          ← Back to Map
        </Link>

        {/* 2 — Issue type + status + severity + time */}
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">{issueType?.emoji}</span>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-slate-900 text-lg leading-tight">
                {issueType?.name_en}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`text-xs flex items-center gap-1 font-medium ${status?.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                  {status?.label}
                </span>
                {severity && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severity.color} ${severity.bg}`}>
                    {severity.label}
                  </span>
                )}
                <span className="text-xs text-slate-400">{timeAgo(report.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 — Photo */}
        {report.photo_url && (
          <a href={report.photo_url} target="_blank" rel="noreferrer">
            <img
              src={report.photo_url}
              alt="Report photo"
              className="w-full rounded-xl object-cover max-h-72 hover:opacity-90 transition-opacity"
            />
          </a>
        )}

        {/* 4 — Ward / Mandal / Constituency / Landmark */}
        <div className="card p-4 space-y-1.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <MapPin size={12} /> Location
          </div>
          {ward?.ward_name_en && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ward</span>
              <span className="text-slate-700">{ward.ward_name_en}</span>
            </div>
          )}
          {ward?.mandal_en && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Mandal</span>
              <span className="text-slate-700">{ward.mandal_en}</span>
            </div>
          )}
          {ward?.constituency_en && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Constituency</span>
              <span className="text-slate-700">{ward.constituency_en}</span>
            </div>
          )}
          {report.landmark && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Landmark</span>
              <span className="text-slate-700 text-right max-w-[60%]">{report.landmark}</span>
            </div>
          )}
        </div>

        {/* 5 — Mini non-interactive map */}
        {report.lat && report.lng && (
          <div
            ref={mapRef}
            style={{ height: 220 }}
            className="rounded-xl overflow-hidden border border-slate-200"
          />
        )}

        {/* 6 — Accountability chain */}
        <AccountabilityChain wardId={report.ward_id} lat={report.lat} lng={report.lng} />

        {/* 7 — Description */}
        {report.description && (
          <div className="card p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{report.description}</p>
          </div>
        )}

        {/* 8 — Verification counts + View on map link */}
        <div className="card p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Community Verification
          </div>
          <div className="flex gap-6 mb-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="font-semibold text-green-700">{fixedCount}</span>
              <span className="text-xs text-slate-400">say fixed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle size={16} className="text-red-400" />
              <span className="font-semibold text-red-600">{brokenCount}</span>
              <span className="text-xs text-slate-400">say still broken</span>
            </div>
          </div>
          <Link href="/" className="text-sm text-green-600 hover:underline">
            View on map →
          </Link>
        </div>

        {/* 9 — Share button */}
        <button
          onClick={handleShare}
          className="w-full card p-3 flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-green-700 hover:border-green-300 transition-colors"
        >
          <Share2 size={16} /> Share this report
        </button>

      </div>

      {/* 10 — Footer */}
      <Footer />
    </div>
  )
}
