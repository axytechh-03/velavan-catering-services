import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { getMenuData, saveMenuItem, deleteMenuItem, saveMenuCategory, logActivity } from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = getMenuData()
    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, ...itemData } = body

    if (type === 'category') {
      const saved = saveMenuCategory(itemData)
      logActivity('category_added', `New menu category "${saved.nameEn}" added`)
      return NextResponse.json({ success: true, category: saved })
    }

    const saved = saveMenuItem(itemData)
    logActivity('dish_added', `New menu dish "${saved.nameEn}" added`)
    return NextResponse.json({ success: true, item: saved })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, ...itemData } = body

    if (type === 'category') {
      const saved = saveMenuCategory(itemData)
      logActivity('category_updated', `Menu category "${saved.nameEn}" updated`)
      return NextResponse.json({ success: true, category: saved })
    }

    const saved = saveMenuItem(itemData)
    logActivity('dish_updated', `Menu dish "${saved.nameEn}" updated`)
    return NextResponse.json({ success: true, item: saved })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const ok = deleteMenuItem(id)
    if (ok) {
      logActivity('dish_deleted', `Menu dish #${id} deleted`)
    }
    return NextResponse.json({ success: ok })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
