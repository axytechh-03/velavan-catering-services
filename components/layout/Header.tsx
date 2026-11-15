'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { smoothScrollTo } from '@/lib/utils'

export function Header() {
  const { t, language, toggleLanguage } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('#home')

  // Section order: Home -> Story (About) -> Services -> Clients -> Menu -> Gallery -> Contact
  const sectionIds = ['home', 'story', 'services', 'clients', 'menu', 'gallery', 'contact']

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const scrollPosition = window.scrollY + 140

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el) {
          const top = el.offsetTop
          if (scrollPosition >= top) {
            setActiveSection(`#${sectionIds[i]}`)
            break
          }
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scrolling when mobile sidebar is open & listen for Escape key
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  // Global smooth scrolling listener for all # hash links on the page
  useEffect(() => {
    const handleGlobalHashClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href === '#' || href.length < 2) return
      const targetId = href.substring(1)
      const element = document.getElementById(targetId)
      if (!element) return

      e.preventDefault()
      smoothScrollTo(targetId)
    }

    document.addEventListener('click', handleGlobalHashClick)
    return () => document.removeEventListener('click', handleGlobalHashClick)
  }, [])

  // Correct order: 1. Home, 2. About / Our Story, 3. Services, 4. Clients, 5. Menu, 6. Gallery, 7. Contact
  const navLinks = [
    { href: '#home', label: t.navHome },
    { href: '#story', label: t.navStory },
    { href: '#services', label: t.navServices },
    { href: '#clients', label: t.navClients },
    { href: '#menu', label: t.navMenu },
    { href: '#gallery', label: t.navGallery },
    { href: '#contact', label: t.navContact },
  ]

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav">
          {/* Brand Link with Official Logo in Original Circular Mark */}
          <a
            className="brand"
            href="#home"
            aria-label="Velavan Catering Services Home"
            onClick={(e) => {
              e.preventDefault()
              setActiveSection('#home')
              smoothScrollTo('home')
            }}
          >
            <div className="brand-mark" style={{ overflow: 'hidden', padding: '2px', background: '#fff' }}>
              <Image
                src="/images/logo/logo.png"
                alt="Velavan Catering Logo"
                width={42}
                height={42}
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                priority
              />
            </div>
            <div>
              <div className="brand-name">VELAVAN</div>
              <div className="brand-sub">CATERING SERVICES</div>
            </div>
          </a>

          {/* Desktop Navlinks (Order: Home, About, Services, Clients, Menu, Gallery, Contact) */}
          <nav className="navlinks" aria-label="Primary Navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={activeSection === link.href ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveSection(link.href)
                  smoothScrollTo(link.href)
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons & Mobile Controls: Language Switch visible on ALL screens */}
          <div className="header-actions">
            <a
              className="btn nav-cta desktop-cta"
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                setActiveSection('#contact')
                smoothScrollTo('contact')
              }}
            >
              {t.navEnquireBtn}
            </a>
            <button
              className="lang-btn header-lang-btn"
              id="languageToggle"
              onClick={toggleLanguage}
              aria-label="Switch Language"
            >
              {t.langSwitchLabel}
            </button>
            <button
              className="menu-toggle"
              id="menuToggle"
              aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop for Mobile / Tablet Sidebar */}
      <div
        className={`mobile-nav-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Mobile & Tablet Navigation Sidebar Panel */}
      <aside
        className={`mobile-sidebar-panel ${mobileOpen ? 'open' : ''}`}
        id="mobileSidebar"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'ta' ? 'வழிசெலுத்தல் பட்டி' : 'Navigation Menu'}
      >
        {/* Sidebar Header with Brand Mark and Close Button */}
        <div className="mobile-sidebar-header">
          <a
            className="brand"
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              setActiveSection('#home')
              smoothScrollTo('home')
              setMobileOpen(false)
            }}
          >
            <div className="brand-mark" style={{ overflow: 'hidden', padding: '2px', background: '#fff' }}>
              <Image
                src="/images/logo/logo.png"
                alt="Velavan Catering Logo"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div>
              <div className="brand-name">VELAVAN</div>
              <div className="brand-sub">CATERING SERVICES</div>
            </div>
          </a>
          <button
            type="button"
            className="mobile-sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label={language === 'ta' ? 'மெனுவை மூடு' : 'Close navigation menu'}
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation Links (Exact 7 sections order) */}
        <nav className="mobile-sidebar-links" aria-label="Mobile Navigation Links">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`mobile-sidebar-link ${activeSection === link.href ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setActiveSection(link.href)
                smoothScrollTo(link.href)
                setMobileOpen(false)
              }}
            >
              <span>{link.label}</span>
              {activeSection === link.href && <span className="active-dot" aria-hidden="true" />}
            </a>
          ))}
        </nav>

        {/* Sidebar Action: Only Enquire Now CTA (Language Switch is in top navigation bar) */}
        <div className="mobile-sidebar-actions">
          <a
            className="btn nav-cta mobile-cta-btn"
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              setActiveSection('#contact')
              smoothScrollTo('contact')
              setMobileOpen(false)
            }}
          >
            {t.navEnquireBtn}
          </a>
        </div>
      </aside>
    </>
  )
}

