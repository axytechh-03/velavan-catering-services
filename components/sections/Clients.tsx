'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useCard3DTilt } from '@/lib/motion/useCard3DTilt'
import { isMotionAllowed } from '@/lib/motion/gsap'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ClientItem {
  id: string
  name: string
  logo: string
  alt: string
  maxHeight?: number
}

const clientsData: ClientItem[] = [
  {
    id: 'kari-motor-speedway',
    name: 'Kari Motor Speedway',
    logo: '/images/clients/kari-motor-speedway.png',
    alt: 'Kari Motor Speedway',
    maxHeight: 52,
  },
  {
    id: 'meco-racing',
    name: 'MECO Racing',
    logo: '/images/clients/meco-racing.png',
    alt: 'MECO Racing',
    maxHeight: 62,
  },
  {
    id: 'ahura-racing',
    name: 'Ahura Racing',
    logo: '/images/clients/ahura-racing.png',
    alt: 'Ahura Racing',
    maxHeight: 50,
  },
  {
    id: 'dark-don-racing',
    name: 'Dark Don Racing',
    logo: '/images/clients/dark-don-racing.png',
    alt: 'Dark Don Racing',
    maxHeight: 46,
  },
  {
    id: 'racr',
    name: 'R.A.C.R.',
    logo: '/images/clients/racr.png',
    alt: 'Rajini Academy of Competitive Racing',
    maxHeight: 66,
  },
  {
    id: 'rppl',
    name: 'RPPL',
    logo: '/images/clients/rppl.png',
    alt: 'Racing Promotions Private Limited',
    maxHeight: 46,
  },
  {
    id: 'webber-india',
    name: 'Webber India',
    logo: '/images/clients/webber-india.png',
    alt: 'Webber India',
    maxHeight: 56,
  },
  {
    id: 'surabhi-farms',
    name: 'Surabhi Farms & Foods',
    logo: '/images/clients/surabhi-farms.png',
    alt: 'Surabhi Farms and Foods',
    maxHeight: 78,
  },
]

