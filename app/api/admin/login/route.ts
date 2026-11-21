import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'axy.techh@gmail.com'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || body.username || '').trim().toLowerCase()
    const password = String(body.password || '')

    // Case A: Missing credentials
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password. Please check your credentials and try again.' },
        { status: 401 }
      )
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      return NextResponse.json(
        { success: false, message: 'Unable to sign in right now. Please try again later.' },
        { status: 503 }
      )
    }

    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    // Case A: Authentication failure (bad password, non-existent user, invalid format, etc.)
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
    // Remove the previous insecure cookie if present.
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

export async function DELETE(request: Request) {
  const isHttps =
    new URL(request.url).protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https'
  const secure = process.env.NODE_ENV === 'production' && isHttps

  const response = NextResponse.json({ success: true })
  for (const name of ['velavan_access_token', 'velavan_refresh_token', 'velavan_admin_token']) {
    response.cookies.set(name, '', {
      httpOnly: true, secure,
      sameSite: 'lax', path: '/', maxAge: 0,
    })
  }
  return response
}
