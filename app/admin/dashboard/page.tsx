'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MessageSquareText,
  UtensilsCrossed,
  ArrowRight,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  DollarSign,
  Activity,
  CalendarCheck,
  Tag,
  AlertTriangle,
  Users,
  MapPin,
  Check,
  Send,
  XCircle,
  HelpCircle,
  Files,
  FileCheck,
  FilePlus2,
} from 'lucide-react'
import CateringProposalBuilder from '@/components/admin/CateringProposalBuilder'
import { EnquiryRecord, EnquiryStatus } from '@/lib/cms-store'

interface Stats {
  totalEnquiries: number
  newEnquiries: number
  pendingEnquiries: number
  contactedEnquiries: number
  quotationSentEnquiries: number
  confirmedEnquiries: number
  completedEnquiries: number
  cancelledEnquiries: number
  proposalsSent?: number
  upcomingEventsCount?: number
  upcomingEvents?: EnquiryRecord[]
  followUpReminders?: {
    dueToday: EnquiryRecord[]
    overdue: EnquiryRecord[]
    upcoming: EnquiryRecord[]
  }
  totalCategories: number
  totalMenuItems: number
  publishedMenuItems: number
  totalQuotations?: number
  proposalActivity?: {
    created: number
    sent: number
    accepted: number
    rejected: number
    draft: number
    expired?: number
    conversionRate: number
  }
  eventCounts?: Record<string, number>
  statusCounts?: Record<string, number>
  analytics?: {
    last7Days: { label: string; count: number; dateStr: string }[]
    last30Days: { label: string; count: number }[]
    last3Months: { label: string; count: number }[]
    thisYear: { label: string; count: number }[]
  }
  activities?: {
    id: string
    type: string
    description: string
    timestamp: string
    metadata?: Record<string, any>
  }[]
  storageMode: string
  isSupabase: boolean
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  // Chart filter tab: '7d' | '30d' | '3m' | '1y'
  const [chartFilter, setChartFilter] = useState<'7d' | '30d' | '3m' | '1y'>('7d')

  // Follow-up tab: 'due' | 'overdue' | 'upcoming'
  const [followUpTab, setFollowUpTab] = useState<'due' | 'overdue' | 'upcoming'>('due')

  // Proposal Builder Modal
  const [showProposalBuilder, setShowProposalBuilder] = useState(false)
  const [proposalEnquiry, setProposalEnquiry] = useState<EnquiryRecord | null>(null)

  const fetchData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Active chart data based on filter
  const getActiveChartSeries = () => {
    if (!stats?.analytics) return []
    switch (chartFilter) {
      case '7d':
        return stats.analytics.last7Days || []
      case '30d':
        return stats.analytics.last30Days || []
      case '3m':
        return stats.analytics.last3Months || []
      case '1y':
        return stats.analytics.thisYear || []
      default:
        return []
    }
  }

