import { NextResponse } from 'next/server'
import { addEnquiry } from '@/lib/cms-store'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * Normalizes phone numbers for duplicate / rate-limiting detection.
 * Accounts for Indian mobile numbers (+91, 91, leading 0) and standard international digits.
 */
function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return ''
  // Extract all digits
  const digits = rawPhone.replace(/\D/g, '')

  // Indian phone number normalization:
  // 12 digits starting with '91' (e.g. +91 90803 09584) -> core 10 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2)
  }
  // 11 digits starting with trunk '0' (e.g. 09080309584) -> core 10 digits
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1)
  }
  // Standard 10-digit number
  if (digits.length === 10) {
    return digits
  }
  // Supported international formats (e.g. 11-15 digits)
  return digits
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Honeypot check (catches automated spam bots filling hidden fields)
    if (body._hp || body.website) {
      return NextResponse.json({ error: 'Invalid submission detected.' }, { status: 400 })
    }

    // Resolve field names (supports both API contract and frontend form names)
    const rawName = body.name
    const rawPhone = body.phone
    const rawEventType = body.event_type || body.event
    const rawEventDate = body.event_date || body.date
    const rawLocation = body.location
    const rawOtherEventType = body.other_event_type || body.otherEvent || ''
    const rawGuestCount = body.guest_count !== undefined ? body.guest_count : body.guests
    const rawEventTime = body.event_time || ''
    const rawEmail = body.email || ''

    // Resolve special requests / notes / food preference
    let specialRequests = body.special_requests || ''
    if (!specialRequests && (body.food || body.notes)) {
      const parts = []
      if (body.food) parts.push(`Food: ${body.food}`)
      if (body.notes) parts.push(`Notes: ${body.notes}`)
      specialRequests = parts.join('. ')
    }

    // 2. Strict field presence validation
    if (!rawName || !rawPhone || !rawEventType || !rawEventDate || !rawLocation) {
      return NextResponse.json(
        { error: 'Missing required enquiry fields: name, phone, event type, date, and location are required.' },
        { status: 400 }
      )
    }

    const trimmedName = String(rawName).trim()
    const trimmedPhone = String(rawPhone).trim()
    const trimmedLocation = String(rawLocation).trim()
    const trimmedEventType = String(rawEventType).trim()
    const trimmedEventDate = String(rawEventDate).trim()

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json({ error: 'Please enter a valid name (2-100 characters).' }, { status: 400 })
    }

    // Validate phone: extract digits; valid contact numbers should have 10-15 digits
    const digitsOnly = trimmedPhone.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json(
        { error: 'Please provide a valid mobile or contact number with at least 10 digits.' },
        { status: 400 }
      )
    }

    if (trimmedLocation.length < 2 || trimmedLocation.length > 200) {
      return NextResponse.json({ error: 'Please enter a valid event location (2-200 characters).' }, { status: 400 })
    }

    // 3. Distributed serverless cooldown rate-limit (60-second cooldown per normalized phone number)
    try {
      const sb = getSupabaseServerClient()
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
      const normalizedIncoming = normalizePhoneNumber(trimmedPhone)

      // Query recent enquiries created within the last 60 seconds
      const { data: recentEnquiries } = await sb
        .from('enquiries')
        .select('id, phone, created_at')
        .gte('created_at', oneMinuteAgo)

      if (recentEnquiries && recentEnquiries.length > 0) {
        const isDuplicate = recentEnquiries.some((enq) => {
          return normalizePhoneNumber(enq.phone || '') === normalizedIncoming
        })

        if (isDuplicate) {
          return NextResponse.json(
            {
              error:
                'We recently received an enquiry from this phone number. Please allow 1 minute before resubmitting or reach us directly at +91 90803 09584.',
            },
            { status: 429 }
          )
        }
      }
    } catch (dbRateErr) {
      // Non-blocking fallback: if rate-check lookup fails, log and proceed with submission
      console.warn('[Enquiry API] Rate check fallback:', dbRateErr)
    }

    // 4. Save enquiry record to Supabase (preserves original customer-formatted phone string)
    const savedRecord = await addEnquiry({
      name: trimmedName,
      phone: trimmedPhone,
      email: rawEmail ? String(rawEmail).trim().slice(0, 150) : '',
      event_type: trimmedEventType.slice(0, 100),
      other_event_type: rawOtherEventType ? String(rawOtherEventType).trim().slice(0, 100) : '',
      guest_count: Math.min(Math.max(Number(rawGuestCount) || 100, 1), 50000),
      event_date: trimmedEventDate.slice(0, 50),
      event_time: rawEventTime ? String(rawEventTime).trim().slice(0, 50) : '',
      location: trimmedLocation,
      special_requests: specialRequests ? String(specialRequests).trim().slice(0, 1000) : '',
      status: 'new',
    })

    return NextResponse.json({ success: true, data: savedRecord })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
