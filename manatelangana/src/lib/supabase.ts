import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | undefined

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// Lazy proxy — defers client creation to first use at request time.
// Prevents build-time failures when env vars are not available locally.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_: SupabaseClient, prop: string | symbol) {
    const client = getClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export type Report = {
  id: string
  ward_id: string
  issue_type_id: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'rejected' | 'inactive'
  photo_url: string | null
  description: string | null
  lat: number | null
  lng: number | null
  landmark: string | null
  upvotes: number
  is_test: boolean
  is_duplicate: boolean
  browser_fingerprint: string | null
  reporter_says_fixed_at: string | null
  resolution_note: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  wards?: Ward
  issue_types?: IssueType
}

export type ReportVerification = {
  id: string
  report_id: string
  verdict: 'fixed' | 'still_broken'
  photo_url: string | null
  note: string | null
  browser_fingerprint: string
  created_at: string
}

export type Ward = {
  id: string
  ward_number: number
  ward_name_en: string
  ward_name_te: string
  mandal_en: string
  mandal_te: string
  constituency_en: string
  mla_name: string
  mla_party: string
  mp_name: string
  mp_constituency: string
  district: string
  lat: number | null
  lng: number | null
}

export type IssueType = {
  id: string
  slug: string
  name_en: string
  name_te: string
  emoji: string
  description: string
  sort_order: number
  is_active: boolean
}

export type MlaLeaderboard = {
  mla_name: string
  mla_party: string
  constituency_en: string
  total_reports: number
  resolved: number
  open_issues: number
  in_progress: number
  resolution_score: number
}

export type Contribution = {
  id: string
  amount_paise: number
  status: string
  created_at: string
}

export type FundProposal = {
  id: string
  title: string
  description: string
  amount_paise: number
  status: string
  votes: number
  created_at: string
}

export type PlatformCost = {
  id: string
  item: string
  provider: string
  monthly_paise: number
  annual_paise: number
  notes: string
}

export type Volunteer = {
  id: string
  name: string
  email: string
  phone: string | null
  roles: string[]
  area: string | null
  message: string | null
  status: 'new' | 'contacted' | 'active' | 'inactive'
  notes: string | null
  created_at: string
}
