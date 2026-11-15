'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function TopBar() {
  const { t } = useLanguage()

  return (
    <aside className="topbar">
      {t.topbar}
    </aside>
  )
}
