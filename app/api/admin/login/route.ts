import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getClientIp,
  hashIdentifier,
  incrementRateLimit,
  resetRateLimit,
} from '@/lib/rate-limit'

const ADMIN_EMAIL = 'axy.techh@gmail.com'
const LOGIN_WINDOW_SECONDS = 15 * 60 // 15-minute sliding window
const IP_MAX_FAILURES = 5 // 5 failed attempts allowed per IP within window

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || body.username || '').trim().toLowerCase()
    const password = String(body.password || '')

    // 1. Initial field validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password. Please check your credentials and try again.' },
        { status: 401 }
      )
    }

    // 2. Resolve client IP and generate secure hashed key
    let clientIp: string
    let ipKey: string
    try {
      clientIp = getClientIp(request.headers)
      ipKey = `login:ip:${hashIdentifier(clientIp)}`
    } catch {
      return NextResponse.json(
        { success: false, message: 'Authentication service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // 3. Atomically consume 1 attempt BEFORE Supabase authentication.
    // This eliminates the check-then-increment concurrency race condition.
    const rateLimit = await incrementRateLimit(ipKey, LOGIN_WINDOW_SECONDS, IP_MAX_FAILURES)

    // Fail-closed if database rate-limiting infrastructure is unavailable in production
    if (rateLimit.serviceUnavailable) {
      return NextResponse.json(
        { success: false, message: 'Authentication service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // If quota exceeded, block request immediately without invoking Supabase Auth
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || LOGIN_WINDOW_SECONDS),
          },
        }
      )
    }

    // 4. Verify Supabase configuration
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      return NextResponse.json(
        { success: false, message: 'Unable to sign in right now. Please try again later.' },
        { status: 503 }
      )
    }

    // 5. Execute Supabase authentication
    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    // Case A: Authentication failure (bad password, non-existent user, invalid format, etc.)
    // Note: Attempt was already atomically consumed in step 3; no secondary increment needed.
    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password. Please check your credentials and try again.' },
        { status: 401 }
      )
    }

    // Case B: Authenticated in Supabase, but not an administrator
    if (data.user.email?.toLowerCase() !== ADMIN_EMAIL || data.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'This account does not have administrator access. Please contact the system administrator.' },
        { status: 403 }
      )
    }

    // 6. Successful authentication: Reset the failure counter for this IP
    await resetRateLimit(ipKey)

    const isHttps =
      new URL(request.url).protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https'
    const secure = process.env.NODE_ENV === 'production' && isHttps

    const response = NextResponse.json({
      success: true,
      user: {
        email: ADMIN_EMAIL,
        name: 'Velavan Catering Admin',
        username: 'Velavan Admin',
        role: 'Administrator',
      },
    })
    response.cookies.set('velavan_access_token', data.session.access_token, {
      httpOnly: true, secure, sameSite: 'lax', path: '/',
      maxAge: data.session.expires_in,
    })
    response.cookies.set('velavan_refresh_token', data.session.refresh_token, {
      httpOnly: true, secure, sameSite: 'lax', path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    response.cookies.set('velavan_admin_token', '', {
      httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 0,
    })
    return response
  } catch {
    return NextResponse.json(
      { success: false, message: 'Unable to sign in right now. Please try again later.' },
      { status: 500 }
    )
  }
}
