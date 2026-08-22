/**
 * Mithila Jodi — Supabase Database Types
 * Generated shape matches the schema in packages/db/schema/
 * Run `supabase gen types typescript` to regenerate from actual DB.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AccountStatus = 'pending_verification' | 'active' | 'suspended' | 'banned' | 'deactivated' | 'deleted'
export type AccountRole = 'user' | 'moderator' | 'admin'
export type ConsentType = 'terms' | 'privacy' | 'data_processing' | 'marketing' | 'third_party_sharing'
export type ProfileFor = 'self' | 'son' | 'daughter' | 'sibling' | 'other'
export type ProfileGender = 'male' | 'female'
export type ProfileStatus = 'draft' | 'pending_review' | 'active' | 'deactivated' | 'deleted'
export type MembershipStatus = 'pending' | 'active' | 'expiring_soon' | 'grace' | 'expired' | 'cancelled' | 'refunded' | 'payment_failed'
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded'
export type InterestStatus = 'sent' | 'accepted' | 'declined' | 'withdrawn'
export type PhotoStatus = 'pending_moderation' | 'approved' | 'rejected' | 'deleted'
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired' | 'revoked'
export type BiodataLanguage = 'en' | 'hi' | 'mai' | 'sa'

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          mobile: string
          mobile_verified: boolean
          email: string | null
          email_verified: boolean
          account_status: AccountStatus
          role: AccountRole
          created_at: string
          updated_at: string
          deleted_at: string | null
          status_reason: string | null
          failed_login_attempts: number
          locked_until: string | null
        }
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          account_id: string
          profile_for: ProfileFor
          first_name: string
          last_name: string | null
          gender: ProfileGender
          dob: string
          religion: string
          caste: string | null
          sub_caste: string | null
          self_gotra: string | null
          maternal_gotra: string | null
          mool: string | null
          gram: string | null
          native_place_id: number | null
          current_loc_id: number | null
          job_loc_id: number | null
          education_level_id: number | null
          education_detail: string | null
          profession_id: number | null
          profession_detail: string | null
          employer: string | null
          height_cm: number | null
          diet: string | null
          smoking: string | null
          drinking: string | null
          about_me: string | null
          family_about: string | null
          profile_status: ProfileStatus
          discoverable: boolean
          profile_complete: number
          created_at: string
          updated_at: string
          activated_at: string | null
          deleted_at: string | null
          status_reason: string | null
          search_needs_rebuild: boolean
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      memberships: {
        Row: {
          id: string
          account_id: string
          payment_id: string | null
          plan: string
          status: MembershipStatus
          started_at: string | null
          expires_at: string | null
          grace_until: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>
      }
      payments: {
        Row: {
          id: string
          account_id: string
          membership_id: string | null
          gateway: string
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gateway_signature: string | null
          amount_paise: number
          currency: string
          plan: string
          status: PaymentStatus
          idempotency_key: string
          failure_code: string | null
          failure_description: string | null
          refund_id: string | null
          refunded_amount_paise: number | null
          refunded_at: string | null
          raw_webhook: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      plan_config: {
        Row: {
          plan: string
          price_paise: number
          duration_days: number
          grace_days: number
          expiring_soon_days: number
          label_en: string
          label_hi: string | null
          label_mai: string | null
          active: boolean
          updated_at: string
        }
        Insert: Database['public']['Tables']['plan_config']['Row']
        Update: Partial<Database['public']['Tables']['plan_config']['Row']>
      }
      otp_challenges: {
        Row: {
          id: string
          mobile: string
          otp_hash: string
          attempts: number
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['otp_challenges']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['otp_challenges']['Insert']>
      }
      account_sessions: {
        Row: {
          id: string
          account_id: string
          token_hash: string
          expires_at: string
          device_hash: string | null
          user_agent: string | null
          ip_address: string | null
          last_seen: string
          revoked_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['account_sessions']['Row'], 'id' | 'created_at' | 'last_seen'>
        Update: Partial<Database['public']['Tables']['account_sessions']['Insert']>
      }
      legal_consents: {
        Row: {
          id: string
          account_id: string
          type: ConsentType
          version: string
          consented: boolean
          ip_address: string | null
          user_agent: string | null
          created_at: string
          withdrawn_at: string | null
          withdrawal_reason: string | null
        }
        Insert: Omit<Database['public']['Tables']['legal_consents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['legal_consents']['Insert']>
      }
      interests: {
        Row: {
          id: string
          from_profile: string
          to_profile: string
          status: InterestStatus
          message: string | null
          sent_at: string
          responded_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['interests']['Row'], 'id' | 'sent_at'>
        Update: Partial<Database['public']['Tables']['interests']['Insert']>
      }
      profile_photos: {
        Row: {
          id: string
          profile_id: string
          storage_path: string
          is_primary: boolean
          display_order: number
          status: PhotoStatus
          moderation_note: string | null
          moderated_by: string | null
          moderated_at: string | null
          blurhash: string | null
          width_px: number | null
          height_px: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profile_photos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['profile_photos']['Insert']>
      }
      india_locations: {
        Row: {
          id: number
          parent_id: number | null
          level: 'country' | 'state' | 'district' | 'city' | 'town' | 'village'
          name_en: string
          name_hi: string | null
          name_mai: string | null
          state_code: string | null
          pincode: string | null
          is_mithila_region: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['india_locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['india_locations']['Insert']>
      }
      community_masters: {
        Row: {
          id: number
          type: string
          value: string
          label_en: string
          label_hi: string | null
          label_mai: string | null
          is_mithila: boolean
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['community_masters']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['community_masters']['Insert']>
      }
      education_levels: {
        Row: {
          id: number
          label_en: string
          label_hi: string | null
          label_mai: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['education_levels']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['education_levels']['Insert']>
      }
      professions: {
        Row: {
          id: number
          category: string
          label_en: string
          label_hi: string | null
          label_mai: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['professions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['professions']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_profile: {
        Args: { p_profile_id: string; min_level?: string }
        Returns: boolean
      }
      is_admin_or_moderator: {
        Args: Record<string, never>
        Returns: boolean
      }
      rebuild_profile_discoverable: {
        Args: { p_profile_id: string }
        Returns: void
      }
    }
    Enums: {
      account_status: AccountStatus
      account_role: AccountRole
      profile_for: ProfileFor
      profile_gender: ProfileGender
      profile_status: ProfileStatus
      membership_status: MembershipStatus
      payment_status: PaymentStatus
      interest_status: InterestStatus
      photo_status: PhotoStatus
    }
  }
}
