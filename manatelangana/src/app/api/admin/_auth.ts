import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export function requireAdmin(): NextResponse | null {
  const session = cookies().get('admin_session')
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
