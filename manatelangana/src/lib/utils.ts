// Simple anonymous fingerprint — no personal data collected
export function getFingerprint(): string {
  const key = 'mt_fp'
  if (typeof window === 'undefined') return 'server'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(key, fp)
  }
  return fp
}

export function formatPaise(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`
  return `₹${rupees.toFixed(0)}`
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export const PARTY_COLORS: Record<string, string> = {
  INC: 'bg-blue-100 text-blue-800',
  BRS: 'bg-red-100 text-red-800',
  BJP: 'bg-orange-100 text-orange-800',
  TDP: 'bg-yellow-100 text-yellow-700',
}

export const STATUS_CONFIG = {
  open:        { label: 'Open',        labelTe: 'తెరవబడింది',      color: 'text-red-600',    dot: 'bg-red-500' },
  in_progress: { label: 'In Progress', labelTe: 'ప్రగతిలో ఉంది',   color: 'text-amber-600',  dot: 'bg-amber-500' },
  resolved:    { label: 'Resolved',    labelTe: 'పరిష్కరించబడింది', color: 'text-green-600',  dot: 'bg-green-500' },
  rejected:    { label: 'Rejected',    labelTe: 'తిరస్కరించబడింది', color: 'text-slate-400',  dot: 'bg-slate-400' },
}

export const SEVERITY_CONFIG = {
  low:    { label: 'Low',    labelTe: 'తక్కువ',   color: 'text-green-600', bg: 'bg-green-50' },
  medium: { label: 'Medium', labelTe: 'మధ్యస్థం', color: 'text-amber-600', bg: 'bg-amber-50' },
  high:   { label: 'High',   labelTe: 'అధికం',    color: 'text-red-600',   bg: 'bg-red-50' },
}
