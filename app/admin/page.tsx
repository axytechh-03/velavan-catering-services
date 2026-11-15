'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Check if session is already active; if yes, redirect straight to dashboard
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch('/api/admin/check')
        const data = await res.json()
        if (data.authenticated) {
          router.replace('/admin/dashboard')
          return
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setVerifying(false)
      }
    }
    checkExistingAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/admin/dashboard')
      } else {
        setErrorMessage(data.message || 'Invalid administrator password. Please try again.')
      }
    } catch (err) {
      setErrorMessage('Network error while authenticating. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d281e 0%, #153d2d 50%, #0d281e 100%)',
          color: '#faf8f1',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '2px solid rgba(196, 163, 101, 0.4)',
            borderTopColor: '#c4a365',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px',
          }}
        />
        <p style={{ color: '#c4a365', letterSpacing: '0.1em', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          Verifying Administrator Session...
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1a4d38 0%, #0d281e 65%, #081a14 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle decorative background circles */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196, 163, 101, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196, 163, 101, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(21, 61, 45, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(196, 163, 101, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 35px rgba(196, 163, 101, 0.12)',
          padding: '40px 32px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Crest Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              margin: '0 auto 18px',
              borderRadius: '50%',
              background: '#ffffff',
              padding: '6px',
              border: '2.5px solid #c4a365',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 16px rgba(196, 163, 101, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/images/logo/logo.png"
              alt="Velavan Catering Logo"
              width={72}
              height={72}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
            />
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c4a365',
              marginBottom: '6px',
            }}
          >
            MANAGEMENT PLATFORM
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
              fontSize: '1.85rem',
              fontWeight: 600,
              color: '#faf8f1',
              margin: '0 0 6px',
              letterSpacing: '0.02em',
            }}
          >
            Velavan Admin Portal
          </h1>

          <p
            style={{
              fontSize: '0.85rem',
              color: 'rgba(250, 248, 241, 0.72)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Secure Content Management System for Website Administration
          </p>

          <div
            style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #c4a365, transparent)',
              margin: '16px auto 0',
            }}
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fca5a5',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#e5ded1',
                marginBottom: '8px',
              }}
            >
              Administrator Username
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(196, 163, 101, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(10, 35, 25, 0.65)',
                  border: '1px solid rgba(196, 163, 101, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#c4a365')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(196, 163, 101, 0.3)')}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#e5ded1',
                }}
              >
                Security Password
              </label>
              <span style={{ fontSize: '0.72rem', color: '#c4a365' }}>
                Default: <code>velavan2026</code>
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(196, 163, 101, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  background: 'rgba(10, 35, 25, 0.65)',
                  border: '1px solid rgba(196, 163, 101, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#c4a365')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(196, 163, 101, 0.3)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250, 248, 241, 0.6)',
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

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
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
                <span>Access Admin Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Back link */}
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
            <span>HTTP-Only Session</span>
          </span>
        </div>
      </div>
    </div>
  )
}
