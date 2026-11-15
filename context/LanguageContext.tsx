'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
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
  const [dynamicContent, setDynamicContent] = useState<any>(null)

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

  // Fetch dynamic CMS content
  useEffect(() => {
    async function loadDynamicContent() {
      try {
        const res = await fetch('/api/content?section=content')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            setDynamicContent(json.data)
          }
        }
      } catch (e) {
        // Fallback silently to static translations
      }
    }
    loadDynamicContent()
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

  const baseT = TRANSLATIONS[language]

  const t = useMemo(() => {
    if (!dynamicContent) return baseT
    const c = dynamicContent
    const isTa = language === 'ta'

    return {
      ...baseT,
      heroEyebrow: (isTa ? c.hero?.eyebrowTa : c.hero?.eyebrowEn) || baseT.heroEyebrow,
      heroTitle: (isTa ? c.hero?.titleTa : c.hero?.titleEn) || baseT.heroTitle,
      heroDesc: (isTa ? c.hero?.descTa : c.hero?.descEn) || baseT.heroDesc,
      heroBtnPlan: (isTa ? c.hero?.btnPlanTa : c.hero?.btnPlanEn) || baseT.heroBtnPlan,
      heroBtnWork: (isTa ? c.hero?.btnWorkTa : c.hero?.btnWorkEn) || baseT.heroBtnWork,
      heroNote: (isTa ? c.hero?.noteTa : c.hero?.noteEn) || baseT.heroNote,
      promiseStrip: c.hero?.promiseStrip || baseT.promiseStrip,

      storyEyebrow: (isTa ? c.story?.eyebrowTa : c.story?.eyebrowEn) || baseT.storyEyebrow,
      storyTitle: (isTa ? c.story?.titleTa : c.story?.titleEn) || baseT.storyTitle,
      storyP1: (isTa ? c.story?.p1Ta : c.story?.p1En) || baseT.storyP1,
      storyP2: (isTa ? c.story?.p2Ta : c.story?.p2En) || baseT.storyP2,
      storyCaption: (isTa ? c.story?.captionTa : c.story?.captionEn) || baseT.storyCaption,

      tributeEyebrow: (isTa ? c.tribute?.eyebrowTa : c.tribute?.eyebrowEn) || baseT.tributeEyebrow,
      tributeName: c.tribute?.name || baseT.tributeName,
      tributeTagline: (isTa ? c.tribute?.taglineTa : c.tribute?.taglineEn) || baseT.tributeTagline,
      tributeDesc: (isTa ? c.tribute?.descTa : c.tribute?.descEn) || baseT.tributeDesc,

      regEnterpriseTypeValue: c.registrations?.msmeEnterpriseType || baseT.regEnterpriseTypeValue,
      regStatusVerified: c.registrations?.msmeStatus || baseT.regStatusVerified,
      regLicenseCategoryValue: c.registrations?.fssaiCategory || baseT.regLicenseCategoryValue,
      regFeePaidThroughValue: c.registrations?.fssaiValidThrough || baseT.regFeePaidThroughValue,
      regComplianceStatusValue: c.registrations?.fssaiStatus || baseT.regComplianceStatusValue,
    }
  }, [baseT, dynamicContent, language])

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
