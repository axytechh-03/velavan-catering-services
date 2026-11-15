import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
)

// Safe Supabase client that doesn't crash during build or when unconfigured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface EnquirySubmission {
  id?: string
  name: string
  phone: string
  email?: string
  event_type: string
  other_event_type?: string
  guest_count: number
  event_date: string
  event_time?: string
  location: string
  special_requests?: string
  status?: 'new' | 'contacted' | 'confirmed' | 'cancelled'
  created_at?: string
}

export interface MenuItemData {
  id: string
  category_id: string
  category_en: string
  category_ta: string
  name_en: string
  name_ta: string
  description_en?: string
  description_ta?: string
  badge?: string
  is_veg: boolean
  is_featured: boolean
}
