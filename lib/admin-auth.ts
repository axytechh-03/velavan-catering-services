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

    cookieStore.set('velavan_access_token', data.session.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: data.session.expires_in,
    })
    cookieStore.set('velavan_refresh_token', data.session.refresh_token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
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
  // Clear the old forgeable cookie so it cannot be reused.
  cookieStore.delete('velavan_admin_token')
}
