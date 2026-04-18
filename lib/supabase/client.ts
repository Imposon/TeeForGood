import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Admin client for server-side operations (use carefully!)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Re-export Database type
export type { Database }

// Table Row Types
export type User = Database['public']['Tables']['users']['Row']
export type Charity = Database['public']['Tables']['charities']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Score = Database['public']['Tables']['scores']['Row']
export type Draw = Database['public']['Tables']['draws']['Row']
export type DrawEntry = Database['public']['Tables']['draw_entries']['Row']
export type Winnings = Database['public']['Tables']['winnings']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type UserStats = Database['public']['Tables']['user_stats']['Row']
