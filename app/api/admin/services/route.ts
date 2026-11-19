import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
