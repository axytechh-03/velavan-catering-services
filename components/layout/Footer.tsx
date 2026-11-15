'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { ArrowUp } from 'lucide-react'

export function Footer() {
  const { language, t } = useLanguage()
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [contactData, setContactData] = useState({
    phonePrimary: '+91 90803 09584',
    email: 'dhineshkumarctpm@gmail.com',
    addressEn: '15/49, Mariamman Kovil Street, Chettipalayam, Coimbatore – 641201',
    addressTa: '15/49, மாரியம்மன் கோவில் வீதி, செட்டிபாளையம், கோயம்புத்தூர் – 641201',
  })

  useEffect(() => {
    async function loadContact() {
      try {
        const res = await fetch('/api/content?section=content')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data && json.data.contact) {
            setContactData({
              phonePrimary: json.data.contact.phonePrimary || '+91 90803 09584',
              email: json.data.contact.email || 'dhineshkumarctpm@gmail.com',
              addressEn: json.data.contact.addressEn || '15/49, Mariamman Kovil Street, Chettipalayam, Coimbatore – 641201',
              addressTa: json.data.contact.addressTa || '15/49, மாரியம்மன் கோவில் வீதி, செட்டிபாளையம், கோயம்புத்தூர் – 641201',
            })
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    loadContact()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid reveal-up">
          {/* Column 1: Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div
                className="brand-mark"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  padding: '2px',
                  background: '#ffffff',
                  border: '1.5px solid var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/images/logo/logo.png"
                  alt="Velavan Catering Logo"
                  width={42}
                  height={42}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                />
              </div>
              <div>
                <div className="footer-brand" style={{ margin: 0, lineHeight: 1.1 }}>VELAVAN</div>
                <div className="footer-sub" style={{ marginTop: '3px' }}>CATERING SERVICES</div>
              </div>
            </div>
            <p>
              {language === 'ta'
                ? 'சிறந்த உணவு, கவனமான திட்டமிடல் மற்றும் மனமார்ந்த விருந்தோம்பல் மூலம் மறக்க முடியாத விழாக்களை உருவாக்குகிறோம்.'
                : 'Creating memorable celebrations through exceptional food, thoughtful planning and heartfelt hospitality.'}
            </p>
          </div>

          {/* Column 2: Explore Navigation Links */}
          <div>
            <h4>{t.footerExplore}</h4>
            <div className="footer-links">
              <a href="#story">{t.navStory}</a>
              <a href="#services">{t.navServices}</a>
              <a href="#clients">{t.navClients}</a>
              <a href="#menu">{t.navMenu}</a>
              <a href="#gallery">{t.navGallery}</a>
              <a href="#contact">{t.navContact}</a>
            </div>
          </div>

          {/* Column 3: Official Contact Details */}
          <div>
            <h4>{t.footerContact}</h4>
            <div className="footer-links">
              <span>
                📞 <a href={`tel:${contactData.phonePrimary.replace(/\s+/g, '')}`} style={{ color: 'inherit' }}>{contactData.phonePrimary}</a>
              </span>
              <span>
                ✉ <a href={`mailto:${contactData.email}`} style={{ color: 'inherit' }}>{contactData.email}</a>
              </span>
              <span>
                📍 <span>{language === 'ta' ? contactData.addressTa : contactData.addressEn}</span>
              </span>
              <a
                href="#contact"
                style={{ color: 'var(--gold2)', fontWeight: 700, marginTop: '6px' }}
              >
                {language === 'ta' ? 'விசாரிக்க →' : 'Make an Enquiry →'}
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Line with Back-To-Top Link */}
        <div className="footer-bottom reveal-up" style={{ transitionDelay: '0.1s' }}>
          <span>
            © {new Date().getFullYear()} {t.footerRights}
          </span>
          <button
            type="button"
            className="footer-top-btn"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>{language === 'ta' ? 'மேலே செல்க' : 'Back to Top'}</span>
            <ArrowUp size={14} />
          </button>
          <span>{t.footerAgency}</span>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        className={`floating-top-btn ${showTopBtn ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>
    </footer>
  )
}
