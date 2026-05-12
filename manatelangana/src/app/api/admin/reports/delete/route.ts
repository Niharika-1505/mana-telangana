import { NextResponse } from 'next/server'
import { requireAdmin } from '../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id, ids, all_test } = await request.json()

  if (all_test) {
    const { error } = await (supabaseAdmin.from('reports') as any).delete().eq('is_test', true)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: 'all_test' })
  }

  if (ids && Array.isArray(ids)) {
    const { error } = await supabaseAdmin.from('reports').delete().in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: ids.length })
  }

  if (id) {
    const { error } = await supabaseAdmin.from('reports').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: 1 })
  }

  return NextResponse.json({ error: 'id, ids, or all_test required' }, { status: 400 })
}
