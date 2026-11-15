import { cookies } from 'next/headers'

export function verifyAdminAuth(): boolean {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('velavan_admin_token')
    return Boolean(token && token.value === 'authenticated')
  } catch (err) {
    return false
  }
}
