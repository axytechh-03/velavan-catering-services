'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import MediaUploader, {
  isSupabaseStorageUrl,
  safelyDeleteStorageImage,
} from '@/components/admin/MediaUploader'

export default function ServicesManagementPage() {
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const originalImageRef = useRef<string>('')

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
    originalImageRef.current = svc.image
    setEditingService(svc)
    setFormData({ ...svc })
    setFeaturedEnText((svc.featuredDishes?.en || []).join(', '))
    setFeaturedTaText((svc.featuredDishes?.ta || []).join(', '))
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    if (!formData.image.trim()) {
      setToastMessage('Please upload or specify a service banner image.')
      return
    }

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
        const oldImage = originalImageRef.current
        const newImage = updated.image

        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        setToastMessage(`Service "${updated.titleEn}" updated and published!`)
        setEditingService(null)

        // Safe replacement rule:
        // Only after database update succeeded:
        if (oldImage && oldImage !== newImage && isSupabaseStorageUrl(oldImage)) {
          const isReferencedElsewhere = services.some(
            (s) => s.id !== updated.id && s.image === oldImage
          )
          const isBaseline = [
            'wedding-muhurtham.jpg',
            'reception-catering.jpg',
            'engagement-catering.jpg',
            'corporate-events.jpg',
            'birthday-family-functions.jpg',
            'special-events-occasions.jpg',
          ].some((seed) => oldImage.includes(seed))
          if (!isReferencedElsewhere && !isBaseline) {
            safelyDeleteStorageImage(oldImage)
          }
        }
        originalImageRef.current = ''
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
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '2rem',
              margin: '0 0 4px',
              color: '#153d2d',
              fontWeight: 700,
            }}
          >
            Celebration Services CMS
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#6b756e' }}>
            Manage the 6 core catering service cards, titles, descriptions, capacities, and photography.
          </p>
        </div>

        <button
          onClick={fetchServices}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid #d1c7b7',
            color: '#153d2d',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'transform 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '24px',
          }}
        >
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e3dcce',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
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
                    background: 'rgba(21, 61, 45, 0.9)',
                    border: '1px solid rgba(196, 163, 101, 0.5)',
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
                      background: svc.active ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
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
                      color: '#153d2d',
                      fontSize: '1.25rem',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontWeight: 700,
                    }}
                  >
                    {svc.titleEn}
                  </h3>
                  <div
                    style={{
                      color: '#9e7f41',
                      fontSize: '0.88rem',
                      fontFamily: 'var(--font-tamil, "Noto Sans Tamil", sans-serif)',
                      fontWeight: 600,
                    }}
                  >
                    {svc.titleTa}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#9e7f41',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  ✦ {svc.tagEn}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.84rem',
                    color: '#55635b',
                    lineHeight: 1.5,
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
                    background: '#faf8f1',
                    borderRadius: '8px',
                    border: '1px solid #e3dcce',
                    fontSize: '0.76rem',
                    color: '#153d2d',
                    fontWeight: 600,
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
                    paddingTop: '10px',
                    borderTop: '1px solid #f0eae1',
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
                      boxShadow: '0 2px 8px rgba(196, 163, 101, 0.25)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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
              maxWidth: '720px',
              background: '#ffffff',
              border: '1.5px solid #c4a365',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
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
                padding: '18px 24px',
                borderBottom: '1px solid #e3dcce',
                background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
              }}
            >
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#c4a365',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  SERVICE CARD EDITOR
                </span>
                <h3
                  style={{
                    margin: 0,
                    color: '#faf8f1',
                    fontSize: '1.22rem',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                  }}
                >
                  Edit Celebration Service: {formData.number}
                </h3>
              </div>
              <button
                onClick={() => setEditingService(null)}
                aria-label="Close Edit Service Modal"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#faf8f1',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSaveService}
              style={{
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={formData.tagEn}
                    onChange={(e) => setFormData({ ...formData, tagEn: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tagline (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={formData.tagTa}
                    onChange={(e) => setFormData({ ...formData, tagTa: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  value={formData.descEn}
                  onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontSize: '0.86rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Description (தமிழ்)
                </label>
                <textarea
                  rows={3}
                  value={formData.descTa}
                  onChange={(e) => setFormData({ ...formData, descTa: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontSize: '0.86rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                      background: '#faf8f1',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#153d2d',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <MediaUploader
                folder="services"
                currentUrl={formData.image}
                onChange={(image) => setFormData({ ...formData, image })}
                label="Service Banner Image"
                required
                helpText="Upload JPEG, PNG, WebP or SVG up to 5 MB for this catering celebration tier."
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px' }}>
                <input
                  type="checkbox"
                  id="svc-active-toggle"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ accentColor: '#153d2d' }}
                />
                <label htmlFor="svc-active-toggle" style={{ fontSize: '0.86rem', color: '#153d2d', cursor: 'pointer', fontWeight: 600 }}>
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
                  borderTop: '1px solid #f0eae1',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  style={{
                    padding: '9px 18px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#153d2d',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '9px 22px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0d281e',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 3px 12px rgba(196, 163, 101, 0.3)',
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
