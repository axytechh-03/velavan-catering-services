import { NextResponse } from 'next/server'
import { verifyAdminAuth, isValidAdminRequestOrigin } from '@/lib/admin-auth'
import {
  getClientsDataAsync,
  saveClientsDataAsync,
  saveClientItemAsync,
  deleteClientItemAsync,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const clients = await getClientsDataAsync()
    return NextResponse.json({ success: true, clients })
  } catch (err: any) {
    console.error('[Admin Clients GET Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to fetch clients data.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isValidAdminRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid request origin.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const saved = await saveClientItemAsync(body)
    return NextResponse.json({ success: true, client: saved })
  } catch (err: any) {
    console.error('[Admin Clients POST Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to create client.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!isValidAdminRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid request origin.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (Array.isArray(body)) {
      await saveClientsDataAsync(body)
      return NextResponse.json({ success: true, clients: body })
    }

    const saved = await saveClientItemAsync(body)
    return NextResponse.json({ success: true, client: saved })
  } catch (err: any) {
    console.error('[Admin Clients PUT Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to update client data.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!isValidAdminRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid request origin.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const ok = await deleteClientItemAsync(id)
    return NextResponse.json({ success: ok })
  } catch (err: any) {
    console.error('[Admin Clients DELETE Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to delete client.' }, { status: 500 })
  }
}
