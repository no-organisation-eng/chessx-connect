export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          email: string | null
          passkey_credential: Json | null
          lichess_username: string | null
          lichess_verified_at: string | null
          lichess_rating_bullet: number | null
          lichess_rating_blitz: number | null
          lichess_rating_rapid: number | null
          platform_rating: number
          skill_tier: string
          trust_score: number
          risk_level: string
          wallet_address: string | null
          chx_balance: number
          usdc_balance: number
          referral_code: string | null
          referred_by: string | null
          is_banned: boolean
          device_fingerprint: string[] | null
          last_active_at: string | null
          created_at: string
          updated_at: string
          display_name: string | null
          wins: number
          losses: number
          draws: number
          total_earnings_usdc: number
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          passkey_credential?: Json | null
          lichess_username?: string | null
          lichess_verified_at?: string | null
          lichess_rating_bullet?: number | null
          lichess_rating_blitz?: number | null
          lichess_rating_rapid?: number | null
          platform_rating?: number
          skill_tier?: string
          trust_score?: number
          risk_level?: string
          wallet_address?: string | null
          chx_balance?: number
          usdc_balance?: number
          referral_code?: string | null
          referred_by?: string | null
          is_banned?: boolean
          device_fingerprint?: string[] | null
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
          display_name?: string | null
          avatar_url?: string | null
          wins?: number
          losses?: number
          draws?: number
          total_earnings_usdc?: number
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          passkey_credential?: Json | null
          lichess_username?: string | null
          lichess_verified_at?: string | null
          lichess_rating_bullet?: number | null
          lichess_rating_blitz?: number | null
          lichess_rating_rapid?: number | null
          platform_rating?: number
          skill_tier?: string
          trust_score?: number
          risk_level?: string
          wallet_address?: string | null
          chx_balance?: number
          usdc_balance?: number
          referral_code?: string | null
          referred_by?: string | null
          is_banned?: boolean
          device_fingerprint?: string[] | null
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
          display_name?: string | null
          avatar_url?: string | null
          wins?: number
          losses?: number
          draws?: number
          total_earnings_usdc?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          white_user_id: string | null
          black_user_id: string | null
          time_control: string
          time_seconds: number
          increment_seconds: number
          stake_usdc: number
          escrow_tx_hash: string | null
          status: string
          result: string | null
          termination: string | null
          white_rating_before: number | null
          white_rating_after: number | null
          black_rating_before: number | null
          black_rating_after: number | null
          white_accuracy: number | null
          black_accuracy: number | null
          anticheat_flag: string | null
          tournament_id: string | null
          payout_tx_hash: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          pgn: string | null
          live_fen: string | null
          turn: string | null
          white_username: string | null
          black_username: string | null
          white_time_ms: number | null
          black_time_ms: number | null
          last_move_at: string | null
          pending_draw_from: string | null
          pending_takeback_from: string | null
          white_funded: boolean
          black_funded: boolean
        }
        Insert: {
          id?: string
          white_user_id?: string | null
          black_user_id?: string | null
          time_control: string
          time_seconds: number
          increment_seconds?: number
          stake_usdc?: number
          escrow_tx_hash?: string | null
          status?: string
          result?: string | null
          termination?: string | null
          white_rating_before?: number | null
          white_rating_after?: number | null
          black_rating_before?: number | null
          black_rating_after?: number | null
          white_accuracy?: number | null
          black_accuracy?: number | null
          anticheat_flag?: string | null
          tournament_id?: string | null
          payout_tx_hash?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          pgn?: string | null
          live_fen?: string | null
          turn?: string | null
          white_username?: string | null
          black_username?: string | null
          white_time_ms?: number | null
          black_time_ms?: number | null
          last_move_at?: string | null
          pending_draw_from?: string | null
          pending_takeback_from?: string | null
          white_funded?: boolean
          black_funded?: boolean
        }
        Update: {
          id?: string
          white_user_id?: string | null
          black_user_id?: string | null
          time_control?: string
          time_seconds?: number
          increment_seconds?: number
          stake_usdc?: number
          escrow_tx_hash?: string | null
          status?: string
          result?: string | null
          termination?: string | null
          white_rating_before?: number | null
          white_rating_after?: number | null
          black_rating_before?: number | null
          black_rating_after?: number | null
          white_accuracy?: number | null
          black_accuracy?: number | null
          anticheat_flag?: string | null
          tournament_id?: string | null
          payout_tx_hash?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          pgn?: string | null
          live_fen?: string | null
          turn?: string | null
          white_username?: string | null
          black_username?: string | null
          white_time_ms?: number | null
          black_time_ms?: number | null
          last_move_at?: string | null
          pending_draw_from?: string | null
          pending_takeback_from?: string | null
          white_funded?: boolean
          black_funded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "matches_white_user_id_fkey"
            columns: ["white_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_black_user_id_fkey"
            columns: ["black_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      moves: {
        Row: {
          id: number
          match_id: string
          ply: number
          san: string
          uci: string
          fen_after: string
          time_spent_ms: number
          clock_remaining_ms: number
          stockfish_eval: number | null
          is_best_move: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          match_id: string
          ply: number
          san: string
          uci: string
          fen_after: string
          time_spent_ms: number
          clock_remaining_ms: number
          stockfish_eval?: number | null
          is_best_move?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          match_id?: string
          ply?: number
          san?: string
          uci?: string
          fen_after?: string
          time_spent_ms?: number
          clock_remaining_ms?: number
          stockfish_eval?: number | null
          is_best_move?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moves_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
      ratings: {
        Row: {
          id: number
          user_id: string
          match_id: string
          time_control: string
          rating_before: number
          rating_after: number
          delta: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          match_id: string
          time_control: string
          rating_before: number
          rating_after: number
          delta: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          match_id?: string
          time_control?: string
          rating_before?: number
          rating_after?: number
          delta?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string | null
          currency: string
          amount: number
          direction: string | null
          match_id: string | null
          tournament_id: string | null
          on_chain_tx_hash: string | null
          status: string
          notes: string | null
          created_at: string
          raw_payload: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          type?: string | null
          currency?: string
          amount: number
          direction?: string | null
          match_id?: string | null
          tournament_id?: string | null
          on_chain_tx_hash?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          raw_payload?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string | null
          currency?: string
          amount?: number
          direction?: string | null
          match_id?: string | null
          tournament_id?: string | null
          on_chain_tx_hash?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          raw_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          device_info: Json | null
          ip_address: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          device_info?: Json | null
          ip_address?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          device_info?: Json | null
          ip_address?: string | null
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      match_invites: {
        Row: {
          id: string
          creator_user_id: string
          match_id: string | null
          code: string
          time_control: string
          time_seconds: number
          increment_seconds: number
          stake_usdc: number
          escrow_tx_hash: string | null
          status: string
          created_at: string
          expires_at: string
          is_private: boolean
          turn: string
        }
        Insert: {
          id?: string
          creator_user_id: string
          match_id?: string | null
          code?: string
          time_control: string
          time_seconds: number
          increment_seconds?: number
          stake_usdc?: number
          escrow_tx_hash?: string | null
          status?: string
          created_at?: string
          expires_at?: string
          is_private?: boolean
          turn?: string
        }
        Update: {
          id?: string
          creator_user_id?: string
          match_id?: string | null
          code?: string
          time_control?: string
          time_seconds?: number
          increment_seconds?: number
          stake_usdc?: number
          escrow_tx_hash?: string | null
          status?: string
          created_at?: string
          expires_at?: string
          is_private?: boolean
          turn?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_invites_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invites_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
      lichess_verifications: {
        Row: {
          id: string
          user_id: string
          lichess_username: string
          challenge_code: string
          method: string
          status: string
          verified_at: string | null
          attempts: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lichess_username: string
          challenge_code: string
          method: string
          status?: string
          verified_at?: string | null
          attempts?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lichess_username?: string
          challenge_code?: string
          method?: string
          status?: string
          verified_at?: string | null
          attempts?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lichess_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          source: string
          chx_amount: number
          match_id: string | null
          tournament_id: string | null
          daily_cap_date: string | null
          status: string
          distributed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source: string
          chx_amount: number
          match_id?: string | null
          tournament_id?: string | null
          daily_cap_date?: string | null
          status?: string
          distributed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source?: string
          chx_amount?: number
          match_id?: string | null
          tournament_id?: string | null
          daily_cap_date?: string | null
          status?: string
          distributed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      anticheat_flags: {
        Row: {
          id: string
          user_id: string
          match_id: string | null
          flag_type: string
          severity: string
          details: Json | null
          reviewed_by: string | null
          resolution: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id?: string | null
          flag_type: string
          severity: string
          details?: Json | null
          reviewed_by?: string | null
          resolution?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string | null
          flag_type?: string
          severity?: string
          details?: Json | null
          reviewed_by?: string | null
          resolution?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anticheat_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          channel: string
          title: string
          body: string
          payload: Json | null
          read_at: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          channel: string
          title: string
          body: string
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          channel?: string
          title?: string
          body?: string
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tournaments: {
        Row: {
          id: string
          name: string
          format: string
          time_control: string
          entry_fee_usdc: number
          prize_pool_usdc: number
          max_players: number | null
          min_rating: number | null
          max_rating: number | null
          status: string
          started_at: string | null
          ended_at: string | null
          payout_tx_hash: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          format: string
          time_control: string
          entry_fee_usdc?: number
          prize_pool_usdc?: number
          max_players?: number | null
          min_rating?: number | null
          max_rating?: number | null
          status?: string
          started_at?: string | null
          ended_at?: string | null
          payout_tx_hash?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          format?: string
          time_control?: string
          entry_fee_usdc?: number
          prize_pool_usdc?: number
          max_players?: number | null
          min_rating?: number | null
          max_rating?: number | null
          status?: string
          started_at?: string | null
          ended_at?: string | null
          payout_tx_hash?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          id: string
          tournament_id: string
          user_id: string
          seed: number | null
          score: number
          placement: number | null
          prize_usdc: number | null
          entry_tx_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          user_id: string
          seed?: number | null
          score?: number
          placement?: number | null
          prize_usdc?: number | null
          entry_tx_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          user_id?: string
          seed?: number | null
          score?: number
          placement?: number | null
          prize_usdc?: number | null
          entry_tx_hash?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      skill_tier_enum: "Beginner" | "Intermediate" | "Advanced" | "Pro"
      risk_level_enum: "low" | "medium" | "high" | "banned"
      match_status_enum: "pending" | "active" | "completed" | "aborted"
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
      skill_tier_enum: {
        Beginner: "Beginner",
        Intermediate: "Intermediate",
        Advanced: "Advanced",
        Pro: "Pro",
      },
      risk_level_enum: {
        low: "low",
        medium: "medium",
        high: "high",
        banned: "banned",
      },
      match_status_enum: {
        pending: "pending",
        active: "active",
        completed: "completed",
        aborted: "aborted",
      },
    },
  },
} as const
