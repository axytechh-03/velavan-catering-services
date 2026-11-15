'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, isSupabaseConfigured, EnquirySubmission } from '@/lib/supabase'
import { menuItems } from '@/data/menu'
import {
  Lock,
  Search,
  Download,
  Phone,
  Calendar,
  Users,
  MapPin,
  Filter,
  RefreshCw,
  ExternalLink,
  Database,
  UtensilsCrossed,
} from 'lucide-react'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState<'enquiries' | 'menu' | 'database'>('enquiries')

  const [enquiries, setEnquiries] = useState<EnquirySubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Sample data fallback
  const sampleEnquiries: EnquirySubmission[] = [
    {
      id: 'demo-1',
      name: 'R. Karthikeyan',
      phone: '9842211223',
      email: 'karthik@example.com',
      event_type: 'Wedding',
      guest_count: 1200,
      event_date: '2026-12-14',
      location: 'Codissia Hall A, Coimbatore',
      special_requests: 'Require traditional banana leaf service, Elaneer Payasam & Ghee Badam Halwa.',
      status: 'new',
      created_at: '2026-11-14T09:30:00Z',
    },
    {
      id: 'demo-2',
      name: 'Dr. Meenakshi Sundaram',
      phone: '9443355667',
      email: 'meenakshi@gmail.com',
      event_type: 'Reception',
      guest_count: 800,
      event_date: '2026-12-28',
      location: 'Grand Regent, Avinashi Road, Coimbatore',
      special_requests: 'Live Bun Parotta counter and special Dosa counter.',
      status: 'contacted',
      created_at: '2026-11-13T16:45:00Z',
    },
    {
      id: 'demo-3',
      name: 'S. Balasubramaniam',
      phone: '9080311222',
      event_type: 'Family Function',
      guest_count: 350,
      event_date: '2026-11-25',
      location: 'Chettipalayam, Coimbatore',
      special_requests: 'Grahapravesam pure satvik lunch without onion/garlic for morning.',
      status: 'confirmed',
      created_at: '2026-11-12T11:15:00Z',
    },
  ]

  // Check server-side secure session
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch('/api/admin/check')
        const data = await res.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setLoadingAuth(false)
      }
    }
    verifyAuth()
  }, [])

  // Fetch enquiries
  useEffect(() => {
    if (isAuthenticated) {
      fetchEnquiries()
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)
      } else {
        setLoginError(data.message || 'Invalid credentials')
      }
    } catch (err: any) {
      setLoginError('Authentication service error')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch (e) {
      console.error(e)
    }
    setIsAuthenticated(false)
  }

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setEnquiries(data)
          setLoading(false)
          return
        }
      }

      // Local storage fallback
      const stored = localStorage.getItem('velavan_enquiries')
      if (stored) {
        const parsed = JSON.parse(stored)
        setEnquiries([...parsed, ...sampleEnquiries])
      } else {
        setEnquiries(sampleEnquiries)
        localStorage.setItem('velavan_enquiries', JSON.stringify(sampleEnquiries))
      }
    } catch (e) {
      console.error(e)
      setEnquiries(sampleEnquiries)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: EnquirySubmission['status']) => {
    const updated = enquiries.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    )
    setEnquiries(updated)

    try {
      localStorage.setItem('velavan_enquiries', JSON.stringify(updated))
      if (isSupabaseConfigured && supabase && !id.startsWith('demo-') && !id.startsWith('local-')) {
        await supabase.from('enquiries').update({ status: newStatus }).eq('id', id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const exportCSV = () => {
    const headers = ['Name,Phone,Email,EventType,Guests,Date,Location,Status,Created']
    const rows = enquiries.map((item) =>
      [
        `"${item.name}"`,
        `"${item.phone}"`,
        `"${item.email || ''}"`,
        `"${item.event_type}"`,
        item.guest_count,
        `"${item.event_date}"`,
        `"${item.location}"`,
        `"${item.status || 'new'}"`,
        `"${item.created_at || ''}"`,
      ].join(',')
    )
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `velavan_enquiries_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const filteredEnquiries = enquiries.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      )
    }
    return true
  })

  if (loadingAuth) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading security context...</p>
      </div>
    )
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: 'var(--white)', padding: '36px', borderRadius: '4px', border: '1px solid var(--line-gold)', boxShadow: 'var(--shadow)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="brand-mark" style={{ margin: '0 auto 14px', width: '56px', height: '56px' }}>
              <Image
                src="/images/logo/logo.png"
                alt="Velavan Catering Logo"
                width={50}
                height={50}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h2 className="serif" style={{ fontSize: '24px', margin: '0 0 6px', color: 'var(--green2)' }}>
              Velavan Admin Portal
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
              Authorized Catering Management
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '10.5px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Secure Access Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '2px' }}
                  autoFocus
                />
              </div>
              {loginError && (
                <p style={{ color: '#b83b2e', fontSize: '12px', marginTop: '6px' }}>
                  ⚠️ {loginError}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-dark" style={{ width: '100%' }}>
              Sign In to Management
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
            <Link href="/" style={{ color: 'var(--gold-dark)' }}>
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard Screen
  return (
    <div className="section" style={{ minHeight: '85vh', background: 'var(--ivory)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <h1 className="serif" style={{ fontSize: '28px', margin: '0 0 4px', color: 'var(--green2)' }}>
              Velavan Catering Management
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--gold-dark)', margin: 0 }}>
              Real-time Inquiries & Prospectus Menu
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" className="btn btn-outline" style={{ color: 'var(--green)', borderColor: 'var(--line)' }}>
              Live Website
            </Link>
            <button onClick={handleLogout} className="btn" style={{ background: '#b83b2e', borderColor: '#b83b2e', color: '#fff' }}>
              Logout
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`menu-tab ${activeTab === 'enquiries' ? 'active' : ''}`}
            style={activeTab === 'enquiries' ? { background: 'var(--green)', color: '#fff', borderColor: 'var(--green)' } : {}}
          >
            Enquiries ({enquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`menu-tab ${activeTab === 'menu' ? 'active' : ''}`}
            style={activeTab === 'menu' ? { background: 'var(--green)', color: '#fff', borderColor: 'var(--green)' } : {}}
          >
            Prospectus Dishes ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`menu-tab ${activeTab === 'database' ? 'active' : ''}`}
            style={activeTab === 'database' ? { background: 'var(--green)', color: '#fff', borderColor: 'var(--green)' } : {}}
          >
            Database Settings
          </button>
        </div>

        {/* TAB 1: Enquiries */}
        {activeTab === 'enquiries' && (
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', background: '#fff', padding: '14px 18px', border: '1px solid var(--line)', borderRadius: '4px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name, mobile, location..."
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '2px', fontSize: '13px' }}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '2px', fontSize: '13px' }}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button onClick={exportCSV} className="btn btn-sm btn-dark">
                Export CSV
              </button>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredEnquiries.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    padding: '18px 24px',
                    border: '1px solid var(--line)',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '19px', color: 'var(--green2)' }}>
                        {item.name}
                      </h3>
                      <span style={{ fontSize: '11px', color: 'var(--gold-dark)', fontWeight: 600 }}>
                        {item.event_type} {item.other_event_type ? `(${item.other_event_type})` : ''} • {item.guest_count} Guests
                      </span>
                    </div>

                    <div>
                      <select
                        value={item.status || 'new'}
                        onChange={(e) => updateStatus(item.id!, e.target.value as any)}
                        style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--gold)', borderRadius: '2px' }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px', color: 'var(--ink)' }}>
                    <div>📞 <a href={`tel:${item.phone}`} style={{ fontWeight: 600 }}>{item.phone}</a></div>
                    <div>📅 {item.event_date}</div>
                    <div>📍 {item.location}</div>
                  </div>

                  {item.special_requests && (
                    <div style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--ivory)', padding: '6px 10px', borderRadius: '2px' }}>
                      {item.special_requests}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <a
                      href={`https://wa.me/91${item.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
                    >
                      WhatsApp Client
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Menu Viewer */}
        {activeTab === 'menu' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {menuItems.map((dish) => (
              <div key={dish.id} style={{ background: '#fff', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '4px' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--green2)' }}>{dish.nameTa}</div>
                <div style={{ fontSize: '12px', color: 'var(--gold-dark)', fontStyle: 'italic' }}>{dish.nameEn}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Database Settings */}
        {activeTab === 'database' && (
          <div style={{ background: '#fff', padding: '24px', border: '1px solid var(--line)', borderRadius: '4px' }}>
            <h3 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '20px', margin: '0 0 12px', color: 'var(--green2)' }}>
              Supabase PostgreSQL Connection
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
              Status: {isSupabaseConfigured ? '🟢 Connected to Supabase Cloud' : '🟡 Local Storage Active (Zero Crash Resilience)'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
              Configure <code style={{ background: 'var(--paper)', padding: '2px 4px' }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code style={{ background: 'var(--paper)', padding: '2px 4px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Netlify Environment Settings to persist directly to Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
