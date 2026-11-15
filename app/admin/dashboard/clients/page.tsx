'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { ClientRecord } from '@/lib/cms-store'

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [isAddModal, setIsAddModal] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null)
  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<ClientRecord>({
    id: '',
    name: '',
    category: '',
    active: true,
    order: 1,
  })

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clients')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.clients) {
          setClients(data.clients)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  const openAddModal = () => {
    setFormData({
      id: `c-${Date.now()}`,
      name: '',
      category: 'Wedding Mandapam',
      active: true,
      order: clients.length + 1,
    })
    setIsAddModal(true)
  }

  const openEditModal = (client: ClientRecord) => {
    setEditingClient(client)
    setFormData({ ...client })
  }

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/clients', {
        method: isAddModal ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.client) {
          if (isAddModal) {
            setClients((prev) => [...prev, data.client])
            setToastMessage(`Client "${formData.name}" added!`)
          } else {
            setClients((prev) => prev.map((c) => (c.id === formData.id ? data.client : c)))
            setToastMessage(`Client "${formData.name}" updated!`)
          }
          setIsAddModal(false)
          setEditingClient(null)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/clients?id=${clientToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id))
        setToastMessage('Client removed from list.')
        setClientToDelete(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (client: ClientRecord) => {
    const updated = { ...client, active: !client.active }
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        setClients((prev) => prev.map((c) => (c.id === client.id ? updated : c)))
        setToastMessage(`Client status changed.`)
      }
    } catch (e) {
      console.error(e)
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

      {/* Header */}
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
            Clients & Partner Brands CMS
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.7)' }}>
            Manage the list of venue partners, convention centers, and corporate clients displayed on the public site.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchClients}
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
            onClick={openAddModal}
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
            <Plus size={16} />
            <span>Add Partner / Client</span>
          </button>
        </div>
      </div>

      {/* Clients Table */}
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
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Partner / Client Name</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category / Sector</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Display Order</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#c4a365' }}>
                    Loading partner brands...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(250, 248, 241, 0.6)' }}>
                    No clients recorded.
                  </td>
                </tr>
              ) : (
                clients.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      opacity: c.active ? 1 : 0.6,
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'rgba(196, 163, 101, 0.15)',
                            color: '#c4a365',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Building2 size={16} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#faf8f1', fontSize: '0.92rem' }}>{c.name}</span>
                      </div>
                    </td>

                    <td style={{ padding: '16px', color: '#c4a365' }}>{c.category}</td>

                    <td style={{ padding: '16px', color: 'rgba(250, 248, 241, 0.7)' }}>#{i + 1}</td>

                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleToggleActive(c)}
                        style={{
                          background: c.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${c.active ? '#10b981' : '#ef4444'}`,
                          color: c.active ? '#6ee7b7' : '#fca5a5',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {c.active ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{c.active ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(196, 163, 101, 0.15)',
                            border: '1px solid rgba(196, 163, 101, 0.3)',
                            borderRadius: '6px',
                            color: '#c4a365',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setClientToDelete(c)}
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
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CLIENT */}
      {/* ========================================================================= */}
      {(isAddModal || editingClient) && (
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
            zIndex: 80,
          }}
          onClick={() => {
            setIsAddModal(false)
            setEditingClient(null)
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#0d281e',
              border: '1.5px solid rgba(196, 163, 101, 0.4)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', color: '#faf8f1', fontSize: '1.25rem' }}>
              {isAddModal ? 'Add Partner / Venue Client' : 'Edit Client Details'}
            </h3>

            <form onSubmit={handleSaveClient} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Client / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kongu Convention & Wedding Halls"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(10, 35, 25, 0.65)',
                    border: '1px solid rgba(196, 163, 101, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Category / Sector
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Mandapam, Luxury Banquets, Corporate Group"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(10, 35, 25, 0.65)',
                    border: '1px solid rgba(196, 163, 101, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="client-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="client-active" style={{ fontSize: '0.86rem', color: '#faf8f1', cursor: 'pointer' }}>
                  Active on Website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModal(false)
                    setEditingClient(null)
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#faf8f1',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 18px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0d281e',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  Save Partner Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {clientToDelete && (
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
          onClick={() => setClientToDelete(null)}
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
              Confirm Client Deletion
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'rgba(250, 248, 241, 0.7)', lineHeight: 1.5 }}>
              Are you sure you want to permanently remove <strong style={{ color: '#ffffff' }}>{clientToDelete.name}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setClientToDelete(null)}
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
                onClick={handleDeleteClient}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Deleting...' : 'Delete Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
