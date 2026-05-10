import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  const { wards } = await request.json()
  if (!Array.isArray(wards) || wards.length === 0) {
    return NextResponse.json({ error: 'wards array required' }, { status: 400 })
  }

  // Wards that have a UUID id → targeted UPDATE by id (single-cell edits)
  const withId    = wards.filter((w: any) => w.id)
  // Wards without id → INSERT/UPDATE via ward_number conflict (CSV upsert, addWard)
  const withoutId = wards.filter((w: any) => !w.id)

  let upserted = 0

  for (const ward of withId) {
    const { id, ...fields } = ward
    const { error } = await supabaseAdmin.from('wards').update(fields).eq('id', id)
    if (!error) upserted++
  }

  if (withoutId.length > 0) {
    const { error } = await supabaseAdmin
      .from('wards')
      .upsert(withoutId, { onConflict: 'ward_number' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    upserted += withoutId.length
  }

  return NextResponse.json({ upserted })
}
