'use client'

import { useEffect, useRef, RefObject } from 'react'
import { isMotionAllowed, isTouchDevice } from './gsap'

interface TiltOptions {
  maxTilt?: number
  perspective?: number
  scale?: number
  speed?: number
  glare?: boolean
}

/**
 * Custom hook to add subtle 3D card tilt on mouse move.
 * Automatically disabled on touch screens and when reduced motion is preferred.
 */
export function useCard3DTilt<T extends HTMLElement = HTMLElement>(
  targetRef?: RefObject<T>,
  options: TiltOptions = {}
): RefObject<T> {
  const internalRef = useRef<T>(null)
  const cardRef = targetRef || internalRef

  const {
    maxTilt = 7,
    perspective = 1000,
    scale = 1.02,
    speed = 450,
  } = options

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    if (!isMotionAllowed() || isTouchDevice()) return

    let rafId: number | null = null

    // Ensure parent and element have 3D transform settings
    el.style.transformStyle = 'preserve-3d'
    el.style.transition = `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${speed}ms ease`

    const onMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const cx = rect.width / 2
        const cy = rect.height / 2

        const offsetX = (x - cx) / cx
        const offsetY = (y - cy) / cy

        const rotX = -offsetY * maxTilt
        const rotY = offsetX * maxTilt

        el.style.transform = `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`
      })
    }

    const onMouseEnter = () => {
      el.style.transition = 'transform 100ms ease-out, box-shadow 300ms ease'
    }

    const onMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId)
      el.style.transition = `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${speed}ms ease`
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    }

    el.addEventListener('mousemove', onMouseMove, { passive: true })
    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.style.transform = ''
      el.style.transition = ''
    }
  }, [cardRef, maxTilt, perspective, scale, speed])

  return cardRef
}
