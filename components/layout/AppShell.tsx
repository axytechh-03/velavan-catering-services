'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { BrandLoader } from '@/components/common/BrandLoader'
import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollAnimationProvider } from '@/components/common/ScrollAnimationProvider'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  // When browsing any administrative route (/admin or /admin/*),
  // completely isolate the view: DO NOT render the public brand loader,
  // top announcement bar, public header, or public footer.
  if (isAdmin) {
    return (
      <div id="admin-standalone-root" style={{ minHeight: '100vh', width: '100%' }}>
        {children}
      </div>
    )
  }

  // Public website renders full luxury chrome
  return (
    <ScrollAnimationProvider>
      <BrandLoader />
      <TopBar />
      <Header />
      <main id="main-content" style={{ minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
    </ScrollAnimationProvider>
  )
}
