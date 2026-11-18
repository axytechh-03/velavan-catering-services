import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authenticated = await verifyAdminAuth()
  return NextResponse.json({ authenticated }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
