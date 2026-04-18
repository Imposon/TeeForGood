// ============================================================
// Supabase Database Types - Generated from schema
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'user' | 'admin'
          charity_id: string | null
          charity_percentage: number
          subscription_status: 'active' | 'cancelled' | 'expired' | 'inactive' | 'past_due'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: 'user' | 'admin'
          charity_id?: string | null
          charity_percentage?: number
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'inactive' | 'past_due'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'user' | 'admin'
          charity_id?: string | null
          charity_percentage?: number
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'inactive' | 'past_due'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      charities: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          mission_statement: string | null
          category: string
          logo_url: string | null
          banner_url: string | null
          website_url: string | null
          is_featured: boolean
          is_active: boolean
          total_donations_received: number
          donation_count: number
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          mission_statement?: string | null
          category: string
          logo_url?: string | null
          banner_url?: string | null
          website_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          total_donations_received?: number
          donation_count?: number
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          mission_statement?: string | null
          category?: string
          logo_url?: string | null
          banner_url?: string | null
          website_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          total_donations_received?: number
          donation_count?: number
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan_type: 'monthly' | 'yearly'
          status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_type: 'monthly' | 'yearly'
          status?: 'active' | 'cancelled' | 'expired' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_type?: 'monthly' | 'yearly'
          status?: 'active' | 'cancelled' | 'expired' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          stripe_payment_intent_id: string | null
          stripe_invoice_id: string | null
          amount: number
          currency: string
          status: 'succeeded' | 'pending' | 'failed' | 'canceled'
          payment_method: string | null
          receipt_url: string | null
          failure_message: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          amount: number
          currency?: string
          status?: 'succeeded' | 'pending' | 'failed' | 'canceled'
          payment_method?: string | null
          receipt_url?: string | null
          failure_message?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          amount?: number
          currency?: string
          status?: 'succeeded' | 'pending' | 'failed' | 'canceled'
          payment_method?: string | null
          receipt_url?: string | null
          failure_message?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          course_name: string | null
          course_location: string | null
          played_date: string
          weather_conditions: string | null
          notes: string | null
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          course_name?: string | null
          course_location?: string | null
          played_date: string
          weather_conditions?: string | null
          notes?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          course_name?: string | null
          course_location?: string | null
          played_date?: string
          weather_conditions?: string | null
          notes?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      draws: {
        Row: {
          id: string
          draw_date: string
          month: number
          year: number
          winning_numbers: number[]
          total_pool: number
          status: 'pending' | 'open' | 'closed' | 'simulating' | 'published' | 'completed' | 'cancelled'
          rollover_amount: number
          rollover_from: string | null
          entry_count: number
          winner_count: number
          is_simulation: boolean
          published_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          draw_date: string
          month: number
          year: number
          winning_numbers: number[]
          total_pool?: number
          status?: 'pending' | 'open' | 'closed' | 'simulating' | 'published' | 'completed' | 'cancelled'
          rollover_amount?: number
          rollover_from?: string | null
          entry_count?: number
          winner_count?: number
          is_simulation?: boolean
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          draw_date?: string
          month?: number
          year?: number
          winning_numbers?: number[]
          total_pool?: number
          status?: 'pending' | 'open' | 'closed' | 'simulating' | 'published' | 'completed' | 'cancelled'
          rollover_amount?: number
          rollover_from?: string | null
          entry_count?: number
          winner_count?: number
          is_simulation?: boolean
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      draw_entries: {
        Row: {
          id: string
          draw_id: string
          user_id: string
          numbers: number[]
          matches: number
          match_5: boolean
          match_4: boolean
          match_3: boolean
          prize_amount: number
          is_winner: boolean
          entry_method: 'random' | 'weighted' | 'manual'
          created_at: string
        }
        Insert: {
          id?: string
          draw_id: string
          user_id: string
          numbers: number[]
          matches?: number
          match_5?: boolean
          match_4?: boolean
          match_3?: boolean
          prize_amount?: number
          is_winner?: boolean
          entry_method?: 'random' | 'weighted' | 'manual'
          created_at?: string
        }
        Update: {
          id?: string
          draw_id?: string
          user_id?: string
          numbers?: number[]
          matches?: number
          match_5?: boolean
          match_4?: boolean
          match_3?: boolean
          prize_amount?: number
          is_winner?: boolean
          entry_method?: 'random' | 'weighted' | 'manual'
          created_at?: string
        }
      }
      winnings: {
        Row: {
          id: string
          draw_id: string
          user_id: string
          entry_id: string
          prize_amount: number
          match_count: number
          status: 'pending' | 'proof_submitted' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'expired'
          proof_image_url: string | null
          proof_uploaded_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_receipt_url: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          draw_id: string
          user_id: string
          entry_id: string
          prize_amount: number
          match_count: number
          status?: 'pending' | 'proof_submitted' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'expired'
          proof_image_url?: string | null
          proof_uploaded_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_receipt_url?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          draw_id?: string
          user_id?: string
          entry_id?: string
          prize_amount?: number
          match_count?: number
          status?: 'pending' | 'proof_submitted' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'expired'
          proof_image_url?: string | null
          proof_uploaded_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_receipt_url?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string | null
          charity_id: string
          amount: number
          currency: string
          is_anonymous: boolean
          message: string | null
          is_recurring: boolean
          recurring_interval: 'monthly' | 'yearly' | null
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id: string | null
          receipt_url: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          charity_id: string
          amount: number
          currency?: string
          is_anonymous?: boolean
          message?: string | null
          is_recurring?: boolean
          recurring_interval?: 'monthly' | 'yearly' | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          receipt_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          charity_id?: string
          amount?: number
          currency?: string
          is_anonymous?: boolean
          message?: string | null
          is_recurring?: boolean
          recurring_interval?: 'monthly' | 'yearly' | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          receipt_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_scores: number
          best_score: number | null
          average_score: number | null
          total_donations: number
          total_winnings: number
          draws_entered: number
          draws_won: number
          current_streak: number
          longest_streak: number
          last_score_date: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          total_scores?: number
          best_score?: number | null
          average_score?: number | null
          total_donations?: number
          total_winnings?: number
          draws_entered?: number
          draws_won?: number
          current_streak?: number
          longest_streak?: number
          last_score_date?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_scores?: number
          best_score?: number | null
          average_score?: number | null
          total_donations?: number
          total_winnings?: number
          draws_entered?: number
          draws_won?: number
          current_streak?: number
          longest_streak?: number
          last_score_date?: string | null
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          ip_address: unknown | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      limit_user_scores: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_details?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
