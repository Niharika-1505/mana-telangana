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

const TELANGANA_CENTER: [number, number] = [17.5, 79.5]
const DEFAULT_ZOOM = 7
const TELANGANA_BOUNDS: [[number, number], [number, number]] = [[15.5, 77.0], [19.9, 81.5]]
const DISTRICT_GEOJSON_URLS = [
  'https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/TELANGANA/TELANGANA_DISTRICTS.geojson',
  'https://raw.githubusercontent.com/datameet/india-district-boundaries/master/states/Telangana.geojson',
]

const DISTRICT_STYLE = {
  color: '#1a6b5a', weight: 1.5, opacity: 0.6, fillOpacity: 0.03, fillColor: '#1a6b5a',
}
const DISTRICT_HOVER_STYLE = {
  color: '#1a6b5a', weight: 2.5, opacity: 0.9, fillOpacity: 0.08, fillColor: '#1a6b5a',
}

export default function MapView() {
  const mapRef        = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletRef    = useRef<any>(null)
  const markersRef    = useRef<any[]>([])
  const [reports, setReports]             = useState<Report[]>([])
  const [filter, setFilter]               = useState<string>('all')
  const [mounted, setMounted]             = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const { t } = useLang()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    loadMap()
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [mounted])

  // Re-render markers whenever filter or reports list changes
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return
    addMarkers(leafletRef.current, mapInstanceRef.current, reports, filter)
  }, [filter, reports])

  async function loadMap() {
    const L = (await import('leaflet')).default
    if (!mapRef.current || mapInstanceRef.current) return
    leafletRef.current = L

    const map = L.map(mapRef.current, {
      center: TELANGANA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      maxBounds: TELANGANA_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 7,
      maxZoom: 18,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map

    // District boundaries load first so pins always render on top
    await loadDistrictBoundaries(L, map)
    loadReports()
  }

  async function loadDistrictBoundaries(L: any, map: any) {
    try {
      let geojson: any = null
      for (const url of DISTRICT_GEOJSON_URLS) {
        try {
          const res = await fetch(url)
          if (res.ok) { geojson = await res.json(); break }
        } catch { /* try next */ }
      }
      if (!geojson) return
      L.geoJSON(geojson, {
        style: () => ({ ...DISTRICT_STYLE }),
        onEachFeature: (feature: any, layer: any) => {
          // Try common property name variants from different GeoJSON sources
          const name =
            feature.properties?.district ||
            feature.properties?.DISTRICT ||
            feature.properties?.District ||
            feature.properties?.name ||
            feature.properties?.NAME ||
            ''
          if (name) layer.bindTooltip(name, { sticky: true, opacity: 0.85 })
          layer.on({
            mouseover: (e: any) => e.target.setStyle({ ...DISTRICT_HOVER_STYLE }),
            mouseout:  (e: any) => e.target.setStyle({ ...DISTRICT_STYLE }),
          })
        },
      }).addTo(map)
    } catch {
      // GeoJSON fetch failed — map works normally without district outlines
    }
  }

  async function loadReports() {
    const { data } = await supabase
      .from('reports')
      .select('*, wards(*), issue_types(*)')
      .not('lat', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200)

    if (!data) return
    setReports(data) // triggers useEffect([filter, reports]) which calls addMarkers
  }

  function addMarkers(L: any, map: any, data: Report[], activeFilter: string) {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const filtered = activeFilter === 'all'
      ? data
      : data.filter(r => (r.issue_types as any)?.slug === activeFilter)

    filtered.forEach(report => {
      if (!report.lat || !report.lng) return
      const slug  = (report.issue_types as any)?.slug  || 'garbage'
      const color = ISSUE_COLORS[slug] || '#16a34a'
      const emoji = (report.issue_types as any)?.emoji || '📍'

      const icon = L.divIcon({
        html: `<div style="
          background:${color};width:28px;height:28px;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          border:2px solid rgba(255,255,255,0.8);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;
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
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 min-w-0 truncate">
          <div className="live-dot flex-shrink-0" />
          {t('map_live')}
        </div>
        <Link href="/report" className="btn-primary text-xs px-3 py-1.5 flex-shrink-0 whitespace-nowrap">
          {t('map_report_btn')}
        </Link>
      </div>

      {/* Filter pills — horizontally scrollable on mobile */}
      <div className="flex gap-2 px-4 py-2 border-b border-slate-100 overflow-x-auto scrollbar-hide bg-slate-50">
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

      {/* Map canvas */}
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
