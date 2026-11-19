import { NextResponse } from 'next/server'
import {
  getServicesDataAsync,
  getGalleryDataAsync,
  getMenuDataAsync,
  getClientsDataAsync,
  getSiteContentDataAsync,
} from '@/lib/cms-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    if (section === 'services') {
      const services = await getServicesDataAsync()
      return NextResponse.json({
        success: true,
        data: services.filter((s) => s.active),
      })
    }

    if (section === 'gallery') {
      const gallery = await getGalleryDataAsync()
      return NextResponse.json({
        success: true,
        data: gallery.filter((g) => g.active),
      })
    }

    if (section === 'menu') {
      const menu = await getMenuDataAsync()
      return NextResponse.json({
        success: true,
        data: {
          categories: menu.categories.filter((c) => c.active !== false),
          items: menu.items.filter((i) => i.active !== false),
        },
      })
    }

    if (section === 'clients') {
      const clients = await getClientsDataAsync()
      return NextResponse.json({
        success: true,
        data: clients.filter((c) => c.active),
      })
    }

    if (section === 'content') {
      const content = await getSiteContentDataAsync()
      return NextResponse.json({
        success: true,
        data: content,
      })
    }

    // Return complete public CMS bundle (strictly public content only)
    const [services, gallery, menu, clients, content] = await Promise.all([
      getServicesDataAsync(),
      getGalleryDataAsync(),
      getMenuDataAsync(),
      getClientsDataAsync(),
      getSiteContentDataAsync(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        services: services.filter((s) => s.active),
        gallery: gallery.filter((g) => g.active),
        menuCategories: menu.categories.filter((c) => c.active !== false),
        menuItems: menu.items.filter((i) => i.active !== false),
        clients: clients.filter((c) => c.active),
        content,
      },
    })
  } catch (err: any) {
    console.error('Error fetching public content from Supabase:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
