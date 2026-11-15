import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { getSiteContentData, saveSiteContentData } from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const content = getSiteContentData()
    return NextResponse.json({ success: true, content })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updated = saveSiteContentData(body)
    return NextResponse.json({ success: true, content: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
