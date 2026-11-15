import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { getCMSData } from '@/lib/cms-store'
import { isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!verifyAdminAuth()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cms = getCMSData()
    const totalEnquiries = cms.enquiries.length
    const newEnquiries = cms.enquiries.filter((e) => e.status === 'new').length
    const contactedEnquiries = cms.enquiries.filter((e) => e.status === 'contacted').length
    const confirmedEnquiries = cms.enquiries.filter((e) => e.status === 'confirmed').length
    const totalDishes = cms.menuItems.length
    const activeDishes = cms.menuItems.filter((i) => i.active !== false).length
    const totalCategories = cms.menuCategories.length
    const totalServices = cms.services.length
    const totalGallery = cms.gallery.length
    const totalClients = cms.clients.length

    return NextResponse.json({
      success: true,
      stats: {
        totalEnquiries,
        newEnquiries,
        contactedEnquiries,
        confirmedEnquiries,
        totalDishes,
        activeDishes,
        totalCategories,
        totalServices,
        totalGallery,
        totalClients,
        storageMode: isSupabaseConfigured ? 'Supabase Database' : 'Local Persistent JSON Store',
        isSupabase: isSupabaseConfigured,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
