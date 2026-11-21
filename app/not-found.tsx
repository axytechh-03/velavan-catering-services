import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Home, PhoneCall } from 'lucide-react'

export const metadata = {
  title: '404 - Page Not Found | Velavan Catering Services',
  description: "The page you're looking for may have been moved or doesn't exist.",
}

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(180deg, #0d281e 0%, #081a13 100%)',
        color: '#faf8f1',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          background: 'rgba(21, 61, 45, 0.55)',
          border: '1.5px solid rgba(196, 163, 101, 0.35)',
          borderRadius: '20px',
          padding: '48px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Brand Mark Emblem */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '2px solid #c4a365',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Image
            src="/images/logo/logo.png"
            alt="Velavan Catering Logo"
            width={60}
            height={60}
            style={{ objectFit: 'contain' }}
            unoptimized
          />
        </div>

        {/* Eyebrow Label */}
        <div
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#c4a365',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Velavan Catering Services
        </div>

        {/* 404 Heading */}
        <h1
          style={{
            fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
            fontSize: '5.5rem',
            lineHeight: 1,
            margin: '0 0 10px',
            color: '#c4a365',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textShadow: '0 4px 18px rgba(196, 163, 101, 0.25)',
          }}
        >
          404
        </h1>

        {/* Main Message */}
        <h2
          style={{
            fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
            fontSize: '2rem',
            margin: '0 0 12px',
            color: '#faf8f1',
            fontWeight: 600,
          }}
        >
          Page Not Found
        </h2>

        {/* Gold Separator Line */}
        <div
          style={{
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #c4a365, transparent)',
            margin: '0 auto 18px',
          }}
        />

        {/* Supporting Message */}
        <p
          style={{
            fontSize: '0.96rem',
            color: 'rgba(250, 248, 241, 0.78)',
            lineHeight: 1.6,
            margin: '0 auto 32px',
            maxWidth: '440px',
          }}
        >
          The page you&apos;re looking for may have been moved or doesn&apos;t exist.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              color: '#0d281e',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(196, 163, 101, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Home size={16} />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/#contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(196, 163, 101, 0.1)',
              border: '1.5px solid #c4a365',
              color: '#faf8f1',
              padding: '11px 22px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            <PhoneCall size={15} style={{ color: '#c4a365' }} />
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
