import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const validPassword = process.env.ADMIN_PASSWORD || 'velavan2026'

    if (password === validPassword) {
      // Set secure cookie
      const cookieStore = cookies()
      cookieStore.set('velavan_admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete('velavan_admin_token')
  return NextResponse.json({ success: true })
}
