import { NextResponse } from 'next/server'
import { verifyAdminAuth, isValidAdminRequestOrigin } from '@/lib/admin-auth'
import {
  getSiteSettingsDataAsync,
  saveSiteSettingsDataAsync,
  getCMSDataAsync,
} from '@/lib/cms-store'
import { isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await getSiteSettingsDataAsync()
    const cms = await getCMSDataAsync()

    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      nextVersion: '14.2.23',
      environment: process.env.NODE_ENV || 'production',
      databaseMode: 'Supabase Managed Cloud',
      isSupabaseConnected: isSupabaseConfigured,
      storagePath: 'Supabase PostgreSQL (velavan-catering)',
      totalRecords: {
        enquiries: cms.enquiries.length,
        dishes: cms.menuItems.length,
        categories: cms.menuCategories.length,
        services: cms.services.length,
        gallery: cms.gallery.length,
        clients: cms.clients.length,
      },
      serverTime: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      settings: {
        siteTitle: settings.siteTitle,
        primaryPhone: settings.primaryPhone,
        whatsappPhone: settings.whatsappPhone,
        emailNotifications: settings.emailNotifications,
        updatedAt: settings.updatedAt,
      },
      system: systemInfo,
    })
  } catch (err: any) {
    console.error('[Admin Settings GET Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings.' }, { status: 500 })
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
    const updated = await saveSiteSettingsDataAsync(body)
    return NextResponse.json({ success: true, settings: updated })
  } catch (err: any) {
    console.error('[Admin Settings PUT Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to update settings.' }, { status: 500 })
  }
}
