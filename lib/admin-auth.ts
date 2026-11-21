import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'axy.techh@gmail.com'

export async function verifyAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('velavan_access_token')?.value
    const refreshToken = cookieStore.get('velavan_refresh_token')?.value
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!accessToken || !url || !anonKey) return false

    const client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })

    const { data: { user }, error } = await client.auth.getUser(accessToken)
    if (!error && user) {
      return user.email?.toLowerCase() === ADMIN_EMAIL &&
        user.app_metadata?.role === 'admin'
    }

    // Attempt a server-side refresh once when the access token has expired.
    if (!refreshToken) return false
    const refreshClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error: refreshError } = await refreshClient.auth.refreshSession({
      refresh_token: refreshToken,
    })
    if (refreshError || !data.session || !data.user) return false
    if (data.user.email?.toLowerCase() !== ADMIN_EMAIL ||
        data.user.app_metadata?.role !== 'admin') return false

    const isHttps = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') === true
    const secure = process.env.NODE_ENV === 'production' && isHttps

    cookieStore.set('velavan_access_token', data.session.access_token, {
      httpOnly: true, secure,
      sameSite: 'lax', path: '/', maxAge: data.session.expires_in,
    })
    cookieStore.set('velavan_refresh_token', data.session.refresh_token, {
      httpOnly: true, secure,
      sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
    })
    return true
  } catch {
    return false
  }
}

export function clearAdminSession() {
  const cookieStore = cookies()
  cookieStore.delete('velavan_access_token')
  cookieStore.delete('velavan_refresh_token')
  cookieStore.delete('velavan_recovery_token')
  // Clear the old forgeable cookie so it cannot be reused.
  cookieStore.delete('velavan_admin_token')
}

/**
 * Resolves and strictly validates the trusted canonical application origin.
 *
 * Requirements:
 * - Prioritizes server-configured process.env.NEXT_PUBLIC_SITE_URL (or SITE_URL / URL).
 * - Strict URL parsing using the standard URL class.
 * - Rejects embedded credentials, query strings, fragments, and subpaths.
 * - In production, strictly enforces 'https:' protocol.
 * - In production, fails closed (returns null) if canonical site URL is missing or invalid.
 * - In non-production, safely falls back to request origin or 'http://localhost:3000'.
 */
function getCanonicalSiteOrigin(request?: Request): string | null {
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

      // Reject embedded credentials
      if (parsed.username || parsed.password) {
        return null
      }

      // Reject query strings or fragments
      if (parsed.search || parsed.hash) {
        return null
      }

      // Reject unexpected subpaths
      if (parsed.pathname && parsed.pathname !== '/') {
        return null
      }

      // In production, strictly enforce https: protocol
      if (isProduction && parsed.protocol !== 'https:') {
        return null
      }

      // Enforce http: or https:
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return null
      }

      return parsed.origin
    } catch {
      return null
    }
  }

  // In production, missing canonical URL must fail closed
  if (isProduction) {
    return null
  }

  // Non-production fallback (local development / testing)
  if (request) {
    try {
      return new URL(request.url).origin
    } catch {
      // Fallback below
    }
  }

  return 'http://localhost:3000'
}

/**
 * Validates that an incoming administrative request originates strictly from the
 * expected canonical application origin.
 *
 * Security Requirements (SEC09-03):
 * 1. Checks Fetch Metadata (Sec-Fetch-Site): rejects 'cross-site' requests immediately.
 * 2. Parses the Origin header strictly using the standard URL class.
 * 3. Compares parsed origin with the canonical site origin (scheme, host, port must match exactly).
 * 4. Rejects null, 'null', malformed, unexpected, or credential-bearing origins.
 * 5. Falls back to Referer strictly when Origin is absent.
 * 6. Fails closed in production if origin cannot be verified or canonical URL is missing.
 */
export function isValidAdminRequestOrigin(request: Request): boolean {
  // 1. Fetch Metadata check: reject cross-site browser requests immediately
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite === 'cross-site') {
    return false
  }

  // 2. Resolve canonical origin
  const canonicalOrigin = getCanonicalSiteOrigin(request)
  if (!canonicalOrigin) {
    // In production, failure to resolve trusted canonical origin must fail closed
    return false
  }

  // 3. Inspect Origin header
  const originHeader = request.headers.get('origin')

  if (originHeader) {
    // Explicitly reject null or 'null' (e.g. sandboxed iframes, file://, privacy extensions)
    if (originHeader === 'null') {
      return false
    }

    try {
      const parsedOrigin = new URL(originHeader)

      // Reject origins with credentials
      if (parsedOrigin.username || parsedOrigin.password) {
        return false
      }

      // Reject non-bare origins containing path, query parameters, or fragments
      if (
        parsedOrigin.pathname !== '/' ||
        parsedOrigin.search !== '' ||
        parsedOrigin.hash !== ''
      ) {
        return false
      }

      // Exact equality: scheme, host, and port must match canonical origin
      return parsedOrigin.origin === canonicalOrigin
    } catch {
      // Malformed Origin header
      return false
    }
  }

  // 4. Fallback to Referer only if Origin is absent
  const refererHeader = request.headers.get('referer')
  if (refererHeader) {
    try {
      const parsedReferer = new URL(refererHeader)

      // Reject referer with credentials
      if (parsedReferer.username || parsedReferer.password) {
        return false
      }

      // Exact equality on origin
      return parsedReferer.origin === canonicalOrigin
    } catch {
      // Malformed Referer header
      return false
    }
  }

  // 5. If both Origin and Referer are absent:
  // In production, state-changing requests missing both Origin and Referer must fail closed.
  // In development / test, allow only if NODE_ENV !== 'production'
  if (process.env.NODE_ENV === 'production') {
    return false
  }

  return true
}
