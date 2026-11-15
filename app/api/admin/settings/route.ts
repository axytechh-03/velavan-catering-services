import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { getSiteSettingsData, saveSiteSettingsData, getCMSData } from '@/lib/cms-store'
import { isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = getSiteSettingsData()
    const cms = getCMSData()

    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      nextVersion: '14.2.23',
      environment: process.env.NODE_ENV || 'production',
      databaseMode: isSupabaseConfigured ? 'Supabase Managed Cloud' : 'Local High-Speed JSON Store',
      isSupabaseConnected: isSupabaseConfigured,
      storagePath: 'data/cms-data.json',
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updated = saveSiteSettingsData(body)
    return NextResponse.json({ success: true, settings: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
