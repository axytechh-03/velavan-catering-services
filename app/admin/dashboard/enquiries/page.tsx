'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Download,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  AlertTriangle,
  Send,
  ExternalLink,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { EnquiryRecord, EnquiryStatus } from '@/lib/cms-store'

export default function EnquiriesManagementPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [eventFilter, setEventFilter] = useState<string>('all')

  // Selected enquiry for details modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [modalStatus, setModalStatus] = useState<EnquiryStatus>('new')
  const [savingNotes, setSavingNotes] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Delete modal state
  const [enquiryToDelete, setEnquiryToDelete] = useState<EnquiryRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enquiries')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.enquiries) {
          setEnquiries(data.enquiries)
        }
      }
    } catch (e) {
      console.error('Error fetching enquiries:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Open modal with preloaded notes
  const openDetailsModal = (enq: EnquiryRecord) => {
    setSelectedEnquiry(enq)
    setAdminNotes(enq.admin_notes || '')
    setModalStatus(enq.status)
  }

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return
    setSavingNotes(true)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEnquiry.id,
          admin_notes: adminNotes,
          status: modalStatus,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.enquiry) {
          setEnquiries((prev) =>
            prev.map((e) => (e.id === selectedEnquiry.id ? data.enquiry : e))
          )
          setSelectedEnquiry(data.enquiry)
          setToastMessage('Enquiry notes & status saved successfully!')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        )
        setToastMessage(`Status changed to ${newStatus}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteEnquiry = async () => {
    if (!enquiryToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/enquiries?id=${enquiryToDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setEnquiries((prev) => prev.filter((e) => e.id !== enquiryToDelete.id))
        setToastMessage('Enquiry record deleted permanently.')
        setEnquiryToDelete(null)
        if (selectedEnquiry?.id === enquiryToDelete.id) {
          setSelectedEnquiry(null)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  const exportCSV = () => {
    const headers = [
      'ID,Customer Name,Phone,Email,Event Type,Guest Count,Event Date,Event Time,Location,Special Requests,Status,Admin Notes,Created At',
    ]
    const rows = filteredEnquiries.map((e) =>
      [
        `"${e.id}"`,
        `"${e.name}"`,
        `"${e.phone}"`,
        `"${e.email || ''}"`,
        `"${e.event_type}"`,
        e.guest_count,
        `"${e.event_date}"`,
        `"${e.event_time || ''}"`,
        `"${(e.location || '').replace(/"/g, '""')}"`,
        `"${(e.special_requests || '').replace(/"/g, '""')}"`,
        `"${e.status}"`,
        `"${(e.admin_notes || '').replace(/"/g, '""')}"`,
        `"${e.created_at}"`,
      ].join(',')
    )

    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `velavan_enquiries_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filtered dataset
  const filteredEnquiries = enquiries.filter((e) => {
    // Status filter
    if (statusFilter !== 'all' && e.status !== statusFilter) return false

    // Event type filter
    if (eventFilter !== 'all' && e.event_type !== eventFilter) return false

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = e.name.toLowerCase().includes(q)
      const matchPhone = e.phone.toLowerCase().includes(q)
      const matchEmail = e.email?.toLowerCase().includes(q)
      const matchLoc = e.location.toLowerCase().includes(q)
      const matchReq = e.special_requests?.toLowerCase().includes(q)
      if (!matchName && !matchPhone && !matchEmail && !matchLoc && !matchReq) {
        return false
      }
    }

    return true
  })

  // Status counts
  const countAll = enquiries.length
  const countNew = enquiries.filter((e) => e.status === 'new').length
  const countContacted = enquiries.filter((e) => e.status === 'contacted').length
  const countConfirmed = enquiries.filter((e) => e.status === 'confirmed').length
  const countCompleted = enquiries.filter((e) => e.status === 'completed').length
  const countCancelled = enquiries.filter((e) => e.status === 'cancelled').length

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#93c5fd', label: 'New' }
      case 'contacted':
        return { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#fde047', label: 'Contacted' }
      case 'confirmed':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#6ee7b7', label: 'Confirmed' }
      case 'completed':
        return { bg: 'rgba(14, 165, 233, 0.2)', border: '#0ea5e9', text: '#7dd3fc', label: 'Completed' }
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#fca5a5', label: 'Cancelled' }
      default:
        return { bg: 'rgba(196, 163, 101, 0.2)', border: '#c4a365', text: '#faf8f1', label: status }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
            border: '1.5px solid #c4a365',
            color: '#faf8f1',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100,
            fontSize: '0.88rem',
          }}
        >
          <Check size={18} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
              fontSize: '2rem',
              margin: '0 0 6px',
              color: '#faf8f1',
            }}
          >
            Catering Enquiries Management
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.7)' }}>
            Review customer catering requests, record client communications, and export bookings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchEnquiries}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(196, 163, 101, 0.15)',
              border: '1px solid rgba(196, 163, 101, 0.3)',
              color: '#faf8f1',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} style={{ color: '#c4a365' }} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              color: '#0d281e',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(196, 163, 101, 0.3)',
            }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          background: 'rgba(21, 61, 45, 0.65)',
          border: '1px solid rgba(196, 163, 101, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Enquiries', count: countAll },
            { id: 'new', label: 'New', count: countNew, color: '#3b82f6' },
            { id: 'contacted', label: 'Contacted', count: countContacted, color: '#eab308' },
            { id: 'confirmed', label: 'Confirmed', count: countConfirmed, color: '#10b981' },
            { id: 'completed', label: 'Completed', count: countCompleted, color: '#0ea5e9' },
            { id: 'cancelled', label: 'Cancelled', count: countCancelled, color: '#ef4444' },
          ].map((tab) => {
            const active = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: active ? '1.5px solid #c4a365' : '1px solid rgba(196, 163, 101, 0.2)',
                  background: active ? 'rgba(196, 163, 101, 0.22)' : 'rgba(0, 0, 0, 0.2)',
                  color: active ? '#ffffff' : 'rgba(250, 248, 241, 0.75)',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: tab.color ? tab.color : 'rgba(255, 255, 255, 0.15)',
                    color: tab.color ? '#000000' : '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search and Secondary Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(196, 163, 101, 0.7)',
              }}
            />
            <input
              type="text"
              placeholder="Search by customer name, phone, venue or requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: 'rgba(10, 35, 25, 0.65)',
                border: '1px solid rgba(196, 163, 101, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(250, 248, 241, 0.6)' }}>Event:</span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'rgba(10, 35, 25, 0.65)',
                border: '1px solid rgba(196, 163, 101, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Events</option>
              <option value="Wedding">Wedding</option>
              <option value="Reception">Reception</option>
              <option value="Engagement">Engagement</option>
              <option value="Family Function">Family Function</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Birthday">Birthday</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div
        style={{
          background: 'rgba(21, 61, 45, 0.75)',
          border: '1px solid rgba(196, 163, 101, 0.25)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(10, 30, 20, 0.6)', borderBottom: '1.5px solid rgba(196, 163, 101, 0.25)', color: '#c4a365' }}>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Customer Details</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Event & Date</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Guests</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Admin Notes</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#c4a365' }}>
                    Loading enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(250, 248, 241, 0.6)' }}>
                    No enquiries found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const badge = getStatusBadge(enq.status)

                  return (
                    <tr
                      key={enq.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: '#faf8f1', fontSize: '0.92rem' }}>{enq.name}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                          <a
                            href={`tel:${enq.phone}`}
                            style={{
                              fontSize: '0.78rem',
                              color: '#c4a365',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Phone size={12} />
                            <span>{enq.phone}</span>
                          </a>
                          {enq.email && (
                            <a
                              href={`mailto:${enq.email}`}
                              style={{
                                fontSize: '0.75rem',
                                color: 'rgba(250, 248, 241, 0.55)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Mail size={12} />
                              <span>{enq.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#ffffff', fontWeight: 600 }}>{enq.event_type}</div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'rgba(250, 248, 241, 0.65)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                          }}
                        >
                          <Calendar size={12} />
                          <span>{enq.event_date}</span>
                        </div>
                        {enq.event_time && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'rgba(250, 248, 241, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '2px',
                            }}
                          >
                            <Clock size={11} />
                            <span>{enq.event_time}</span>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px' }}>
                        <span style={{ fontWeight: 700, color: '#e5ded1' }}>{enq.guest_count}</span>
                        <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.6)' }}> guests</span>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', maxWidth: '200px' }}>
                          <MapPin size={14} style={{ color: '#c4a365', marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.82rem', color: 'rgba(250, 248, 241, 0.85)' }}>
                            {enq.location}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <select
                          value={enq.status}
                          onChange={(e) => handleQuickStatusChange(enq.id, e.target.value as EnquiryStatus)}
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

                      <td style={{ padding: '16px', maxWidth: '200px' }}>
                        {enq.admin_notes ? (
                          <div
                            style={{
                              fontSize: '0.76rem',
                              color: '#c4a365',
                              background: 'rgba(196, 163, 101, 0.1)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(196, 163, 101, 0.25)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={enq.admin_notes}
                          >
                            📝 {enq.admin_notes}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'rgba(250, 248, 241, 0.35)' }}>
                            No notes recorded
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => openDetailsModal(enq)}
                            title="View Full Details & Manage Notes"
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(196, 163, 101, 0.15)',
                              border: '1px solid rgba(196, 163, 101, 0.35)',
                              borderRadius: '6px',
                              color: '#c4a365',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => setEnquiryToDelete(enq)}
                            title="Delete Enquiry"
                            style={{
                              padding: '6px 8px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '6px',
                              color: '#fca5a5',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW DETAILS & ADMIN NOTES */}
      {/* ========================================================================= */}
      {selectedEnquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 80,
          }}
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#0d281e',
              border: '1.5px solid rgba(196, 163, 101, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(196, 163, 101, 0.25)',
                background: 'rgba(21, 61, 45, 0.8)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#c4a365', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                  ENQUIRY DOSSIER #{selectedEnquiry.id}
                </span>
                <h3 style={{ margin: '2px 0 0', color: '#faf8f1', fontSize: '1.3rem' }}>
                  {selectedEnquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250, 248, 241, 0.7)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Communication Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6ee7b7',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  <Phone size={15} />
                  <span>Call {selectedEnquiry.phone}</span>
                </a>

                <a
                  href={`https://wa.me/91${selectedEnquiry.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20greetings%20from%20Velavan%20Catering%20Services.%20We%20received%20your%20catering%20enquiry%20for%20${encodeURIComponent(selectedEnquiry.event_type)}.`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  <MessageSquare size={15} />
                  <span>WhatsApp Message</span>
                </a>

                {selectedEnquiry.email && (
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=Velavan%20Catering%20Services%20-%20Enquiry%20Confirmation`}
                    style={{
                      flex: 1,
                      minWidth: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#93c5fd',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                    }}
                  >
                    <Mail size={15} />
                    <span>Email Client</span>
                  </a>
                )}
              </div>

              {/* Event Specification Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                  background: 'rgba(21, 61, 45, 0.5)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(196, 163, 101, 0.2)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(250, 248, 241, 0.55)', textTransform: 'uppercase' }}>
                    Event Type
                  </span>
                  <div style={{ fontSize: '0.92rem', color: '#faf8f1', fontWeight: 600, marginTop: '2px' }}>
                    {selectedEnquiry.event_type}
                    {selectedEnquiry.other_event_type ? ` (${selectedEnquiry.other_event_type})` : ''}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(250, 248, 241, 0.55)', textTransform: 'uppercase' }}>
                    Event Date & Time
                  </span>
                  <div style={{ fontSize: '0.92rem', color: '#faf8f1', fontWeight: 600, marginTop: '2px' }}>
                    {selectedEnquiry.event_date} {selectedEnquiry.event_time ? ` · ${selectedEnquiry.event_time}` : ''}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(250, 248, 241, 0.55)', textTransform: 'uppercase' }}>
                    Expected Guest Count
                  </span>
                  <div style={{ fontSize: '0.92rem', color: '#faf8f1', fontWeight: 600, marginTop: '2px' }}>
                    {selectedEnquiry.guest_count} Guests
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(250, 248, 241, 0.55)', textTransform: 'uppercase' }}>
                    Venue / Mandapam Location
                  </span>
                  <div style={{ fontSize: '0.92rem', color: '#faf8f1', fontWeight: 600, marginTop: '2px' }}>
                    {selectedEnquiry.location}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <span style={{ fontSize: '0.75rem', color: '#c4a365', fontWeight: 700, textTransform: 'uppercase' }}>
                  Special Requests / Menu Requirements
                </span>
                <div
                  style={{
                    marginTop: '6px',
                    padding: '12px 14px',
                    background: 'rgba(10, 35, 25, 0.6)',
                    border: '1px solid rgba(196, 163, 101, 0.25)',
                    borderRadius: '8px',
                    color: '#faf8f1',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedEnquiry.special_requests || 'No specific requests provided by client.'}
                </div>
              </div>

              {/* Status and Notes Section */}
              <div
                style={{
                  borderTop: '1px solid rgba(196, 163, 101, 0.2)',
                  paddingTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#c4a365',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    Booking Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as EnquiryStatus)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(10, 35, 25, 0.65)',
                      border: '1px solid rgba(196, 163, 101, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  >
                    <option value="new">New (Unreviewed)</option>
                    <option value="contacted">Contacted (In Discussion)</option>
                    <option value="confirmed">Confirmed (Advance Received / Locked)</option>
                    <option value="completed">Completed (Successfully Catered)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#c4a365',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    Internal Administrator Notes & Discussion Log
                  </label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Spoke with customer on Nov 15. Banana leaf 24-dish package agreed at ₹450/leaf. Sent sample tasting box."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(10, 35, 25, 0.65)',
                      border: '1px solid rgba(196, 163, 101, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(196, 163, 101, 0.25)',
                background: 'rgba(21, 61, 45, 0.7)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => setEnquiryToDelete(selectedEnquiry)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <Trash2 size={15} />
                <span>Delete Enquiry</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#faf8f1',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0d281e',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: savingNotes ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Check size={16} />
                  <span>{savingNotes ? 'Saving...' : 'Save Notes & Status'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {enquiryToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 90,
          }}
          onClick={() => setEnquiryToDelete(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0d281e',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              padding: '28px 24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px', color: '#faf8f1', fontSize: '1.25rem' }}>
              Confirm Permanent Deletion
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'rgba(250, 248, 241, 0.7)', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete the catering enquiry from{' '}
              <strong style={{ color: '#ffffff' }}>{enquiryToDelete.name}</strong>? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setEnquiryToDelete(null)}
                style={{
                  padding: '10px 18px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#faf8f1',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEnquiry}
                disabled={deleting}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
