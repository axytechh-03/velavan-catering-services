import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { getCMSDataAsync, getActivitiesAsync, EnquiryRecord } from '@/lib/cms-store'
import { isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await verifyAdminAuth())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cms = await getCMSDataAsync()
    const enquiries = cms.enquiries || []
    const menuItems = cms.menuItems || []
    const menuCategories = cms.menuCategories || []
    const quotations = cms.quotations || []

    const totalEnquiries = enquiries.length
    const newEnquiries = enquiries.filter((e) => e.status === 'new').length
    const contactedEnquiries = enquiries.filter((e) => e.status === 'contacted').length
    const pendingEnquiries = enquiries.filter((e) => e.status === 'follow_up').length
    const quotationSentEnquiries = enquiries.filter((e) => e.status === 'quotation_sent').length
    const confirmedEnquiries = enquiries.filter((e) => e.status === 'confirmed').length
    const completedEnquiries = enquiries.filter((e) => e.status === 'completed').length
    const cancelledEnquiries = enquiries.filter((e) => e.status === 'cancelled').length

    // Menu metrics
    const totalCategories = menuCategories.length
    const totalMenuItems = menuItems.length
    const publishedMenuItems = menuItems.filter((i) => i.active !== false).length

    // Event type breakdown
    const eventCounts: Record<string, number> = {}
    enquiries.forEach((e) => {
      const type = e.event_type || 'Other'
      eventCounts[type] = (eventCounts[type] || 0) + 1
    })

    // Status breakdown (all 7 pipeline stages)
    const statusCounts: Record<string, number> = {
      new: newEnquiries,
      contacted: contactedEnquiries,
      follow_up: pendingEnquiries,
      quotation_sent: quotationSentEnquiries,
      confirmed: confirmedEnquiries,
      completed: completedEnquiries,
      cancelled: cancelledEnquiries,
    }

    // Proposals Sent count
    const proposalsSent = Math.max(
      quotationSentEnquiries,
      quotations.filter((q) => q.status === 'sent' || q.status === 'accepted').length || quotations.length
    )

    // Proposal Activity breakdown
    const proposalCreated = quotations.length
    const proposalSent = quotations.filter((q) => q.status === 'sent').length
    const proposalAccepted = quotations.filter((q) => q.status === 'accepted').length
    const proposalRejected = quotations.filter((q) => q.status === 'rejected').length
    const proposalDraft = quotations.filter((q) => q.status === 'draft').length
    const proposalExpired = quotations.filter((q) => q.status === 'expired').length
    const proposalConversionRate = proposalCreated > 0
      ? Math.round((proposalAccepted / proposalCreated) * 100)
      : 0
    const proposalActivity = {
      created: proposalCreated,
      sent: proposalSent,
      accepted: proposalAccepted,
      rejected: proposalRejected,
      draft: proposalDraft,
      expired: proposalExpired,
      conversionRate: proposalConversionRate,
    }

    // Current date calculations
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Upcoming Events: confirmed bookings sorted by event_date
    const upcomingEvents = enquiries
      .filter((e) => e.status === 'confirmed' && e.event_date)
      .sort((a, b) => (a.event_date > b.event_date ? 1 : -1))
      .slice(0, 6)

    // Follow-up reminders (due today, overdue, upcoming)
    const followUpReminders = {
      dueToday: enquiries.filter(
        (e) =>
          e.follow_up_date === todayStr &&
          e.status !== 'completed' &&
          e.status !== 'cancelled'
      ),
      overdue: enquiries.filter(
        (e) =>
          e.follow_up_date &&
          e.follow_up_date < todayStr &&
          ['new', 'contacted', 'follow_up'].includes(e.status)
      ),
      upcoming: enquiries.filter(
        (e) =>
          e.follow_up_date &&
          e.follow_up_date > todayStr &&
          e.status !== 'completed' &&
          e.status !== 'cancelled'
      ).slice(0, 5),
    }

    // Generate timeline series for 4 filter periods (7d, 30d, 3m, 1y)
    // 1. Last 7 Days (day by day)
    const last7Days: { label: string; count: number; dateStr: string }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateIso = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
      const count = enquiries.filter((e) => e.created_at && e.created_at.startsWith(dateIso)).length
      last7Days.push({ label, count, dateStr: dateIso })
    }

    // 2. Last 30 Days (grouped into 6 periods of 5 days)
    const last30Days: { label: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const startD = new Date(now)
      startD.setDate(startD.getDate() - (i + 1) * 5)
      const endD = new Date(now)
      endD.setDate(endD.getDate() - i * 5)
      const label = `${startD.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${endD.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
      const count = enquiries.filter((e) => {
        if (!e.created_at) return false
        const t = new Date(e.created_at).getTime()
        return t >= startD.getTime() && t <= endD.getTime()
      }).length
      last30Days.push({ label, count })
    }

    // 3. Last 3 Months (month by month)
    const last3Months: { label: string; count: number }[] = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextM = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
      const count = enquiries.filter((e) => {
        if (!e.created_at) return false
        const t = new Date(e.created_at).getTime()
        return t >= d.getTime() && t < nextM.getTime()
      }).length
      last3Months.push({ label, count })
    }

    // 4. This Year (all 12 months)
    const thisYearMonths: { label: string; count: number }[] = []
    const currentYear = now.getFullYear()
    for (let m = 0; m < 12; m++) {
      const d = new Date(currentYear, m, 1)
      const nextM = new Date(currentYear, m + 1, 1)
      const label = d.toLocaleDateString('en-IN', { month: 'short' })
      const count = enquiries.filter((e) => {
        if (!e.created_at) return false
        const t = new Date(e.created_at).getTime()
        return t >= d.getTime() && t < nextM.getTime()
      }).length
      thisYearMonths.push({ label, count })
    }

    // Recent administrative activities
    const activities = await getActivitiesAsync(15)

    return NextResponse.json({
      success: true,
      stats: {
        totalEnquiries,
        newEnquiries,
        pendingEnquiries,
        contactedEnquiries,
        quotationSentEnquiries,
        confirmedEnquiries,
        completedEnquiries,
        cancelledEnquiries,
        proposalsSent,
        upcomingEventsCount: upcomingEvents.length,
        upcomingEvents,
        followUpReminders,
        totalCategories,
        totalMenuItems,
        totalDishes: totalMenuItems,
        publishedMenuItems,
        activeDishes: publishedMenuItems,
        totalQuotations: quotations.length,
        proposalActivity,
        eventCounts,
        statusCounts,
        analytics: {
          last7Days,
          last30Days,
          last3Months,
          thisYear: thisYearMonths,
        },
        activities,
        storageMode: 'Supabase Database',
        isSupabase: isSupabaseConfigured,
      },
    })
  } catch (err: any) {
    console.error('[Admin Stats GET Error]:', err?.message || err)
    return NextResponse.json({ success: false, error: 'Failed to calculate dashboard statistics.' }, { status: 500 })
  }
}
