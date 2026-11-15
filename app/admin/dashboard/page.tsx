'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MessageSquareText,
  UtensilsCrossed,
  Sparkles,
  Image as ImageIcon,
  Building2,
  FileText,
  ArrowRight,
  Plus,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Database,
  Filter,
  Eye,
  Mail,
  MessageCircle,
  X,
  AlertCircle,
  Check,
  RefreshCw,
  Users,
} from 'lucide-react'

interface Stats {
  totalEnquiries: number
  newEnquiries: number
  pendingEnquiries: number
  contactedEnquiries: number
  confirmedEnquiries: number
  completedEnquiries?: number
  cancelledEnquiries?: number
  totalDishes: number
  activeDishes: number
  totalCategories: number
  totalServices: number
  totalGallery: number
  totalClients: number
  eventCounts?: Record<string, number>
  storageMode: string
  isSupabase: boolean
}

interface RecentEnquiry {
  id: string
  name: string
  phone: string
  email?: string
  event_type: string
  guest_count: number
  event_date: string
  event_time?: string
  location: string
  special_requests?: string
  status: string
  admin_notes?: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEnquiry, setSelectedEnquiry] = useState<RecentEnquiry | null>(null)
  const [adminNoteInput, setAdminNoteInput] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [noteSavedToast, setNoteSavedToast] = useState(false)

  const fetchData = async () => {
    try {
      // 1. Fetch KPI stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        if (data.success) {
          setStats(data.stats)
        }
      }

      // 2. Fetch enquiries
      const enqRes = await fetch('/api/admin/enquiries')
      if (enqRes.ok) {
        const enqData = await enqRes.json()
        if (enqData.success && enqData.enquiries) {
          setRecentEnquiries(enqData.enquiries.slice(0, 6))
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setRecentEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        )
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus })
        }
        // Refresh KPI counts
        const statsRes = await fetch('/api/admin/stats')
        if (statsRes.ok) {
          const data = await statsRes.json()
          if (data.success) setStats(data.stats)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedEnquiry) return
    setSavingNote(true)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedEnquiry.id, admin_notes: adminNoteInput }),
      })
      if (res.ok) {
        setSelectedEnquiry({ ...selectedEnquiry, admin_notes: adminNoteInput })
        setRecentEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? { ...e, admin_notes: adminNoteInput } : e))
        )
        setNoteSavedToast(true)
        setTimeout(() => setNoteSavedToast(false), 2500)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingNote(false)
    }
  }

  const openEnquiryModal = (enquiry: RecentEnquiry) => {
    setSelectedEnquiry(enquiry)
    setAdminNoteInput(enquiry.admin_notes || '')
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'new':
        return { bg: '#eef4ff', border: '#b2ccff', text: '#1e40af', label: 'New' }
      case 'contacted':
        return { bg: '#fef9c3', border: '#fde047', text: '#854d0e', label: 'Contacted' }
      case 'confirmed':
        return { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', label: 'Confirmed' }
      case 'completed':
        return { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', label: 'Completed' }
      case 'cancelled':
        return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', label: 'Cancelled' }
      default:
        return { bg: '#faf8f1', border: '#e3dcce', text: '#153d2d', label: status }
    }
  }

  // Calculate event distribution for activity breakdown
  const eventCounts = stats?.eventCounts || {
    Wedding: 1,
    Reception: 1,
    'Family Function': 1,
  }
  const totalCountedEvents = Object.values(eventCounts).reduce((a, b) => a + b, 0) || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Toast Alert */}
      {noteSavedToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
            border: '1.5px solid #c4a365',
            color: '#faf8f1',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10000,
            fontSize: '0.86rem',
          }}
        >
          <Check size={16} style={{ color: '#10b981' }} />
          <span>Internal note saved successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP WELCOME BANNER (ROYAL GREEN BRAND SURFACE) */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
          borderRadius: '14px',
          padding: '28px 32px',
          border: '1px solid rgba(196, 163, 101, 0.3)',
          boxShadow: '0 8px 24px rgba(21, 61, 45, 0.12)',
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
              letterSpacing: '0.2em',
              color: '#c4a365',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            VELAVAN CATERING SERVICES · EXECUTIVE DASHBOARD
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
            Operational Overview & Business Control
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.72)', maxWidth: '640px' }}>
            Real-time management for customer event bookings, 14 menu categories, 151+ dishes, and public website copy.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/dashboard/enquiries"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              color: '#0d281e',
              padding: '11px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.86rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(196, 163, 101, 0.3)',
            }}
          >
            <span>View All Enquiries</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/admin/dashboard/menu"
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
            }}
          >
            <Plus size={16} style={{ color: '#c4a365' }} />
            <span>Add Menu Dish</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7 SUMMARY METRIC CARDS (WHITE SURFACES ON WARM IVORY) */}
      {/* ========================================================================= */}
      <div>
        <div
          style={{
            fontSize: '0.78rem',
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
          <span>Key Business Metrics</span>
          <span style={{ fontSize: '0.72rem', color: '#6b756e', fontWeight: 500 }}>(Live from Database)</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          {/* 1. Total Enquiries */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b756e' }}>Total Enquiries</span>
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
              <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '6px' }}>
                All-time customer requests
              </div>
            </div>
          </div>

          {/* 2. New Enquiries */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #b2ccff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e40af' }}>New Enquiries</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#eef4ff',
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
              <div style={{ fontSize: '0.74rem', color: '#3b82f6', marginTop: '6px', fontWeight: 600 }}>
                Requires follow-up call
              </div>
            </div>
          </div>

          {/* 3. Pending Enquiries */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #fde047',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#854d0e' }}>Pending Enquiries</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#fef9c3',
                  color: '#854d0e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Phone size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#854d0e', lineHeight: 1 }}>
                {stats?.pendingEnquiries ?? stats?.contactedEnquiries ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a16207', marginTop: '6px' }}>
                Contacted & in discussion
              </div>
            </div>
          </div>

          {/* 4. Confirmed Enquiries */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#065f46' }}>Confirmed Enquiries</span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#ecfdf5',
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
              <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                Scheduled event feasts
              </div>
            </div>
          </div>

          {/* 5. Total Menu Categories */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b756e' }}>Menu Categories</span>
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
                <UtensilsCrossed size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#153d2d', lineHeight: 1 }}>
                {stats?.totalCategories ?? 14}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '6px' }}>
                Curated South Indian sections
              </div>
            </div>
          </div>

          {/* 6. Total Dishes */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b756e' }}>Total Dishes</span>
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
                <UtensilsCrossed size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#153d2d', lineHeight: 1 }}>
                {stats?.totalDishes ?? 151}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '6px' }}>
                Bilingual (EN & TA) catalog
              </div>
            </div>
          </div>

          {/* 7. Total Gallery Images */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b756e' }}>Gallery Images</span>
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
                <ImageIcon size={17} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#153d2d', lineHeight: 1 }}>
                {stats?.totalGallery ?? 9}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '6px' }}>
                Moments & Memories photos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK ACTIONS & ENQUIRY ACTIVITY DISTRIBUTION ROW */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Quick Actions Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e3dcce',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#153d2d', fontWeight: 700 }}>
              Quick Action Shortcuts
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#9e7f41', fontWeight: 600 }}>Frequent Admin Tasks</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link
              href="/admin/dashboard/menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                background: '#faf8f1',
                border: '1px solid #e3dcce',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#153d2d',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#c4a365'
                e.currentTarget.style.background = '#ffffff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e3dcce'
                e.currentTarget.style.background = '#faf8f1'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(21, 61, 45, 0.1)',
                  color: '#153d2d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Plus size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Add New Dish</div>
                <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>Menu catalog</div>
              </div>
            </Link>

            <Link
              href="/admin/dashboard/gallery"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                background: '#faf8f1',
                border: '1px solid #e3dcce',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#153d2d',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#c4a365'
                e.currentTarget.style.background = '#ffffff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e3dcce'
                e.currentTarget.style.background = '#faf8f1'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(196, 163, 101, 0.2)',
                  color: '#9e7f41',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ImageIcon size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Upload Image</div>
                <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>Gallery carousel</div>
              </div>
            </Link>

            <Link
              href="/admin/dashboard/services"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                background: '#faf8f1',
                border: '1px solid #e3dcce',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#153d2d',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#c4a365'
                e.currentTarget.style.background = '#ffffff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e3dcce'
                e.currentTarget.style.background = '#faf8f1'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(21, 61, 45, 0.1)',
                  color: '#153d2d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Add Service</div>
                <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>Celebration cards</div>
              </div>
            </Link>

            <Link
              href="/admin/dashboard/enquiries"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                background: '#faf8f1',
                border: '1px solid #e3dcce',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#153d2d',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#c4a365'
                e.currentTarget.style.background = '#ffffff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e3dcce'
                e.currentTarget.style.background = '#faf8f1'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(196, 163, 101, 0.2)',
                  color: '#9e7f41',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageSquareText size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>View Enquiries</div>
                <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>Customer CRM</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Enquiry Distribution Activity Breakdown */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e3dcce',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#153d2d', fontWeight: 700 }}>
              Enquiries by Event Type
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#6b756e' }}>Real Distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(eventCounts).map(([type, count]) => {
              const pct = Math.round((count / totalCountedEvents) * 100)
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 600, color: '#153d2d' }}>{type}</span>
                    <span style={{ color: '#6b756e' }}>{count} bookings ({pct}%)</span>
                  </div>
                  <div style={{ height: '7px', background: '#f3efe5', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #153d2d 0%, #c4a365 100%)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECENT ENQUIRIES TABLE */}
      {/* ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e3dcce',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: '#153d2d', fontWeight: 700 }}>
              Recent Catering Enquiries
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b756e' }}>
              Latest customer booking submissions via public website
            </p>
          </div>

          <Link
            href="/admin/dashboard/enquiries"
            style={{
              fontSize: '0.82rem',
              color: '#c4a365',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Open Enquiries Manager</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b756e' }}>
            No recent enquiries logged yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3efe5', textAlign: 'left' }}>
                  <th style={{ padding: '12px 10px', color: '#6b756e', fontWeight: 600, fontSize: '0.78rem' }}>CUSTOMER</th>
                  <th style={{ padding: '12px 10px', color: '#6b756e', fontWeight: 600, fontSize: '0.78rem' }}>PHONE</th>
                  <th style={{ padding: '12px 10px', color: '#6b756e', fontWeight: 600, fontSize: '0.78rem' }}>EVENT TYPE</th>
                  <th style={{ padding: '12px 10px', color: '#6b756e', fontWeight: 600, fontSize: '0.78rem' }}>EVENT DATE</th>
                  <th style={{ padding: '12px 10px', color: '#6b756e', fontWeight: 600, fontSize: '0.78rem' }}>ENQUIRY DATE</th>
                  <th style={{ padding: '12px 10px', color: '#6b756e', fontWeight: 600, fontSize: '0.78rem' }}>STATUS</th>
                  <th style={{ padding: '12px 10px', color: '#6b756e', fontWeight: 600, fontSize: '0.78rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((enq) => {
                  const style = getStatusBadgeStyle(enq.status)
                  const enquiryDateFormatted = enq.created_at
                    ? new Date(enq.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent'

                  return (
                    <tr
                      key={enq.id}
                      style={{
                        borderBottom: '1px solid #f3efe5',
                        transition: 'background 0.12s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#faf8f1')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 600, color: '#153d2d' }}>{enq.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#6b756e' }}>{enq.guest_count} Guests</div>
                      </td>

                      <td style={{ padding: '14px 10px' }}>
                        <a
                          href={`tel:${enq.phone}`}
                          style={{ color: '#153d2d', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {enq.phone}
                        </a>
                      </td>

                      <td style={{ padding: '14px 10px', color: '#153d2d' }}>
                        {enq.event_type}
                      </td>

                      <td style={{ padding: '14px 10px', color: '#6b756e', whiteSpace: 'nowrap' }}>
                        {enq.event_date}
                      </td>

                      <td style={{ padding: '14px 10px', color: '#6b756e', whiteSpace: 'nowrap' }}>
                        {enquiryDateFormatted}
                      </td>

                      <td style={{ padding: '14px 10px' }}>
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            border: `1px solid ${style.border}`,
                            background: style.bg,
                            color: style.text,
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => openEnquiryModal(enq)}
                          style={{
                            padding: '6px 12px',
                            background: '#faf8f1',
                            border: '1px solid #d1c7b7',
                            color: '#153d2d',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} style={{ color: '#c4a365' }} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ENQUIRY DOSSIER DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedEnquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 23, 17, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #c4a365',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                padding: '24px 28px',
                color: '#faf8f1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: '#c4a365',
                    textTransform: 'uppercase',
                  }}
                >
                  Customer Booking Dossier
                </span>
                <h3
                  style={{
                    margin: '4px 0 0',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: '1.6rem',
                    color: '#faf8f1',
                    fontWeight: 700,
                  }}
                >
                  {selectedEnquiry.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250, 248, 241, 0.65)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Communication Bar */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                  }}
                >
                  <Phone size={15} />
                  <span>Call Phone</span>
                </a>

                <a
                  href={`https://wa.me/91${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20this%20is%20Velavan%20Catering%20Services%20regarding%20your%20${encodeURIComponent(selectedEnquiry.event_type)}%20enquiry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                  }}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>

                {selectedEnquiry.email && (
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                    }}
                  >
                    <Mail size={15} />
                    <span>Email</span>
                  </a>
                )}
              </div>

              {/* Event Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  background: '#faf8f1',
                  padding: '16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: '#6b756e', fontSize: '0.76rem', display: 'block' }}>EVENT OCCASION</span>
                  <strong style={{ color: '#153d2d' }}>{selectedEnquiry.event_type}</strong>
                </div>

                <div>
                  <span style={{ color: '#6b756e', fontSize: '0.76rem', display: 'block' }}>GUEST CAPACITY</span>
                  <strong style={{ color: '#153d2d' }}>{selectedEnquiry.guest_count} Guests</strong>
                </div>

                <div>
                  <span style={{ color: '#6b756e', fontSize: '0.76rem', display: 'block' }}>EVENT DATE</span>
                  <strong style={{ color: '#153d2d' }}>{selectedEnquiry.event_date}</strong>
                </div>

                <div>
                  <span style={{ color: '#6b756e', fontSize: '0.76rem', display: 'block' }}>LOCATION / MANDAPAM</span>
                  <strong style={{ color: '#153d2d' }}>{selectedEnquiry.location}</strong>
                </div>
              </div>

              {/* Special Requests */}
              {selectedEnquiry.special_requests && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                    Customer Requests & Menu Preferences
                  </label>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e3dcce',
                      padding: '12px',
                      borderRadius: '8px',
                      marginTop: '6px',
                      fontSize: '0.86rem',
                      color: '#1f2f25',
                      lineHeight: '1.5',
                    }}
                  >
                    {selectedEnquiry.special_requests}
                  </div>
                </div>
              )}

              {/* Internal Admin Notes */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                  Internal Administrator Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Record call discussions, customized leaf menu items, advance payment status..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1c7b7',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginTop: '6px',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    style={{
                      padding: '7px 16px',
                      background: '#153d2d',
                      color: '#faf8f1',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: savingNote ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {savingNote ? <RefreshCw size={13} className="spin" /> : <Check size={13} />}
                    <span>{savingNote ? 'Saving...' : 'Save Internal Note'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
