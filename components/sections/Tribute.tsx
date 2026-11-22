'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { useCard3DTilt } from '@/lib/motion/useCard3DTilt'

export function Tribute() {
  const { t } = useLanguage()
  const frameRef = useRef<HTMLDivElement>(null)
  useCard3DTilt(frameRef, { maxTilt: 6, scale: 1.03, speed: 400 })

  return (
    <section className="section tribute-section" id="tribute">
      <div className="container">
        <div className="tribute-composition">
          <div className="tribute-visual reveal-left">
            <div ref={frameRef} className="tribute-frame">
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
