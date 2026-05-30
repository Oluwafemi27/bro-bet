export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          changes: Json | null
          created_at: string | null
          created_at_index: string | null
          entity_id: string | null
          entity_type: string
          error_message: string | null
          id: string
          ip_address: unknown
          status: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          changes?: Json | null
          created_at?: string | null
          created_at_index?: string | null
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          status?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          changes?: Json | null
          created_at?: string | null
          created_at_index?: string | null
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          status?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          admin_id: string
          can_approve: boolean | null
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          permission: string
          resource: string
        }
        Insert: {
          admin_id: string
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission: string
          resource: string
        }
        Update: {
          admin_id?: string
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: string
          resource?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity_at: string | null
          login_at: string | null
          logout_at: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          login_at?: string | null
          logout_at?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          login_at?: string | null
          logout_at?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      bet_settlements: {
        Row: {
          amount: number | null
          bet_id: string
          created_at: string
          id: string
          new_status: string
          previous_status: string
          settled_reason: string | null
        }
        Insert: {
          amount?: number | null
          bet_id: string
          created_at?: string
          id?: string
          new_status: string
          previous_status: string
          settled_reason?: string | null
        }
        Update: {
          amount?: number | null
          bet_id?: string
          created_at?: string
          id?: string
          new_status?: string
          previous_status?: string
          settled_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bet_settlements_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_settlements_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "vw_current_bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_settlements_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "vw_settled_bets"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          bet_type: string | null
          booking_code: string | null
          cashout_amount: number | null
          cashout_at: string | null
          created_at: string | null
          id: string
          potential_win: number
          selections: Json | null
          settled_at: string | null
          stake: number
          status: string | null
          updated_at: string | null
          user_id: string
          win_amount: number | null
        }
        Insert: {
          bet_type?: string | null
          booking_code?: string | null
          cashout_amount?: number | null
          cashout_at?: string | null
          created_at?: string | null
          id?: string
          potential_win: number
          selections?: Json | null
          settled_at?: string | null
          stake: number
          status?: string | null
          updated_at?: string | null
          user_id: string
          win_amount?: number | null
        }
        Update: {
          bet_type?: string | null
          booking_code?: string | null
          cashout_amount?: number | null
          cashout_at?: string | null
          created_at?: string | null
          id?: string
          potential_win?: number
          selections?: Json | null
          settled_at?: string | null
          stake?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
          win_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      betting_markets: {
        Row: {
          created_at: string
          id: string
          market_type: string
          match_id: string
          odds: number
          selection: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_type: string
          match_id: string
          odds: number
          selection: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          market_type?: string
          match_id?: string
          odds?: number
          selection?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "betting_markets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "live_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "betting_markets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "vw_live_matches_with_streams"
            referencedColumns: ["match_id"]
          },
        ]
      }
      compliance_logs: {
        Row: {
          action: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          log_type: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          log_type: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          log_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          created_at: string | null
          document_url: string | null
          id: string
          review_date: string | null
          review_notes: string | null
          reviewed_by: string | null
          status: string | null
          submission_date: string | null
          user_id: string
          verification_type: string
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          review_date?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string | null
          user_id: string
          verification_type: string
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          review_date?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string | null
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      live_matches: {
        Row: {
          away_score: number | null
          away_team: string
          created_at: string
          end_time: string | null
          external_data: Json | null
          home_score: number | null
          home_team: string
          id: string
          league: string | null
          match_id: string
          sport: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team: string
          created_at?: string
          end_time?: string | null
          external_data?: Json | null
          home_score?: number | null
          home_team: string
          id?: string
          league?: string | null
          match_id: string
          sport: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team?: string
          created_at?: string
          end_time?: string | null
          external_data?: Json | null
          home_score?: number | null
          home_team?: string
          id?: string
          league?: string | null
          match_id?: string
          sport?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          channel_title: string | null
          created_at: string
          embed_url: string | null
          external_id: string | null
          id: string
          is_active: boolean
          match_id: string
          stream_provider: string
          stream_url: string
          thumbnail_url: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          channel_title?: string | null
          created_at?: string
          embed_url?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          match_id: string
          stream_provider: string
          stream_url: string
          thumbnail_url?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          channel_title?: string | null
          created_at?: string
          embed_url?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          match_id?: string
          stream_provider?: string
          stream_url?: string
          thumbnail_url?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "live_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_streams_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "vw_live_matches_with_streams"
            referencedColumns: ["match_id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number | null
          bonus_balance: number | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_staff: boolean | null
          kyc_verified: boolean | null
          last_login: string | null
          login_count: number | null
          phone: string | null
          referral_code: string | null
          staff_department: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          bonus_balance?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_staff?: boolean | null
          kyc_verified?: boolean | null
          last_login?: string | null
          login_count?: number | null
          phone?: string | null
          referral_code?: string | null
          staff_department?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          bonus_balance?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_staff?: boolean | null
          kyc_verified?: boolean | null
          last_login?: string | null
          login_count?: number | null
          phone?: string | null
          referral_code?: string | null
          staff_department?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      risk_alerts: {
        Row: {
          alert_type: string
          bet_id: string | null
          created_at: string | null
          description: string
          details: Json | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          bet_id?: string | null
          created_at?: string | null
          description: string
          details?: Json | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          bet_id?: string | null
          created_at?: string | null
          description?: string
          details?: Json | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_alerts_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_alerts_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "vw_current_bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_alerts_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "vw_settled_bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_alerts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          recorded_at: string | null
          status: string | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          recorded_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          recorded_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          processing_notes: string | null
          reference: string | null
          rejected_reason: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
          bank_name: string | null
          account_number: string | null
          metadata: Json | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          processing_notes?: string | null
          reference?: string | null
          rejected_reason?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          bank_name?: string | null
          account_number?: string | null
          metadata?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          processing_notes?: string | null
          reference?: string | null
          rejected_reason?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          bank_name?: string | null
          account_number?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          account_number: string | null
          bank_name: string | null
          account_name: string | null
          provider: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          account_number?: string | null
          bank_name?: string | null
          account_name?: string | null
          provider?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          account_number?: string | null
          bank_name?: string | null
          account_name?: string | null
          provider?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_daily_stats: {
        Row: {
          active_users: number | null
          date: string | null
          losing_bets: number | null
          total_bets: number | null
          total_staked: number | null
          total_winnings_paid: number | null
          winning_bets: number | null
        }
        Relationships: []
      }
      vw_current_bets: {
        Row: {
          bet_type: string | null
          booking_code: string | null
          created_at: string | null
          hours_active: number | null
          id: string | null
          potential_win: number | null
          selections_count: number | null
          stake: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          bet_type?: string | null
          booking_code?: string | null
          created_at?: string | null
          hours_active?: never
          id?: string | null
          potential_win?: number | null
          selections_count?: never
          stake?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bet_type?: string | null
          booking_code?: string | null
          created_at?: string | null
          hours_active?: never
          id?: string | null
          potential_win?: number | null
          selections_count?: never
          stake?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_live_matches_with_streams: {
        Row: {
          away_score: number | null
          away_team: string | null
          home_score: number | null
          home_team: string | null
          league: string | null
          match_id: string | null
          sport: string | null
          start_time: string | null
          status: string | null
          streams: Json | null
        }
        Relationships: []
      }
      vw_settled_bets: {
        Row: {
          bet_type: string | null
          booking_code: string | null
          created_at: string | null
          id: string | null
          net_result: number | null
          potential_win: number | null
          selections_count: number | null
          settled_at: string | null
          stake: number | null
          status: string | null
          user_id: string | null
          win_amount: number | null
        }
        Insert: {
          bet_type?: string | null
          booking_code?: string | null
          created_at?: string | null
          id?: string | null
          net_result?: never
          potential_win?: number | null
          selections_count?: never
          settled_at?: string | null
          stake?: number | null
          status?: string | null
          user_id?: string | null
          win_amount?: number | null
        }
        Update: {
          bet_type?: string | null
          booking_code?: string | null
          created_at?: string | null
          id?: string | null
          net_result?: never
          potential_win?: number | null
          selections_count?: never
          settled_at?: string | null
          stake?: number | null
          status?: string | null
          user_id?: string | null
          win_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_user_bet_stats: {
        Row: {
          lost_bets: number | null
          net_profit: number | null
          pending_bets: number | null
          total_bets: number | null
          total_staked: number | null
          total_won: number | null
          user_id: string | null
          win_rate: number | null
          won_bets: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_betting_stats: {
        Args: { p_days?: number }
        Returns: {
          total_bets: number
          total_lost: number
          total_staked: number
          total_won: number
          win_rate: number
        }[]
      }
      get_live_matches: {
        Args: { p_sport?: string }
        Returns: {
          away_score: number
          away_team: string
          home_score: number
          home_team: string
          id: string
          sport: string
          start_time: string
          status: string
        }[]
      }
      get_upcoming_matches: {
        Args: { p_hours?: number; p_sport?: string }
        Returns: {
          away_team: string
          home_team: string
          id: string
          league: string
          sport: string
          start_time: string
        }[]
      }
      get_user_bet_history: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          bet_type: string
          booking_code: string
          created_at: string
          id: string
          potential_win: number
          selections_count: number
          settled_at: string
          stake: number
          status: string
          win_amount: number
        }[]
      }
      get_user_stats: {
        Args: never
        Returns: {
          active_users_today: number
          banned_users: number
          new_users_today: number
          total_users: number
          verified_users: number
        }[]
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      log_admin_activity: {
        Args: {
          p_action: string
          p_admin_id: string
          p_changes?: Json
          p_entity_id?: string
          p_entity_type: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const