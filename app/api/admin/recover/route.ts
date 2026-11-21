import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'axy.techh@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return NextResponse.json(
        { success: false, message: 'Authentication configuration is missing on the server.' },
        { status: 503 }
      )
    }

    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const origin = request.headers.get('origin') || request.nextUrl.origin || 'http://localhost:3000'
    const redirectTo = `${origin}/admin/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
      redirectTo,
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Password recovery instructions have been dispatched to ${ADMIN_EMAIL}.`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Unable to process recovery request.' },
      { status: 500 }
    )
  }
}
