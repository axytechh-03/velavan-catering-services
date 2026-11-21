import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'axy.techh@gmail.com'
const DEFAULT_FALLBACK_PATH = '/admin/reset-password'

/**
 * Validates and sanitizes redirect destination paths.
 * Enforces strictly safe, relative internal destinations on the same origin.
 * Rejects protocol-relative URLs (//), backslash bypasses (/\ or \), external schemes,
 * malformed or nested URI encodings, control characters, and origin departures.
 */
function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK_PATH
): string {
  if (!candidate || typeof candidate !== 'string') {
    return fallback
  }

  const trimmed = candidate.trim()
  if (!trimmed) {
    return fallback
  }

  // Must begin with a single slash and never a double slash or backslash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || /\x5c/.test(trimmed)) {
    return fallback
  }

  // Reject raw control characters or null bytes
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallback
  }

  // Iteratively decode to prevent nested percent-encoding bypasses (e.g. %252f, %255c)
  let current = trimmed
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(current)
      if (decoded === current) break
      current = decoded
    } catch {
      // Malformed URI encoding
      return fallback
    }
  }

  // Check decoded string for protocol-relative, backslash, or control-character bypasses
  if (
    !current.startsWith('/') ||
    current.startsWith('//') ||
    current.startsWith('/\\') ||
    /\x5c/.test(current) ||
    /[\x00-\x1F\x7F]/.test(current)
  ) {
    return fallback
  }

  // Validate that resolving against an isolated base cannot escape the origin
  try {
    const dummyOrigin = 'http://127.0.0.1:9999'
    const parsed = new URL(trimmed, dummyOrigin)

    if (parsed.origin !== dummyOrigin || parsed.protocol !== 'http:') {
      return fallback
    }

    if (!parsed.pathname.startsWith('/') || parsed.pathname.startsWith('//') || /\x5c/.test(parsed.pathname)) {
      return fallback
    }

    // Reconstruct safe relative path from parsed components (pathname + search + hash)
    const safePath = parsed.pathname + parsed.search + parsed.hash
    if (!safePath.startsWith('/') || safePath.startsWith('//') || safePath.startsWith('/\\') || /\x5c/.test(safePath)) {
      return fallback
    }

    return safePath
  } catch {
    return fallback
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const rawNext = requestUrl.searchParams.get('next')
  const targetPath = getSafeRedirectPath(rawNext, DEFAULT_FALLBACK_PATH)
  const errorParam = requestUrl.searchParams.get('error_description') || requestUrl.searchParams.get('error')

  // Handle provider/Supabase explicit error query parameters
  if (errorParam) {
    const errorUrl = new URL('/admin/reset-password', request.url)
    errorUrl.searchParams.set('error', errorParam)
    return NextResponse.redirect(errorUrl)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const errorUrl = new URL('/admin/reset-password', request.url)
    errorUrl.searchParams.set('error', 'Authentication configuration is missing on the server.')
    return NextResponse.redirect(errorUrl)
  }

  // Create client using the existing Supabase client approach
  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let session: any = null
  let user: any = null

  if (code) {
    // Exchange the Supabase recovery authorization code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.session) {
      console.error('[Auth Callback Error] Code exchange failed:', error?.message)
      const errorUrl = new URL('/admin/reset-password', request.url)
      errorUrl.searchParams.set(
        'error',
        'Invalid or expired recovery authorization code. Please request a new link.'
      )
      return NextResponse.redirect(errorUrl)
    }
    session = data.session
    user = data.user
  } else if (tokenHash && type) {
    // Verify OTP / token hash if provided in alternative query format
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    })
    if (error || !data.session) {
      console.error('[Auth Callback Error] OTP verification failed:', error?.message)
      const errorUrl = new URL('/admin/reset-password', request.url)
      errorUrl.searchParams.set(
        'error',
        'Invalid or expired recovery token. Please request a new link.'
      )
      return NextResponse.redirect(errorUrl)
    }
    session = data.session
    user = data.user
  } else {
    // Neither 'code' nor 'token_hash' query parameter was provided.
    // In Supabase implicit grant recovery, the recovery tokens are appended as a URL hash
    // fragment (e.g. /auth/callback#access_token=...&type=recovery).
    // Redirect cleanly to the safe target destination WITHOUT an error so the client page can process the hash.
    const redirectUrl = new URL(targetPath, request.url)
    if (redirectUrl.origin !== requestUrl.origin) {
      return NextResponse.redirect(new URL(DEFAULT_FALLBACK_PATH, request.url))
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Enforce administrator role security:
  // Reject if the recovered user does not match the configured admin email or lacks the 'admin' role
  if (
    !user ||
    user.email?.toLowerCase() !== ADMIN_EMAIL ||
    user.app_metadata?.role !== 'admin'
  ) {
    const unauthorizedUrl = new URL('/admin/reset-password', request.url)
    unauthorizedUrl.searchParams.set('error', 'This account does not have administrator privileges.')
    return NextResponse.redirect(unauthorizedUrl)
  }

  // Construct target redirect URL (defaults to /admin/reset-password)
  const redirectUrl = new URL(targetPath, request.url)
  if (redirectUrl.origin !== requestUrl.origin) {
    return NextResponse.redirect(new URL(DEFAULT_FALLBACK_PATH, request.url))
  }
  const redirectResponse = NextResponse.redirect(redirectUrl)

  // SECURITY HARDENING:
  // Set ONLY a dedicated recovery-session cookie ('velavan_recovery_token') with short expiry (30 min).
  // Do NOT issue normal login cookies ('velavan_access_token' / 'velavan_refresh_token').
  // This guarantees recovery sessions cannot access the normal admin dashboard before resetting the password.
  const isHttps = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'
  const secure = process.env.NODE_ENV === 'production' && isHttps

  redirectResponse.cookies.set('velavan_recovery_token', session.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 1800, // 30-minute short expiry dedicated solely to password reset
  })

  return redirectResponse
}
