'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { smoothScrollTo } from '@/lib/utils'
import { gsap, ScrollTrigger, isMotionAllowed, isTouchDevice } from '@/lib/motion/gsap'

export function Hero() {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 40 })

  // Desktop mouse parallax & subtle golden spotlight
  useEffect(() => {
    const heroEl = heroRef.current
    if (!heroEl || !isMotionAllowed() || isTouchDevice()) return

    let rafId: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const rect = heroEl.getBoundingClientRect()
        const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
        const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
        setSpotlightPos({ x: xPercent, y: yPercent })

        // Subtle content 3D depth shift
        if (contentRef.current) {
          const shiftX = (xPercent - 50) * 0.12
          const shiftY = (yPercent - 50) * 0.1
          contentRef.current.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`
        }
      })
    }

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId)
      setSpotlightPos({ x: 50, y: 40 })
      if (contentRef.current) {
        contentRef.current.style.transform = 'translate3d(0, 0, 0)'
        contentRef.current.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }

    heroEl.addEventListener('mousemove', handleMouseMove, { passive: true })
    heroEl.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      heroEl.removeEventListener('mousemove', handleMouseMove)
      heroEl.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // GSAP ScrollTrigger parallax scrub on hero background
  useEffect(() => {
    if (!isMotionAllowed() || !heroRef.current || !bgRef.current) return

    const ctx = gsap.context(() => {
      // Parallax scroll on background image
      gsap.to(bgRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Soft fade & slight upward drift of content on scroll
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          yPercent: -12,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="hero" id="home">
      {/* Background layer with parallax scrub */}
      <div ref={bgRef} className="hero-bg-layer" aria-hidden="true" />

      {/* Subtle ambient golden sheen / spotlight overlay */}
      <div
        className="hero-sheen-layer"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle 650px at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(196, 163, 101, 0.16) 0%, rgba(9, 37, 25, 0.04) 60%, transparent 100%)`,
        }}
      />

      <div ref={contentRef} className="container hero-content">
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
