import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { getEnquiries, updateEnquiry, deleteEnquiry, addEnquiry } from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.toLowerCase()

    let enquiries = await getEnquiries()

    if (status && status !== 'all') {
      enquiries = enquiries.filter((e) => e.status === status)
    }

    if (search) {
      enquiries = enquiries.filter(
        (e) =>
          e.name.toLowerCase().includes(search) ||
          e.phone.toLowerCase().includes(search) ||
          (e.email && e.email.toLowerCase().includes(search)) ||
          e.location.toLowerCase().includes(search) ||
          e.event_type.toLowerCase().includes(search)
      )
    }

    return NextResponse.json({ success: true, enquiries })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing enquiry ID' }, { status: 400 })
    }

    const updated = await updateEnquiry(id, updates)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, enquiry: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch (e) {
        // No body
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing enquiry ID' }, { status: 400 })
    }

    const ok = await deleteEnquiry(id)
    return NextResponse.json({ success: ok })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const created = await addEnquiry(body)
    return NextResponse.json({ success: true, enquiry: created })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
