'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function PromiseStrip() {
  const { t } = useLanguage()
  const rawText = t.promiseStrip || ''

  // Safely strip any legacy or injected HTML tags, then split on decorative separator
  const cleanText = rawText.replace(/<[^>]*>/g, '').trim()
  const segments = cleanText.split(/✦/).map((s) => s.trim()).filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  return (
    <div className="promise-strip">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>✦</span>}
          {segment}
        </React.Fragment>
      ))}
    </div>
  )
}
