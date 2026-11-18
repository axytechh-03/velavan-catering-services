import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  for (const name of ['velavan_access_token', 'velavan_refresh_token', 'velavan_admin_token']) {
    response.cookies.set(name, '', {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: 0,
    })
  }
  return response
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/admin', request.url))
  for (const name of ['velavan_access_token', 'velavan_refresh_token', 'velavan_admin_token']) {
    response.cookies.set(name, '', {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: 0,
    })
  }
  return response
}
