import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  const { id, admin_notes } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const patch: Record<string, any> = { status: 'rejected' }
  if (admin_notes !== undefined) patch.admin_notes = admin_notes

  const { error } = await supabaseAdmin.from('ward_contributions').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
