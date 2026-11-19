import { createClient, SupabaseClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

/**
 * Security Safeguard:
 * This module contains elevated administrative database access via SUPABASE_SERVICE_ROLE_KEY.
 * It must NEVER be imported into or executed within browser / client-side components.
 */
if (typeof window !== 'undefined') {
  throw new Error('Security violation: lib/supabase-server can only be imported in server-side contexts.')
}

// Fallback loader for standalone Node scripts / background tasks
if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=')
        const k = trimmed.substring(0, idx).trim()
        let v = trimmed.substring(idx + 1).trim()
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1)
        }
        if (!process.env[k]) {
          process.env[k] = v
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const isSupabaseServerConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceRoleKey &&
  supabaseUrl !== 'https://your-project.supabase.co'
)

let cachedServerClient: SupabaseClient | null = null

/**
 * Returns a singleton Supabase admin client initialized with the SUPABASE_SERVICE_ROLE_KEY.
 * This client runs strictly in Node.js server-side environments (API routes, server actions, background tasks)
 * and bypasses RLS policies with elevated privileges.
 *
 * Never expose this client or the service role key to the browser.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('Security violation: getSupabaseServerClient cannot be called from client-side code.')
  }

  if (!isSupabaseServerConfigured) {
    throw new Error(
      'Supabase server client is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in environment variables.'
    )
  }

  if (!cachedServerClient) {
    cachedServerClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return cachedServerClient
}

/**
 * Direct instance export for server-side route handlers.
 * Throws early in development if accessed when not configured.
 */
export const supabaseServer = isSupabaseServerConfigured
  ? getSupabaseServerClient()
  : (null as unknown as SupabaseClient)
