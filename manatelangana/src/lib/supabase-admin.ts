import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// SERVICE ROLE client — bypasses all RLS policies.
// NEVER import this file from src/components/ or any client component.
// Only use inside src/app/api/ route handlers.

let _client: SupabaseClient | undefined

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _client
}

// Lazy proxy — defers client creation to first use at request time.
// Prevents build-time failures when env vars are not available locally.
const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_: SupabaseClient, prop: string | symbol) {
    const client = getClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export default supabaseAdmin
