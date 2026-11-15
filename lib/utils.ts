import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let isScrollingActive = false

export function smoothScrollTo(targetIdOrHref: string, customOffset?: number) {
  if (typeof window === 'undefined') return
  const id = targetIdOrHref.replace(/^#/, '')
  const element = document.getElementById(id)
  if (!element) return

  if (isScrollingActive) return
  isScrollingActive = true

  const header = document.querySelector('.header')
  const headerHeight = header ? header.getBoundingClientRect().height : 82
  const offset = customOffset ?? (headerHeight + 16)

  const elementTop = element.getBoundingClientRect().top
  const targetY = elementTop + window.pageYOffset - offset

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: targetY,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })

  try {
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `#${id}`)
    }
  } catch {}

  setTimeout(() => {
    isScrollingActive = false
  }, 600)
}

