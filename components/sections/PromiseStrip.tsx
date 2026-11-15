'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function PromiseStrip() {
  const { t } = useLanguage()

  return (
    <div
      className="promise-strip"
      dangerouslySetInnerHTML={{ __html: t.promiseStrip }}
    />
  )
}
