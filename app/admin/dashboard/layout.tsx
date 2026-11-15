'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  PhoneCall,
  ShieldCheck,
  Settings,
  LogOut,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  X,
  Bell,
  Calendar,
  ExternalLink,
  ChevronDown,
  User,
  CheckCircle2,
  KeyRound,
  Database,
  Layers,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  exact?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export default function StandaloneAdminDashboardLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Layout states
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [authenticating, setAuthenticating] = useState(true)
  const [newEnquiryCount, setNewEnquiryCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Verify server-side authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check')
        const data = await res.json()
        if (!data.authenticated) {
          router.replace('/admin')
          return
        }

        // Fetch KPI stats for badges & notification drawer
        const statsRes = await fetch('/api/admin/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.success && statsData.stats) {
            setNewEnquiryCount(statsData.stats.newEnquiries || 0)
          }
        }

        // Fetch recent enquiries for notification dropdown
        const enqRes = await fetch('/api/admin/enquiries')
        if (enqRes.ok) {
          const enqData = await enqRes.json()
          if (enqData.success && enqData.enquiries) {
            const newOnes = enqData.enquiries.filter((e: any) => e.status === 'new').slice(0, 4)
            setRecentNotifications(newOnes)
          }
        }
      } catch (err) {
        console.error('Session error:', err)
        router.replace('/admin')
      } finally {
        setAuthenticating(false)
      }
    }
    checkAuth()
  }, [router])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false)
    setProfileDropdownOpen(false)
    setNotificationsOpen(false)
  }, [pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout error:', e)
    }
    router.replace('/admin')
  }

  // Sidebar navigation definition
  const navigationGroups: NavGroup[] = [
    {
      title: 'MAIN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          id: 'enquiries',
          label: 'Enquiries',
          href: '/admin/dashboard/enquiries',
          icon: MessageSquareText,
          badge: newEnquiryCount > 0 ? `${newEnquiryCount} New` : undefined,
        },
      ],
    },
    {
      title: 'WEBSITE MANAGEMENT',
      items: [
        {
          id: 'menu',
          label: 'Menu Management',
          href: '/admin/dashboard/menu',
          icon: UtensilsCrossed,
        },
        {
          id: 'services',
          label: 'Services Management',
          href: '/admin/dashboard/services',
          icon: Sparkles,
        },
        {
          id: 'gallery',
          label: 'Gallery Management',
          href: '/admin/dashboard/gallery',
          icon: ImageIcon,
        },
        {
          id: 'clients',
          label: 'Clients Management',
          href: '/admin/dashboard/clients',
          icon: Building2,
        },
        {
          id: 'content',
          label: 'Website Content',
          href: '/admin/dashboard/content',
          icon: FileText,
        },
        {
          id: 'contact',
          label: 'Contact Details',
          href: '/admin/dashboard/contact',
          icon: PhoneCall,
        },
        {
          id: 'compliance',
          label: 'Compliance & Food Safety',
          href: '/admin/dashboard/compliance',
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'settings',
          label: 'Admin Settings',
          href: '/admin/dashboard/settings',
          icon: Settings,
        },
      ],
    },
  ]

  // Breadcrumb resolution
  const getBreadcrumb = () => {
    if (pathname === '/admin/dashboard') return { group: 'Main', page: 'Dashboard Overview' }
    if (pathname.includes('/enquiries')) return { group: 'Main', page: 'Customer Enquiries' }
    if (pathname.includes('/menu')) return { group: 'Website Management', page: 'Menu Management' }
    if (pathname.includes('/services')) return { group: 'Website Management', page: 'Services Management' }
    if (pathname.includes('/gallery')) return { group: 'Website Management', page: 'Gallery Management' }
    if (pathname.includes('/clients')) return { group: 'Website Management', page: 'Clients Management' }
    if (pathname.includes('/content')) return { group: 'Website Management', page: 'Website Content' }
    if (pathname.includes('/contact')) return { group: 'Website Management', page: 'Contact Details' }
    if (pathname.includes('/compliance')) return { group: 'Website Management', page: 'Compliance & Food Safety' }
    if (pathname.includes('/settings')) return { group: 'System', page: 'Admin Settings' }
    return { group: 'Admin', page: 'Management' }
  }

  const breadcrumb = getBreadcrumb()

  // Format today's date
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  if (authenticating) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d281e',
          color: '#c4a365',
          fontFamily: '"DM Sans", sans-serif',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(196, 163, 101, 0.2)',
            borderTopColor: '#c4a365',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.88rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Loading Administration Panel...
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
        backgroundColor: '#faf8f1',
        color: '#1f2f25',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* =========================================================================
          LEFT SIDEBAR (DESKTOP & MOBILE DRAWER)
          ========================================================================= */}
      {/* Mobile Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 23, 17, 0.72)',
            backdropFilter: 'blur(3px)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        className="admin-sidebar"
        style={{
          width: collapsed ? '78px' : '260px',
          minWidth: collapsed ? '78px' : '260px',
          backgroundColor: '#0d281e',
          borderRight: '1px solid rgba(196, 163, 101, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          transition: 'width 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: collapsed ? '18px 12px' : '20px 18px',
            borderBottom: '1px solid rgba(196, 163, 101, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #c4a365',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                padding: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Image
                src="/images/logo/logo.png"
                alt="Velavan"
                width={34}
                height={34}
                style={{ objectFit: 'contain' }}
              />
            </div>

            {!collapsed && (
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#faf8f1',
                    letterSpacing: '0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  Velavan Catering
                </div>
                <div
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    color: '#c4a365',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                  }}
                >
                  Administration Panel
                </div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-collapse-btn"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'rgba(196, 163, 101, 0.15)',
              border: '1px solid rgba(196, 163, 101, 0.3)',
              color: '#c4a365',
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Sidebar Nav Links (Scrollable) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: 'rgba(196, 163, 101, 0.7)',
                    textTransform: 'uppercase',
                    padding: '0 12px 6px',
                  }}
                >
                  {group.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        padding: collapsed ? '11px 0' : '10px 14px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? '#faf8f1' : 'rgba(250, 248, 241, 0.72)',
                        background: isActive ? 'linear-gradient(90deg, #153d2d 0%, rgba(21, 61, 45, 0.8) 100%)' : 'transparent',
                        borderLeft: isActive ? '3px solid #c4a365' : '3px solid transparent',
                        transition: 'all 0.16s ease',
                        position: 'relative',
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(21, 61, 45, 0.45)'
                          e.currentTarget.style.color = '#faf8f1'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = 'rgba(250, 248, 241, 0.72)'
                        }
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        <Icon
                          size={19}
                          style={{
                            color: isActive ? '#c4a365' : 'rgba(196, 163, 101, 0.65)',
                            flexShrink: 0,
                          }}
                        />
                        {!collapsed && (
                          <span
                            style={{
                              fontSize: '0.86rem',
                              fontWeight: isActive ? 600 : 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          style={{
                            backgroundColor: '#c4a365',
                            color: '#0d281e',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            letterSpacing: '0.04em',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Small badge dot if collapsed */}
                      {collapsed && item.badge && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '18px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#c4a365',
                          }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* SYSTEM: Profile and Logout Direct Buttons */}
          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(196, 163, 101, 0.15)' }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: 'rgba(196, 163, 101, 0.7)',
                  textTransform: 'uppercase',
                  padding: '0 12px 6px',
                }}
              >
                ACCOUNT
              </div>
            )}

            <button
              onClick={() => setShowProfileModal(true)}
              title={collapsed ? 'Administrator Profile' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '11px 0' : '10px 14px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(250, 248, 241, 0.72)',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '12px',
                transition: 'all 0.16s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(21, 61, 45, 0.45)'
                e.currentTarget.style.color = '#faf8f1'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'rgba(250, 248, 241, 0.72)'
              }}
            >
              <UserCheck size={19} style={{ color: 'rgba(196, 163, 101, 0.65)', flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: '0.86rem', fontWeight: 500 }}>Profile Dossier</span>}
            </button>

            <button
              onClick={handleLogout}
              title={collapsed ? 'Secure Logout' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '11px 0' : '10px 14px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#ff8a7a',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '12px',
                transition: 'all 0.16s ease',
                marginTop: '3px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(184, 59, 46, 0.18)'
                e.currentTarget.style.color = '#ffb3a7'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#ff8a7a'
              }}
            >
              <LogOut size={19} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Sign Out</span>}
            </button>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div
          style={{
            padding: collapsed ? '14px 6px' : '14px 16px',
            borderTop: '1px solid rgba(196, 163, 101, 0.18)',
            backgroundColor: 'rgba(9, 31, 23, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#153d2d',
                border: '1px solid #c4a365',
                color: '#c4a365',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
                flexShrink: 0,
              }}
            >
              VK
            </div>

            {!collapsed && (
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#faf8f1', lineHeight: 1.2 }}>
                  Admin Portal
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '0.68rem', color: 'rgba(250, 248, 241, 0.65)' }}>Online / Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA + TOP TOOLBAR
          ========================================================================= */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: '#faf8f1',
        }}
      >
        {/* Top Admin Toolbar */}
        <header
          style={{
            height: '68px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e3dcce',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 900,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Left: Mobile Drawer Trigger + Breadcrumb + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="mobile-drawer-toggle"
              aria-label="Open navigation menu"
              style={{
                display: 'none',
                background: '#faf8f1',
                border: '1px solid #d1c7b7',
                color: '#153d2d',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <MenuIcon size={20} />
            </button>

            <div>
              {/* Breadcrumb */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: '#6b756e',
                  fontWeight: 500,
                }}
              >
                <span>Velavan Admin</span>
                <span>/</span>
                <span style={{ color: '#9e7f41' }}>{breadcrumb.group}</span>
                <span>/</span>
                <span style={{ color: '#153d2d', fontWeight: 600 }}>{breadcrumb.page}</span>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: '1.28rem',
                  fontWeight: 700,
                  color: '#153d2d',
                  margin: '2px 0 0',
                  lineHeight: 1.15,
                }}
              >
                {breadcrumb.page}
              </h2>
            </div>
          </div>

          {/* Right: Date, Live Website Link, Notifications & Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Current Date Badge */}
            <div
              className="toolbar-date-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 12px',
                background: '#faf8f1',
                border: '1px solid #e3dcce',
                borderRadius: '20px',
                fontSize: '0.8rem',
                color: '#153d2d',
                fontWeight: 500,
              }}
            >
              <Calendar size={14} style={{ color: '#c4a365' }} />
              <span>{currentDate}</span>
            </div>

            {/* View Live Website Button */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: 'rgba(21, 61, 45, 0.06)',
                border: '1px solid rgba(21, 61, 45, 0.18)',
                color: '#153d2d',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(21, 61, 45, 0.12)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(21, 61, 45, 0.06)')}
            >
              <ExternalLink size={14} style={{ color: '#c4a365' }} />
              <span className="view-site-text">View Public Site</span>
            </Link>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#faf8f1',
                  border: '1px solid #e3dcce',
                  color: '#153d2d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <Bell size={18} />
                {newEnquiryCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: '#b83b2e',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(184, 59, 46, 0.4)',
                    }}
                  >
                    {newEnquiryCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '320px',
                    background: '#ffffff',
                    border: '1px solid #e3dcce',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                    padding: '16px',
                    zIndex: 999,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #f3efe5',
                      paddingBottom: '10px',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#153d2d' }}>
                      Recent Enquiries Alert
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#eaf1ec',
                        color: '#153d2d',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {newEnquiryCount} Pending
                    </span>
                  </div>

                  {recentNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b756e', fontSize: '0.84rem' }}>
                      All enquiries have been reviewed.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {recentNotifications.map((notif: any) => (
                        <Link
                          key={notif.id}
                          href="/admin/dashboard/enquiries"
                          style={{
                            display: 'block',
                            padding: '10px',
                            background: '#faf8f1',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            border: '1px solid #e3dcce',
                          }}
                        >
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#153d2d' }}>
                            {notif.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#6b756e', marginTop: '2px' }}>
                            {notif.event_type} • {notif.guest_count} Guests • {notif.event_date}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f3efe5', textAlign: 'center' }}>
                    <Link
                      href="/admin/dashboard/enquiries"
                      style={{
                        fontSize: '0.82rem',
                        color: '#c4a365',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      View All Customer Enquiries →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#faf8f1',
                  border: '1px solid #e3dcce',
                  borderRadius: '24px',
                  padding: '4px 10px 4px 5px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#153d2d',
                    color: '#c4a365',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                  }}
                >
                  VK
                </div>
                <span className="profile-btn-label" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#153d2d' }}>
                  Admin
                </span>
                <ChevronDown size={14} style={{ color: '#6b756e' }} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '210px',
                    background: '#ffffff',
                    border: '1px solid #e3dcce',
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    padding: '8px',
                    zIndex: 999,
                  }}
                >
                  <div
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #f3efe5',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#153d2d' }}>Administrator</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>admin@velavancatering.com</div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      setShowProfileModal(true)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: '#153d2d',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#faf8f1')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <User size={15} style={{ color: '#c4a365' }} />
                    <span>Admin Profile</span>
                  </button>

                  <Link
                    href="/admin/dashboard/settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: '#153d2d',
                      textDecoration: 'none',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#faf8f1')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Settings size={15} style={{ color: '#c4a365' }} />
                    <span>System Settings</span>
                  </Link>

                  <div style={{ height: '1px', background: '#f3efe5', margin: '6px 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      color: '#b83b2e',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(184, 59, 46, 0.08)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Main Scrollable Viewport */}
        <main
          style={{
            flex: 1,
            padding: '28px 32px',
            maxWidth: '1500px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* =========================================================================
          ADMIN PROFILE DOSSIER MODAL
          ========================================================================= */}
      {showProfileModal && (
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
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #c4a365',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                padding: '24px 28px',
                color: '#faf8f1',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250, 248, 241, 0.65)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#faf8f1',
                    border: '2px solid #c4a365',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#153d2d',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                  }}
                >
                  VK
                </div>
                <div>
                  <h3
                    style={{
                      margin: '0 0 4px',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: '1.4rem',
                      color: '#faf8f1',
                    }}
                  >
                    Velavan Administrator
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#0d281e',
                        backgroundColor: '#c4a365',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      SUPER ADMIN
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.7)' }}>
                      Full CMS Authority
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#faf8f1',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                  }}
                >
                  <span style={{ color: '#6b756e' }}>Username ID:</span>
                  <span style={{ fontWeight: 600, color: '#153d2d' }}>admin</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#faf8f1',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                  }}
                >
                  <span style={{ color: '#6b756e' }}>Official Email:</span>
                  <span style={{ fontWeight: 600, color: '#153d2d' }}>admin@velavancatering.com</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#faf8f1',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                  }}
                >
                  <span style={{ color: '#6b756e' }}>Session Protocol:</span>
                  <span style={{ fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={14} />
                    <span>HTTP-Only Secure Cookie</span>
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#faf8f1',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                  }}
                >
                  <span style={{ color: '#6b756e' }}>Access Boundary:</span>
                  <span style={{ fontWeight: 600, color: '#153d2d' }}>Isolated Admin Panel</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Link
                  href="/admin/dashboard/settings"
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    padding: '10px 18px',
                    background: '#faf8f1',
                    border: '1px solid #c4a365',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Settings size={15} style={{ color: '#c4a365' }} />
                  <span>Change Password</span>
                </Link>

                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                    color: '#faf8f1',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS overrides for the standalone admin layout */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            transform: ${mobileDrawerOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            width: 260px !important;
            min-width: 260px !important;
          }
          .mobile-drawer-toggle {
            display: flex !important;
          }
          .sidebar-collapse-btn {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .toolbar-date-badge {
            display: none !important;
          }
          .view-site-text {
            display: none !important;
          }
          .profile-btn-label {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
