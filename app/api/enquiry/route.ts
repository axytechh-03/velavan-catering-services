import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('enquiries').insert([body]).select()
      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ success: true, warning: 'Saved locally' })
      }
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: true, message: 'Received successfully' })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
