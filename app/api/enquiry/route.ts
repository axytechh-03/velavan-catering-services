import { NextResponse } from 'next/server'
import { addEnquiry } from '@/lib/cms-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    if (!body.name || !body.phone || !body.event_type || !body.event_date || !body.location) {
      return NextResponse.json(
        { error: 'Missing required enquiry fields' },
        { status: 400 }
      )
    }

    const savedRecord = await addEnquiry({
      name: body.name,
      phone: body.phone,
      email: body.email || '',
      event_type: body.event_type,
      other_event_type: body.other_event_type || '',
      guest_count: Number(body.guest_count) || 100,
      event_date: body.event_date,
      event_time: body.event_time || '',
      location: body.location,
      special_requests: body.special_requests || '',
      status: 'new',
    })

    return NextResponse.json({ success: true, data: savedRecord })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
