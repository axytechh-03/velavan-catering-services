import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'axy.techh@gmail.com'

function secretMatches(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  return providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
}

/**
 * One-time bootstrap endpoint.
 *
 * Required server-only environment variables:
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ADMIN_BOOTSTRAP_SECRET (a long random value; remove it after successful use)
 *
 * Never expose either value with a NEXT_PUBLIC_ prefix.
 */
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const providedSecret = request.headers.get('x-admin-bootstrap-secret') || ''

  if (!expectedSecret || !serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { success: false, error: 'Server bootstrap configuration is incomplete.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!providedSecret || !secretMatches(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Could not verify the administrator account.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const user = data.users.find(
    (candidate) => candidate.email?.toLowerCase() === ADMIN_EMAIL
  )

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'The configured administrator account was not found.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { success: false, error: 'The administrator email must be confirmed before role assignment.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const { data: updated, error: updateError } =
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, role: 'admin' },
    })

  if (updateError || !updated.user) {
    return NextResponse.json(
      { success: false, error: 'Could not assign the administrator role.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Administrator role assigned. Remove ADMIN_BOOTSTRAP_SECRET from the hosting environment now.',
      email: ADMIN_EMAIL,
      role: updated.user.app_metadata?.role,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
