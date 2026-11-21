import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabase-server'
import { isValidAdminRequestOrigin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  // 1. Enforce origin validation to prevent CSRF / cross-origin logout triggers
  if (!isValidAdminRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid request origin.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // 2. Attempt server-side Supabase session revocation for the current session only
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('velavan_access_token')?.value

    if (accessToken && isSupabaseServerConfigured) {
      try {
        const adminClient = getSupabaseServerClient()
        const { error } = await adminClient.auth.admin.signOut(accessToken, 'local')
        if (error) {
          console.warn('[Admin Logout] Supabase session revocation warning:', error.message)
        }
      } catch (revocationErr: any) {
        console.warn(
          '[Admin Logout] Supabase session revocation encountered an error:',
          revocationErr?.message || 'Unknown revocation error'
        )
      }
    }
  } catch (cookieErr: any) {
    console.warn(
      '[Admin Logout] Failed to read request cookies prior to logout:',
      cookieErr?.message || 'Unknown cookie error'
    )
  }

  // 2. Unconditionally clear all four authentication cookies in the browser
  const isHttps =
    new URL(request.url).protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https'
  const secure = process.env.NODE_ENV === 'production' && isHttps

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  for (const name of ['velavan_access_token', 'velavan_refresh_token', 'velavan_recovery_token', 'velavan_admin_token']) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  }
  return response
}
