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

// Lazy proxy needed because SUPABASE_SERVICE_ROLE_KEY is a runtime-only env var.
// Turbopack evaluates this module at build time; direct createClient() would fail
// with "supabaseUrl is required" since the var is undefined in the build environment.
const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_: SupabaseClient, prop: string | symbol) {
    const client = getClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export default supabaseAdmin
