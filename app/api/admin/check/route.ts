import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authenticated = await verifyAdminAuth()
  if (!authenticated) {
    return NextResponse.json(
      { authenticated: false },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        email: 'axy.techh@gmail.com',
        name: 'Velavan Catering Admin',
        username: 'Velavan Admin',
        initials: 'VC',
        role: 'Administrator',
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
