'use client'

import React, { useEffect } from 'react'

export function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade, .reveal-stagger').forEach((el) => {
        el.classList.add('is-revealed')
      })
      return
    }

    // Configure Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            // Each section or element animates strictly ONCE during normal scrolling
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    // Observe all target reveal elements
    const observeElements = () => {
      const targets = document.querySelectorAll(
        '.reveal-up:not(.is-revealed), .reveal-left:not(.is-revealed), .reveal-right:not(.is-revealed), .reveal-fade:not(.is-revealed), .reveal-stagger:not(.is-revealed)'
      )
      targets.forEach((el) => observer.observe(el))
    }

    observeElements()

    // MutationObserver to observe elements dynamically rendered (e.g. Menu category shifts)
    const mutationObserver = new MutationObserver(() => {
      observeElements()
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return <>{children}</>
}
