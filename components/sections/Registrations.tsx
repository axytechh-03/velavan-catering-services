'use client'

import React, { useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useCard3DTilt } from '@/lib/motion/useCard3DTilt'

function RegCard({
  children,
  delay = '0s',
}: {
  children: React.ReactNode
  delay?: string
}) {
  const cardRef = useRef<HTMLElement>(null)
  useCard3DTilt(cardRef, { maxTilt: 5, scale: 1.02, speed: 400 })

  return (
    <article
      ref={cardRef}
      className="reg-card reveal-up is-revealed"
      style={{
        transitionDelay: delay,
        opacity: 1,
      }}
    >
      {children}
    </article>
  )
}

export function Registrations() {
  const { t } = useLanguage()

  return (
    <section className="section registrations-section" id="registrations">
      <div className="container">
        <div className="section-head reveal-up">
          <div className="eyebrow">
            {t.regEyebrow}
          </div>
          <h2 className="serif">
            {t.regTitle}
          </h2>
          <div className="gold-line center-line"></div>
        </div>

        <div className="reg-grid">
          {/* Card 1: UDYAM – MSME REGISTRATION */}
          <RegCard delay="0s">
            <div className="reg-header">
              <div className="reg-title-wrap">
                <span className="reg-sublabel">{t.regGovtOfIndia}</span>
                <h3>{t.regUdyamTitle}</h3>
              </div>
              <div className="reg-icon-box" title="MSME Certified">
                <svg viewBox="0 0 24 24" aria-hidden="true" width={24} height={24}>
                  <path
                    d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            <div className="reg-number-box">
              <span className="reg-number-label">{t.regNumberLabel}</span>
              <div className="reg-number-value">UDYAM-TN-03-0341714</div>
            </div>

            <ul className="reg-details">
              <li>
                <span>{t.regEnterpriseType}</span>
                <strong>{t.regEnterpriseTypeValue}</strong>
              </li>
              <li>
                <span>{t.regIssuingMinistry}</span>
                <strong>{t.regIssuingMinistryValue}</strong>
              </li>
              <li>
                <span>{t.regStatusLabel}</span>
                <span className="reg-status-badge">{t.regStatusVerified}</span>
              </li>
            </ul>
          </RegCard>

          {/* Card 2: FSSAI – STATE LICENSE */}
          <RegCard delay="0.15s">
            <div className="reg-header">
              <div className="reg-title-wrap">
                <span className="reg-sublabel">{t.regFoodSafetyStandards}</span>
                <h3>{t.regFssaiTitle}</h3>
              </div>
              <div className="reg-icon-box" title="FSSAI Food Safety">
                <svg viewBox="0 0 24 24" aria-hidden="true" width={24} height={24}>
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            <div className="reg-number-box">
              <span className="reg-number-label">{t.regLicenseNumberLabel}</span>
              <div className="reg-number-value">12426003001273</div>
            </div>

            <ul className="reg-details">
              <li>
                <span>{t.regLicenseCategory}</span>
                <strong>{t.regLicenseCategoryValue}</strong>
              </li>
              <li>
                <span>{t.regFeePaidThrough}</span>
                <strong>{t.regFeePaidThroughValue}</strong>
              </li>
              <li>
                <span>{t.regComplianceStatus}</span>
                <span className="reg-status-badge">{t.regComplianceStatusValue}</span>
              </li>
            </ul>
          </RegCard>
        </div>
      </div>
    </section>
  )
}