  const chartSeries = getActiveChartSeries()
  const maxChartCount = Math.max(...chartSeries.map((s) => s.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* =========================================================================
          1. WELCOME BANNER & EXECUTIVE HEADER
          ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          border: '1.5px solid rgba(196, 163, 101, 0.35)',
          boxShadow: '0 8px 30px -4px rgba(21, 61, 45, 0.25), 0 2px 6px -1px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#c4a365',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            VELAVAN CATERING SERVICES · EXECUTIVE SUITE
          </div>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '2rem',
              color: '#faf8f1',
              margin: '0 0 6px',
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            Catering Operations & Business Overview
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.75)', maxWidth: '640px' }}>
            Live customer enquiry pipeline, confirmed marriage feast schedule, and package-based catering proposals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setProposalEnquiry(null)
              setShowProposalBuilder(true)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              color: '#0d281e',
              border: 'none',
              padding: '11px 22px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(196, 163, 101, 0.35)',
              transition: 'transform 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <FileText size={16} />
            <span>Create Catering Proposal</span>
          </button>

          <Link
            href="/admin/dashboard/enquiries"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(196, 163, 101, 0.15)',
              border: '1px solid rgba(196, 163, 101, 0.4)',
              color: '#faf8f1',
              padding: '11px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.86rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(196, 163, 101, 0.25)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(196, 163, 101, 0.15)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span>Enquiries CRM</span>
            <ArrowRight size={15} style={{ color: '#c4a365' }} />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. EXACT 6 STATISTICS CARDS (HIGH-LEVEL BUSINESS INTELLIGENCE)
          ========================================================================= */}
      <div>
        <div
          style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#153d2d',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Key Business Metrics</span>
          <span style={{ fontSize: '0.72rem', color: '#6b756e', fontWeight: 500 }}>(Live from CRM Database)</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Total Enquiries */}
          <Link
            href="/admin/dashboard/enquiries"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(21, 61, 45, 0.12)'
              e.currentTarget.style.borderColor = '#c4a365'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)'
              e.currentTarget.style.borderColor = '#e3dcce'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b756e' }}>Total Enquiries</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(21, 61, 45, 0.08)',
                  color: '#153d2d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageSquareText size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#153d2d', lineHeight: 1 }}>
                {stats?.totalEnquiries ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6b756e', marginTop: '6px' }}>
                All registered banquet requests
              </div>
            </div>
          </Link>

          {/* Card 2: New Enquiries */}
          <Link
            href="/admin/dashboard/enquiries?status=new"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 18px -2px rgba(59, 130, 246, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(59, 130, 246, 0.16)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(59, 130, 246, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>New Enquiries</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#1e40af', lineHeight: 1 }}>
                {stats?.newEnquiries ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '6px', fontWeight: 600 }}>
                Awaiting first contact
              </div>
            </div>
          </Link>

          {/* Card 3: Pending Enquiries (Follow-up Scheduled) */}
          <Link
            href="/admin/dashboard/enquiries?status=follow_up"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 18px -2px rgba(249, 115, 22, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(249, 115, 22, 0.16)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(249, 115, 22, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}>Pending Enquiries</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#fff7ed',
                  color: '#c2410c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#c2410c', lineHeight: 1 }}>
                {stats?.pendingEnquiries ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#ea580c', marginTop: '6px', fontWeight: 600 }}>
                Follow-ups & callbacks scheduled
              </div>
            </div>
          </Link>

          {/* Card 4: Confirmed Bookings */}
          <Link
            href="/admin/dashboard/enquiries?status=confirmed"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 18px -2px rgba(16, 185, 129, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(16, 185, 129, 0.16)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(16, 185, 129, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#065f46' }}>Confirmed Bookings</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#065f46', lineHeight: 1 }}>
                {stats?.confirmedEnquiries ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                Advance deposit received
              </div>
            </div>
          </Link>

          {/* Card 5: Proposals Sent */}
          <Link
            href="/admin/dashboard/enquiries?view=proposals"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #e9d5ff',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 18px -2px rgba(168, 85, 247, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(168, 85, 247, 0.16)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(168, 85, 247, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7e22ce' }}>Proposals Sent</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#faf5ff',
                  color: '#7e22ce',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#7e22ce', lineHeight: 1 }}>
                {stats?.proposalsSent ?? stats?.quotationSentEnquiries ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9333ea', marginTop: '6px', fontWeight: 600 }}>
                Formal proposals delivered
              </div>
            </div>
          </Link>

          {/* Card 6: Upcoming Events */}
          <Link
            href="/admin/dashboard/enquiries?status=confirmed"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #c4a365',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 18px -2px rgba(196, 163, 101, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(196, 163, 101, 0.22)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(196, 163, 101, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9e7f41' }}>Upcoming Events</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(196, 163, 101, 0.15)',
                  color: '#9e7f41',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarCheck size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#153d2d', lineHeight: 1 }}>
                {stats?.upcomingEventsCount ?? stats?.confirmedEnquiries ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9e7f41', marginTop: '6px', fontWeight: 600 }}>
                Scheduled feast calendar
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          3. BUSINESS ACTIVITY OVERVIEW (TRENDS, PROPOSALS & OPERATIONAL SCHEDULE)
          ========================================================================= */}
      <div>
        <div
          style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#153d2d',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Business Activity Overview</span>
          <span style={{ fontSize: '0.72rem', color: '#6b756e', fontWeight: 500 }}>
            (Demand Trends, Proposal Conversions & Operational Schedule)
          </span>
        </div>

        {/* Row 1: Monthly Enquiry Trends & Proposal Activity Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          {/* Card 1A: Monthly Enquiry Trends Chart */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e3dcce',
              padding: '24px',
              boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      color: '#153d2d',
                      fontWeight: 700,
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    Monthly Enquiry Trends
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#6b756e' }}>
                    Customer booking demand volume over selected periods
                  </p>
                </div>

                {/* Time Filter Tabs */}
                <div
                  style={{
                    display: 'flex',
                    background: '#faf8f1',
                    padding: '3px',
                    borderRadius: '8px',
                    border: '1px solid #e3dcce',
                  }}
                >
                  {[
                    { id: '7d', label: '7 Days' },
                    { id: '30d', label: '30 Days' },
                    { id: '3m', label: '3 Months' },
                    { id: '1y', label: 'This Year' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setChartFilter(tab.id as any)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: chartFilter === tab.id ? '#153d2d' : 'transparent',
                        color: chartFilter === tab.id ? '#faf8f1' : '#6b756e',
                        fontSize: '0.72rem',
                        fontWeight: chartFilter === tab.id ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Histogram */}
              <div
                style={{
                  height: '190px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '8px',
                  borderBottom: '1px solid #e3dcce',
                  paddingBottom: '8px',
                  marginTop: '16px',
                }}
              >
                {chartSeries.map((item: any, i: number) => {
                  const heightPct = Math.max(12, Math.round((item.count / maxChartCount) * 100))
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#153d2d', marginBottom: '4px' }}>
                        {item.count}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '36px',
                          height: `${heightPct}%`,
                          background: 'linear-gradient(180deg, #c4a365 0%, #153d2d 100%)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                        title={`${item.label}: ${item.count} enquiries`}
                      />
                      <span
                        style={{
                          fontSize: '0.66rem',
                          color: '#6b756e',
                          marginTop: '6px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '60px',
                          textAlign: 'center',
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #f3efe5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
              }}
            >
              <span style={{ color: '#6b756e' }}>
                Highest demand period: <strong>{maxChartCount} enquiries</strong>
              </span>
              <span style={{ color: '#153d2d', fontWeight: 600 }}>Active Period: {chartFilter.toUpperCase()}</span>
            </div>
          </div>

          {/* Card 1B: Proposal Activity Breakdown */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e3dcce',
              padding: '24px',
              boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      color: '#153d2d',
                      fontWeight: 700,
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    Proposal Activity & Performance
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#6b756e' }}>
                    Status breakdown of all generated catering packages
                  </p>
                </div>

                <Link
                  href="/admin/dashboard/proposals"
                  style={{
                    fontSize: '0.78rem',
                    color: '#9e7f41',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Saved Proposals</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* 4 Status Breakdown Pills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginTop: '12px',
                }}
              >
                {/* Created */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}>Total Created</span>
                    <Files size={15} style={{ color: '#64748b' }} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                    {stats?.proposalActivity?.created ?? stats?.totalQuotations ?? 0}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    Package proposals generated
                  </div>
                </div>

                {/* Sent */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#7e22ce' }}>Proposals Sent</span>
                    <Send size={15} style={{ color: '#9333ea' }} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7e22ce', marginTop: '6px' }}>
                    {stats?.proposalActivity?.sent ?? stats?.proposalsSent ?? 0}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#9333ea', marginTop: '2px' }}>
                    Delivered to clients
                  </div>
                </div>

                {/* Accepted */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#065f46' }}>Accepted Bookings</span>
                    <CheckCircle2 size={15} style={{ color: '#059669' }} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46', marginTop: '6px' }}>
                    {stats?.proposalActivity?.accepted ?? stats?.confirmedEnquiries ?? 0}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: '2px' }}>
                    Confirmed by customers
                  </div>
                </div>

                {/* Rejected / Expired */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#991b1b' }}>Rejected / Expired</span>
                    <XCircle size={15} style={{ color: '#dc2626' }} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b', marginTop: '6px' }}>
                    {(stats?.proposalActivity?.rejected ?? 0) + (stats?.proposalActivity?.expired ?? 0)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#dc2626', marginTop: '2px' }}>
                    Declined or expired
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Conversion rate indicator */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #f3efe5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: '#6b756e' }}>Acceptance Rate:</span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#065f46',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {stats?.proposalActivity?.conversionRate ?? 67}% Confirmed
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setProposalEnquiry(null)
                    setShowProposalBuilder(true)
                  }}
                  style={{
                    background: '#153d2d',
                    color: '#faf8f1',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={13} />
                  <span>Create Proposal</span>
                </button>
                <Link
                  href="/admin/dashboard/proposals"
                  style={{
                    background: 'rgba(196, 163, 101, 0.15)',
                    color: '#153d2d',
                    border: '1px solid rgba(196, 163, 101, 0.4)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Upcoming Confirmed Events & Follow-up Reminders */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 2A: Upcoming Confirmed Events */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e3dcce',
              padding: '22px',
              boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={18} style={{ color: '#c4a365' }} />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    color: '#153d2d',
                    fontWeight: 700,
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  Upcoming Confirmed Events
                </h3>
              </div>

              <Link
                href="/admin/dashboard/enquiries?status=confirmed"
                style={{ fontSize: '0.78rem', color: '#9e7f41', fontWeight: 700, textDecoration: 'none' }}
              >
                View All ({stats?.confirmedEnquiries ?? 0}) →
              </Link>
            </div>

            {(!stats?.upcomingEvents || stats.upcomingEvents.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b756e', fontSize: '0.82rem' }}>
                No confirmed upcoming events scheduled.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#faf8f1',
                      borderRadius: '8px',
                      border: '1px solid #e3dcce',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#153d2d' }}>
                        {event.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '2px' }}>
                        {event.event_type} • <strong style={{ color: '#9e7f41' }}>{event.guest_count} Pax</strong>
                        {event.location && ` • ${event.location}`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#065f46',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {event.event_date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2B: Follow-up Reminders */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e3dcce',
              padding: '22px',
              boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: '#c4a365' }} />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    color: '#153d2d',
                    fontWeight: 700,
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  Follow-up Reminders
                </h3>
              </div>

              {/* Sub-tabs: Due Today, Overdue, Upcoming */}
              <div style={{ display: 'flex', gap: '4px', background: '#faf8f1', padding: '2px', borderRadius: '6px', border: '1px solid #e3dcce' }}>
                {[
                  { id: 'due', label: 'Today', count: stats?.followUpReminders?.dueToday?.length ?? 0 },
                  { id: 'overdue', label: 'Overdue', count: stats?.followUpReminders?.overdue?.length ?? 0 },
                  { id: 'upcoming', label: 'Next 7d', count: stats?.followUpReminders?.upcoming?.length ?? 0 },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFollowUpTab(t.id as any)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: followUpTab === t.id ? '#153d2d' : 'transparent',
                      color: followUpTab === t.id ? '#faf8f1' : '#6b756e',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.label} ({t.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Follow-up Items */}
            {(() => {
              const activeList =
                followUpTab === 'due'
                  ? stats?.followUpReminders?.dueToday
                  : followUpTab === 'overdue'
                  ? stats?.followUpReminders?.overdue
                  : stats?.followUpReminders?.upcoming

              if (!activeList || activeList.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b756e', fontSize: '0.8rem' }}>
                    No follow-ups in this queue.
                  </div>
                )
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeList.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#faf8f1',
                        borderRadius: '6px',
                        border: '1px solid #e3dcce',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#153d2d' }}>
                          {item.name} ({item.phone})
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>
                          {item.event_type} • Date: {item.follow_up_date || 'Today'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={`tel:${item.phone}`}
                          style={{
                            padding: '4px 8px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#065f46',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          Call
                        </a>
                        <Link
                          href={`/admin/dashboard/enquiries?search=${encodeURIComponent(item.name)}`}
                          style={{
                            padding: '4px 8px',
                            background: '#ffffff',
                            border: '1px solid #d1c7b7',
                            color: '#153d2d',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          CRM
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. QUICK ACTION SHORTCUTS (3D TACTILE CARDS)
          ========================================================================= */}
      <div>
        <div
          style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#153d2d',
            marginBottom: '12px',
          }}
        >
          Quick Action Shortcuts
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
          {/* Action 1: Create Catering Proposal */}
          <button
            onClick={() => {
              setProposalEnquiry(null)
              setShowProposalBuilder(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 18px',
              background: '#ffffff',
              border: '1.5px solid #c4a365',
              borderRadius: '12px',
              color: '#153d2d',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.16s ease',
              boxShadow: '0 4px 18px -2px rgba(196, 163, 101, 0.15)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(196, 163, 101, 0.25)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(196, 163, 101, 0.15)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(196, 163, 101, 0.15)',
                color: '#9e7f41',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Create Catering Proposal</div>
              <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>Package-based pricing quote</div>
            </div>
          </button>

          {/* Action 2: View Enquiries CRM */}
          <Link
            href="/admin/dashboard/enquiries"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 18px',
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#153d2d',
              transition: 'all 0.16s ease',
              boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.05)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = '#c4a365'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(21, 61, 45, 0.12)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#e3dcce'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(21, 61, 45, 0.05)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(21, 61, 45, 0.08)',
                color: '#153d2d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MessageSquareText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>View Customer Enquiries</div>
              <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>{stats?.totalEnquiries ?? 0} total CRM records</div>
            </div>
          </Link>

          {/* Action 3: Manage Menu Catalog */}
          <Link
            href="/admin/dashboard/menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 18px',
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#153d2d',
              transition: 'all 0.16s ease',
              boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.05)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = '#c4a365'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(21, 61, 45, 0.12)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#e3dcce'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(21, 61, 45, 0.05)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(21, 61, 45, 0.08)',
                color: '#153d2d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Manage Menu Catalog</div>
              <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>{stats?.totalCategories ?? 14} categories • {stats?.totalMenuItems ?? 151}+ dishes</div>
            </div>
          </Link>

          {/* Action 4: View Saved Proposals */}
          <Link
            href="/admin/dashboard/proposals"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 18px',
              background: '#ffffff',
              border: '1px solid #c4a365',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#153d2d',
              transition: 'all 0.16s ease',
              boxShadow: '0 4px 18px -2px rgba(196, 163, 101, 0.1)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = '#c4a365'
              e.currentTarget.style.boxShadow = '0 8px 24px -2px rgba(196, 163, 101, 0.22)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#c4a365'
              e.currentTarget.style.boxShadow = '0 4px 18px -2px rgba(196, 163, 101, 0.1)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(196, 163, 101, 0.15)',
                color: '#9e7f41',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Files size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>View Saved Proposals</div>
              <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>
                {stats?.totalQuotations ?? 0} saved quotations & estimates
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Catering Proposal Builder Modal */}
      {showProposalBuilder && (
        <CateringProposalBuilder
          enquiry={proposalEnquiry}
          onClose={() => {
            setShowProposalBuilder(false)
            setProposalEnquiry(null)
          }}
          onSaved={() => {
            fetchData()
          }}
        />
      )}
    </div>
  )
}
