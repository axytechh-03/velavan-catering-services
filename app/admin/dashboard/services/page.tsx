'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Sparkles,
  Edit2,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Users,
  Layers,
  Save,
} from 'lucide-react'
import { ServiceRecord } from '@/lib/cms-store'

export default function ServicesManagementPage() {
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [saving, setSaving] = useState(false)

  // Form State
  const [formData, setFormData] = useState<ServiceRecord | null>(null)
  const [featuredEnText, setFeaturedEnText] = useState('')
  const [featuredTaText, setFeaturedTaText] = useState('')

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/services')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.services) {
          setServices(data.services)
        }
      }
    } catch (e) {
      console.error('Error fetching services:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  const openEditModal = (svc: ServiceRecord) => {
    setEditingService(svc)
    setFormData({ ...svc })
    setFeaturedEnText((svc.featuredDishes?.en || []).join(', '))
    setFeaturedTaText((svc.featuredDishes?.ta || []).join(', '))
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    setSaving(true)

    const updated: ServiceRecord = {
      ...formData,
      featuredDishes: {
        en: featuredEnText.split(',').map((s) => s.trim()).filter(Boolean),
        ta: featuredTaText.split(',').map((s) => s.trim()).filter(Boolean),
      },
    }

    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })

      if (res.ok) {
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        setToastMessage(`Service "${updated.titleEn}" updated and published!`)
        setEditingService(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (svc: ServiceRecord) => {
    const updated = { ...svc, active: !svc.active }
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        setServices((prev) => prev.map((s) => (s.id === svc.id ? updated : s)))
        setToastMessage(`Service ${updated.active ? 'published' : 'hidden'} on public site.`)
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
            Celebration Services CMS
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.7)' }}>
            Manage the 6 core catering service cards, titles, descriptions, capacities, and photography.
          </p>
        </div>

        <button
          onClick={fetchServices}
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
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#c4a365' }}>
          Loading services...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                background: 'rgba(21, 61, 45, 0.75)',
                border: '1.5px solid rgba(196, 163, 101, 0.25)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                opacity: svc.active ? 1 : 0.65,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Image banner */}
              <div
                style={{
                  height: '180px',
                  position: 'relative',
                  background: '#0a1d15',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={svc.image}
                  alt={svc.titleEn}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: svc.imagePosition || 'center center',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(13, 40, 30, 0.85)',
                    border: '1px solid rgba(196, 163, 101, 0.4)',
                    color: '#c4a365',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {svc.number}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                  }}
                >
                  <button
                    onClick={() => handleToggleActive(svc)}
                    style={{
                      background: svc.active ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {svc.active ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{svc.active ? 'Live' : 'Hidden'}</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                <div>
                  <h3
                    style={{
                      margin: '0 0 2px',
                      color: '#faf8f1',
                      fontSize: '1.25rem',
                      fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
                      fontWeight: 600,
                    }}
                  >
                    {svc.titleEn}
                  </h3>
                  <div
                    style={{
                      color: '#c4a365',
                      fontSize: '0.88rem',
                      fontFamily: 'var(--font-tamil, "Noto Sans Tamil", sans-serif)',
                    }}
                  >
                    {svc.titleTa}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(196, 163, 101, 0.95)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  ✦ {svc.tagEn}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.84rem',
                    color: 'rgba(250, 248, 241, 0.75)',
                    lineHeight: 1.45,
                    flex: 1,
                  }}
                >
                  {svc.descEn}
                </p>

                {/* Capacity & Leaf style meta */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(10, 35, 25, 0.5)',
                    borderRadius: '8px',
                    border: '1px solid rgba(196, 163, 101, 0.15)',
                    fontSize: '0.76rem',
                    color: 'rgba(250, 248, 241, 0.8)',
                  }}
                >
                  {svc.capacity && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} style={{ color: '#c4a365' }} />
                      <span>{svc.capacity}</span>
                    </div>
                  )}
                  {svc.leafStyle && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={13} style={{ color: '#c4a365' }} />
                      <span>{svc.leafStyle}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(196, 163, 101, 0.2)',
                  }}
                >
                  <button
                    onClick={() => openEditModal(svc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#0d281e',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={14} />
                    <span>Edit Service Card</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT SERVICE */}
      {/* ========================================================================= */}
      {editingService && formData && (
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
          onClick={() => setEditingService(null)}
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
              <h3 style={{ margin: 0, color: '#faf8f1', fontSize: '1.25rem' }}>
                Edit Celebration Service: {formData.number}
              </h3>
              <button
                onClick={() => setEditingService(null)}
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

            <form
              onSubmit={handleSaveService}
              style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
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
                    Title (தமிழ்) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleTa}
                    onChange={(e) => setFormData({ ...formData, titleTa: e.target.value })}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={formData.tagEn}
                    onChange={(e) => setFormData({ ...formData, tagEn: e.target.value })}
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
                    Tagline (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={formData.tagTa}
                    onChange={(e) => setFormData({ ...formData, tagTa: e.target.value })}
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  value={formData.descEn}
                  onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(10, 35, 25, 0.65)',
                    border: '1px solid rgba(196, 163, 101, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Description (தமிழ்)
                </label>
                <textarea
                  rows={3}
                  value={formData.descTa}
                  onChange={(e) => setFormData({ ...formData, descTa: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(10, 35, 25, 0.65)',
                    border: '1px solid rgba(196, 163, 101, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Guest Capacity Text
                  </label>
                  <input
                    type="text"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g. 200 to 5,000+ Guests"
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
                    Service / Leaf Style
                  </label>
                  <input
                    type="text"
                    value={formData.leafStyle || ''}
                    onChange={(e) => setFormData({ ...formData, leafStyle: e.target.value })}
                    placeholder="e.g. Traditional Plantain Leaf Feast"
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Image URL / Path
                </label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px' }}>
                <input
                  type="checkbox"
                  id="svc-active-toggle"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="svc-active-toggle" style={{ fontSize: '0.86rem', color: '#faf8f1', cursor: 'pointer' }}>
                  Active & Displayed on Public Website
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(196, 163, 101, 0.2)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
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
                  disabled={saving}
                  style={{
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0d281e',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Save & Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
