import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.delete('velavan_admin_token')
  return NextResponse.json({ success: true, message: 'Logged out successfully' })
}

export async function GET() {
  const cookieStore = cookies()
  cookieStore.delete('velavan_admin_token')
  return NextResponse.redirect(new URL('/admin', 'http://localhost:3000'))
}
