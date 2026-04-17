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
      games: {
        Row: {
          black_accuracy: number | null
          black_funded: boolean
          black_id: string | null
          black_rating_after: number | null
          black_rating_before: number | null
          black_username: string | null
          created_at: string
          ended_at: string | null
          id: string
          increment_seconds: number
          invite_id: string | null
          live_fen: string | null
          pgn: string | null
          result: string | null
          stake_usdc: number
          started_at: string
          status: string
          termination: string | null
          time_control: string
          time_seconds: number
          turn: string | null
          white_accuracy: number | null
          white_funded: boolean
          white_id: string | null
          white_rating_after: number | null
          white_rating_before: number | null
          white_username: string | null
        }
        Insert: {
          black_accuracy?: number | null
          black_funded?: boolean
          black_id?: string | null
          black_rating_after?: number | null
          black_rating_before?: number | null
          black_username?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          increment_seconds?: number
          invite_id?: string | null
          live_fen?: string | null
          pgn?: string | null
          result?: string | null
          stake_usdc?: number
          started_at?: string
          status?: string
          termination?: string | null
          time_control?: string
          time_seconds?: number
          turn?: string | null
          white_accuracy?: number | null
          white_funded?: boolean
          white_id?: string | null
          white_rating_after?: number | null
          white_rating_before?: number | null
          white_username?: string | null
        }
        Update: {
          black_accuracy?: number | null
          black_funded?: boolean
          black_id?: string | null
          black_rating_after?: number | null
          black_rating_before?: number | null
          black_username?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          increment_seconds?: number
          invite_id?: string | null
          live_fen?: string | null
          pgn?: string | null
          result?: string | null
          stake_usdc?: number
          started_at?: string
          status?: string
          termination?: string | null
          time_control?: string
          time_seconds?: number
          turn?: string | null
          white_accuracy?: number | null
          white_funded?: boolean
          white_id?: string | null
          white_rating_after?: number | null
          white_rating_before?: number | null
          white_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_black_id_fkey"
            columns: ["black_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "games_white_id_fkey"
            columns: ["white_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      match_invites: {
        Row: {
          accepted_at: string | null
          code: string
          created_at: string
          creator_color: string
          creator_id: string
          expires_at: string
          game_id: string | null
          id: string
          increment_seconds: number
          stake_usdc: number
          status: string
          time_control: string
          time_seconds: number
        }
        Insert: {
          accepted_at?: string | null
          code: string
          created_at?: string
          creator_color?: string
          creator_id: string
          expires_at?: string
          game_id?: string | null
          id?: string
          increment_seconds?: number
          stake_usdc?: number
          status?: string
          time_control?: string
          time_seconds?: number
        }
        Update: {
          accepted_at?: string | null
          code?: string
          created_at?: string
          creator_color?: string
          creator_id?: string
          expires_at?: string
          game_id?: string | null
          id?: string
          increment_seconds?: number
          stake_usdc?: number
          status?: string
          time_control?: string
          time_seconds?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_usdc: number
          created_at: string
          from_address: string
          game_id: string | null
          id: string
          invite_id: string | null
          network: string
          raw_payload: Json | null
          status: string
          to_address: string
          tx_id: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount_usdc: number
          created_at?: string
          from_address: string
          game_id?: string | null
          id?: string
          invite_id?: string | null
          network: string
          raw_payload?: Json | null
          status?: string
          to_address: string
          tx_id: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount_usdc?: number
          created_at?: string
          from_address?: string
          game_id?: string | null
          id?: string
          invite_id?: string | null
          network?: string
          raw_payload?: Json | null
          status?: string
          to_address?: string
          tx_id?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          draws: number
          id: string
          losses: number
          platform_rating: number
          skill_tier: string
          total_earnings_usdc: number
          trust_score: number
          updated_at: string
          user_id: string
          username: string | null
          wallet_address: string | null
          wallet_verified_at: string | null
          wins: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          draws?: number
          id?: string
          losses?: number
          platform_rating?: number
          skill_tier?: string
          total_earnings_usdc?: number
          trust_score?: number
          updated_at?: string
          user_id: string
          username?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
          wins?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          draws?: number
          id?: string
          losses?: number
          platform_rating?: number
          skill_tier?: string
          total_earnings_usdc?: number
          trust_score?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
          wins?: number
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          id: string
          joined_at: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          current_players: number
          entry_fee_usdc: number
          format: string
          id: string
          max_players: number
          max_rating: number | null
          min_rating: number | null
          name: string
          prize_pool_usdc: number
          starts_at: string | null
          status: string
          time_control: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_players?: number
          entry_fee_usdc?: number
          format?: string
          id?: string
          max_players?: number
          max_rating?: number | null
          min_rating?: number | null
          name: string
          prize_pool_usdc?: number
          starts_at?: string | null
          status?: string
          time_control?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_players?: number
          entry_fee_usdc?: number
          format?: string
          id?: string
          max_players?: number
          max_rating?: number | null
          min_rating?: number | null
          name?: string
          prize_pool_usdc?: number
          starts_at?: string | null
          status?: string
          time_control?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
