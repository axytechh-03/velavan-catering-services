'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TRANSLATIONS, Locale } from '@/data/translations'

interface LanguageContextType {
  language: Locale
  setLanguage: (lang: Locale) => void
  toggleLanguage: () => void
  t: (typeof TRANSLATIONS)['en'] | (typeof TRANSLATIONS)['ta']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('velavan_language') as Locale
    if (saved === 'en' || saved === 'ta') {
      setLanguageState(saved)
      if (saved === 'ta') {
        document.body.classList.add('tamil')
        document.documentElement.lang = 'ta'
      } else {
        document.body.classList.remove('tamil')
        document.documentElement.lang = 'en'
      }
    }
  }, [])

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('velavan_language', lang)
      if (lang === 'ta') {
        document.body.classList.add('tamil')
        document.documentElement.lang = 'ta'
      } else {
        document.body.classList.remove('tamil')
        document.documentElement.lang = 'en'
      }
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en')
  }

  const t = TRANSLATIONS[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
