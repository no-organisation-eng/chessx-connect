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
      anticheat_flags: {
        Row: {
          created_at: string
          details: Json | null
          flag_type: string
          id: string
          match_id: string | null
          resolution: string | null
          reviewed_by: string | null
          severity: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          flag_type: string
          id?: string
          match_id?: string | null
          resolution?: string | null
          reviewed_by?: string | null
          severity: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          flag_type?: string
          id?: string
          match_id?: string | null
          resolution?: string | null
          reviewed_by?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anticheat_flags_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anticheat_flags_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anticheat_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anticheat_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anticheat_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anticheat_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lichess_verifications: {
        Row: {
          attempts: number
          challenge_code: string
          created_at: string
          id: string
          lichess_username: string
          method: string
          status: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          challenge_code: string
          created_at?: string
          id?: string
          lichess_username: string
          method: string
          status?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          challenge_code?: string
          created_at?: string
          id?: string
          lichess_username?: string
          method?: string
          status?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lichess_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lichess_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
      matches: {
        Row: {
          anticheat_flag: string | null
          black_accuracy: number | null
          black_funded: boolean
          black_rating_after: number | null
          black_rating_before: number | null
          black_time_ms: number | null
          black_user_id: string | null
          black_username: string | null
          created_at: string
          ended_at: string | null
          escrow_tx_hash: string | null
          id: string
          increment_seconds: number
          invite_id: string | null
          last_move_at: string | null
          live_fen: string | null
          payout_tx_hash: string | null
          pending_draw_from: string | null
          pending_takeback_from: string | null
          pgn: string | null
          result: string | null
          stake_usdc: number
          started_at: string
          status: string
          termination: string | null
          time_control: string
          time_seconds: number
          tournament_id: string | null
          turn: string | null
          white_accuracy: number | null
          white_funded: boolean
          white_rating_after: number | null
          white_rating_before: number | null
          white_time_ms: number | null
          white_user_id: string | null
          white_username: string | null
        }
        Insert: {
          anticheat_flag?: string | null
          black_accuracy?: number | null
          black_funded?: boolean
          black_rating_after?: number | null
          black_rating_before?: number | null
          black_time_ms?: number | null
          black_user_id?: string | null
          black_username?: string | null
          created_at?: string
          ended_at?: string | null
          escrow_tx_hash?: string | null
          id?: string
          increment_seconds?: number
          invite_id?: string | null
          last_move_at?: string | null
          live_fen?: string | null
          payout_tx_hash?: string | null
          pending_draw_from?: string | null
          pending_takeback_from?: string | null
          pgn?: string | null
          result?: string | null
          stake_usdc?: number
          started_at?: string
          status?: string
          termination?: string | null
          time_control?: string
          time_seconds?: number
          tournament_id?: string | null
          turn?: string | null
          white_accuracy?: number | null
          white_funded?: boolean
          white_rating_after?: number | null
          white_rating_before?: number | null
          white_time_ms?: number | null
          white_user_id?: string | null
          white_username?: string | null
        }
        Update: {
          anticheat_flag?: string | null
          black_accuracy?: number | null
          black_funded?: boolean
          black_rating_after?: number | null
          black_rating_before?: number | null
          black_time_ms?: number | null
          black_user_id?: string | null
          black_username?: string | null
          created_at?: string
          ended_at?: string | null
          escrow_tx_hash?: string | null
          id?: string
          increment_seconds?: number
          invite_id?: string | null
          last_move_at?: string | null
          live_fen?: string | null
          payout_tx_hash?: string | null
          pending_draw_from?: string | null
          pending_takeback_from?: string | null
          pgn?: string | null
          result?: string | null
          stake_usdc?: number
          started_at?: string
          status?: string
          termination?: string | null
          time_control?: string
          time_seconds?: number
          tournament_id?: string | null
          turn?: string | null
          white_accuracy?: number | null
          white_funded?: boolean
          white_rating_after?: number | null
          white_rating_before?: number | null
          white_time_ms?: number | null
          white_user_id?: string | null
          white_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_black_id_fkey"
            columns: ["black_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "games_black_id_fkey"
            columns: ["black_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "games_white_id_fkey"
            columns: ["white_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "games_white_id_fkey"
            columns: ["white_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      moves: {
        Row: {
          clock_remaining_ms: number
          created_at: string
          fen_after: string
          id: number
          is_best_move: boolean | null
          match_id: string
          ply: number
          san: string
          stockfish_eval: number | null
          time_spent_ms: number
          uci: string
        }
        Insert: {
          clock_remaining_ms: number
          created_at?: string
          fen_after: string
          id?: number
          is_best_move?: boolean | null
          match_id: string
          ply: number
          san: string
          stockfish_eval?: number | null
          time_spent_ms: number
          uci: string
        }
        Update: {
          clock_remaining_ms?: number
          created_at?: string
          fen_after?: string
          id?: number
          is_best_move?: boolean | null
          match_id?: string
          ply?: number
          san?: string
          stockfish_eval?: number | null
          time_spent_ms?: number
          uci?: string
        }
        Relationships: [
          {
            foreignKeyName: "moves_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moves_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          payload: Json | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          created_at: string
          delta: number
          id: number
          match_id: string
          rating_after: number
          rating_before: number
          time_control: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: number
          match_id: string
          rating_after: number
          rating_before: number
          time_control: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: number
          match_id?: string
          rating_after?: number
          rating_before?: number
          time_control?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          chx_amount: number
          created_at: string
          daily_cap_date: string | null
          distributed_at: string | null
          id: string
          match_id: string | null
          source: string
          status: string
          tournament_id: string | null
          user_id: string
        }
        Insert: {
          chx_amount: number
          created_at?: string
          daily_cap_date?: string | null
          distributed_at?: string | null
          id?: string
          match_id?: string | null
          source: string
          status?: string
          tournament_id?: string | null
          user_id: string
        }
        Update: {
          chx_amount?: number
          created_at?: string
          daily_cap_date?: string | null
          distributed_at?: string | null
          id?: string
          match_id?: string | null
          source?: string
          status?: string
          tournament_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          entry_tx_hash: string | null
          id: string
          joined_at: string
          placement: number | null
          prize_usdc: number | null
          score: number
          seed: number | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          entry_tx_hash?: string | null
          id?: string
          joined_at?: string
          placement?: number | null
          prize_usdc?: number | null
          score?: number
          seed?: number | null
          tournament_id: string
          user_id: string
        }
        Update: {
          entry_tx_hash?: string | null
          id?: string
          joined_at?: string
          placement?: number | null
          prize_usdc?: number | null
          score?: number
          seed?: number | null
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          direction: string | null
          from_address: string
          game_id: string | null
          id: string
          invite_id: string | null
          network: string
          notes: string | null
          on_chain_tx_hash: string | null
          on_chain_tx_hash_old: string
          raw_payload: Json | null
          status: string
          to_address: string
          type: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          direction?: string | null
          from_address: string
          game_id?: string | null
          id?: string
          invite_id?: string | null
          network: string
          notes?: string | null
          on_chain_tx_hash?: string | null
          on_chain_tx_hash_old: string
          raw_payload?: Json | null
          status?: string
          to_address: string
          type?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          direction?: string | null
          from_address?: string
          game_id?: string | null
          id?: string
          invite_id?: string | null
          network?: string
          notes?: string | null
          on_chain_tx_hash?: string | null
          on_chain_tx_hash_old?: string
          raw_payload?: Json | null
          status?: string
          to_address?: string
          type?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          chx_balance: number
          created_at: string
          device_fingerprint: string[] | null
          display_name: string | null
          draws: number
          email: string | null
          id: string
          is_banned: boolean
          last_active_at: string | null
          lichess_rating_blitz: number | null
          lichess_rating_bullet: number | null
          lichess_rating_rapid: number | null
          lichess_username: string | null
          lichess_verified_at: string | null
          losses: number
          passkey_credential: Json | null
          platform_rating: number
          referral_code: string | null
          referred_by: string | null
          risk_level: string
          skill_tier: string
          total_earnings_usdc: number
          trust_score: number
          updated_at: string
          usdc_balance: number
          user_id: string
          username: string | null
          wallet_address: string | null
          wallet_verified_at: string | null
          wins: number
        }
        Insert: {
          avatar_url?: string | null
          chx_balance?: number
          created_at?: string
          device_fingerprint?: string[] | null
          display_name?: string | null
          draws?: number
          email?: string | null
          id?: string
          is_banned?: boolean
          last_active_at?: string | null
          lichess_rating_blitz?: number | null
          lichess_rating_bullet?: number | null
          lichess_rating_rapid?: number | null
          lichess_username?: string | null
          lichess_verified_at?: string | null
          losses?: number
          passkey_credential?: Json | null
          platform_rating?: number
          referral_code?: string | null
          referred_by?: string | null
          risk_level?: string
          skill_tier?: string
          total_earnings_usdc?: number
          trust_score?: number
          updated_at?: string
          usdc_balance?: number
          user_id: string
          username?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
          wins?: number
        }
        Update: {
          avatar_url?: string | null
          chx_balance?: number
          created_at?: string
          device_fingerprint?: string[] | null
          display_name?: string | null
          draws?: number
          email?: string | null
          id?: string
          is_banned?: boolean
          last_active_at?: string | null
          lichess_rating_blitz?: number | null
          lichess_rating_bullet?: number | null
          lichess_rating_rapid?: number | null
          lichess_username?: string | null
          lichess_verified_at?: string | null
          losses?: number
          passkey_credential?: Json | null
          platform_rating?: number
          referral_code?: string | null
          referred_by?: string | null
          risk_level?: string
          skill_tier?: string
          total_earnings_usdc?: number
          trust_score?: number
          updated_at?: string
          usdc_balance?: number
          user_id?: string
          username?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      games: {
        Row: {
          anticheat_flag: string | null
          black_accuracy: number | null
          black_funded: boolean | null
          black_id: string | null
          black_rating_after: number | null
          black_rating_before: number | null
          black_time_ms: number | null
          black_username: string | null
          created_at: string | null
          ended_at: string | null
          escrow_tx_hash: string | null
          id: string | null
          increment_seconds: number | null
          invite_id: string | null
          last_move_at: string | null
          live_fen: string | null
          payout_tx_hash: string | null
          pending_draw_from: string | null
          pending_takeback_from: string | null
          pgn: string | null
          result: string | null
          stake_usdc: number | null
          started_at: string | null
          status: string | null
          termination: string | null
          time_control: string | null
          time_seconds: number | null
          tournament_id: string | null
          turn: string | null
          white_accuracy: number | null
          white_funded: boolean | null
          white_id: string | null
          white_rating_after: number | null
          white_rating_before: number | null
          white_time_ms: number | null
          white_username: string | null
        }
        Insert: {
          anticheat_flag?: string | null
          black_accuracy?: number | null
          black_funded?: boolean | null
          black_id?: string | null
          black_rating_after?: number | null
          black_rating_before?: number | null
          black_time_ms?: number | null
          black_username?: string | null
          created_at?: string | null
          ended_at?: string | null
          escrow_tx_hash?: string | null
          id?: string | null
          increment_seconds?: number | null
          invite_id?: string | null
          last_move_at?: string | null
          live_fen?: string | null
          payout_tx_hash?: string | null
          pending_draw_from?: string | null
          pending_takeback_from?: string | null
          pgn?: string | null
          result?: string | null
          stake_usdc?: number | null
          started_at?: string | null
          status?: string | null
          termination?: string | null
          time_control?: string | null
          time_seconds?: number | null
          tournament_id?: string | null
          turn?: string | null
          white_accuracy?: number | null
          white_funded?: boolean | null
          white_id?: string | null
          white_rating_after?: number | null
          white_rating_before?: number | null
          white_time_ms?: number | null
          white_username?: string | null
        }
        Update: {
          anticheat_flag?: string | null
          black_accuracy?: number | null
          black_funded?: boolean | null
          black_id?: string | null
          black_rating_after?: number | null
          black_rating_before?: number | null
          black_time_ms?: number | null
          black_username?: string | null
          created_at?: string | null
          ended_at?: string | null
          escrow_tx_hash?: string | null
          id?: string | null
          increment_seconds?: number | null
          invite_id?: string | null
          last_move_at?: string | null
          live_fen?: string | null
          payout_tx_hash?: string | null
          pending_draw_from?: string | null
          pending_takeback_from?: string | null
          pgn?: string | null
          result?: string | null
          stake_usdc?: number | null
          started_at?: string | null
          status?: string | null
          termination?: string | null
          time_control?: string | null
          time_seconds?: number | null
          tournament_id?: string | null
          turn?: string | null
          white_accuracy?: number | null
          white_funded?: boolean | null
          white_id?: string | null
          white_rating_after?: number | null
          white_rating_before?: number | null
          white_time_ms?: number | null
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
            foreignKeyName: "games_black_id_fkey"
            columns: ["black_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "games_white_id_fkey"
            columns: ["white_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "games_white_id_fkey"
            columns: ["white_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          chx_balance: number | null
          created_at: string | null
          display_name: string | null
          draws: number | null
          email: string | null
          id: string | null
          is_banned: boolean | null
          lichess_rating_blitz: number | null
          lichess_rating_bullet: number | null
          lichess_rating_rapid: number | null
          lichess_username: string | null
          lichess_verified_at: string | null
          losses: number | null
          platform_rating: number | null
          referral_code: string | null
          referred_by: string | null
          risk_level: string | null
          skill_tier: string | null
          total_earnings_usdc: number | null
          trust_score: number | null
          updated_at: string | null
          usdc_balance: number | null
          user_id: string | null
          username: string | null
          wallet_address: string | null
          wallet_verified_at: string | null
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          chx_balance?: number | null
          created_at?: string | null
          display_name?: string | null
          draws?: number | null
          email?: string | null
          id?: string | null
          is_banned?: boolean | null
          lichess_rating_blitz?: number | null
          lichess_rating_bullet?: number | null
          lichess_rating_rapid?: number | null
          lichess_username?: string | null
          lichess_verified_at?: string | null
          losses?: number | null
          platform_rating?: number | null
          referral_code?: string | null
          referred_by?: string | null
          risk_level?: string | null
          skill_tier?: string | null
          total_earnings_usdc?: number | null
          trust_score?: number | null
          updated_at?: string | null
          usdc_balance?: number | null
          user_id?: string | null
          username?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          chx_balance?: number | null
          created_at?: string | null
          display_name?: string | null
          draws?: number | null
          email?: string | null
          id?: string | null
          is_banned?: boolean | null
          lichess_rating_blitz?: number | null
          lichess_rating_bullet?: number | null
          lichess_rating_rapid?: number | null
          lichess_username?: string | null
          lichess_verified_at?: string | null
          losses?: number | null
          platform_rating?: number | null
          referral_code?: string | null
          referred_by?: string | null
          risk_level?: string | null
          skill_tier?: string | null
          total_earnings_usdc?: number | null
          trust_score?: number | null
          updated_at?: string | null
          usdc_balance?: number | null
          user_id?: string | null
          username?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      match_status_enum: "pending" | "active" | "completed" | "aborted"
      risk_level_enum: "low" | "medium" | "high" | "banned"
      skill_tier_enum: "Beginner" | "Intermediate" | "Advanced" | "Pro"
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
      match_status_enum: ["pending", "active", "completed", "aborted"],
      risk_level_enum: ["low", "medium", "high", "banned"],
      skill_tier_enum: ["Beginner", "Intermediate", "Advanced", "Pro"],
    },
  },
} as const
