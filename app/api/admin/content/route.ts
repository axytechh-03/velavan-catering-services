import { NextResponse } from 'next/server'
import { verifyAdminAuth, isValidAdminRequestOrigin } from '@/lib/admin-auth'
import {
  getSiteContentDataAsync,
  saveSiteContentDataAsync,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const content = await getSiteContentDataAsync()
    return NextResponse.json({ success: true, content })
  } catch (err: any) {
    console.error('[Admin Content GET Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to fetch site content.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!isValidAdminRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid request origin.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updated = await saveSiteContentDataAsync(body)
    return NextResponse.json({ success: true, content: updated })
  } catch (err: any) {
    console.error('[Admin Content PUT Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to update site content.' }, { status: 500 })
  }
}
