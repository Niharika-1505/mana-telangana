import { createClient } from '@supabase/supabase-js'

// SERVICE ROLE client — bypasses all RLS policies.
// NEVER import this file from src/components/ or any client component.
// Only use inside src/app/api/ route handlers.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default supabaseAdmin
