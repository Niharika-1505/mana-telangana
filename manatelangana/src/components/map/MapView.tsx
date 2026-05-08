'use client'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import { supabase, Report } from '@/lib/supabase'
import { timeAgo, STATUS_CONFIG } from '@/lib/utils'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'

const ISSUE_COLORS: Record<string, string> = {
  garbage:      '#f87171',
  pothole:      '#fbbf24',
  drainage:     '#60a5fa',
  streetlight:  '#a78bfa',
  'open-drain': '#34d399',
  waterlogging: '#38bdf8',
  dumping:      '#fb923c',
  stray:        '#f472b6',
  tree:         '#86efac',
  encroachment: '#fde68a',
  water:        '#67e8f9',
  toilet:       '#c4b5fd',
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
      const color = ISSUE_COLORS[slug] || '#4ade80'
      const emoji = (report.issue_types as any)?.emoji || '📍'
      const status = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]

      const icon = L.divIcon({
        html: `<div style="
          background:${color};
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);border:2px solid rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          cursor:pointer;
        "><span style="transform:rotate(45deg);font-size:12px">${emoji}</span></div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      })

      const marker = L.marker([report.lat, report.lng], { icon })
      marker.bindPopup(`
        <div style="min-width:200px;padding:4px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:18px">${emoji}</span>
            <strong style="font-size:13px">${(report.issue_types as any)?.name_en || 'Issue'}</strong>
          </div>
          <div style="font-size:11px;color:#9ab89a;margin-bottom:4px">
            📍 ${report.wards ? report.wards.ward_name_en : 'Unknown ward'}
          </div>
          <div style="font-size:11px;color:#9ab89a;margin-bottom:4px">
            🏛 MLA: ${report.wards ? report.wards.mla_name : '—'}
          </div>
          <div style="font-size:11px;margin-bottom:8px">
            <span style="color:${color}">${status?.label || report.status}</span>
            · ${timeAgo(report.created_at)}
          </div>
          ${report.photo_url ? `<img src="${report.photo_url}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px" />` : ''}
          <a href="/report/${report.id}" style="font-size:11px;color:#4ade80">View details →</a>
        </div>
      `, { maxWidth: 240 })

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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d442d]">
        <div className="flex items-center gap-2 text-sm font-medium text-[#9ab89a]">
          <div className="live-dot" />
          {t('map_live')}
        </div>
        <Link href="/report" className="btn-primary text-xs px-3 py-1.5">
          {t('map_report_btn')}
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-4 py-2 border-b border-[#2d442d] overflow-x-auto">
        {filterItems.map(({ slug, emoji, labelKey }) => (
          <button
            key={slug}
            onClick={() => setFilter(slug)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all
              ${filter === slug
                ? 'bg-green-400/15 border border-green-700 text-green-400'
                : 'border border-[#2d442d] text-[#5a7a5a] hover:border-green-900'
              }`}
          >
            {emoji} {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: '420px', width: '100%' }} />

      {/* Legend */}
      <div className="px-4 py-2 border-t border-[#2d442d] flex flex-wrap gap-3">
        {Object.entries(ISSUE_COLORS).slice(0, 6).map(([slug, color]) => (
          <div key={slug} className="flex items-center gap-1.5 text-xs text-[#5a7a5a]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {slug.charAt(0).toUpperCase() + slug.slice(1)}
          </div>
        ))}
      </div>
    </div>
  )
}
