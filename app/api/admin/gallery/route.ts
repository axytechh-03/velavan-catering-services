import { NextResponse } from 'next/server'
import { verifyAdminAuth, isValidAdminRequestOrigin } from '@/lib/admin-auth'
import {
  getGalleryDataAsync,
  saveGalleryDataAsync,
  saveGalleryItemAsync,
  deleteGalleryItemAsync,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const gallery = await getGalleryDataAsync()
    return NextResponse.json({ success: true, gallery })
  } catch (err: any) {
    console.error('[Admin Gallery GET Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery items.' }, { status: 500 })
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
    const saved = await saveGalleryItemAsync(body)
    return NextResponse.json({ success: true, item: saved })
  } catch (err: any) {
    console.error('[Admin Gallery POST Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to create gallery item.' }, { status: 500 })
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
      await saveGalleryDataAsync(body)
      return NextResponse.json({ success: true, gallery: body })
    }

    const saved = await saveGalleryItemAsync(body)
    return NextResponse.json({ success: true, item: saved })
  } catch (err: any) {
    console.error('[Admin Gallery PUT Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to update gallery data.' }, { status: 500 })
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

    const ok = await deleteGalleryItemAsync(id)
    return NextResponse.json({ success: ok })
  } catch (err: any) {
    console.error('[Admin Gallery DELETE Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to delete gallery item.' }, { status: 500 })
  }
}
