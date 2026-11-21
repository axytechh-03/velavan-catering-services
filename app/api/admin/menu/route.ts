import { NextResponse } from 'next/server'
import { verifyAdminAuth, isValidAdminRequestOrigin } from '@/lib/admin-auth'
import {
  getMenuDataAsync,
  saveMenuItemAsync,
  deleteMenuItemAsync,
  saveMenuCategoryAsync,
  logActivityAsync,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await getMenuDataAsync()
    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    console.error('[Admin Menu GET Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to fetch menu data.' }, { status: 500 })
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
    const { type, ...itemData } = body

    if (type === 'category') {
      const saved = await saveMenuCategoryAsync(itemData)
      await logActivityAsync('category_added', `New menu category "${saved.nameEn}" added`)
      return NextResponse.json({ success: true, category: saved })
    }

    const saved = await saveMenuItemAsync(itemData)
    await logActivityAsync('dish_added', `New menu dish "${saved.nameEn}" added`)
    return NextResponse.json({ success: true, item: saved })
  } catch (err: any) {
    console.error('[Admin Menu POST Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to create menu item.' }, { status: 500 })
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
    const { type, ...itemData } = body

    if (type === 'category') {
      const saved = await saveMenuCategoryAsync(itemData)
      await logActivityAsync('category_updated', `Menu category "${saved.nameEn}" updated`)
      return NextResponse.json({ success: true, category: saved })
    }

    const saved = await saveMenuItemAsync(itemData)
    await logActivityAsync('dish_updated', `Menu dish "${saved.nameEn}" updated`)
    return NextResponse.json({ success: true, item: saved })
  } catch (err: any) {
    console.error('[Admin Menu PUT Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to update menu item.' }, { status: 500 })
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

    const ok = await deleteMenuItemAsync(id)
    if (ok) {
      await logActivityAsync('dish_deleted', `Menu dish #${id} deleted`)
    }
    return NextResponse.json({ success: ok })
  } catch (err: any) {
    console.error('[Admin Menu DELETE Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to delete menu item.' }, { status: 500 })
  }
}
