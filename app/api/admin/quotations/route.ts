import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import {
  getQuotations,
  getQuotationById,
  saveQuotation,
  duplicateQuotation,
  updateQuotationStatus,
  deleteQuotation,
  QuotationRecord,
  QuotationStatus,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const enquiryId = searchParams.get('enquiryId')

    if (id) {
      const quotation = await getQuotationById(id)
      if (!quotation) {
        return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, quotation })
    }

    let quotations = await getQuotations()

    if (enquiryId) {
      quotations = quotations.filter((q) => q.enquiryId === enquiryId)
    }

    return NextResponse.json({ success: true, quotations })
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

    // Handle duplication request
    if (body.action === 'duplicate' && body.id) {
      const duplicated = await duplicateQuotation(body.id)
      if (!duplicated) {
        return NextResponse.json({ success: false, error: 'Source proposal not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, quotation: duplicated })
    }

    const payload = body as Omit<QuotationRecord, 'id' | 'created_at'>
    if (!payload.customerName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      )
    }

    const hasSessions = Array.isArray(payload.sessions) && payload.sessions.some((s) => s.dishes && s.dishes.length > 0)
    const hasItems = Array.isArray(payload.items) && payload.items.length > 0
    const hasCustomDishes = Array.isArray(payload.customDishes) && payload.customDishes.length > 0
    if (!hasSessions && !hasItems && !hasCustomDishes) {
      return NextResponse.json(
        { success: false, error: 'Please add at least one meal session with dishes or dishes to the proposal' },
        { status: 400 }
      )
    }

    const saved = await saveQuotation(payload)
    return NextResponse.json({ success: true, quotation: saved })
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
    const { id, status, ...rest } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing proposal ID' }, { status: 400 })
    }

    if (status) {
      const ok = await updateQuotationStatus(id, status as QuotationStatus)
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
      }
    }

    if (Object.keys(rest).length > 0) {
      const updated = await saveQuotation({ id, ...rest } as any)
      return NextResponse.json({ success: true, quotation: updated })
    }

    const updated = await getQuotationById(id)
    return NextResponse.json({ success: true, quotation: updated })
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing proposal ID' }, { status: 400 })
    }

    const ok = await deleteQuotation(id)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
