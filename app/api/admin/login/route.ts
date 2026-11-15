import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSiteSettingsData } from '@/lib/cms-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = body.password?.trim()
    const identifier = (body.email || body.username || 'admin').trim().toLowerCase()

    const storedSettings = getSiteSettingsData()
    const validPassword = storedSettings.adminPassword || process.env.ADMIN_PASSWORD || 'velavan2026'

    // Allow username 'admin' or admin email
    const validIdentifiers = ['admin', 'admin@velavancatering.com', 'dhineshkumarctpm@gmail.com']
    const isIdentifierValid = validIdentifiers.includes(identifier) || identifier.length > 0

    if (isIdentifierValid && password === validPassword) {
      // Set secure HTTP-only cookie
      const cookieStore = cookies()
      cookieStore.set('velavan_admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return NextResponse.json({
        success: true,
        user: {
          username: 'admin',
          email: 'admin@velavancatering.com',
          role: 'Super Administrator',
        },
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid administrator credentials. Please check your password.' },
      { status: 401 }
    )
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete('velavan_admin_token')
  return NextResponse.json({ success: true })
}
