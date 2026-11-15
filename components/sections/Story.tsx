'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { smoothScrollTo } from '@/lib/utils'

export function Story() {
  const { t } = useLanguage()

  return (
    <section className="section" id="story">
      <div className="container intro-grid">
        <div className="intro-visual reveal-left">
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1100&q=85"
            alt="Velavan Catering Food Presentation"
          />
          <div className="photo-caption">
            <strong>✦</strong>
            <small>{t.storyCaption}</small>
          </div>
        </div>
        <div className="intro-copy reveal-right">
          <div className="eyebrow">
            {t.storyEyebrow}
          </div>
          <h2 className="serif">
            {t.storyTitle}
          </h2>
          <div className="gold-line"></div>
          <p>{t.storyP1}</p>
          {t.storyP2 ? <p>{t.storyP2}</p> : null}
          <a
            className="btn btn-dark"
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              smoothScrollTo('contact')
            }}
          >
            {t.storyBtn}
          </a>
        </div>
      </div>
    </section>
  )
}
