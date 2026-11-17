import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { getEnquiries, updateEnquiry, deleteEnquiry, addEnquiry, logActivity } from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const event = searchParams.get('event')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')?.toLowerCase().trim()
    const sort = searchParams.get('sort') || 'newest'

    let enquiries = await getEnquiries()

    if (status && status !== 'all') {
      enquiries = enquiries.filter((e) => e.status === status)
    }

    if (event && event !== 'all') {
      enquiries = enquiries.filter((e) => e.event_type === event)
    }

    if (priority && priority !== 'all') {
      enquiries = enquiries.filter((e) => (e.priority || 'normal') === priority)
    }

    if (search) {
      enquiries = enquiries.filter(
        (e) =>
          e.name.toLowerCase().includes(search) ||
          e.phone.toLowerCase().includes(search) ||
          (e.email && e.email.toLowerCase().includes(search)) ||
          (e.location && e.location.toLowerCase().includes(search)) ||
          (e.event_type && e.event_type.toLowerCase().includes(search)) ||
          (e.special_requests && e.special_requests.toLowerCase().includes(search)) ||
          (e.admin_notes && e.admin_notes.toLowerCase().includes(search))
      )
    }

    // Sort newest vs oldest
    enquiries.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      return sort === 'oldest' ? timeA - timeB : timeB - timeA
    })

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

    // Log activities for meaningful status or priority changes
    if (updates.status) {
      logActivity(
        'enquiry_status',
        `Enquiry for ${updated.name} updated to "${updates.status}"`,
        { enquiryId: id, status: updates.status }
      )
    } else if (updates.priority) {
      logActivity(
        'enquiry_priority',
        `Enquiry for ${updated.name} set to ${updates.priority} priority`,
        { enquiryId: id, priority: updates.priority }
      )
    } else if (updates.follow_up_date) {
      logActivity(
        'follow_up_scheduled',
        `Follow-up scheduled for ${updated.name} on ${updates.follow_up_date}`,
        { enquiryId: id, follow_up_date: updates.follow_up_date }
      )
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
    if (ok) {
      logActivity('enquiry_deleted', `Enquiry #${id} was deleted`, { enquiryId: id })
    }
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
    logActivity('new_enquiry', `New enquiry received from ${created.name} (${created.event_type})`, {
      enquiryId: created.id,
    })
    return NextResponse.json({ success: true, enquiry: created })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