function ClientLogoCard({
  client,
  isDuplicate = false,
}: {
  client: ClientItem
  isDuplicate?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  useCard3DTilt(cardRef, { maxTilt: 6, scale: 1.03, speed: 350 })

  return (
    <div
      ref={cardRef}
      className="client-logo-card"
      title={isDuplicate ? undefined : client.name}
      aria-hidden={isDuplicate ? 'true' : undefined}
    >
      <img
        src={client.logo}
        alt={isDuplicate ? '' : client.alt}
        className="client-showcase-logo"
        style={{ maxHeight: `${client.maxHeight || 56}px` }}
        loading="lazy"
        draggable={false}
      />
    </div>
  )
}

export function Clients() {
  const { t } = useLanguage()
  const showcaseContainerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Current translation offset along X in pixels
  const xPosRef = useRef(0)
  const targetXRef = useRef(0)
  const isPausedRef = useRef(false)
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const singleSetWidthRef = useRef(0)

  // Drag & touch state
  const isDraggingRef = useRef(false)
  const startClientXRef = useRef(0)
  const startXPosRef = useRef(0)

  // Measure single sequence width (8 cards + 8 gaps)
  const measureTrack = useCallback(() => {
    if (!trackRef.current) return
    const firstSet = trackRef.current.children[0] as HTMLElement
    if (firstSet) {
      singleSetWidthRef.current = firstSet.offsetWidth
    }
  }, [])

  useEffect(() => {
    measureTrack()
    window.addEventListener('resize', measureTrack, { passive: true })
    return () => window.removeEventListener('resize', measureTrack)
  }, [measureTrack])

  // Continuous RAF animation loop
  useEffect(() => {
    const motionOk = isMotionAllowed()
    let animationFrameId: number

    const stepSpeed = 0.65 // pixels per frame at ~60fps (smooth elegant linear glide)

    const animate = () => {
      const halfWidth = singleSetWidthRef.current
      if (halfWidth > 0 && motionOk) {
        // If manual target is requested via arrows or drag, smoothly interpolate towards target
        if (Math.abs(targetXRef.current - xPosRef.current) > 0.5) {
          xPosRef.current += (targetXRef.current - xPosRef.current) * 0.1
        } else {
          // If not paused, advance continuous marquee leftward (negative X)
          if (!isPausedRef.current && !isDraggingRef.current) {
            xPosRef.current -= stepSpeed
            targetXRef.current = xPosRef.current
          }
        }

        // Seamless wrap when past single set width
        if (xPosRef.current <= -halfWidth) {
          xPosRef.current += halfWidth
          targetXRef.current += halfWidth
        } else if (xPosRef.current > 0) {
          xPosRef.current -= halfWidth
          targetXRef.current -= halfWidth
        }

        // Apply 3D transform without triggering layout reflow
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${xPosRef.current}px, 0, 0)`
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [])

  // Temporary pause with smooth resume after idle delay
  const pauseAutoMovement = (delayMs = 3000) => {
    isPausedRef.current = true
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    pauseTimerRef.current = setTimeout(() => {
      isPausedRef.current = false
    }, delayMs)
  }

  // Manual Arrow Navigation
  const handleNavClick = (direction: 'left' | 'right') => {
    const shiftAmount = 260 // Roughly one card + gap
    pauseAutoMovement(3500)

    if (direction === 'left') {
      // Move track rightward (shows previous logos)
      targetXRef.current += shiftAmount
    } else {
      // Move track leftward (shows next logos)
      targetXRef.current -= shiftAmount
    }
  }

  // Mouse hover pause
  const handleMouseEnter = () => {
    isPausedRef.current = true
  }

  const handleMouseLeave = () => {
    if (!isDraggingRef.current) {
      pauseAutoMovement(1200)
    }
  }

  // Mouse drag support
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    isPausedRef.current = true
    startClientXRef.current = e.clientX
    startXPosRef.current = xPosRef.current
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grabbing'
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const delta = e.clientX - startClientXRef.current
    xPosRef.current = startXPosRef.current + delta * 1.2
    targetXRef.current = xPosRef.current
  }

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      if (trackRef.current) {
        trackRef.current.style.cursor = 'grab'
      }
      pauseAutoMovement(2500)
    }
  }

  // Touch swipe support on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true
    isPausedRef.current = true
    startClientXRef.current = e.touches[0].clientX
    startXPosRef.current = xPosRef.current
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    const delta = e.touches[0].clientX - startClientXRef.current
    xPosRef.current = startXPosRef.current + delta * 1.2
    targetXRef.current = xPosRef.current
  }

  const handleTouchEnd = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      pauseAutoMovement(2500)
    }
  }

  return (
    <section className="section clients-section" id="clients">
      <div className="container">
        <div className="section-head reveal-up">
          <div className="eyebrow">
            {t.clientsEyebrow}
          </div>
          <h2 className="serif">
            {t.clientsTitle}
          </h2>
          <div className="gold-line center-line"></div>
        </div>

        {/* Continuous Showcase Frame (Strictly Zero Scrollbar, Zero Overflow) */}
        <div
          ref={showcaseContainerRef}
          className="client-showcase-frame"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="Continuous client logo showcase"
          tabIndex={0}
        >
          {/* Left Navigation Arrow */}
          <button
            type="button"
            className="client-nav-btn client-nav-prev"
            onClick={() => handleNavClick('left')}
            aria-label="View previous client logos"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Left Gradient Fade */}
          <div className="client-edge-fade client-edge-left" aria-hidden="true" />

          {/* Continuous Moving Track */}
          <div ref={trackRef} className="client-continuous-track">
            {/* Primary Logo Set */}
            <div className="client-logo-set">
              {clientsData.map((client) => (
                <ClientLogoCard
                  key={`primary-${client.id}`}
                  client={client}
                  isDuplicate={false}
                />
              ))}
            </div>

            {/* Seamless Duplicate Set for Infinite Marquee Loop */}
            <div className="client-logo-set" aria-hidden="true">
              {clientsData.map((client) => (
                <ClientLogoCard
                  key={`dupe-${client.id}`}
                  client={client}
                  isDuplicate={true}
                />
              ))}
            </div>
          </div>

          {/* Right Gradient Fade */}
          <div className="client-edge-fade client-edge-right" aria-hidden="true" />

          {/* Right Navigation Arrow */}
          <button
            type="button"
            className="client-nav-btn client-nav-next"
            onClick={() => handleNavClick('right')}
            aria-label="View next client logos"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Refined Client Note */}
        <p className="client-note reveal-up">
          {t.clientsNote}
        </p>
      </div>
    </section>
  )
}
