'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function Clients() {
  const { t } = useLanguage()

  return (
    <section className="section clients-section" id="clients">
      <div className="container">
        <div className="section-head reveal-up">
          <div className="eyebrow">
            {t.clientsEyebrow}
          </div>
          <h2 className="serif">
            {t.clientsTitle}
          </h2>
          <div className="gold-line center-line"></div>
        </div>

        <div className="client-logos reveal-up" aria-label="Client logos" style={{ transitionDelay: '0.15s' }}>
          {/* Geometric Minimal Brand Insignia 1 */}
          <div className="client-logo" title="Partner Brand Emblem">
            <svg viewBox="0 0 80 60" aria-hidden="true">
              <path d="M40 5 65 18 65 42 40 55 15 42 15 18Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M40 14 56 23 56 37 40 46 24 37 24 23Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M40 19 47 30 40 41 33 30Z" fill="currentColor" />
            </svg>
          </div>
          {/* Geometric Minimal Brand Insignia 2 */}
          <div className="client-logo" title="Partner Brand Emblem">
            <svg viewBox="0 0 80 60" aria-hidden="true">
              <circle cx="40" cy="30" r="23" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="40" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M40 13 45 25 58 30 45 35 40 47 35 35 22 30 35 25Z" fill="currentColor" />
            </svg>
          </div>
          {/* Geometric Minimal Brand Insignia 3 */}
          <div className="client-logo" title="Partner Brand Emblem">
            <svg viewBox="0 0 80 60" aria-hidden="true">
              <path d="M15 45 40 9 65 45Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M26 40 40 20 54 40Z" fill="currentColor" />
              <path d="M11 51H69" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          {/* Geometric Minimal Brand Insignia 4 */}
          <div className="client-logo" title="Partner Brand Emblem">
            <svg viewBox="0 0 80 60" aria-hidden="true">
              <path d="M17 13H63V47H17Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M25 39 40 20 55 39M25 29H55" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="40" cy="29" r="4" fill="currentColor" />
            </svg>
          </div>
          {/* Geometric Minimal Brand Insignia 5 */}
          <div className="client-logo" title="Partner Brand Emblem">
            <svg viewBox="0 0 80 60" aria-hidden="true">
              <path d="M40 7 48 23 66 25 53 38 56 54 40 46 24 54 27 38 14 25 32 23Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m40 17 5 12 13 1-10 9 3 12-11-6-11 6 3-12-10-9 13-1Z" fill="currentColor" />
            </svg>
          </div>
          {/* Geometric Minimal Brand Insignia 6 */}
          <div className="client-logo" title="Partner Brand Emblem">
            <svg viewBox="0 0 80 60" aria-hidden="true">
              <path d="M14 43C25 10 55 10 66 43M20 43C29 22 51 22 60 43" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M26 43 40 24 54 43Z" fill="currentColor" />
            </svg>
          </div>
        </div>

        <p className="client-note">
          {t.clientsNote}
        </p>
      </div>
    </section>
  )
}
