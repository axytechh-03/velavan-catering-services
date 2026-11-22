'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Maximize2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { GalleryRecord } from '@/lib/cms-store'
import MediaUploader, {
  isSupabaseStorageUrl,
  safelyDeleteStorageImage,
} from '@/components/admin/MediaUploader'

export default function GalleryManagementPage() {
  const [gallery, setGallery] = useState<GalleryRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Lightbox
  const [lightboxItem, setLightboxItem] = useState<GalleryRecord | null>(null)

  // Modals
  const [isAddModal, setIsAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryRecord | null>(null)
  const [itemToDelete, setItemToDelete] = useState<GalleryRecord | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const originalUrlRef = useRef<string>('')

  // Form State
  const [formData, setFormData] = useState<GalleryRecord>({
    id: '',
    titleEn: '',
    titleTa: '',
    categoryEn: 'Traditional Dining',
    categoryTa: 'பாரம்பரிய இலை விருந்து',
    url: '/images/gallery/traditional-banana-leaf-feast.webp',
    captionEn: '',
    captionTa: '',
    objectPosition: 'center center',
    active: true,
    order: 1,
  })

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.gallery) {
          setGallery(data.gallery)
        }
      }
    } catch (e) {
      console.error('Error fetching gallery:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  const openAddModal = () => {
    originalUrlRef.current = ''
    setFormData({
      id: `gal-${Date.now()}`,
      titleEn: '',
      titleTa: '',
      categoryEn: 'Wedding Virundhu',
      categoryTa: 'திருமண விருந்து',
      url: '',
      captionEn: '',
      captionTa: '',
      objectPosition: 'center center',
      active: true,
      order: gallery.length + 1,
    })
    setIsAddModal(true)
  }

  const openEditModal = (item: GalleryRecord) => {
    originalUrlRef.current = item.url
    setEditingItem(item)
    setFormData({ ...item })
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.url.trim()) {
      setToastMessage('Please upload or specify a photograph image.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/gallery', {
        method: isAddModal ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.item) {
          const oldUrl = originalUrlRef.current
          const newUrl = formData.url

          if (isAddModal) {
            setGallery((prev) => [data.item, ...prev])
            setToastMessage(`Photograph "${formData.titleEn}" added to gallery!`)
          } else {
            setGallery((prev) => prev.map((g) => (g.id === formData.id ? data.item : g)))
            setToastMessage(`Photograph "${formData.titleEn}" updated!`)

            // Safe replacement rule:
            // Only after database update succeeded:
            if (oldUrl && oldUrl !== newUrl && isSupabaseStorageUrl(oldUrl)) {
              const isReferencedElsewhere = gallery.some(
                (g) => g.id !== formData.id && g.url === oldUrl
              )
              const isBaseline = /gallery-[1-9]\.jpg/.test(oldUrl)
              if (!isReferencedElsewhere && !isBaseline) {
                safelyDeleteStorageImage(oldUrl)
              }
            }
          }
          originalUrlRef.current = ''
          setIsAddModal(false)
          setEditingItem(null)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return
    setSubmitting(true)

    const deletedUrl = itemToDelete.url
    const deletedId = itemToDelete.id

    try {
      const res = await fetch(`/api/admin/gallery?id=${deletedId}`, { method: 'DELETE' })
      if (res.ok) {
        setGallery((prev) => prev.filter((g) => g.id !== deletedId))
        setToastMessage('Photograph removed from gallery.')
        setItemToDelete(null)

        // Safe deletion rule:
        // Only after database deletion succeeded:
        if (deletedUrl && isSupabaseStorageUrl(deletedUrl)) {
          const isReferencedElsewhere = gallery.some(
            (g) => g.id !== deletedId && g.url === deletedUrl
          )
          const isBaseline = /gallery-[1-9]\.jpg/.test(deletedUrl)
          if (!isReferencedElsewhere && !isBaseline) {
            safelyDeleteStorageImage(deletedUrl)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (item: GalleryRecord) => {
    const updated = { ...item, active: !item.active }
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        setGallery((prev) => prev.map((g) => (g.id === item.id ? updated : g)))
        setToastMessage(`Photo ${updated.active ? 'published' : 'hidden'}.`)
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
            Moments & Memories Gallery CMS
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.7)' }}>
            Manage the celebration photography carousel, captions, and visual storytelling for weddings and events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchGallery}
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
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#c4a365' }}>
          Loading celebration gallery...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {gallery.map((item, idx) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(21, 61, 45, 0.75)',
                border: '1.5px solid rgba(196, 163, 101, 0.25)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                opacity: item.active ? 1 : 0.6,
              }}
            >
              {/* Photo Box */}
              <div
                style={{
                  height: '200px',
                  position: 'relative',
                  background: '#0a1d15',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
                onClick={() => setLightboxItem(item)}
              >
                <img
                  src={item.url}
                  alt={item.titleEn}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: item.objectPosition || 'center center',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(13, 40, 30, 0.85)',
                    border: '1px solid rgba(196, 163, 101, 0.4)',
                    color: '#c4a365',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Photo #{idx + 1}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    display: 'flex',
                    gap: '6px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleToggleActive(item)}
                    style={{
                      background: item.active ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {item.active ? <Eye size={11} /> : <EyeOff size={11} />}
                    <span>{item.active ? 'Live' : 'Hidden'}</span>
                  </button>

                  <button
                    onClick={() => setLightboxItem(item)}
                    title="Fullscreen Preview"
                    style={{
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: '#faf8f1',
                      border: 'none',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#c4a365',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '4px',
                    }}
                  >
                    {item.categoryEn} · {item.categoryTa}
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      color: '#faf8f1',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
                    }}
                  >
                    {item.titleEn}
                  </h3>
                  <div
                    style={{
                      color: '#c4a365',
                      fontSize: '0.82rem',
                      marginTop: '2px',
                      fontFamily: 'var(--font-tamil, "Noto Sans Tamil", sans-serif)',
                    }}
                  >
                    {item.titleTa}
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'rgba(250, 248, 241, 0.7)',
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {item.captionEn}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(196, 163, 101, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: 'rgba(250, 248, 241, 0.45)', fontFamily: 'monospace' }}>
                    {item.url.split('/').pop()}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openEditModal(item)}
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
                      onClick={() => setItemToDelete(item)}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PHOTO */}
      {/* ========================================================================= */}
      {(isAddModal || editingItem) && (
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
            setEditingItem(null)
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
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
                {isAddModal ? 'Add Celebration Photograph' : 'Edit Photograph Details'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModal(false)
                  setEditingItem(null)
                }}
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

            <form onSubmit={handleSaveItem} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    Category Tag (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoryEn}
                    onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
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
                    Category Tag (தமிழ்)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoryTa}
                    onChange={(e) => setFormData({ ...formData, categoryTa: e.target.value })}
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

              <MediaUploader
                folder="gallery"
                currentUrl={formData.url}
                onChange={(url) => setFormData({ ...formData, url })}
                label="Photograph Image"
                required
                helpText="Upload JPEG, PNG, WebP or SVG up to 5 MB. Stored securely in Supabase Storage."
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Caption (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.captionEn}
                  onChange={(e) => setFormData({ ...formData, captionEn: e.target.value })}
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
                  Caption (தமிழ்)
                </label>
                <textarea
                  rows={2}
                  value={formData.captionTa}
                  onChange={(e) => setFormData({ ...formData, captionTa: e.target.value })}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="gal-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="gal-active" style={{ fontSize: '0.86rem', color: '#faf8f1', cursor: 'pointer' }}>
                  Publish in Public Carousel
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(196, 163, 101, 0.2)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModal(false)
                    setEditingItem(null)
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
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0d281e',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Photograph'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX PREVIEW */}
      {/* ========================================================================= */}
      {lightboxItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 95,
          }}
          onClick={() => setLightboxItem(null)}
        >
          <button
            onClick={() => setLightboxItem(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} />
          </button>

          <div
            style={{
              maxWidth: '900px',
              maxHeight: '75vh',
              overflow: 'hidden',
              borderRadius: '12px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxItem.url}
              alt={lightboxItem.titleEn}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '16px',
              maxWidth: '700px',
              color: '#faf8f1',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>{lightboxItem.titleEn}</h4>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(250, 248, 241, 0.75)' }}>
              {lightboxItem.captionEn}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {itemToDelete && (
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
          onClick={() => setItemToDelete(null)}
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
              Confirm Photograph Deletion
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'rgba(250, 248, 241, 0.7)', lineHeight: 1.5 }}>
              Are you sure you want to permanently remove <strong style={{ color: '#ffffff' }}>{itemToDelete.titleEn}</strong> from the gallery?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setItemToDelete(null)}
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
                onClick={handleDeleteItem}
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
                {submitting ? 'Deleting...' : 'Delete Photograph'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
