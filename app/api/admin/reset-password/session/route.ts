import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'axy.techh@gmail.com'

/**
 * Dedicated secure recovery-session validation endpoint.
 *
 * Security Hardening Requirements:
 * - Accept recovery access token from the client.
 * - Validate it with Supabase Auth using getUser(token).
 * - Confirm exact administrator email and 'admin' role.
 * - Set ONLY the distinct recovery-session cookie ('velavan_recovery_token').
 * - Do NOT issue normal admin login cookies ('velavan_access_token' / 'velavan_refresh_token').
 * - The recovery cookie is HTTP-only, SameSite=Lax, Secure in production, with a short 30-minute expiry.
 * - Never log or return the token.
 * - Reject invalid or expired tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return NextResponse.json(
        { success: false, message: 'Authentication service configuration is missing on the server.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    let token = ''

    // Read token from JSON body
    try {
      const body = await request.json()
      if (typeof body.accessToken === 'string') {
        token = body.accessToken.trim()
      }
    } catch {
      // Body empty or malformed
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Recovery authorization token is required.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Authenticate token with Supabase Auth using existing client approach
    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Recovery token is invalid or has expired. Please request a new recovery link.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Enforce administrator role security
    if (
      user.email?.toLowerCase() !== ADMIN_EMAIL ||
      user.app_metadata?.role !== 'admin'
    ) {
      return NextResponse.json(
        { success: false, message: 'This account does not have administrator privileges.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Establish ONLY the dedicated recovery-session cookie ('velavan_recovery_token')
    const response = NextResponse.json(
      {
        success: true,
        message: 'Administrator recovery session established successfully.',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    const isHttps = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'
    const secure = process.env.NODE_ENV === 'production' && isHttps

    response.cookies.set('velavan_recovery_token', token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 1800, // 30-minute short expiry dedicated solely to password reset
    })

    return response
  } catch {
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while verifying the recovery session.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
