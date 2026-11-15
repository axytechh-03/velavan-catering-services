import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Velavan Catering Services | Administration Panel',
  description: 'Official standalone administrative portal for Velavan Catering Services.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="velavan-admin-app"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#faf8f1',
        color: '#1f2f25',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {children}
    </div>
  )
}
