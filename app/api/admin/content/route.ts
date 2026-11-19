import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
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
    console.error('ERROR IN ADMIN CONTENT GET:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updated = await saveSiteContentDataAsync(body)
    return NextResponse.json({ success: true, content: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
