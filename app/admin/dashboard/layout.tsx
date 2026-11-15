'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquareText,
  UtensilsCrossed,
  Sparkles,
  Image as ImageIcon,
  Building2,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  ChevronRight,
  Database,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminDashboardLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newEnquiryCount, setNewEnquiryCount] = useState(0)

  // Verify authentication on mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch('/api/admin/check')
        const data = await res.json()
        if (!data.authenticated) {
          router.replace('/admin')
          return
        }
        // Load initial stats to show badge
        const statsRes = await fetch('/api/admin/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.success && statsData.stats) {
            setNewEnquiryCount(statsData.stats.newEnquiries || 0)
          }
        }
      } catch (err) {
        console.error('Session check error:', err)
        router.replace('/admin')
      } finally {
        setLoading(false)
      }
    }
    verifyAuth()
  }, [router])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (e) {
      console.error(e)
    }
    router.replace('/admin')
  }

  const navItems = [
    {
      label: 'Overview',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Enquiries',
      href: '/admin/dashboard/enquiries',
      icon: MessageSquareText,
      badge: newEnquiryCount > 0 ? `${newEnquiryCount} New` : undefined,
    },
    {
      label: 'Menu CMS',
      href: '/admin/dashboard/menu',
      icon: UtensilsCrossed,
      tag: '14 Cats',
    },
    {
      label: 'Services',
      href: '/admin/dashboard/services',
      icon: Sparkles,
      tag: '6 Services',
    },
    {
      label: 'Gallery',
      href: '/admin/dashboard/gallery',
      icon: ImageIcon,
      tag: '9 Photos',
    },
    {
      label: 'Clients',
      href: '/admin/dashboard/clients',
      icon: Building2,
    },
    {
      label: 'Website Content',
      href: '/admin/dashboard/content',
      icon: FileText,
      tag: 'Hero & Info',
    },
    {
      label: 'Settings',
      href: '/admin/dashboard/settings',
      icon: Settings,
    },
  ]

  const isCurrentActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d281e',
          color: '#faf8f1',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '2px solid rgba(196, 163, 101, 0.3)',
            borderTopColor: '#c4a365',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p style={{ color: '#c4a365', letterSpacing: '0.12em', fontSize: '0.85rem' }}>
          LOADING VELAVAN ADMIN DASHBOARD...
        </p>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0a1d15',
        color: '#faf8f1',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      }}
    >
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className="admin-sidebar"
        style={{
          width: '270px',
          background: 'linear-gradient(180deg, #113426 0%, #0d281e 100%)',
          borderRight: '1px solid rgba(196, 163, 101, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(196, 163, 101, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#ffffff',
              padding: '3px',
              border: '2px solid #c4a365',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/logo/logo.png"
              alt="Velavan Crest"
              width={38}
              height={38}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
            />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#faf8f1',
                lineHeight: 1.15,
                fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
              }}
            >
              Velavan Catering
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: '#c4a365',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: '3px',
              }}
            >
              Admin CMS Platform
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            padding: '20px 14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(196, 163, 101, 0.8)',
              padding: '0 10px 8px',
            }}
          >
            Management Sections
          </div>

          {navItems.map((item) => {
            const active = isCurrentActive(item.href, item.exact)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#ffffff' : 'rgba(250, 248, 241, 0.75)',
                  background: active
                    ? 'linear-gradient(90deg, rgba(196, 163, 101, 0.22) 0%, rgba(196, 163, 101, 0.08) 100%)'
                    : 'transparent',
                  borderLeft: active ? '3px solid #c4a365' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = '#faf8f1'
                  }
                }}
                onMouseOut={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(250, 248, 241, 0.75)'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} style={{ color: active ? '#c4a365' : 'rgba(196, 163, 101, 0.7)' }} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      background: '#10b981',
                      color: '#06281e',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '12px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {item.tag && !item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: 'rgba(250, 248, 241, 0.45)',
                      fontWeight: 500,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer User Box */}
        <div
          style={{
            padding: '16px 14px',
            borderTop: '1px solid rgba(196, 163, 101, 0.2)',
            background: 'rgba(10, 30, 20, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#c4a365',
                  color: '#0d281e',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                AD
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#faf8f1' }}>Admin Manager</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Authenticated
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out of Admin"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: 'rgba(196, 163, 101, 0.1)',
              border: '1px solid rgba(196, 163, 101, 0.25)',
              borderRadius: '6px',
              color: '#c4a365',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            <span>View Public Website</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 60,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: '280px',
              background: '#0d281e',
              borderRight: '1px solid rgba(196, 163, 101, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
              zIndex: 70,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Image src="/images/logo/logo.png" alt="Logo" width={32} height={32} />
                <span style={{ fontWeight: 700, color: '#faf8f1', fontSize: '0.95rem' }}>Velavan Admin</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#faf8f1',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
              {navItems.map((item) => {
                const active = isCurrentActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#ffffff' : 'rgba(250, 248, 241, 0.75)',
                      background: active ? 'rgba(196, 163, 101, 0.2)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={18} style={{ color: active ? '#c4a365' : 'rgba(196, 163, 101, 0.7)' }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          background: '#10b981',
                          color: '#06281e',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '12px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <button
              onClick={handleLogout}
              style={{
                marginTop: '16px',
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            background: 'rgba(17, 52, 38, 0.92)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(196, 163, 101, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile hamburger button */}
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#faf8f1',
                padding: '6px',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
              }}
            >
              <MenuIcon size={22} />
            </button>

            {/* Breadcrumb path */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: 'rgba(250, 248, 241, 0.55)' }}>Velavan Admin</span>
              <ChevronRight size={14} style={{ color: 'rgba(196, 163, 101, 0.6)' }} />
              <span style={{ color: '#c4a365', fontWeight: 600, textTransform: 'capitalize' }}>
                {pathname.replace('/admin/dashboard', '').replace('/', '') || 'Overview'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Store engine badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#6ee7b7',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <Database size={12} />
              <span>Live CMS Store Active</span>
            </div>

            {/* View live public website */}
            <Link
              href="/"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(196, 163, 101, 0.15)',
                border: '1px solid rgba(196, 163, 101, 0.35)',
                borderRadius: '6px',
                color: '#faf8f1',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>View Site</span>
              <ExternalLink size={13} style={{ color: '#c4a365' }} />
            </Link>
          </div>
        </header>

        {/* Child Page Content */}
        <main style={{ flex: 1, padding: '32px 28px', maxWidth: '1440px', width: '100%', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            display: none !important;
          }
          .admin-mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}
