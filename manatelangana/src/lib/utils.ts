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
  INC: 'bg-blue-900 text-blue-300',
  BRS: 'bg-red-900 text-red-300',
  BJP: 'bg-orange-900 text-orange-300',
  TDP: 'bg-yellow-900 text-yellow-300',
}

export const STATUS_CONFIG = {
  open:        { label: 'Open',        labelTe: 'తెరవబడింది',      color: 'text-red-400',    dot: 'bg-red-400' },
  in_progress: { label: 'In Progress', labelTe: 'ప్రగతిలో ఉంది',   color: 'text-amber-400',  dot: 'bg-amber-400' },
  resolved:    { label: 'Resolved',    labelTe: 'పరిష్కరించబడింది', color: 'text-green-400',  dot: 'bg-green-400' },
  rejected:    { label: 'Rejected',    labelTe: 'తిరస్కరించబడింది', color: 'text-gray-400',   dot: 'bg-gray-400' },
}

export const SEVERITY_CONFIG = {
  low:    { label: 'Low',    labelTe: 'తక్కువ',   color: 'text-green-400', bg: 'bg-green-900' },
  medium: { label: 'Medium', labelTe: 'మధ్యస్థం', color: 'text-amber-400', bg: 'bg-amber-900' },
  high:   { label: 'High',   labelTe: 'అధికం',    color: 'text-red-400',   bg: 'bg-red-900' },
}
