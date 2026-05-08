'use client'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import { supabase, Report } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import ReportDetailModal from './ReportDetailModal'

const ISSUE_COLORS: Record<string, string> = {
  garbage:      '#ef4444',
  pothole:      '#f59e0b',
  drainage:     '#3b82f6',
  streetlight:  '#8b5cf6',
  'open-drain': '#10b981',
  waterlogging: '#0ea5e9',
  dumping:      '#f97316',
  stray:        '#ec4899',
  tree:         '#22c55e',
  encroachment: '#eab308',
  water:        '#06b6d4',
  toilet:       '#a78bfa',
}

const NALGONDA_CENTER: [number, number] = [17.05, 79.27]
const DEFAULT_ZOOM = 9

export default function MapView() {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [mounted, setMounted] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const { t } = useLang()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    loadMap()
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mounted])

  async function loadMap() {
    const L = (await import('leaflet')).default
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: NALGONDA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map
    loadReports(L, map)
  }

  async function loadReports(L: any, map: any) {
    const { data } = await supabase
      .from('reports')
      .select('*, wards(*), issue_types(*)')
      .not('lat', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200)

    if (!data) return
    setReports(data)
    addMarkers(L, map, data)
  }

  function addMarkers(L: any, map: any, data: Report[]) {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    data.forEach(report => {
      if (!report.lat || !report.lng) return
      const slug = (report.issue_types as any)?.slug || 'garbage'
      const color = ISSUE_COLORS[slug] || '#16a34a'
      const emoji = (report.issue_types as any)?.emoji || '📍'

      const icon = L.divIcon({
        html: `<div style="
          background:${color};
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.8);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);
          cursor:pointer;
        "><span style="transform:rotate(45deg);font-size:12px">${emoji}</span></div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      })

      const marker = L.marker([report.lat, report.lng], { icon })
      marker.on('click', () => setSelectedReport(report))

      marker.addTo(map)
      markersRef.current.push(marker)
    })
  }

  const filterItems = [
    { slug: 'all',         emoji: '🗺', labelKey: 'map_filter_all'      as const },
    { slug: 'garbage',     emoji: '🗑', labelKey: 'map_filter_garbage'  as const },
    { slug: 'pothole',     emoji: '🕳', labelKey: 'map_filter_pothole'  as const },
    { slug: 'drainage',    emoji: '💧', labelKey: 'map_filter_drainage' as const },
    { slug: 'streetlight', emoji: '💡', labelKey: 'map_filter_light'    as const },
    { slug: 'waterlogging',emoji: '🌧', labelKey: 'map_filter_water'    as const },
  ]

  return (
    <div className="card overflow-hidden">
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <div className="live-dot" />
          {t('map_live')}
        </div>
        <Link href="/report" className="btn-primary text-xs px-3 py-1.5">
          {t('map_report_btn')}
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-4 py-2 border-b border-slate-100 overflow-x-auto bg-slate-50">
        {filterItems.map(({ slug, emoji, labelKey }) => (
          <button
            key={slug}
            onClick={() => setFilter(slug)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all
              ${filter === slug
                ? 'bg-green-100 border border-green-400 text-green-700 font-medium'
                : 'border border-slate-200 text-slate-500 hover:border-green-300 bg-white'
              }`}
          >
            {emoji} {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: '420px', width: '100%' }} />

      {/* Legend */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-3">
        {Object.entries(ISSUE_COLORS).slice(0, 6).map(([slug, color]) => (
          <div key={slug} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {slug.charAt(0).toUpperCase() + slug.slice(1)}
          </div>
        ))}
      </div>
    </div>
  )
}
