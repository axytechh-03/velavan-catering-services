'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function Values() {
  const { language } = useLanguage()

  const valuesData = [
    {
      icon: '✧',
      titleEn: 'Thoughtful Planning',
      titleTa: 'சிறந்த திட்டமிடல்',
      subEn: 'Every detail considered',
      subTa: 'ஒவ்வொரு விவரத்திலும் கவனம்',
    },
    {
      icon: '❖',
      titleEn: 'Grand Celebrations',
      titleTa: 'பிரம்மாண்ட விழாக்கள்',
      subEn: 'Events of every scale',
      subTa: 'அனைத்து அளவிலான நிகழ்வுகள்',
    },
    {
      icon: '♨',
      titleEn: 'Freshly Prepared',
      titleTa: 'புதிதாகத் தயாரித்தல்',
      subEn: 'Food made for the occasion',
      subTa: 'நிகழ்விற்கேற்ற உணவு',
    },
    {
      icon: '♡',
      titleEn: 'Warm Hospitality',
      titleTa: 'அன்பான விருந்தோம்பல்',
      subEn: 'Guests are our priority',
      subTa: 'விருந்தினர்களே எங்கள் முன்னுரிமை',
    },
  ]

  return (
    <section className="values">
      <div className="container values-grid">
        {valuesData.map((item, idx) => (
          <div
            key={idx}
            className="value-item reveal-up"
            style={{ transitionDelay: `${idx * 0.1}s` }}
          >
            <div className="value-icon">{item.icon}</div>
            <div className="value-title">
              {language === 'ta' ? item.titleTa : item.titleEn}
            </div>
            <div className="value-sub">
              {language === 'ta' ? item.subTa : item.subEn}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
