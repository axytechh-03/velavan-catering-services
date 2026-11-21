import { NextResponse } from 'next/server'
import { verifyAdminAuth, isValidAdminRequestOrigin } from '@/lib/admin-auth'
import {
  getServicesDataAsync,
  saveServicesDataAsync,
  saveServiceItemAsync,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const services = await getServicesDataAsync()
    return NextResponse.json({ success: true, services })
  } catch (err: any) {
    console.error('[Admin Services GET Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to fetch services data.' }, { status: 500 })
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

    if (Array.isArray(body)) {
      await saveServicesDataAsync(body)
      return NextResponse.json({ success: true, services: body })
    }

    const saved = await saveServiceItemAsync(body)
    return NextResponse.json({ success: true, service: saved })
  } catch (err: any) {
    console.error('[Admin Services PUT Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to update services data.' }, { status: 500 })
  }
}
