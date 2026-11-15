import { NextResponse } from 'next/server'
import {
  getCMSData,
  getServicesData,
  getGalleryData,
  getMenuData,
  getClientsData,
  getSiteContentData,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    if (section === 'services') {
      return NextResponse.json({ success: true, data: getServicesData().filter((s) => s.active) })
    }
    if (section === 'gallery') {
      return NextResponse.json({ success: true, data: getGalleryData().filter((g) => g.active) })
    }
    if (section === 'menu') {
      const menu = getMenuData()
      return NextResponse.json({
        success: true,
        data: {
          categories: menu.categories.filter((c) => c.active !== false),
          items: menu.items.filter((i) => i.active !== false),
        },
      })
    }
    if (section === 'clients') {
      return NextResponse.json({ success: true, data: getClientsData().filter((c) => c.active) })
    }
    if (section === 'content') {
      return NextResponse.json({ success: true, data: getSiteContentData() })
    }

    // Return complete public CMS bundle
    const cms = getCMSData()
    return NextResponse.json({
      success: true,
      data: {
        services: cms.services.filter((s) => s.active),
        gallery: cms.gallery.filter((g) => g.active),
        menuCategories: cms.menuCategories.filter((c) => c.active !== false),
        menuItems: cms.menuItems.filter((i) => i.active !== false),
        clients: cms.clients.filter((c) => c.active),
        content: cms.content,
      },
    })
  } catch (err: any) {
    console.error('Error fetching public content:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
