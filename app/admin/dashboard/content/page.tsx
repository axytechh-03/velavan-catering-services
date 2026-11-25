'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Save,
  Check,
  RefreshCw,
  Phone,
  ShieldCheck,
  Heart,
  Sparkles,
  Award,
} from 'lucide-react'
import { SiteContentRecord } from '@/lib/cms-store'

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'story' | 'tribute' | 'contact' | 'registrations'>('hero')
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
        setToastMessage('Website content updated and published to public site!')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
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
            Website Content & Copy CMS
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.7)' }}>
            Edit homepage headings, storytelling narratives, official contact info, and legal registration numbers.
          </p>
        </div>

        <button
          onClick={fetchContent}
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

      {/* Tab Navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {[
          { id: 'hero', label: 'Hero Header', icon: Sparkles },
          { id: 'story', label: 'Our Story', icon: FileText },
          { id: 'tribute', label: 'Jayanthi Tribute', icon: Heart },
          { id: 'contact', label: 'Contact & Address', icon: Phone },
          { id: 'registrations', label: 'Compliance & FSSAI', icon: ShieldCheck },
        ].map((tab) => {
          const active = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                border: active ? '1.5px solid #c4a365' : '1px solid rgba(196, 163, 101, 0.2)',
                background: active ? 'rgba(196, 163, 101, 0.22)' : 'rgba(21, 61, 45, 0.5)',
                color: active ? '#ffffff' : 'rgba(250, 248, 241, 0.75)',
                fontSize: '0.86rem',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} style={{ color: active ? '#c4a365' : 'rgba(196, 163, 101, 0.7)' }} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Form Body */}
      {loading || !content ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#c4a365' }}>
          Loading website copy...
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          style={{
            background: 'rgba(21, 61, 45, 0.75)',
            border: '1.5px solid rgba(196, 163, 101, 0.25)',
            borderRadius: '14px',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {/* ================================================================= */}
          {/* TAB 1: HERO */}
          {/* ================================================================= */}
          {activeTab === 'hero' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ margin: '0 0 4px', color: '#faf8f1', fontSize: '1.25rem' }}>
                Hero Section Content
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Eyebrow (English)
                  </label>
                  <input
                    type="text"
                    value={content.hero.eyebrowEn}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrowEn: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Eyebrow (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={content.hero.eyebrowTa}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrowTa: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Main Heading (English)
                  </label>
                  <input
                    type="text"
                    value={content.hero.titleEn}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleEn: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Main Heading (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={content.hero.titleTa}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleTa: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Supporting Narrative (English)
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero.descEn}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, descEn: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Supporting Narrative (தமிழ்)
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero.descTa}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, descTa: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Hero Promise Ribbon Text
                </label>
                <input
                  type="text"
                  value={content.hero.promiseStrip}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, promiseStrip: e.target.value } })}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: STORY */}
          {/* ================================================================= */}
          {activeTab === 'story' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ margin: '0 0 4px', color: '#faf8f1', fontSize: '1.25rem' }}>
                Our Story & Heritage
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Story Title (English)
                  </label>
                  <input
                    type="text"
                    value={content.story.titleEn}
                    onChange={(e) => setContent({ ...content, story: { ...content.story, titleEn: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Story Title (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={content.story.titleTa}
                    onChange={(e) => setContent({ ...content, story: { ...content.story, titleTa: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Paragraph 1 (English)
                  </label>
                  <textarea
                    rows={4}
                    value={content.story.p1En}
                    onChange={(e) => setContent({ ...content, story: { ...content.story, p1En: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Paragraph 1 (தமிழ்)
                  </label>
                  <textarea
                    rows={4}
                    value={content.story.p1Ta}
                    onChange={(e) => setContent({ ...content, story: { ...content.story, p1Ta: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: TRIBUTE */}
          {/* ================================================================= */}
          {activeTab === 'tribute' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ margin: '0 0 4px', color: '#faf8f1', fontSize: '1.25rem' }}>
                Heritage Tribute Section (Jayanthi)
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Portrait Tribute Name
                </label>
                <input
                  type="text"
                  value={content.tribute.name}
                  onChange={(e) => setContent({ ...content, tribute: { ...content.tribute, name: e.target.value } })}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={content.tribute.taglineEn}
                    onChange={(e) => setContent({ ...content, tribute: { ...content.tribute, taglineEn: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tagline (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={content.tribute.taglineTa}
                    onChange={(e) => setContent({ ...content, tribute: { ...content.tribute, taglineTa: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tribute Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={content.tribute.descEn}
                    onChange={(e) => setContent({ ...content, tribute: { ...content.tribute, descEn: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tribute Description (தமிழ்)
                  </label>
                  <textarea
                    rows={3}
                    value={content.tribute.descTa}
                    onChange={(e) => setContent({ ...content, tribute: { ...content.tribute, descTa: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: CONTACT */}
          {/* ================================================================= */}
          {activeTab === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ margin: '0 0 4px', color: '#faf8f1', fontSize: '1.25rem' }}>
                Official Contact & Address
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Primary Phone Number
                  </label>
                  <input
                    type="text"
                    value={content.contact.phonePrimary}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, phonePrimary: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Secondary Phone Number
                  </label>
                  <input
                    type="text"
                    value={content.contact.phoneSecondary}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, phoneSecondary: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    WhatsApp Enquiry Number
                  </label>
                  <input
                    type="text"
                    value={content.contact.whatsapp}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Physical Address (English)
                  </label>
                  <textarea
                    rows={2}
                    value={content.contact.addressEn}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, addressEn: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Physical Address (தமிழ்)
                  </label>
                  <textarea
                    rows={2}
                    value={content.contact.addressTa}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, addressTa: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,35,25,0.65)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '8px', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: REGISTRATIONS */}
          {/* ================================================================= */}
          {activeTab === 'registrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ margin: '0 0 4px', color: '#faf8f1', fontSize: '1.25rem' }}>
                Compliance, MSME & FSSAI State License Details
              </h3>

              <div
                style={{
                  background: 'rgba(10, 35, 25, 0.5)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(196, 163, 101, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#c4a365' }}>
                  1. UDYAM – MSME REGISTRATION (Govt. of India)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(250,248,241,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={content.registrations.msmeNumber}
                      onChange={(e) => setContent({ ...content, registrations: { ...content.registrations, msmeNumber: e.target.value } })}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(10,35,25,0.8)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(250,248,241,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Enterprise Type
                    </label>
                    <input
                      type="text"
                      value={content.registrations.msmeEnterpriseType}
                      onChange={(e) => setContent({ ...content, registrations: { ...content.registrations, msmeEnterpriseType: e.target.value } })}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(10,35,25,0.8)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(10, 35, 25, 0.5)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(196, 163, 101, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#c4a365' }}>
                  2. FSSAI – FOOD SAFETY STANDARDS (State License)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(250,248,241,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      License Number
                    </label>
                    <input
                      type="text"
                      value={content.registrations.fssaiNumber}
                      onChange={(e) => setContent({ ...content, registrations: { ...content.registrations, fssaiNumber: e.target.value } })}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(10,35,25,0.8)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(250,248,241,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Fee Paid Through / Validity
                    </label>
                    <input
                      type="text"
                      value={content.registrations.fssaiValidThrough}
                      onChange={(e) => setContent({ ...content, registrations: { ...content.registrations, fssaiValidThrough: e.target.value } })}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(10,35,25,0.8)', border: '1px solid rgba(196,163,101,0.3)', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Submit Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid rgba(196, 163, 101, 0.25)',
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#0d281e',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(196, 163, 101, 0.35)',
              }}
            >
              <Save size={18} />
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish All Content'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
