'use client'

import React, { useState, useEffect } from 'react'
import {
  PhoneCall,
  Save,
  Check,
  RefreshCw,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { SiteContentRecord } from '@/lib/cms-store'

export default function ContactDetailsPage() {
  const [content, setContent] = useState<SiteContentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const fetchContent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.content) {
          setContent(data.content)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return
    setSaving(true)

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })

      if (res.ok) {
        setToastMessage('Contact details successfully updated and published to the live website!')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !content) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#c4a365' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px' }} />
        <p>Loading contact details from database...</p>
        <style jsx>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  const c = content.contact

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Toast Alert */}
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

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
          borderRadius: '14px',
          padding: '28px 32px',
          border: '1px solid rgba(196, 163, 101, 0.3)',
          boxShadow: '0 8px 24px rgba(21, 61, 45, 0.12)',
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
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#c4a365',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Website Management
          </div>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '1.85rem',
              color: '#faf8f1',
              margin: '0 0 6px',
              fontWeight: 700,
            }}
          >
            Contact Details & Communications
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.72)' }}>
            Manage direct customer telephone lines, WhatsApp number, email and bilingual registered office addresses.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
            color: '#0d281e',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(196, 163, 101, 0.35)',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
          <span>{saving ? 'Publishing...' : 'Publish Changes to Site'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px' }}>
        {/* Telephone & Electronic Communication */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e3dcce',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(21, 61, 45, 0.08)',
                color: '#153d2d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#153d2d', fontWeight: 700 }}>
                Direct Phone & WhatsApp
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b756e' }}>
                Customer calling lines and instant WhatsApp inquiry numbers
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                Primary Phone Number (Click-to-Call)
              </label>
              <input
                type="text"
                value={c.phonePrimary}
                onChange={(e) => setContent({ ...content, contact: { ...c, phonePrimary: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                Secondary Phone Number (Alternative)
              </label>
              <input
                type="text"
                value={c.phoneSecondary || ''}
                onChange={(e) => setContent({ ...content, contact: { ...c, phoneSecondary: e.target.value } })}
                placeholder="+91 98422 12345"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                WhatsApp Booking Number (Digits only, e.g. 919080309584)
              </label>
              <input
                type="text"
                value={c.whatsapp}
                onChange={(e) => setContent({ ...content, contact: { ...c, whatsapp: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                Official Enquiries Email
              </label>
              <input
                type="email"
                value={c.email}
                onChange={(e) => setContent({ ...content, contact: { ...c, email: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                Operational Catering Hours
              </label>
              <input
                type="text"
                value={c.workingHoursEn || 'Open 24/7 for Bookings & Events'}
                onChange={(e) => setContent({ ...content, contact: { ...c, workingHoursEn: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Physical Office & Map Locations */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e3dcce',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(21, 61, 45, 0.08)',
                color: '#153d2d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#153d2d', fontWeight: 700 }}>
                Registered Kitchen & Office
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b756e' }}>
                Bilingual address rendered on website footer and contact section
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                English Registered Address
              </label>
              <textarea
                rows={3}
                value={c.addressEn}
                onChange={(e) => setContent({ ...content, contact: { ...c, addressEn: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                Tamil Registered Address (முகவரி)
              </label>
              <textarea
                rows={3}
                value={c.addressTa}
                onChange={(e) => setContent({ ...content, contact: { ...c, addressTa: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Live Preview Strip */}
            <div
              style={{
                marginTop: '12px',
                background: '#faf8f1',
                border: '1px dashed #c4a365',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9e7f41', textTransform: 'uppercase', marginBottom: '8px' }}>
                Live Website Preview:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#1f2f25', lineHeight: '1.6' }}>
                <div>📞 <strong>{c.phonePrimary}</strong></div>
                <div>✉️ <strong>{c.email}</strong></div>
                <div>📍 {c.addressEn}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
