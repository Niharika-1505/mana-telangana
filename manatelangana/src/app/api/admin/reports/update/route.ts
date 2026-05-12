import { NextResponse } from 'next/server'
import { requireAdmin } from '../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id, ids, status, resolution_note, is_duplicate } = await request.json()

  const patch: Record<string, any> = { updated_at: new Date().toISOString() }
  if (status !== undefined) {
    patch.status = status
    patch.resolved_at = status === 'resolved' ? new Date().toISOString() : null
  }
  if (resolution_note !== undefined) patch.resolution_note = resolution_note
  if (is_duplicate !== undefined) patch.is_duplicate = is_duplicate

  // Bulk update
  if (ids && Array.isArray(ids)) {
    const { error } = await supabaseAdmin.from('reports').update(patch).in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ updated: ids.length })
  }

  // Single update
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await supabaseAdmin
    .from('reports').update(patch).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
