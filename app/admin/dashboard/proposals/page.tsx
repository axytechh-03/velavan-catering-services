'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Copy,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  ChevronDown,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Files,
} from 'lucide-react'
import CateringProposalBuilder from '@/components/admin/CateringProposalBuilder'
import { QuotationRecord, QuotationStatus } from '@/lib/cms-store'

export default function SavedProposalsPage() {
  const [proposals, setProposals] = useState<QuotationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest')

  // Proposal Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState<QuotationRecord | null>(null)
  const [builderViewMode, setBuilderViewMode] = useState<'build' | 'preview'>('build')

  // Action status message
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Fetch proposals
  const fetchProposals = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/quotations')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.quotations)) {
          setProposals(data.quotations)
        }
      }
    } catch (err) {
      console.error('Error fetching proposals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  // Duplicate proposal
  const handleDuplicate = async (proposalId: string) => {
    try {
      const res = await fetch('/api/admin/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', id: proposalId }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Duplicated proposal as #${data.quotation.quotationNumber}`)
        fetchProposals()
      } else {
        alert(data.error || 'Failed to duplicate proposal')
      }
    } catch (err) {
      console.error('Duplicate error:', err)
      alert('Error duplicating proposal')
    }
  }

  // Update status directly
  const handleStatusChange = async (proposalId: string, newStatus: QuotationStatus) => {
    try {
      const res = await fetch('/api/admin/quotations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proposalId, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Proposal status updated to ${newStatus}`)
        fetchProposals()
      }
    } catch (err) {
      console.error('Status change error:', err)
    }
  }

  // Delete proposal
  const handleDelete = async (proposalId: string, pNumber: string) => {
    const confirmed = confirm(`Are you sure you want to delete proposal #${pNumber}? This cannot be undone.`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/quotations?id=${proposalId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Deleted proposal #${pNumber}`)
        fetchProposals()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  // Open builder in Preview mode
  const handlePreviewA4 = (proposal: QuotationRecord) => {
    setEditingProposal(proposal)
    setBuilderViewMode('preview')
    setBuilderOpen(true)
  }

  // Open builder in Edit mode
  const handleEditProposal = (proposal: QuotationRecord) => {
    setEditingProposal(proposal)
    setBuilderViewMode('build')
    setBuilderOpen(true)
  }

  // Metrics summary
  const totalCount = proposals.length
  const sentCount = proposals.filter((p) => p.status === 'sent').length
  const acceptedCount = proposals.filter((p) => p.status === 'accepted').length
  const draftCount = proposals.filter((p) => p.status === 'draft').length
  const totalValue = proposals.reduce((sum, p) => sum + (p.packageAmount || p.grandTotal || 0), 0)

  // Filtered and sorted list
  const filteredProposals = proposals
    .filter((p) => {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        p.quotationNumber?.toLowerCase().includes(q) ||
        p.customerName?.toLowerCase().includes(q) ||
        p.customerPhone?.toLowerCase().includes(q) ||
        p.eventType?.toLowerCase().includes(q) ||
        p.eventLocation?.toLowerCase().includes(q)

      const matchStatus = statusFilter === 'all' || p.status === statusFilter

      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      }
      if (sortBy === 'amount_high') {
        return (b.packageAmount || b.grandTotal || 0) - (a.packageAmount || a.grandTotal || 0)
      }
      if (sortBy === 'amount_low') {
        return (a.packageAmount || a.grandTotal || 0) - (b.packageAmount || b.grandTotal || 0)
      }
      return 0
    })

  // Status badge styling helper
  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Accepted / Confirmed',
          bg: '#f0fdf4',
          color: '#065f46',
          border: '#bbf7d0',
          icon: CheckCircle2,
        }
      case 'sent':
        return {
          label: 'Sent to Customer',
          bg: '#faf5ff',
          color: '#7e22ce',
          border: '#e9d5ff',
          icon: Send,
        }
      case 'draft':
        return {
          label: 'Draft',
          bg: '#f8fafc',
          color: '#475569',
          border: '#e2e8f0',
          icon: Clock,
        }
      case 'rejected':
        return {
          label: 'Declined',
          bg: '#fef2f2',
          color: '#991b1b',
          border: '#fecaca',
          icon: XCircle,
        }
      case 'expired':
        return {
          label: 'Expired',
          bg: '#fffbeb',
          color: '#92400e',
          border: '#fde68a',
          icon: AlertCircle,
        }
      default:
        return {
          label: status,
          bg: '#f8fafc',
          color: '#475569',
          border: '#e2e8f0',
          icon: Clock,
        }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            background: '#153d2d',
            color: '#faf8f1',
            border: '1px solid #c4a365',
            borderRadius: '8px',
            padding: '12px 20px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            zIndex: 1200,
            fontSize: '0.86rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} style={{ color: '#c4a365' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Quick Actions */}
      <div
        style={{
          background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          border: '1.5px solid rgba(196, 163, 101, 0.35)',
          boxShadow: '0 8px 30px -4px rgba(21, 61, 45, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
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
            VELAVAN CATERING SERVICES · PROPOSAL REPOSITORY
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
            Saved Catering Proposals & Estimates
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.75)', maxWidth: '620px' }}>
            Historical snapshot repository of multi-meal session catering quotes, package estimates and PDF proposals.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProposal(null)
            setBuilderViewMode('build')
            setBuilderOpen(true)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
            color: '#0d281e',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(196, 163, 101, 0.35)',
            transition: 'transform 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={16} />
          <span>Create New Proposal</span>
        </button>
      </div>

      {/* 2. Top Summary Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3dcce',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: '#6b756e', fontWeight: 600 }}>Total Proposals</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#153d2d', marginTop: '4px' }}>
            {totalCount}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e9d5ff',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: '#7e22ce', fontWeight: 600 }}>Proposals Sent</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7e22ce', marginTop: '4px' }}>
            {sentCount}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: '#065f46', fontWeight: 600 }}>Accepted Bookings</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>
            {acceptedCount}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>Draft Proposals</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
            {draftCount}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #c4a365',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 2px 10px rgba(196, 163, 101, 0.1)',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: '#9e7f41', fontWeight: 700 }}>Total Proposed Value</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#153d2d', marginTop: '4px' }}>
            ₹{totalValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e3dcce',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9e7f41' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by proposal #, customer name, occasion, venue..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #d1c7b7',
              fontSize: '0.84rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#6b756e', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1c7b7',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: '#faf8f1',
                color: '#153d2d',
              }}
            >
              <option value="all">All Statuses ({totalCount})</option>
              <option value="draft">Drafts ({draftCount})</option>
              <option value="sent">Sent ({sentCount})</option>
              <option value="accepted">Accepted ({acceptedCount})</option>
              <option value="rejected">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#6b756e', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1c7b7',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: '#faf8f1',
                color: '#153d2d',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount (₹)</option>
              <option value="amount_low">Lowest Amount (₹)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Proposals Table / Cards Grid */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e3dcce',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.05)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b756e', fontSize: '0.9rem' }}>
            Loading catering proposals...
          </div>
        ) : filteredProposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileText size={42} style={{ color: '#c4a365', margin: '0 auto 12px' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#153d2d', fontWeight: 700 }}>
              No proposals found
            </h3>
            <p style={{ margin: '6px 0 16px', fontSize: '0.82rem', color: '#6b756e' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Click "+ Create New Proposal" to generate your first multi-meal catering package.'}
            </p>
            <button
              onClick={() => {
                setEditingProposal(null)
                setBuilderViewMode('build')
                setBuilderOpen(true)
              }}
              style={{
                background: '#153d2d',
                color: '#faf8f1',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              + Create New Proposal
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '980px' }}>
              <thead>
                <tr
                  style={{
                    background: '#faf8f1',
                    borderBottom: '1px solid #e3dcce',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#6b756e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>Proposal #</th>
                  <th style={{ padding: '14px 18px' }}>Customer & Contact</th>
                  <th style={{ padding: '14px 18px' }}>Occasion & Sessions</th>
                  <th style={{ padding: '14px 18px' }}>Event Date & Guests</th>
                  <th style={{ padding: '14px 18px' }}>Package Amount</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => {
                  const badge = getStatusBadge(proposal.status)
                  const StatusIcon = badge.icon
                  const pkgAmount = proposal.packageAmount || proposal.grandTotal || 0
                  const sessionCount = proposal.sessions?.length || 1
                  const dishCount =
                    proposal.sessions?.reduce((c, s) => c + (s.dishes?.length || 0), 0) ||
                    proposal.items?.length ||
                    0

                  return (
                    <tr
                      key={proposal.id}
                      style={{
                        borderBottom: '1px solid #f3efe5',
                        fontSize: '0.86rem',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#faf8f1')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      {/* Proposal Number */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#153d2d',
                              fontSize: '0.88rem',
                              background: '#f4f8f5',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #d1e2d7',
                            }}
                          >
                            {proposal.quotationNumber}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6b756e', marginTop: '3px' }}>
                          Created: {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('en-IN') : 'Recent'}
                        </div>
                      </td>

                      {/* Customer & Phone */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#153d2d' }}>
                          {proposal.customerName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '2px' }}>
                          {proposal.customerPhone}
                          {proposal.customerEmail && ` • ${proposal.customerEmail}`}
                        </div>
                      </td>

                      {/* Occasion & Sessions */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#153d2d' }}>
                          {proposal.eventType}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#9e7f41', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Layers size={12} />
                          <span>{sessionCount} Sessions • {dishCount} Delicacies</span>
                        </div>
                      </td>

                      {/* Event Date & Guests */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#153d2d' }}>
                          {proposal.eventDate || 'Date TBD'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '2px' }}>
                          <strong style={{ color: '#065f46' }}>{proposal.guestCount} Pax</strong>
                          {proposal.eventLocation && ` • ${proposal.eventLocation}`}
                        </div>
                      </td>

                      {/* Package Amount */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#153d2d' }}>
                          ₹{pkgAmount.toLocaleString('en-IN')}
                        </div>
                        {proposal.advanceAmount ? (
                          <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '1px' }}>
                            Adv: ₹{proposal.advanceAmount.toLocaleString('en-IN')}
                          </div>
                        ) : null}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            <StatusIcon size={12} />
                            <span>{badge.label}</span>
                          </span>

                          {/* Quick Status Select */}
                          <select
                            value={proposal.status}
                            onChange={(e) => handleStatusChange(proposal.id, e.target.value as QuotationStatus)}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              border: '1px solid #d1c7b7',
                              background: '#ffffff',
                              cursor: 'pointer',
                            }}
                            title="Update Status"
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Declined</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Preview A4 */}
                          <button
                            onClick={() => handlePreviewA4(proposal)}
                            title="Preview Official A4 Document"
                            style={{
                              padding: '6px 10px',
                              background: '#153d2d',
                              color: '#faf8f1',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={13} />
                            <span>A4 Preview</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEditProposal(proposal)}
                            title="Edit Proposal Builder"
                            style={{
                              padding: '6px 10px',
                              background: '#faf8f1',
                              border: '1px solid #d1c7b7',
                              color: '#153d2d',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          {/* Duplicate as New Proposal */}
                          <button
                            onClick={() => handleDuplicate(proposal.id)}
                            title="Duplicate as New Proposal"
                            style={{
                              padding: '6px 8px',
                              background: '#ffffff',
                              border: '1px solid #c4a365',
                              color: '#9e7f41',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Copy size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(proposal.id, proposal.quotationNumber)}
                            title="Delete Proposal"
                            style={{
                              padding: '6px 8px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#b83b2e',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proposal Builder Modal */}
      {builderOpen && (
        <CateringProposalBuilder
          initialQuotation={editingProposal}
          initialViewMode={builderViewMode}
          onClose={() => {
            setBuilderOpen(false)
            setEditingProposal(null)
          }}
          onSaved={() => {
            fetchProposals()
          }}
        />
      )}
    </div>
  )
}
