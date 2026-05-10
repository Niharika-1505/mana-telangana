import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface AttemptRecord {
  count: number
  firstAttemptAt: number
}

// In-memory store — resets if the serverless instance is recycled.
// Effective against casual brute force; a distributed store (Redis)
// would be needed for a multi-instance production deployment.
const failedAttempts = new Map<string, AttemptRecord>()

const MAX_ATTEMPTS    = 5
const WINDOW_MS       = 15 * 60 * 1000 // 15 minutes
const FAILURE_DELAY_MS = 500            // slow down each wrong guess

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const now = Date.now()

  // Evict expired windows so the Map doesn't grow unboundedly
  const existing = failedAttempts.get(ip)
  if (existing && now - existing.firstAttemptAt > WINDOW_MS) {
    failedAttempts.delete(ip)
  }

  const record = failedAttempts.get(ip)
  if (record && record.count >= MAX_ATTEMPTS) {
    const retryAfterSecs = Math.ceil((WINDOW_MS - (now - record.firstAttemptAt)) / 1000)
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } }
    )
  }

  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    )
  }

  if (password !== adminPassword) {
    // Artificial delay — makes each guess take ≥500 ms
    await new Promise(resolve => setTimeout(resolve, FAILURE_DELAY_MS))

    if (failedAttempts.has(ip)) {
      failedAttempts.get(ip)!.count++
    } else {
      failedAttempts.set(ip, { count: 1, firstAttemptAt: now })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Correct password — clear the attempt record
  failedAttempts.delete(ip)

  cookies().set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return NextResponse.json({ success: true })
}
