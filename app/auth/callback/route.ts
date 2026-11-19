import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'axy.techh@gmail.com'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/admin/reset-password'
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
      const errorUrl = new URL('/admin/reset-password', request.url)
      errorUrl.searchParams.set(
        'error',
        error?.message || 'Invalid or expired recovery authorization code. Please request a new link.'
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
      const errorUrl = new URL('/admin/reset-password', request.url)
      errorUrl.searchParams.set(
        'error',
        error?.message || 'Invalid or expired recovery token. Please request a new link.'
      )
      return NextResponse.redirect(errorUrl)
    }
    session = data.session
    user = data.user
  } else {
    // Neither 'code' nor 'token_hash' query parameter was provided.
    // In Supabase implicit grant recovery, the recovery tokens are appended as a URL hash
    // fragment (e.g. /auth/callback#access_token=...&type=recovery).
    // Redirect cleanly to /admin/reset-password WITHOUT an error so the client page can process the hash.
    const targetPath = next.startsWith('/') ? next : '/admin/reset-password'
    return NextResponse.redirect(new URL(targetPath, request.url))
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
  const targetPath = next.startsWith('/') ? next : '/admin/reset-password'
  const redirectResponse = NextResponse.redirect(new URL(targetPath, request.url))

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
