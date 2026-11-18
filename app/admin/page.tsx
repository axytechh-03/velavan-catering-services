'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  KeyRound,
} from 'lucide-react'

export default function StandaloneAdminLoginPage() {
  const router = useRouter()
  const [emailOrUsername, setEmailOrUsername] = useState('axy.techh@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyingSession, setVerifyingSession] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Verify whether an active admin session already exists
  useEffect(() => {
    async function checkActiveSession() {
      try {
        const res = await fetch('/api/admin/check')
        const data = await res.json()
        if (data.authenticated) {
          router.replace('/admin/dashboard')
          return
        }
      } catch (err) {
        console.error('Session verification error:', err)
      } finally {
        setVerifyingSession(false)
      }
    }
    checkActiveSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: emailOrUsername,
          email: emailOrUsername,
          password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Redirect cleanly to dashboard
        router.replace('/admin/dashboard')
      } else {
        setErrorMessage(data.message || 'Invalid administrator credentials. Access denied.')
      }
    } catch (err: any) {
      setErrorMessage('Authentication gateway error. Please verify server connection.')
    } finally {
      setLoading(false)
    }
  }

  if (verifyingSession) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d281e',
          color: '#c4a365',
          fontFamily: '"DM Sans", sans-serif',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            border: '3px solid rgba(196, 163, 101, 0.25)',
            borderTopColor: '#c4a365',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Verifying Security Credentials...
        </p>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0d281e',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(21, 61, 45, 0.9) 0%, transparent 45%),
          radial-gradient(circle at 85% 80%, rgba(196, 163, 101, 0.08) 0%, transparent 40%),
          linear-gradient(180deg, #091f17 0%, #0d281e 50%, #071711 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Subtle gold ornamental top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #c4a365 25%, #dfc58e 50%, #c4a365 75%, transparent 100%)',
        }}
      />

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#153d2d',
          border: '1px solid rgba(196, 163, 101, 0.35)',
          borderRadius: '16px',
          padding: '40px 36px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(196, 163, 101, 0.15)',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Card corner accent */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196, 163, 101, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(196, 163, 101, 0.6)',
              padding: '8px',
              marginBottom: '16px',
            }}
          >
            <Image
              src="/images/logo/logo.png"
              alt="Velavan Catering Services"
              width={64}
              height={64}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: '#c4a365',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Velavan Catering Services
          </div>

          <h1
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '1.95rem',
              fontWeight: 700,
              color: '#faf8f1',
              margin: '0 0 6px',
              letterSpacing: '0.02em',
            }}
          >
            Administration Portal
          </h1>

          <p
            style={{
              fontSize: '0.86rem',
              color: 'rgba(250, 248, 241, 0.68)',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            Sign in to manage catering bookings, menu items & live content.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(184, 59, 46, 0.15)',
              border: '1px solid rgba(184, 59, 46, 0.4)',
              color: '#ffb3a7',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '22px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.85rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px', color: '#ff8a7a' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email / Username field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#faf8f1',
                marginBottom: '8px',
                letterSpacing: '0.04em',
              }}
            >
              Administrator ID or Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#c4a365',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Mail size={17} />
              </div>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="axy.techh@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(13, 40, 30, 0.8)',
                  border: '1px solid rgba(196, 163, 101, 0.3)',
                  borderRadius: '8px',
                  color: '#faf8f1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#c4a365'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 163, 101, 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(196, 163, 101, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#faf8f1',
                  letterSpacing: '0.04em',
                }}
              >
                Security Password
              </label>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c4a365',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  opacity: 0.9,
                }}
              >
                Forgot credentials?
              </button>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#c4a365',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Lock size={17} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  background: 'rgba(13, 40, 30, 0.8)',
                  border: '1px solid rgba(196, 163, 101, 0.3)',
                  borderRadius: '8px',
                  color: '#faf8f1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#c4a365'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 163, 101, 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(196, 163, 101, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250, 248, 241, 0.55)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Secure Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              color: '#0d281e',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.92rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 18px rgba(196, 163, 101, 0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              opacity: loading ? 0.75 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(196, 163, 101, 0.45)'
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(196, 163, 101, 0.3)'
              }
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Card Footer Links */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(196, 163, 101, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#c4a365',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.2s',
            }}
          >
            <ArrowLeft size={15} />
            <span>Return to Public Website</span>
          </Link>

          <span
            style={{
              color: 'rgba(250, 248, 241, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Encrypted Session</span>
          </span>
        </div>
      </div>

      {/* Forgot Credentials Modal */}
      {showHelpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#153d2d',
              border: '1.5px solid #c4a365',
              borderRadius: '12px',
              padding: '28px',
              color: '#faf8f1',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHelpModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'rgba(250, 248, 241, 0.6)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(196, 163, 101, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c4a365',
                }}
              >
                <KeyRound size={22} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  color: '#c4a365',
                }}
              >
                Administrator Access Credentials
              </h3>
            </div>

            <div style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'rgba(250, 248, 241, 0.85)' }}>
              <p style={{ margin: '0 0 12px' }}>
                For security reasons, administrator account registration is strictly closed to the general public.
              </p>
              <div
                style={{
                  background: 'rgba(13, 40, 30, 0.8)',
                  border: '1px solid rgba(196, 163, 101, 0.25)',
                  padding: '14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#c4a365', fontWeight: 600, marginBottom: '6px' }}>
                  DEFAULT INITIAL CREDENTIALS:
                </div>
                <div>Username: <strong style={{ color: '#fff' }}>admin</strong></div>
                <div>Default Password: <strong style={{ color: '#fff' }}>velavan2026</strong></div>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(250, 248, 241, 0.65)' }}>
                To modify or rotate the administrator password, sign in and navigate to{' '}
                <strong style={{ color: '#c4a365' }}>Admin Settings</strong> in the sidebar, or update the{' '}
                <code>ADMIN_PASSWORD</code> environment variable in your hosting dashboard.
              </p>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  padding: '8px 18px',
                  background: '#c4a365',
                  color: '#0d281e',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
