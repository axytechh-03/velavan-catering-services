'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { smoothScrollTo } from '@/lib/utils'

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="hero" id="home">
      {/* Background layer with slow subtle zoom */}
      <div className="hero-bg-layer" aria-hidden="true" />

      <div className="container hero-content">
        <div className="eyebrow hero-anim-1">
          {t.heroEyebrow}
        </div>
        <h1 className="serif hero-anim-2">
          {t.heroTitle}
        </h1>
        <p className="hero-anim-3">
          {t.heroDesc}
        </p>
        <div className="hero-actions hero-anim-4">
          <a
            className="btn hero-btn-1"
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              smoothScrollTo('contact')
            }}
          >
            {t.heroBtnPlan}
          </a>
          <a
            className="btn btn-outline hero-btn-2"
            href="#gallery"
            onClick={(e) => {
              e.preventDefault()
              smoothScrollTo('gallery')
            }}
          >
            {t.heroBtnWork}
          </a>
        </div>
        <div className="hero-note hero-anim-5">
          {t.heroNote}
        </div>
      </div>
    </section>
  )
}
