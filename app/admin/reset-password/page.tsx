'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
  const [requestingNewLink, setRequestingNewLink] = useState(false)
  const [linkSentMessage, setLinkSentMessage] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Listen to Supabase Auth PASSWORD_RECOVERY and SIGNED_IN events
  useEffect(() => {
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session?.access_token) {
        try {
          const res = await fetch('/api/admin/reset-password/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
            }),
          })
          const data = await res.json()
          if (res.ok && data.success) {
            setHasActiveSession(true)
            setErrorMessage('')
            // Clean sensitive tokens and error parameters from address bar
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch {
          // Handled gracefully in session check
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Comprehensive recovery session detection and processing
  useEffect(() => {
    async function initSession() {
      // 1. Inspect URL hash for implicit-grant recovery tokens
      let hashAccessToken = ''
      let hashRefreshToken = ''
      let hashError = ''

      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash
        const hashParams = new URLSearchParams(hash)
        hashAccessToken = hashParams.get('access_token') || ''
        hashRefreshToken = hashParams.get('refresh_token') || ''
        hashError = hashParams.get('error_description') || hashParams.get('error') || ''
      }

      // If recovery token is in URL hash, process and sync it via dedicated session endpoint
      if (hashAccessToken) {
        try {
          const syncRes = await fetch('/api/admin/reset-password/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: hashAccessToken,
              refreshToken: hashRefreshToken,
            }),
          })
          const syncData = await syncRes.json()

          if (syncRes.ok && syncData.success) {
            setHasActiveSession(true)
            setErrorMessage('')
            // Remove sensitive tokens and hash from browser address bar
            window.history.replaceState(null, '', window.location.pathname)

            // Also synchronize client supabase instance if configured
            if (supabase) {
              supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken || '',
              }).catch(() => {})
            }

            setCheckingSession(false)
            return
          }
        } catch {
          // Proceed to check server-side cookies
        }
      }

      // 2. Validate existing HTTP-only cookie session via GET /api/admin/reset-password
      try {
        const res = await fetch('/api/admin/reset-password')
        const data = await res.json()

        if (data.authenticated) {
          setHasActiveSession(true)
          setErrorMessage('')
          // Clean stale query parameters from address bar if session is valid
          if (typeof window !== 'undefined' && window.location.search) {
            window.history.replaceState(null, '', window.location.pathname)
          }
          setCheckingSession(false)
          return
        }
      } catch {
        // Fall through to client instance check
      }

      // 3. Check client-side Supabase instance session
      if (supabase) {
        try {
          const { data: clientSession } = await supabase.auth.getSession()
          if (clientSession?.session?.access_token) {
            const bridgeRes = await fetch('/api/admin/reset-password/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: clientSession.session.access_token,
                refreshToken: clientSession.session.refresh_token,
              }),
            })
            const bridgeData = await bridgeRes.json()

            if (bridgeRes.ok && bridgeData.success) {
              setHasActiveSession(true)
              setErrorMessage('')
              window.history.replaceState(null, '', window.location.pathname)
              setCheckingSession(false)
              return
            }
          }
        } catch {
          // Proceed to error assignment
        }
      }

      // 4. If no valid session could be established, surface errors safely
      const urlError = searchParams.get('error_description') || searchParams.get('error') || hashError
      setHasActiveSession(false)

      if (urlError) {
        const decoded = decodeURIComponent(urlError)
        if (decoded.toLowerCase().includes('rate limit')) {
          setErrorMessage('Email request rate limit reached. Please check your existing inbox or wait a short while before requesting another link.')
        } else {
          setErrorMessage(decoded)
        }
      } else {
        setErrorMessage('No active password recovery session found or the recovery link has expired. Please request a new recovery link below.')
      }

      setCheckingSession(false)
    }

    initSession()
  }, [searchParams])

  // Cooldown countdown timer to prevent repeated automatic email requests
  useEffect(() => {
    if (cooldownSeconds <= 0) return

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownSeconds])

  // Countdown timer for automatic redirect after success
  useEffect(() => {
    if (redirectCountdown === null) return

    if (redirectCountdown <= 0) {
      router.replace('/admin')
      return
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearTimeout(timer)
  }, [redirectCountdown, router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLinkSentMessage('')

    // Validate minimum length requirement
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.')
      return
    }

    // Validate confirmation match
    if (password !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.')
      return
    }

    setSubmitting(true)

    try {
      // Execute secure server-side password update with cookie-based authorization.
      // POST /api/admin/reset-password is the single, authoritative place where updateUser({ password }) is executed.
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Sign out any lingering client-side session state for clean isolation
        if (supabase) {
          supabase.auth.signOut().catch(() => {})
        }
        setSuccessMessage('Password updated successfully! Redirecting you to the administrator sign-in page...')
        setRedirectCountdown(3)
      } else {
        setErrorMessage(data.message || 'Failed to update administrator password.')
      }
    } catch {
      setErrorMessage('Network error while updating password. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  // Request new recovery link with rate-limit cooldown protection
  const handleRequestNewRecoveryLink = async () => {
    if (cooldownSeconds > 0 || requestingNewLink) return

    setRequestingNewLink(true)
    setErrorMessage('')
    setLinkSentMessage('')

    try {
      const res = await fetch('/api/admin/recover', { method: 'POST' })
      const data = await res.json()

      if (res.ok && data.success) {
        setLinkSentMessage(data.message || 'Recovery instructions have been dispatched to axy.techh@gmail.com.')
        setCooldownSeconds(60) // Enforce 60-second cooldown
      } else {
        const errorText = data.message || 'Could not dispatch recovery email.'
        if (errorText.toLowerCase().includes('rate limit')) {
          setErrorMessage('Supabase email rate limit exceeded. Please wait a short while or check your spam/junk folder for existing emails.')
          setCooldownSeconds(60)
        } else {
          setErrorMessage(errorText)
        }
      }
    } catch {
      setErrorMessage('Network error while requesting recovery link. Please try again.')
    } finally {
      setRequestingNewLink(false)
    }
  }

  if (checkingSession) {
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
          Verifying Recovery Authorization...
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
          background:
            'linear-gradient(90deg, transparent 0%, #c4a365 25%, #dfc58e 50%, #c4a365 75%, transparent 100%)',
        }}
      />

      {/* Main Reset Password Card */}
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
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            Set New Password
          </h1>

          <p
            style={{
              fontSize: '0.86rem',
              color: 'rgba(250, 248, 241, 0.68)',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            Create a secure new password for administrator account{' '}
            <strong style={{ color: '#c4a365' }}>axy.techh@gmail.com</strong>.
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

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#a7f3d0',
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
            <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '2px', color: '#34d399' }} />
            <div>
              <div>{successMessage}</div>
              {redirectCountdown !== null && (
                <div style={{ marginTop: '4px', fontSize: '0.78rem', opacity: 0.85 }}>
                  Redirecting in {redirectCountdown}s...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link Sent Alert */}
        {linkSentMessage && (
          <div
            style={{
              background: 'rgba(196, 163, 101, 0.15)',
              border: '1px solid rgba(196, 163, 101, 0.4)',
              color: '#f5e6c8',
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
            <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '2px', color: '#c4a365' }} />
            <span>{linkSentMessage}</span>
          </div>
        )}

        {/* Form when active session exists */}
        {hasActiveSession && !successMessage && (
          <form
            onSubmit={handleResetPassword}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* New Password Field */}
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
                New Security Password
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
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            {/* Confirm Password Field */}
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
                Confirm New Password
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
                  <KeyRound size={17} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
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
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 6px 18px rgba(196, 163, 101, 0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                opacity: submitting ? 0.75 : 1,
              }}
              onMouseOver={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(196, 163, 101, 0.45)'
                }
              }}
              onMouseOut={(e) => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(196, 163, 101, 0.3)'
                }
              }}
            >
              {submitting ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* If no session exists or session expired, offer recovery options */}
        {!hasActiveSession && !successMessage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleRequestNewRecoveryLink}
              disabled={requestingNewLink || cooldownSeconds > 0}
              style={{
                padding: '13px 20px',
                background:
                  cooldownSeconds > 0
                    ? 'rgba(196, 163, 101, 0.35)'
                    : 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                color: '#0d281e',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: requestingNewLink || cooldownSeconds > 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: requestingNewLink ? 0.75 : 1,
                transition: 'background 0.2s',
              }}
            >
              {cooldownSeconds > 0 ? (
                <>
                  <Clock size={16} />
                  <span>Resend Available in {cooldownSeconds}s</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>{requestingNewLink ? 'Sending Recovery Link...' : 'Email New Recovery Link'}</span>
                </>
              )}
            </button>

            <Link
              href="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 18px',
                background: 'rgba(21, 61, 45, 0.5)',
                border: '1px solid rgba(196, 163, 101, 0.3)',
                borderRadius: '8px',
                color: '#faf8f1',
                textDecoration: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
                transition: 'background 0.2s',
              }}
            >
              <ArrowLeft size={16} />
              <span>Return to Admin Login</span>
            </Link>
          </div>
        )}

        {/* Success Action */}
        {successMessage && (
          <div style={{ marginTop: '14px' }}>
            <Link
              href="/admin"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                color: '#0d281e',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                textDecoration: 'none',
                boxShadow: '0 6px 18px rgba(196, 163, 101, 0.3)',
              }}
            >
              <span>Proceed to Login Now</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

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
            href="/admin"
            style={{
              color: '#c4a365',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={15} />
            <span>Administrator Sign In</span>
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
    </div>
  )
}

export default function StandaloneResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0d281e',
            color: '#c4a365',
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
