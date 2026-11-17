'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Download,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trash2,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Tag,
  AlertCircle,
  Printer,
  Edit2,
  DollarSign,
  Send,
} from 'lucide-react'
import CateringProposalBuilder from '@/components/admin/CateringProposalBuilder'
import {
  EnquiryRecord,
  EnquiryStatus,
  EnquiryPriority,
  QuotationRecord,
  QuotationStatus,
} from '@/lib/cms-store'

function EnquiriesManagementContent() {
  const searchParams = useSearchParams()

  // Main view switcher: 'enquiries' | 'quotations'
  const [mainView, setMainView] = useState<'enquiries' | 'quotations'>('enquiries')

  // Datasets
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([])
  const [quotations, setQuotations] = useState<QuotationRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Enquiries Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Sync with URL query parameters (Pipeline clicks & Quick Actions)
  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam) {
      setStatusFilter(statusParam)
      setMainView('enquiries')
    }
    const viewParam = searchParams.get('view')
    if (viewParam === 'proposals' || viewParam === 'quotations') {
      setMainView('quotations')
    }
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
      setMainView('enquiries')
    }
  }, [searchParams])

  // Quotations Filters & Search
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('')
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all')

  // Selected enquiry for details modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [modalStatus, setModalStatus] = useState<EnquiryStatus>('new')
  const [modalPriority, setModalPriority] = useState<EnquiryPriority>('normal')
  const [modalFollowUpDate, setModalFollowUpDate] = useState('')
  const [modalFollowUpNotes, setModalFollowUpNotes] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Delete modal state
  const [enquiryToDelete, setEnquiryToDelete] = useState<EnquiryRecord | null>(null)
  const [quoteToDelete, setQuoteToDelete] = useState<QuotationRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Quotation Builder Modal state
  const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)
  const [quotationEnquiry, setQuotationEnquiry] = useState<EnquiryRecord | null>(null)
  const [editingQuotation, setEditingQuotation] = useState<QuotationRecord | null>(null)
  const [builderInitialView, setBuilderInitialView] = useState<'build' | 'preview'>('build')

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Enquiries
      const enqRes = await fetch('/api/admin/enquiries')
      if (enqRes.ok) {
        const data = await enqRes.json()
        if (data.success && data.enquiries) {
          setEnquiries(data.enquiries)
        }
      }

      // 2. Fetch Quotations
      const quoteRes = await fetch('/api/admin/quotations')
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json()
        if (quoteData.success && quoteData.quotations) {
          setQuotations(quoteData.quotations)
        }
      }
    } catch (e) {
      console.error('Error fetching CRM data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Open enquiry modal
  const openDetailsModal = (enq: EnquiryRecord) => {
    setSelectedEnquiry(enq)
    setAdminNotes(enq.admin_notes || '')
    setModalStatus(enq.status)
    setModalPriority(enq.priority || 'normal')
    setModalFollowUpDate(enq.follow_up_date || '')
    setModalFollowUpNotes(enq.follow_up_notes || '')
  }

  const handleSaveDetails = async () => {
    if (!selectedEnquiry) return
    setSavingDetails(true)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEnquiry.id,
          admin_notes: adminNotes,
          status: modalStatus,
          priority: modalPriority,
          follow_up_date: modalFollowUpDate,
          follow_up_notes: modalFollowUpNotes,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.enquiry) {
          setEnquiries((prev) =>
            prev.map((e) => (e.id === selectedEnquiry.id ? data.enquiry : e))
          )
          setSelectedEnquiry(data.enquiry)
          setToastMessage('Enquiry details updated successfully!')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingDetails(false)
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

  const handleQuickPriorityChange = async (id: string, newPriority: EnquiryPriority) => {
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, priority: newPriority }),
      })
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, priority: newPriority } : e))
        )
        setToastMessage(`Priority set to ${newPriority}`)
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

  // Quotation Management Actions
  const handleQuoteStatusChange = async (id: string, newStatus: QuotationStatus) => {
    try {
      const res = await fetch('/api/admin/quotations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setQuotations((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
        )
        setToastMessage(`Quotation status changed to ${newStatus}`)
        // Refresh enquiries as enquiry status might have synced
        const enqRes = await fetch('/api/admin/enquiries')
        if (enqRes.ok) {
          const d = await enqRes.json()
          if (d.success) setEnquiries(d.enquiries)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteQuotation = async () => {
    if (!quoteToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/quotations?id=${quoteToDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setQuotations((prev) => prev.filter((q) => q.id !== quoteToDelete.id))
        setToastMessage('Quotation deleted successfully.')
        setQuoteToDelete(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  // Open Quotation Builder
  const openNewQuotation = () => {
    setQuotationEnquiry(null)
    setEditingQuotation(null)
    setBuilderInitialView('build')
    setShowQuotationBuilder(true)
  }

  const openQuotationFromEnquiry = (enq: EnquiryRecord) => {
    setQuotationEnquiry(enq)
    setEditingQuotation(null)
    setBuilderInitialView('build')
    setShowQuotationBuilder(true)
  }

  const openExistingQuotation = (quote: QuotationRecord, initialView: 'build' | 'preview') => {
    setEditingQuotation(quote)
    setQuotationEnquiry(null)
    setBuilderInitialView(initialView)
    setShowQuotationBuilder(true)
  }

  // Filtered Enquiries dataset
  const filteredEnquiries = useMemo(() => {
    let result = enquiries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (eventFilter !== 'all' && e.event_type !== eventFilter) return false
      if (priorityFilter !== 'all' && (e.priority || 'normal') !== priorityFilter) return false

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

    result.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA
    })

    return result
  }, [enquiries, statusFilter, eventFilter, priorityFilter, searchQuery, sortOrder])

  // Pagination calculation
  const totalPages = Math.ceil(filteredEnquiries.length / pageSize) || 1
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredEnquiries.slice(start, start + pageSize)
  }, [filteredEnquiries, currentPage])

  // Filtered Quotations dataset
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (quoteStatusFilter !== 'all' && q.status !== quoteStatusFilter) return false
      if (quoteSearchQuery.trim()) {
        const s = quoteSearchQuery.toLowerCase()
        const matchName = q.customerName.toLowerCase().includes(s)
        const matchNum = q.quotationNumber.toLowerCase().includes(s)
        const matchPhone = q.customerPhone?.toLowerCase().includes(s)
        const matchEvent = q.eventType?.toLowerCase().includes(s)
        if (!matchName && !matchNum && !matchPhone && !matchEvent) return false
      }
      return true
    })
  }, [quotations, quoteStatusFilter, quoteSearchQuery])

  // Export CSV respecting current filters
  const exportCSV = () => {
    const headers = [
      'ID,Customer Name,Phone,Email,Event Type,Guest Count,Event Date,Event Time,Location,Special Requests,Priority,Status,Follow-up Date,Follow-up Notes,Admin Notes,Created At',
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
        `"${e.priority || 'normal'}"`,
        `"${e.status}"`,
        `"${e.follow_up_date || ''}"`,
        `"${(e.follow_up_notes || '').replace(/"/g, '""')}"`,
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

  // Overdue follow-ups
  const todayStr = new Date().toISOString().split('T')[0]
  const overdueCount = enquiries.filter(
    (e) =>
      e.follow_up_date &&
      e.follow_up_date <= todayStr &&
      e.status !== 'completed' &&
      e.status !== 'cancelled'
  ).length

  // Status counts for tabs
  const countAll = enquiries.length
  const countNew = enquiries.filter((e) => e.status === 'new').length
  const countContacted = enquiries.filter((e) => e.status === 'contacted').length
  const countFollowUp = enquiries.filter((e) => e.status === 'follow_up').length
  const countQuoteSent = enquiries.filter((e) => e.status === 'quotation_sent').length
  const countConfirmed = enquiries.filter((e) => e.status === 'confirmed').length
  const countCompleted = enquiries.filter((e) => e.status === 'completed').length
  const countCancelled = enquiries.filter((e) => e.status === 'cancelled').length

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return { bg: '#eef4ff', border: '#b2ccff', text: '#1e40af', label: 'New' }
      case 'contacted':
        return { bg: '#fef9c3', border: '#fde047', text: '#854d0e', label: 'Contacted' }
      case 'follow_up':
        return { bg: '#fff7ed', border: '#fdba74', text: '#c2410c', label: 'Follow-up' }
      case 'quotation_sent':
        return { bg: '#fdf4ff', border: '#f0abfc', text: '#a21caf', label: 'Quote Sent' }
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

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', label: 'High' }
      case 'low':
        return { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb', label: 'Low' }
      default:
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', label: 'Normal' }
    }
  }

  const getQuoteStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'draft':
        return { bg: '#f3f4f6', border: '#d1d5db', text: '#4b5563', label: 'Draft' }
      case 'sent':
        return { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Sent' }
      case 'accepted':
        return { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', label: 'Accepted' }
      case 'rejected':
        return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', label: 'Rejected' }
      case 'expired':
        return { bg: '#fffbeb', border: '#fde68a', text: '#b45309', label: 'Expired' }
      default:
        return { bg: '#faf8f1', border: '#e3dcce', text: '#153d2d', label: status }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            padding: '12px 20px',
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '1.95rem',
              margin: '0 0 4px',
              color: '#153d2d',
              fontWeight: 700,
            }}
          >
            Customer Enquiries CRM & Catering Proposals
          </h1>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#6b756e' }}>
            Manage incoming event bookings, client discussions, priority tracking, and package-based catering proposals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={openNewQuotation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              color: '#0d281e',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(196, 163, 101, 0.25)',
            }}
          >
            <FileText size={15} />
            <span>Create Catering Proposal</span>
          </button>

          <button
            onClick={fetchAllData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#faf8f1',
              border: '1px solid #e3dcce',
              color: '#153d2d',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} style={{ color: '#c4a365' }} />
            <span>Refresh</span>
          </button>

          {mainView === 'enquiries' && (
            <button
              onClick={exportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#faf8f1',
                border: '1px solid #c4a365',
                color: '#153d2d',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={15} style={{ color: '#9e7f41' }} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Toggle: Enquiries CRM vs Saved Quotations */}
      <div
        style={{
          display: 'flex',
          background: '#ffffff',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #e3dcce',
          width: 'fit-content',
        }}
      >
        <button
          onClick={() => setMainView('enquiries')}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: 'none',
            background: mainView === 'enquiries' ? '#153d2d' : 'transparent',
            color: mainView === 'enquiries' ? '#faf8f1' : '#6b756e',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Customer Enquiries</span>
          <span
            style={{
              backgroundColor: mainView === 'enquiries' ? '#c4a365' : '#faf8f1',
              color: '#0d281e',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '10px',
            }}
          >
            {enquiries.length}
          </span>
        </button>

        <button
          onClick={() => setMainView('quotations')}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: 'none',
            background: mainView === 'quotations' ? '#153d2d' : 'transparent',
            color: mainView === 'quotations' ? '#faf8f1' : '#6b756e',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={15} style={{ color: mainView === 'quotations' ? '#c4a365' : '#6b756e' }} />
          <span>Catering Proposals</span>
          <span
            style={{
              backgroundColor: mainView === 'quotations' ? '#c4a365' : '#faf8f1',
              color: '#0d281e',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '10px',
            }}
          >
            {quotations.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          VIEW A: CUSTOMER ENQUIRIES CRM
          ========================================================================= */}
      {mainView === 'enquiries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Overdue Follow-up Notice Banner (if any) */}
          {overdueCount > 0 && (
            <div
              style={{
                background: '#fff7ed',
                border: '1px solid #fdba74',
                borderRadius: '10px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} style={{ color: '#ea580c' }} />
                <span style={{ fontSize: '0.86rem', color: '#c2410c', fontWeight: 600 }}>
                  {overdueCount} enquiry follow-up{overdueCount > 1 ? 's' : ''} scheduled for today or overdue!
                </span>
              </div>
              <button
                onClick={() => setStatusFilter('follow_up')}
                style={{
                  background: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Pending Follow-ups
              </button>
            </div>
          )}

          {/* 7 Status Filter Tabs */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              padding: '14px 18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'all', label: 'All Enquiries', count: countAll, bg: '#faf8f1', color: '#153d2d' },
                { id: 'new', label: 'New', count: countNew, bg: '#eef4ff', color: '#1e40af' },
                { id: 'contacted', label: 'Contacted', count: countContacted, bg: '#fef9c3', color: '#854d0e' },
                { id: 'follow_up', label: 'Follow-up', count: countFollowUp, bg: '#fff7ed', color: '#c2410c' },
                { id: 'quotation_sent', label: 'Quote Sent', count: countQuoteSent, bg: '#fdf4ff', color: '#a21caf' },
                { id: 'confirmed', label: 'Confirmed', count: countConfirmed, bg: '#ecfdf5', color: '#065f46' },
                { id: 'completed', label: 'Completed', count: countCompleted, bg: '#f0f9ff', color: '#0369a1' },
                { id: 'cancelled', label: 'Cancelled', count: countCancelled, bg: '#fef2f2', color: '#991b1b' },
              ].map((tab) => {
                const active = statusFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id)
                      setCurrentPage(1)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 14px',
                      borderRadius: '20px',
                      border: active ? '1.5px solid #153d2d' : '1px solid #e3dcce',
                      background: active ? '#153d2d' : '#faf8f1',
                      color: active ? '#faf8f1' : '#153d2d',
                      fontSize: '0.8rem',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        background: active ? '#c4a365' : tab.bg,
                        color: active ? '#0d281e' : tab.color,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '10px',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Filter Controls Row: Search + Event Type + Priority + Sort */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid #f3efe5',
              }}
            >
              {/* Search Input */}
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9e7f41',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, venue, notes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Event Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b756e' }}>Event:</span>
                <select
                  value={eventFilter}
                  onChange={(e) => {
                    setEventFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: '8px 10px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontSize: '0.82rem',
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

              {/* Priority Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b756e' }}>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: '8px 10px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Sort Order */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b756e' }}>Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  style={{
                    padding: '8px 10px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enquiries Table Card Surface */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#faf8f1', borderBottom: '1.5px solid #e3dcce', color: '#153d2d' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>CUSTOMER & CONTACT</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>EVENT & DATE</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>GUESTS & VENUE</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>PRIORITY</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>FOLLOW-UP</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6b756e' }}>
                        Loading enquiry database...
                      </td>
                    </tr>
                  ) : paginatedEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6b756e' }}>
                        No enquiries match the selected filters or search terms.
                      </td>
                    </tr>
                  ) : (
                    paginatedEnquiries.map((enq) => {
                      const badge = getStatusBadge(enq.status)
                      const prio = getPriorityBadge(enq.priority)
                      const isFollowUpDue =
                        enq.follow_up_date &&
                        enq.follow_up_date <= todayStr &&
                        enq.status !== 'completed' &&
                        enq.status !== 'cancelled'

                      return (
                        <tr
                          key={enq.id}
                          style={{
                            borderBottom: '1px solid #f3efe5',
                            transition: 'background 0.12s ease',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#faf8f1')}
                          onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
                        >
                          {/* Customer & Contact */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#153d2d', fontSize: '0.92rem' }}>{enq.name}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
                              <a
                                href={`tel:${enq.phone}`}
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#9e7f41',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                <Phone size={12} />
                                <span>{enq.phone}</span>
                              </a>
                              {enq.email && (
                                <a
                                  href={`mailto:${enq.email}`}
                                  style={{
                                    fontSize: '0.74rem',
                                    color: '#6b756e',
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

                          {/* Event & Date */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ color: '#153d2d', fontWeight: 600 }}>{enq.event_type}</div>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#6b756e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '3px',
                              }}
                            >
                              <Calendar size={12} style={{ color: '#9e7f41' }} />
                              <span>{enq.event_date}</span>
                            </div>
                          </td>

                          {/* Guests & Venue */}
                          <td style={{ padding: '14px 16px' }}>
                            <div>
                              <strong style={{ color: '#153d2d' }}>{enq.guest_count}</strong>
                              <span style={{ fontSize: '0.76rem', color: '#6b756e' }}> Pax</span>
                            </div>
                            <div
                              style={{
                                fontSize: '0.76rem',
                                color: '#6b756e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '3px',
                                maxWidth: '180px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={enq.location}
                            >
                              <MapPin size={12} style={{ color: '#c4a365', flexShrink: 0 }} />
                              <span>{enq.location || 'Venue TBA'}</span>
                            </div>
                          </td>

                          {/* Priority */}
                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={enq.priority || 'normal'}
                              onChange={(e) => handleQuickPriorityChange(enq.id, e.target.value as EnquiryPriority)}
                              style={{
                                background: prio.bg,
                                border: `1px solid ${prio.border}`,
                                color: prio.text,
                                padding: '3px 8px',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value="high">High</option>
                              <option value="normal">Normal</option>
                              <option value="low">Low</option>
                            </select>
                          </td>

                          {/* Status Selector */}
                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={enq.status}
                              onChange={(e) => handleQuickStatusChange(enq.id, e.target.value as EnquiryStatus)}
                              style={{
                                background: badge.bg,
                                border: `1px solid ${badge.border}`,
                                color: badge.text,
                                padding: '4px 8px',
                                borderRadius: '10px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="follow_up">Follow-up Required</option>
                              <option value="quotation_sent">Quotation Sent</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* Follow-up Date */}
                          <td style={{ padding: '14px 16px' }}>
                            {enq.follow_up_date ? (
                              <div
                                style={{
                                  fontSize: '0.76rem',
                                  color: isFollowUpDue ? '#c2410c' : '#153d2d',
                                  fontWeight: isFollowUpDue ? 700 : 500,
                                  background: isFollowUpDue ? '#fff7ed' : '#faf8f1',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  border: isFollowUpDue ? '1px solid #fdba74' : '1px solid #e3dcce',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Calendar size={11} />
                                <span>{enq.follow_up_date}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: '#a8a29e' }}>Not scheduled</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => openQuotationFromEnquiry(enq)}
                                title="Generate Catering Quotation"
                                style={{
                                  padding: '5px 10px',
                                  background: 'rgba(196, 163, 101, 0.15)',
                                  border: '1px solid #c4a365',
                                  borderRadius: '6px',
                                  color: '#153d2d',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                }}
                              >
                                <FileText size={13} style={{ color: '#9e7f41' }} />
                                <span>Quote</span>
                              </button>

                              <button
                                onClick={() => openDetailsModal(enq)}
                                title="View Full Details Dossier"
                                style={{
                                  padding: '5px 8px',
                                  background: '#faf8f1',
                                  border: '1px solid #d1c7b7',
                                  borderRadius: '6px',
                                  color: '#153d2d',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                }}
                              >
                                <Eye size={13} style={{ color: '#c4a365' }} />
                                <span>Details</span>
                              </button>

                              <button
                                onClick={() => setEnquiryToDelete(enq)}
                                title="Delete Enquiry"
                                style={{
                                  padding: '5px 7px',
                                  background: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  color: '#b91c1c',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Trash2 size={13} />
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

            {/* Pagination Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #f3efe5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#6b756e' }}>
                Showing <strong>{paginatedEnquiries.length}</strong> of <strong>{filteredEnquiries.length}</strong> enquiries
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1c7b7',
                    background: '#faf8f1',
                    color: currentPage <= 1 ? '#a8a29e' : '#153d2d',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <span style={{ fontSize: '0.8rem', color: '#153d2d', fontWeight: 600, padding: '0 8px' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1c7b7',
                    background: '#faf8f1',
                    color: currentPage >= totalPages ? '#a8a29e' : '#153d2d',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: SAVED CATERING QUOTATIONS
          ========================================================================= */}
      {mainView === 'quotations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quotations Search & Status Filter Bar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            {/* Search */}
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9e7f41',
                }}
              />
              <input
                type="text"
                placeholder="Search quotations by number, customer name, event..."
                value={quoteSearchQuery}
                onChange={(e) => setQuoteSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: '#faf8f1',
                  border: '1px solid #d1c7b7',
                  borderRadius: '8px',
                  color: '#153d2d',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Quotation Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b756e' }}>Status:</span>
              <select
                value={quoteStatusFilter}
                onChange={(e) => setQuoteStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#faf8f1',
                  border: '1px solid #d1c7b7',
                  borderRadius: '8px',
                  color: '#153d2d',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="all">All Proposals ({quotations.length})</option>
                <option value="draft">Drafts</option>
                <option value="sent">Sent to Clients</option>
                <option value="accepted">Accepted / Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Proposals List Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e3dcce',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#faf8f1', borderBottom: '1.5px solid #e3dcce', color: '#153d2d' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>PROPOSAL #</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>CLIENT DETAILS</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>EVENT & MEAL STYLE</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>DELICACIES / GUESTS</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>PACKAGE TOTAL (₹)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>ADVANCE / BALANCE (₹)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#6b756e' }}>
                        No catering proposals found. Click &quot;Create Catering Proposal&quot; to construct one!
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((quote) => {
                      const badge = getQuoteStatusBadge(quote.status)
                      const packageVal = quote.packageAmount !== undefined ? quote.packageAmount : quote.grandTotal
                      const advVal = quote.advanceAmount || 0
                      const balVal = quote.balanceAmount !== undefined ? quote.balanceAmount : Math.max(0, packageVal - advVal)

                      return (
                        <tr
                          key={quote.id}
                          style={{
                            borderBottom: '1px solid #f3efe5',
                            transition: 'background 0.12s ease',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#faf8f1')}
                          onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#153d2d', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              #{quote.quotationNumber}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#6b756e', marginTop: '2px' }}>
                              Date: {quote.quotationDate || quote.created_at?.split('T')[0] || 'Recent'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#153d2d' }}>{quote.customerName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '2px' }}>
                              {quote.customerPhone} {quote.customerEmail ? `• ${quote.customerEmail}` : ''}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ color: '#153d2d', fontWeight: 600 }}>{quote.eventType}</div>
                            <div style={{ fontSize: '0.74rem', color: '#9e7f41', marginTop: '2px' }}>
                              {quote.mealType || 'Grand Banquet'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#6b756e' }}>
                              Date: {quote.eventDate || 'Scheduled'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div>
                              <strong style={{ color: '#153d2d' }}>{quote.items?.length || 0}</strong> delicacies
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '2px' }}>
                              {quote.guestCount} guests
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div
                              style={{
                                fontFamily: '"Cormorant Garamond", Georgia, serif',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#153d2d',
                              }}
                            >
                              ₹{packageVal.toLocaleString('en-IN')}
                            </div>
                            {quote.taxEnabled && (
                              <div style={{ fontSize: '0.68rem', color: '#065f46' }}>+ GST Included</div>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>
                              Adv: ₹{advVal.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: balVal > 0 ? '#b83b2e' : '#6b756e', fontWeight: 600, marginTop: '2px' }}>
                              Bal: ₹{balVal.toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={quote.status}
                              onChange={(e) => handleQuoteStatusChange(quote.id, e.target.value as QuotationStatus)}
                              style={{
                                background: badge.bg,
                                border: `1px solid ${badge.border}`,
                                color: badge.text,
                                padding: '4px 8px',
                                borderRadius: '10px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                              <option value="expired">Expired</option>
                            </select>
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => openExistingQuotation(quote, 'preview')}
                                title="Open Live A4 Preview & Print PDF"
                                style={{
                                  padding: '5px 10px',
                                  background: 'rgba(196, 163, 101, 0.15)',
                                  border: '1px solid #c4a365',
                                  borderRadius: '6px',
                                  color: '#153d2d',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                }}
                              >
                                <Eye size={13} style={{ color: '#9e7f41' }} />
                                <span>Preview / Print</span>
                              </button>

                              <button
                                onClick={() => openExistingQuotation(quote, 'build')}
                                title="Edit Proposal Items & Pricing"
                                style={{
                                  padding: '5px 8px',
                                  background: '#faf8f1',
                                  border: '1px solid #d1c7b7',
                                  borderRadius: '6px',
                                  color: '#153d2d',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                }}
                              >
                                <Edit2 size={13} style={{ color: '#c4a365' }} />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setQuoteToDelete(quote)}
                                title="Delete Proposal"
                                style={{
                                  padding: '5px 7px',
                                  background: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  color: '#b91c1c',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Trash2 size={13} />
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
        </div>
      )}

      {/* =========================================================================
          MODAL 1: COMPLETE ENQUIRY DOSSIER DRAWER
          ========================================================================= */}
      {selectedEnquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 23, 17, 0.75)',
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
              maxWidth: '680px',
              background: '#ffffff',
              border: '1.5px solid #c4a365',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '92vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e3dcce',
                background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                color: '#faf8f1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#c4a365',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                  }}
                >
                  CUSTOMER DOSSIER #{selectedEnquiry.id}
                </span>
                <h3
                  style={{
                    margin: '3px 0 0',
                    color: '#faf8f1',
                    fontSize: '1.45rem',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
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
                  color: 'rgba(250, 248, 241, 0.7)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Quick Communication Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <Phone size={14} />
                  <span>Call {selectedEnquiry.phone}</span>
                </a>

                <a
                  href={`https://wa.me/91${selectedEnquiry.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20greetings%20from%20Velavan%20Catering%20Services.%20We%20received%20your%20catering%20enquiry%20for%20${encodeURIComponent(selectedEnquiry.event_type)}.`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>

                {selectedEnquiry.email && (
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    style={{
                      flex: 1,
                      minWidth: '130px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '9px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    <Mail size={14} />
                    <span>Email</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    setSelectedEnquiry(null)
                    openQuotationFromEnquiry(selectedEnquiry)
                  }}
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    color: '#0d281e',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={14} />
                  <span>Create Quotation</span>
                </button>
              </div>

              {/* Event Specification Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  background: '#faf8f1',
                  border: '1px solid #e3dcce',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b756e', display: 'block', fontWeight: 600 }}>EVENT TYPE</span>
                  <strong style={{ color: '#153d2d' }}>{selectedEnquiry.event_type}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b756e', display: 'block', fontWeight: 600 }}>GUEST COUNT</span>
                  <strong style={{ color: '#153d2d' }}>{selectedEnquiry.guest_count} Guests</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b756e', display: 'block', fontWeight: 600 }}>EVENT DATE & TIME</span>
                  <strong style={{ color: '#153d2d' }}>
                    {selectedEnquiry.event_date} {selectedEnquiry.event_time ? `• ${selectedEnquiry.event_time}` : ''}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b756e', display: 'block', fontWeight: 600 }}>LOCATION / VENUE</span>
                  <strong style={{ color: '#153d2d' }}>{selectedEnquiry.location}</strong>
                </div>
              </div>

              {/* Customer Special Requests */}
              {selectedEnquiry.special_requests && (
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#153d2d', fontWeight: 700, textTransform: 'uppercase' }}>
                    Customer Requests & Menu Preferences
                  </label>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e3dcce',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      marginTop: '4px',
                      fontSize: '0.84rem',
                      lineHeight: '1.45',
                    }}
                  >
                    {selectedEnquiry.special_requests}
                  </div>
                </div>
              )}

              {/* Priority & Status Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#153d2d', fontWeight: 700, textTransform: 'uppercase' }}>
                    Enquiry Priority
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as EnquiryPriority)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="high">High Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#153d2d', fontWeight: 700, textTransform: 'uppercase' }}>
                    Enquiry Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as EnquiryStatus)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow_up">Follow-up Required</option>
                    <option value="quotation_sent">Quotation Sent</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Follow-up Scheduling Section */}
              <div
                style={{
                  background: '#faf8f1',
                  border: '1px solid #e3dcce',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: '#153d2d', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Follow-up Scheduling & Client Notes
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#6b756e', display: 'block' }}>Next Follow-up Date</span>
                    <input
                      type="date"
                      value={modalFollowUpDate}
                      onChange={(e) => setModalFollowUpDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: '#ffffff',
                        border: '1px solid #d1c7b7',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        marginTop: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#6b756e', display: 'block' }}>Follow-up Task</span>
                    <input
                      type="text"
                      placeholder="e.g. Call back on auspicious date selection, confirm breakfast leaf items..."
                      value={modalFollowUpNotes}
                      onChange={(e) => setModalFollowUpNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: '#ffffff',
                        border: '1px solid #d1c7b7',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        marginTop: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label style={{ fontSize: '0.74rem', color: '#153d2d', fontWeight: 700, textTransform: 'uppercase' }}>
                  Internal Administrator Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record customer preferences, menu changes, advance token payment status..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1c7b7',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginTop: '4px',
                  }}
                />
              </div>

              {/* Modal Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f3efe5',
                  paddingTop: '14px',
                }}
              >
                <button
                  onClick={() => setEnquiryToDelete(selectedEnquiry)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete Enquiry</span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    style={{
                      padding: '8px 16px',
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      color: '#153d2d',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>

                  <button
                    onClick={handleSaveDetails}
                    disabled={savingDetails}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 20px',
                      background: '#153d2d',
                      color: '#faf8f1',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: savingDetails ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {savingDetails ? <RefreshCw size={13} className="spin" /> : <Check size={14} />}
                    <span>{savingDetails ? 'Saving...' : 'Save All Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DELETE CONFIRMATION DIALOG (FOR ENQUIRY OR QUOTATION)
          ========================================================================= */}
      {(enquiryToDelete || quoteToDelete) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 23, 17, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 10000,
          }}
          onClick={() => {
            setEnquiryToDelete(null)
            setQuoteToDelete(null)
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b91c1c' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Confirm Deletion</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6b756e' }}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ margin: '16px 0', fontSize: '0.86rem', color: '#153d2d', lineHeight: 1.4 }}>
              {enquiryToDelete && (
                <span>
                  Are you sure you want to delete the enquiry record for{' '}
                  <strong>{enquiryToDelete.name}</strong> ({enquiryToDelete.event_type})?
                </span>
              )}
              {quoteToDelete && (
                <span>
                  Are you sure you want to delete quotation{' '}
                  <strong>#{quoteToDelete.quotationNumber}</strong> for{' '}
                  <strong>{quoteToDelete.customerName}</strong> (₹
                  {quoteToDelete.grandTotal.toLocaleString('en-IN')})?
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setEnquiryToDelete(null)
                  setQuoteToDelete(null)
                }}
                style={{
                  padding: '8px 16px',
                  background: '#faf8f1',
                  border: '1px solid #d1c7b7',
                  color: '#153d2d',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={enquiryToDelete ? handleDeleteEnquiry : handleDeleteQuotation}
                disabled={deleting}
                style={{
                  padding: '8px 18px',
                  background: '#b91c1c',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
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

      {/* =========================================================================
          MODAL 3: CATERING PROPOSAL & ESTIMATE BUILDER
          ========================================================================= */}
      {showQuotationBuilder && (
        <CateringProposalBuilder
          enquiry={quotationEnquiry}
          initialQuotation={editingQuotation}
          initialViewMode={builderInitialView}
          onClose={() => {
            setShowQuotationBuilder(false)
            setQuotationEnquiry(null)
            setEditingQuotation(null)
          }}
          onSaved={() => {
            fetchAllData()
          }}
        />
      )}
    </div>
  )
}

export default function EnquiriesManagementPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#153d2d', fontFamily: '"DM Sans", sans-serif' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(196, 163, 101, 0.2)',
              borderTopColor: '#c4a365',
              borderRadius: '50%',
              margin: '0 auto 14px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Loading Enquiries CRM...</p>
        </div>
      }
    >
      <EnquiriesManagementContent />
    </Suspense>
  )
}
