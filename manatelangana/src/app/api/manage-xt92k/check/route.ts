import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = cookies().get('admin_session')
  if (session?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true })
  }
  return NextResponse.json({ authenticated: false }, { status: 401 })
}
