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
} from 'lucide-react'

interface Stats {
  totalEnquiries: number
  newEnquiries: number
  contactedEnquiries: number
  confirmedEnquiries: number
  totalDishes: number
  activeDishes: number
  totalCategories: number
  totalServices: number
  totalGallery: number
  totalClients: number
  storageMode: string
  isSupabase: boolean
}

interface RecentEnquiry {
  id: string
  name: string
  phone: string
  event_type: string
  guest_count: number
  event_date: string
  location: string
  status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      // 1. Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        if (data.success) {
          setStats(data.stats)
        }
      }

      // 2. Fetch recent enquiries
      const enqRes = await fetch('/api/admin/enquiries')
      if (enqRes.ok) {
        const enqData = await enqRes.json()
        if (enqData.success && enqData.enquiries) {
          setRecentEnquiries(enqData.enquiries.slice(0, 5))
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard overview data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
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
        // Refresh stats
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'new':
        return { bg: 'rgba(59, 130, 246, 0.18)', border: '#3b82f6', text: '#93c5fd', label: 'New' }
      case 'contacted':
        return { bg: 'rgba(234, 179, 8, 0.18)', border: '#eab308', text: '#fde047', label: 'Contacted' }
      case 'confirmed':
        return { bg: 'rgba(16, 185, 129, 0.18)', border: '#10b981', text: '#6ee7b7', label: 'Confirmed' }
      case 'completed':
        return { bg: 'rgba(14, 165, 233, 0.18)', border: '#0ea5e9', text: '#7dd3fc', label: 'Completed' }
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.18)', border: '#ef4444', text: '#fca5a5', label: 'Cancelled' }
      default:
        return { bg: 'rgba(196, 163, 101, 0.18)', border: '#c4a365', text: '#f5d796', label: status }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ========================================================================= */}
      {/* WELCOME BANNER */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(21, 61, 45, 0.95) 0%, rgba(13, 40, 30, 0.95) 100%)',
          border: '1.5px solid rgba(196, 163, 101, 0.3)',
          borderRadius: '16px',
          padding: '28px 32px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#c4a365',
              marginBottom: '6px',
            }}
          >
            VELAVAN CATERING SERVICES · ADMIN COMMAND CENTER
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
              fontSize: '2rem',
              color: '#faf8f1',
              margin: '0 0 8px',
              fontWeight: 600,
            }}
          >
            Management & Content Overview
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(250, 248, 241, 0.75)', maxWidth: '640px' }}>
            Monitor incoming customer enquiries, manage the 14-category bilingual menu catalog, update core services, and configure website content in real time.
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
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.86rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(196, 163, 101, 0.35)',
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
              padding: '12px 18px',
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
      {/* 8 STATS CARDS */}
      {/* ========================================================================= */}
      <div>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(196, 163, 101, 0.9)',
            marginBottom: '14px',
          }}
        >
          Operational & Content Metrics
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {/* 1. Total Enquiries */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Total Enquiries
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {stats?.totalEnquiries ?? '...'}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                }}
              >
                <MessageSquareText size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
              <strong>{stats?.newEnquiries ?? 0} New / Pending review</strong>
            </div>
          </div>

          {/* 2. Confirmed Events */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Confirmed Bookings
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                  {stats?.confirmedEnquiries ?? '...'}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>Ready for event production</span>
            </div>
          </div>

          {/* 3. Total Dishes */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Catalog Dishes
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {stats?.totalDishes ?? '...'}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(196, 163, 101, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c4a365',
                }}
              >
                <UtensilsCrossed size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Bilingual EN / TA in 14 categories</span>
            </div>
          </div>

          {/* 4. Menu Categories */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Menu Categories
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#c4a365', marginTop: '4px' }}>
                  {stats?.totalCategories ?? 14}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(196, 163, 101, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c4a365',
                }}
              >
                <Filter size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.7)' }}>
              <span>Breakfast, Muhurtham, Sweets & more</span>
            </div>
          </div>

          {/* 5. Services */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Celebration Services
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {stats?.totalServices ?? 6}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}
              >
                <Sparkles size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.7)' }}>
              <span>6 Core Wedding & Event Cards</span>
            </div>
          </div>

          {/* 6. Gallery */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Gallery Photos
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {stats?.totalGallery ?? 9}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f472b6',
                }}
              >
                <ImageIcon size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.7)' }}>
              <span>9 High-Res Event Photographs</span>
            </div>
          </div>

          {/* 7. Clients */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Partner Brands
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {stats?.totalClients ?? 6}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(20, 184, 166, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2dd4bf',
                }}
              >
                <Building2 size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.7)' }}>
              <span>Mandapams & Convention Partners</span>
            </div>
          </div>

          {/* 8. Storage Mode */}
          <div
            style={{
              background: 'rgba(21, 61, 45, 0.65)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.65)', fontWeight: 500 }}>
                  Storage Engine
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#faf8f1', marginTop: '8px' }}>
                  {stats?.storageMode ?? 'Local JSON Store'}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <Database size={20} />
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>Zero-Config High Availability</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK ACTIONS ROW */}
      {/* ========================================================================= */}
      <div>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(196, 163, 101, 0.9)',
            marginBottom: '14px',
          }}
        >
          Quick Action Shortcuts
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}
        >
          <Link
            href="/admin/dashboard/enquiries"
            style={{
              padding: '16px',
              background: 'rgba(21, 61, 45, 0.45)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#faf8f1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <MessageSquareText size={20} style={{ color: '#c4a365' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Review Enquiries</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(250, 248, 241, 0.6)' }}>View customer submissions</div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/menu"
            style={{
              padding: '16px',
              background: 'rgba(21, 61, 45, 0.45)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#faf8f1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <UtensilsCrossed size={20} style={{ color: '#c4a365' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Manage Menu</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(250, 248, 241, 0.6)' }}>Add/edit dishes in 14 cats</div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/services"
            style={{
              padding: '16px',
              background: 'rgba(21, 61, 45, 0.45)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#faf8f1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={20} style={{ color: '#c4a365' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Edit Services</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(250, 248, 241, 0.6)' }}>6 celebration offerings</div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/gallery"
            style={{
              padding: '16px',
              background: 'rgba(21, 61, 45, 0.45)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#faf8f1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <ImageIcon size={20} style={{ color: '#c4a365' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Manage Gallery</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(250, 248, 241, 0.6)' }}>9 celebration photographs</div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/content"
            style={{
              padding: '16px',
              background: 'rgba(21, 61, 45, 0.45)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#faf8f1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <FileText size={20} style={{ color: '#c4a365' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Website Content</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(250, 248, 241, 0.6)' }}>Hero, Contact, FSSAI</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECENT ENQUIRIES TABLE */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'rgba(21, 61, 45, 0.75)',
          border: '1.5px solid rgba(196, 163, 101, 0.25)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
                fontSize: '1.45rem',
                margin: '0 0 4px',
                color: '#faf8f1',
              }}
            >
              Recent Catering Enquiries
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(250, 248, 241, 0.65)' }}>
              Latest wedding and function enquiries submitted from the public website
            </p>
          </div>

          <Link
            href="/admin/dashboard/enquiries"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              color: '#c4a365',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span>View All Enquiries</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(250, 248, 241, 0.6)' }}>
            No enquiries recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(196, 163, 101, 0.2)', color: '#c4a365' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Customer Name</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Event & Date</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Guests</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((enq) => {
                  const badge = getStatusBadgeStyle(enq.status)

                  return (
                    <tr
                      key={enq.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600, color: '#faf8f1' }}>{enq.name}</div>
                        <a
                          href={`tel:${enq.phone}`}
                          style={{
                            fontSize: '0.78rem',
                            color: 'rgba(196, 163, 101, 0.9)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                          }}
                        >
                          <Phone size={12} />
                          <span>{enq.phone}</span>
                        </a>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ color: '#ffffff', fontWeight: 500 }}>{enq.event_type}</div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'rgba(250, 248, 241, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                          }}
                        >
                          <Calendar size={12} />
                          <span>{enq.event_date}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px', color: '#e5ded1' }}>
                        <strong>{enq.guest_count}</strong> guests
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'rgba(250, 248, 241, 0.8)',
                            fontSize: '0.82rem',
                          }}
                        >
                          <MapPin size={13} style={{ color: '#c4a365', flexShrink: 0 }} />
                          <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {enq.location}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <select
                          value={enq.status}
                          onChange={(e) => handleQuickStatusChange(enq.id, e.target.value)}
                          style={{
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.text,
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="new" style={{ background: '#0d281e', color: '#93c5fd' }}>
                            New
                          </option>
                          <option value="contacted" style={{ background: '#0d281e', color: '#fde047' }}>
                            Contacted
                          </option>
                          <option value="confirmed" style={{ background: '#0d281e', color: '#6ee7b7' }}>
                            Confirmed
                          </option>
                          <option value="completed" style={{ background: '#0d281e', color: '#7dd3fc' }}>
                            Completed
                          </option>
                          <option value="cancelled" style={{ background: '#0d281e', color: '#fca5a5' }}>
                            Cancelled
                          </option>
                        </select>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <Link
                          href={`/admin/dashboard/enquiries?id=${enq.id}`}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(196, 163, 101, 0.15)',
                            border: '1px solid rgba(196, 163, 101, 0.3)',
                            borderRadius: '6px',
                            color: '#c4a365',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>Details</span>
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
