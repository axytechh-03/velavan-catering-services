import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { isValidAdminRequestOrigin } from '@/lib/admin-auth'
import {
  getClientIp,
  hashIdentifier,
  incrementRateLimit,
} from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'axy.techh@gmail.com'
const RESET_WINDOW_SECONDS = 900 // 15-minute window
const RESET_IP_LIMIT = 5 // 5 attempts per IP per window

/**
 * GET: Verify if an active, dedicated administrator recovery session exists.
 *
 * Checks exclusively for the 'velavan_recovery_token' cookie.
 * Ordinary login sessions ('velavan_access_token') cannot be used to reset passwords,
 * and recovery sessions cannot access the normal admin dashboard.
 */
export async function GET() {
  try {
    const cookieStore = cookies()
    const recoveryToken = cookieStore.get('velavan_recovery_token')?.value
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!recoveryToken || !url || !anonKey) {
      return NextResponse.json(
        { authenticated: false, email: null },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${recoveryToken}` } },
    })

    const { data: { user }, error } = await client.auth.getUser(recoveryToken)

    if (
      error ||
      !user ||
      user.email?.toLowerCase() !== ADMIN_EMAIL ||
      user.app_metadata?.role !== 'admin'
    ) {
      return NextResponse.json(
        { authenticated: false, email: null },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    return NextResponse.json(
      { authenticated: true, email: ADMIN_EMAIL },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json(
      { authenticated: false, email: null },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

/**
 * POST: Securely update the administrator password using Supabase Auth Admin updateUserById.
 *
 * Security Hardening Requirements:
 * - Authorize exclusively using the dedicated 'velavan_recovery_token' cookie.
 * - Do NOT accept arbitrary request-body or Bearer header fallbacks.
 * - Validate the recovery token with Supabase Auth getUser(token).
 * - Verify the exact administrator email and 'admin' role.
 * - Derive the target user ID solely from the validated token (never from browser payload).
 * - Execute password update with adminClient.auth.admin.updateUserById(user.id, { password }).
 * - Clear all recovery and normal session cookies immediately upon successful update.
 * - Return safe, user-friendly errors.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isValidAdminRequestOrigin(request)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Invalid request origin.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    let clientIp: string
    let ipKey: string
    try {
      clientIp = getClientIp(request.headers)
      ipKey = `recover:reset:ip:${hashIdentifier(clientIp)}`
    } catch {
      return NextResponse.json(
        { success: false, message: 'Password update service temporarily unavailable. Please try again later.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 1. Atomic IP rate limiting check before password update processing
    const rateLimit = await incrementRateLimit(ipKey, RESET_WINDOW_SECONDS, RESET_IP_LIMIT)

    // Fail-closed if database rate-limiting infrastructure is unavailable in production
    if (rateLimit.serviceUnavailable) {
      return NextResponse.json(
        { success: false, message: 'Password update service temporarily unavailable. Please try again later.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Enforce per-IP password update rate limit
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many password update attempts. Please wait before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || RESET_WINDOW_SECONDS),
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const cookieStore = cookies()
    const recoveryToken = cookieStore.get('velavan_recovery_token')?.value
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Authentication service configuration is incomplete on the server.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Require the dedicated recovery session cookie
    if (!recoveryToken) {
      return NextResponse.json(
        { success: false, message: 'No active recovery session found. Please request a new recovery link.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Parse body
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const password = typeof body.password === 'string' ? body.password : ''

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters in length.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 1. Authenticate and validate recovery token with Supabase Auth getUser(recoveryToken)
    const client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${recoveryToken}` } },
    })

    const { data: { user }, error: userError } = await client.auth.getUser(recoveryToken)
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Recovery session is invalid or has expired. Please request a new recovery link.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 2. Enforce administrator role security
    if (user.email?.toLowerCase() !== ADMIN_EMAIL || user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'This account does not have administrator privileges.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // 3. Initialize server-only Supabase Admin client with SUPABASE_SERVICE_ROLE_KEY
    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 4. Update password using Admin API updateUserById with user.id derived strictly from the validated recovery token
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, { password })

    if (updateError) {
      console.error('[Admin Reset Password Error]:', updateError.message)
      return NextResponse.json(
        { success: false, message: 'Unable to update administrator password. Please ensure it meets password requirements and try again.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Password updated successfully. Clear all recovery-session cookies so the user must sign in normally.
    const response = NextResponse.json(
      {
        success: true,
        message: 'Administrator password updated successfully. Please sign in with your new credentials.',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    const isHttps = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'
    const secure = process.env.NODE_ENV === 'production' && isHttps

    for (const name of ['velavan_recovery_token', 'velavan_access_token', 'velavan_refresh_token', 'velavan_admin_token']) {
      response.cookies.set(name, '', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
    }

    return response
  } catch {
    return NextResponse.json(
      { success: false, message: 'An unexpected server error occurred during password reset.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
