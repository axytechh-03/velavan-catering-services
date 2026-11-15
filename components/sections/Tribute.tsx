'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

export function Tribute() {
  const { t } = useLanguage()

  return (
    <section className="section tribute-section" id="tribute">
      <div className="container">
        <div className="tribute-composition">
          <div className="tribute-visual reveal-left">
            <div className="tribute-frame">
              <Image
                src="/images/founder/jayanthi.jpg"
                alt="Jayanthi — The Heart Behind Our Journey"
                width={200}
                height={250}
                className="tribute-img"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                priority
              />
            </div>
          </div>
          <div className="tribute-content reveal-right">
            <div className="eyebrow">
              {t.tributeEyebrow}
            </div>
            <h2 className="serif tribute-name">
              {t.tributeName}
            </h2>
            <div className="tribute-gold-line"></div>
            <p className="tribute-tagline">
              {t.tributeTagline}
            </p>
            <p className="tribute-desc">
              {t.tributeDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
