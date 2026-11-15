'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

export function BrandLoader() {
  const [mounted, setMounted] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setMounted(true)

    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setIsVisible(false)
      return
    }

    // Only show once per session to avoid unnecessary re-triggers
    try {
      if (sessionStorage.getItem('velavan_has_loaded')) {
        setIsVisible(false)
        return
      }
    } catch {
      // sessionStorage might be restricted in some iframes
    }

    // Dismiss when window is loaded or max safety timeout reached
    const handleLoaded = () => {
      setTimeout(() => {
        setIsFadingOut(true)
        setTimeout(() => {
          setIsVisible(false)
          try {
            sessionStorage.setItem('velavan_has_loaded', 'true')
          } catch {}
        }, 500)
      }, 700)
    }

    if (document.readyState === 'complete') {
      handleLoaded()
    } else {
      window.addEventListener('load', handleLoaded)
      // Safety timeout: never block longer than 1.4s
      const timer = setTimeout(handleLoaded, 1400)
      return () => {
        window.removeEventListener('load', handleLoaded)
        clearTimeout(timer)
      }
    }
  }, [])

  if (!mounted || !isVisible) return null

  return (
    <div
      className={`brand-loader-overlay ${isFadingOut ? 'fade-out' : ''}`}
      aria-hidden="true"
    >
      <div className="brand-loader-content">
        <div className="brand-loader-logo-wrap">
          {/* Animated decorative gold circular drawing ring */}
          <svg className="brand-loader-ring" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#c4a365"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Central Logo */}
          <div className="brand-loader-logo">
            <Image
              src="/images/logo/logo.png"
              alt="Velavan Catering Logo"
              width={64}
              height={64}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Brand Name & Subtitle */}
        <div className="brand-loader-text">
          <div className="brand-loader-title">VELAVAN</div>
          <div className="brand-loader-subtitle">CATERING SERVICES</div>
        </div>

        {/* Subtle decorative gold line */}
        <div className="brand-loader-line" />
      </div>
    </div>
  )
}
