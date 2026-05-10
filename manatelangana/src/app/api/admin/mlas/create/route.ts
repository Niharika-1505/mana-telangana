import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../_auth'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const denied = requireAdmin()
  if (denied) return denied

  const body = await request.json()
  const { data, error } = await supabaseAdmin.from('mla').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
