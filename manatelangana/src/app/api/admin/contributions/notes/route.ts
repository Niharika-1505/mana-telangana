import { NextResponse } from 'next/server'
import { requireAdmin } from '../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id, admin_notes } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('ward_contributions')
    .update({ admin_notes: admin_notes ?? null })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
