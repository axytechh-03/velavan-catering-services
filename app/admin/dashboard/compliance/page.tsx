'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Save,
  Check,
  RefreshCw,
  Award,
  Calendar,
  Building,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react'
import { SiteContentRecord } from '@/lib/cms-store'

export default function CompliancePage() {
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
        setToastMessage('Compliance and Food Safety records successfully updated and published!')
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
        <p>Loading compliance records from database...</p>
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

  const r = content.registrations

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
            Compliance & Food Safety Certifications
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.72)' }}>
            Manage Government of India MSME Udyam credentials, FSSAI State Food Hygiene Licenses and statutory validity dates.
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
          <span>{saving ? 'Publishing...' : 'Publish Compliance Records'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px' }}>
        {/* MSME Udyam Registration */}
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
              <Building size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#153d2d', fontWeight: 700 }}>
                Ministry of MSME — Udyam Registration
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b756e' }}>
                Government of India Ministry of Micro, Small & Medium Enterprises
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                Udyam Registration Certificate Number
              </label>
              <input
                type="text"
                value={r.msmeNumber}
                onChange={(e) => setContent({ ...content, registrations: { ...r, msmeNumber: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                Enterprise Classification Type
              </label>
              <input
                type="text"
                value={r.msmeEnterpriseType}
                onChange={(e) => setContent({ ...content, registrations: { ...r, msmeEnterpriseType: e.target.value } })}
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
                Statutory Status
              </label>
              <input
                type="text"
                value={r.msmeStatus}
                onChange={(e) => setContent({ ...content, registrations: { ...r, msmeStatus: e.target.value } })}
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

            <div
              style={{
                marginTop: '12px',
                background: '#faf8f1',
                border: '1px solid #e3dcce',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: '#1f2f25' }}>
                <strong>Active Credential:</strong> Displayed on website registration badges to establish customer confidence.
              </div>
            </div>
          </div>
        </div>

        {/* FSSAI Food Safety License */}
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
              <Award size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#153d2d', fontWeight: 700 }}>
                Food Safety and Standards Authority of India (FSSAI)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b756e' }}>
                State Food Hygiene & Pure Vegetarian Safety License
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                FSSAI 14-Digit State License Number
              </label>
              <input
                type="text"
                value={r.fssaiNumber}
                onChange={(e) => setContent({ ...content, registrations: { ...r, fssaiNumber: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '7px',
                  border: '1px solid #d1c7b7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#153d2d', marginBottom: '6px' }}>
                License Category
              </label>
              <input
                type="text"
                value={r.fssaiCategory}
                onChange={(e) => setContent({ ...content, registrations: { ...r, fssaiCategory: e.target.value } })}
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
                License Fee Paid Through / Valid Date
              </label>
              <input
                type="text"
                value={r.fssaiValidThrough}
                onChange={(e) => setContent({ ...content, registrations: { ...r, fssaiValidThrough: e.target.value } })}
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
                Compliance & Verification Status
              </label>
              <input
                type="text"
                value={r.fssaiStatus}
                onChange={(e) => setContent({ ...content, registrations: { ...r, fssaiStatus: e.target.value } })}
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
      </div>
    </div>
  )
}
