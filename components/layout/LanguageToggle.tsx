'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <button
      className="lang-btn"
      id="languageToggle"
      onClick={toggleLanguage}
      aria-label="Switch Language"
    >
      {t.langSwitchLabel}
    </button>
  )
}
