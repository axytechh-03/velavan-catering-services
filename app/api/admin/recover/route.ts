import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getClientIp,
  hashIdentifier,
  incrementRateLimit,
} from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'axy.techh@gmail.com'
const RECOVERY_WINDOW_SECONDS = 60 * 60 // 60-minute window
const RECOVERY_IP_LIMIT = 3 // 3 recovery attempts per IP per hour
const GENERIC_SUCCESS_MESSAGE =
  'If an administrator account is associated with this request, password recovery instructions have been dispatched.'

/**
 * Resolves and validates the trusted canonical origin for password recovery redirects.
 *
 * Security Requirements (SEC-05 Remediation):
 * - Never trusts or incorporates request headers (Origin, Host, X-Forwarded-Host).
 * - Prioritizes server-configured process.env.NEXT_PUBLIC_SITE_URL (or SITE_URL / URL).
 * - Validates format strictly using the standard URL class.
 * - Rejects embedded credentials (username/password), query strings, hash fragments, and subpaths.
 * - In production, strictly enforces the 'https:' protocol.
 * - In production, fails closed (returns null) if the canonical URL is missing or invalid, triggering HTTP 503.
 * - In local development / test environments only, falls back safely to 'http://localhost:3000'.
 */
function getCanonicalOrigin(): string | null {
  const rawSiteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.URL ||
    ''
  ).trim()

  const isProduction = process.env.NODE_ENV === 'production'

  if (rawSiteUrl) {
    try {
      const parsed = new URL(rawSiteUrl)

      // Reject embedded credentials (e.g. https://user:pass@example.com)
      if (parsed.username || parsed.password) {
        console.error('[Recovery Security Error] Canonical site URL must not contain credentials.')
        return null
      }

      // Reject query strings or fragments
      if (parsed.search || parsed.hash) {
        console.error('[Recovery Security Error] Canonical site URL must not contain query strings or fragments.')
        return null
      }

      // Reject unexpected subpaths (e.g. https://example.com/subpath)
      if (parsed.pathname && parsed.pathname !== '/') {
        console.error('[Recovery Security Error] Canonical site URL must not contain a subpath.')
        return null
      }

      // In production, strictly enforce HTTPS protocol
      if (isProduction && parsed.protocol !== 'https:') {
        console.error('[Recovery Security Error] Canonical site URL in production must use https: protocol.')
        return null
      }

      // Enforce http: or https: protocol
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        console.error('[Recovery Security Error] Canonical site URL must use http: or https: protocol.')
        return null
      }

      // Return the validated origin without trailing slashes
      return parsed.origin
    } catch {
      console.error('[Recovery Security Error] Canonical site URL failed URL parsing.')
      return null
    }
  }

  // In production, missing canonical URL must fail closed
  if (isProduction) {
    console.error('[Recovery Configuration Error] Missing NEXT_PUBLIC_SITE_URL in production environment.')
    return null
  }

  // Non-production local development fallback
  return 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    let clientIp: string
    let ipKey: string
    try {
      clientIp = getClientIp(request.headers)
      ipKey = `recover:ip:${hashIdentifier(clientIp)}`
    } catch {
      return NextResponse.json(
        { success: false, message: 'Password recovery service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // 1. Atomic IP-based rate limiting check
    const rateLimit = await incrementRateLimit(ipKey, RECOVERY_WINDOW_SECONDS, RECOVERY_IP_LIMIT)

    // Fail-closed if database rate-limiting infrastructure is unavailable in production
    if (rateLimit.serviceUnavailable) {
      return NextResponse.json(
        { success: false, message: 'Password recovery service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // Enforce per-IP recovery limit
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many password recovery requests. Please wait before requesting another link.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || RECOVERY_WINDOW_SECONDS),
          },
        }
      )
    }

    // 2. Resolve trusted canonical origin (SEC-05: Eliminates Origin / Host Header Poisoning)
    const canonicalOrigin = getCanonicalOrigin()
    if (!canonicalOrigin) {
      return NextResponse.json(
        { success: false, message: 'Password recovery service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    const redirectTo = `${canonicalOrigin}/admin/reset-password`

    // 3. Verify Supabase configuration
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return NextResponse.json(
        { success: false, message: 'Authentication configuration is missing on the server.' },
        { status: 503 }
      )
    }

    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
      redirectTo,
    })

    if (error) {
      if (error.message?.toLowerCase().includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            message: 'Email request rate limit reached. Please check your existing inbox or wait a short while before requesting another link.',
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(RECOVERY_WINDOW_SECONDS),
            },
          }
        )
      }

      return NextResponse.json(
        { success: false, message: 'Unable to process recovery request. Please try again later.' },
        { status: 500 }
      )
    }

    // Enumeration-safe generic response
    return NextResponse.json({
      success: true,
      message: GENERIC_SUCCESS_MESSAGE,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Unable to process recovery request. Please try again later.' },
      { status: 500 }
    )
  }
}
