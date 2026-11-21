import crypto from 'crypto'
import { getSupabaseServerClient, isSupabaseServerConfigured } from './supabase-server'

export interface RateLimitResult {
  allowed: boolean
  currentPoints: number
  remaining: number
  retryAfter: number // in seconds
  serviceUnavailable?: boolean
}

// Regex validation for IPv4 and IPv6 addresses
const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
const IPV6_REGEX = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,7}:$/

function isValidIp(ip: string): boolean {
  const trimmed = ip.trim()
  return IPV4_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed) || trimmed === '::1'
}

/**
 * Resolves the client IP address using a strict trust hierarchy.
 *
 * Trust Hierarchy:
 * 1. Netlify Edge: 'x-nf-client-connection-ip' is set by Netlify's CDN edge after
 *    terminating client TLS and cannot be forged by external clients.
 * 2. Proxy Chain: 'x-forwarded-for' (first entry) is validated strictly as a valid IP.
 * 3. Arbitrary headers like 'client-ip' are explicitly rejected to prevent spoofing.
 * 4. Production Fallback: If no verifiable IP is provided in production, returns
 *    'unknown-client-ip' so all unidentifiable requests share a single strict quota.
 * 5. Development Fallback: Defaults to '127.0.0.1'.
 */
export function getClientIp(headers: Headers): string {
  // 1. Primary trusted header on Netlify
  const netlifyIp = headers.get('x-nf-client-connection-ip')
  if (netlifyIp && isValidIp(netlifyIp)) {
    return netlifyIp.trim()
  }

  // 2. Secondary proxy header (first IP in chain)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    const candidate = forwardedFor.split(',')[0].trim()
    if (isValidIp(candidate)) {
      return candidate
    }
  }

  // 3. Fallback depending on environment
  if (process.env.NODE_ENV === 'production') {
    return 'unknown-client-ip'
  }

  return '127.0.0.1'
}

/**
 * Retrieves the secret salt for rate-limit key hashing.
 *
 * Security Requirements:
 * - Must be secret, stable, and server-side only.
 * - In production, RATE_LIMIT_SALT must be configured in environment variables.
 * - Public or predictable hardcoded fallbacks in production are strictly forbidden.
 */
function getRateLimitSalt(): string {
  const configuredSalt = process.env.RATE_LIMIT_SALT
  if (configuredSalt && configuredSalt.trim().length >= 16) {
    return configuredSalt.trim()
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[RateLimit Configuration Error] Missing or invalid RATE_LIMIT_SALT in production. ' +
        'A dedicated secret salt (minimum 16 characters) is required to prevent rainbow-table deanonymization.'
    )
    throw new Error('RATE_LIMIT_SALT is not configured in production.')
  }

  // Permitted solely in non-production environments
  return 'dev-only-local-salt-do-not-use-in-production'
}

/**
 * Hashes an identifier (e.g. IP address) using SHA-256 and the secret salt.
 * Ensures user personal data (raw IP addresses) are never stored in plaintext or logs.
 */
export function hashIdentifier(raw: string): string {
  const salt = getRateLimitSalt()
  return crypto
    .createHash('sha256')
    .update(`${raw.toLowerCase().trim()}:${salt}`)
    .digest('hex')
    .slice(0, 32)
}

// In-memory sliding-window fallback PERMITTED ONLY in explicitly identified non-production environments
interface MemoryBucket {
  points: number
  expireAt: number // epoch ms
}
const memoryBuckets = new Map<string, MemoryBucket>()

function incrementMemoryBucket(key: string, windowSeconds: number, maxPoints: number): RateLimitResult {
  const now = Date.now()
  let bucket = memoryBuckets.get(key)
  if (!bucket || bucket.expireAt <= now) {
    bucket = { points: 1, expireAt: now + windowSeconds * 1000 }
    memoryBuckets.set(key, bucket)
    return { allowed: true, currentPoints: 1, remaining: Math.max(0, maxPoints - 1), retryAfter: 0 }
  }
  bucket.points += 1
  if (bucket.points > maxPoints) {
    const retryAfter = Math.max(1, Math.ceil((bucket.expireAt - now) / 1000))
    return { allowed: false, currentPoints: bucket.points, remaining: 0, retryAfter }
  }
  return { allowed: true, currentPoints: bucket.points, remaining: Math.max(0, maxPoints - bucket.points), retryAfter: 0 }
}

function resetMemoryBucket(key: string): void {
  memoryBuckets.delete(key)
}

/**
 * Consumes an attempt and evaluates threshold atomically.
 *
 * Production Policy:
 * - Backed strictly by persistent Supabase PostgreSQL stored procedure.
 * - If Supabase or RPC is unavailable in production, logs a sanitized server diagnostic
 *   and returns { serviceUnavailable: true } to trigger a controlled HTTP 503.
 * - NEVER silently degrades to isolated in-memory counters in production.
 *
 * Development Policy:
 * - If Supabase is unconfigured, logs a warning and permits local memory fallback.
 */
export async function incrementRateLimit(
  key: string,
  windowSeconds: number,
  maxPoints: number
): Promise<RateLimitResult> {
  const isProd = process.env.NODE_ENV === 'production'

  if (isSupabaseServerConfigured) {
    try {
      const sb = getSupabaseServerClient()
      const { data, error } = await sb.rpc('increment_rate_limit', {
        p_key: key,
        p_window_seconds: windowSeconds,
        p_max_points: maxPoints,
      })

      if (!error && Array.isArray(data) && data.length > 0) {
        const row = data[0]
        return {
          allowed: Boolean(row.allowed),
          currentPoints: Number(row.current_points || 0),
          remaining: Number(row.remaining || 0),
          retryAfter: Number(row.retry_after_seconds || 0),
        }
      }

      if (error) {
        console.error('[RateLimit Error] Database increment_rate_limit failed:', error.message)
      }
    } catch (err: any) {
      console.error('[RateLimit Error] Database communication failure:', err?.message || 'Unknown error')
    }
  } else if (isProd) {
    console.error('[RateLimit Error] Supabase server client is not configured in production environment.')
  }

  // In production, database failure must fail closed (service unavailable), NEVER silent memory fallback
  if (isProd) {
    return {
      allowed: false,
      currentPoints: 0,
      remaining: 0,
      retryAfter: 60,
      serviceUnavailable: true,
    }
  }

  // Permitted only in local development / testing environments
  console.warn('[RateLimit] Non-production environment: using local in-memory rate limiter.')
  return incrementMemoryBucket(key, windowSeconds, maxPoints)
}

/**
 * Resets the rate-limit counter for a key upon successful authentication.
 */
export async function resetRateLimit(key: string): Promise<void> {
  resetMemoryBucket(key)

  if (isSupabaseServerConfigured) {
    try {
      const sb = getSupabaseServerClient()
      await sb.rpc('reset_rate_limit', { p_key: key })
    } catch (err: any) {
      console.warn('[RateLimit] Reset non-blocking failure:', err?.message || 'Unknown error')
    }
  }
}

/**
 * Performs bounded cleanup of expired rate limit entries.
 */
export async function cleanupExpiredRateLimits(maxDelete: number = 500): Promise<void> {
  if (isSupabaseServerConfigured) {
    try {
      const sb = getSupabaseServerClient()
      await sb.rpc('cleanup_expired_rate_limits', { p_max_delete: maxDelete })
    } catch (err: any) {
      console.warn('[RateLimit] Cleanup non-blocking failure:', err?.message || 'Unknown error')
    }
  }
}
