import { NextResponse } from 'next/server'
import { requireAdmin } from '../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id, ids, ...fields } = await request.json()

  // Bulk update (bulk party assignment)
  if (ids && Array.isArray(ids)) {
    const { error } = await supabaseAdmin.from('mla').update(fields).in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ updated: ids.length })
  }

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await supabaseAdmin
    .from('mla').update(fields).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
