import { NextResponse } from 'next/server'
import { requireAdmin } from '../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Fetch the contribution so we have the ward data server-side
  const { data: contrib, error: fetchErr } = await supabaseAdmin
    .from('ward_contributions').select('*').eq('id', id).single()
  if (fetchErr || !contrib) {
    return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
  }

  const { error: statusErr } = await supabaseAdmin
    .from('ward_contributions').update({ status: 'approved' }).eq('id', id)
  if (statusErr) return NextResponse.json({ error: statusErr.message }, { status: 500 })

  // Copy councillor data into the ward row (requires service role — wards are RLS-locked)
  if (contrib.ward_number) {
    await supabaseAdmin.from('wards').update({
      ward_councillor:  contrib.councillor_name,
      councillor_party: contrib.councillor_party,
      coverage_status:  'live',
    }).eq('ward_number', contrib.ward_number)
  }

  return NextResponse.json({ success: true })
}
