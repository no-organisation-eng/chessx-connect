-- ============================================================
-- ChessX Platform Blueprint v1.0.0 Migration
-- Clean Implementation for Fresh Projects
-- ============================================================

BEGIN;

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE public.skill_tier_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Pro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.risk_level_enum AS ENUM ('low', 'medium', 'high', 'banned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.match_status_enum AS ENUM ('pending', 'active', 'completed', 'aborted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. USERS TABLE (Idempotent for Fresh or Existing)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE IF EXISTS public.profiles RENAME TO users;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Auth ref
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE,
  wallet_address TEXT,
  wallet_verified_at TIMESTAMPTZ,
  platform_rating INTEGER DEFAULT 1200,
  skill_tier TEXT DEFAULT 'Beginner',
  trust_score INTEGER DEFAULT 100,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  total_earnings_usdc NUMERIC(18,6) DEFAULT 0,
  usdc_balance NUMERIC(18,6) DEFAULT 0,
  chx_balance NUMERIC(18,8) DEFAULT 0,
  risk_level TEXT DEFAULT 'low',
  is_banned BOOLEAN DEFAULT false,
  lichess_username TEXT,
  lichess_verified_at TIMESTAMPTZ,
  lichess_rating_bullet SMALLINT,
  lichess_rating_blitz SMALLINT,
  lichess_rating_rapid SMALLINT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.users(id),
  device_fingerprint TEXT[],
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MATCHES TABLE (Idempotent for Fresh or Existing)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'games') THEN
    ALTER TABLE IF EXISTS public.games RENAME TO matches;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_user_id UUID REFERENCES public.users(id),
  black_user_id UUID REFERENCES public.users(id),
  white_username TEXT,
  black_username TEXT,
  status TEXT DEFAULT 'pending',
  result TEXT,
  termination TEXT,
  pgn TEXT,
  time_control TEXT,
  time_seconds INTEGER,
  increment_seconds INTEGER,
  stake_usdc NUMERIC(18,6) DEFAULT 0,
  white_rating_before INTEGER,
  white_rating_after INTEGER,
  black_rating_before INTEGER,
  black_rating_after INTEGER,
  white_accuracy NUMERIC(5,2),
  black_accuracy NUMERIC(5,2),
  white_funded BOOLEAN DEFAULT false,
  black_funded BOOLEAN DEFAULT false,
  escrow_tx_hash TEXT,
  payout_tx_hash TEXT,
  anticheat_flag TEXT,
  tournament_id UUID,
  live_fen TEXT,
  turn TEXT DEFAULT 'w',
  white_time_ms INTEGER,
  black_time_ms INTEGER,
  last_move_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INFRASTRUCTURE TABLES
CREATE TABLE IF NOT EXISTS public.moves (
  id BIGSERIAL PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  ply INTEGER NOT NULL,
  san TEXT NOT NULL,
  uci TEXT NOT NULL,
  fen_after TEXT NOT NULL,
  time_spent_ms INTEGER NOT NULL,
  clock_remaining_ms INTEGER NOT NULL,
  stockfish_eval NUMERIC(6,2),
  is_best_move BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  time_control TEXT NOT NULL,
  rating_before INTEGER NOT NULL,
  rating_after INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    ALTER TABLE IF EXISTS public.payments RENAME TO transactions;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  amount NUMERIC(18,6),
  currency TEXT DEFAULT 'USDC',
  type TEXT,
  direction TEXT,
  on_chain_tx_hash TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT DEFAULT 'registration',
  entry_fee_usdc NUMERIC(18,6) NOT NULL DEFAULT 0,
  prize_pool_usdc NUMERIC(18,6) NOT NULL DEFAULT 0,
  max_players INTEGER,
  min_rating INTEGER,
  max_rating INTEGER,
  time_control TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score NUMERIC(5,2) DEFAULT 0,
  seed INTEGER,
  placement INTEGER,
  prize_usdc NUMERIC(18,6),
  entry_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
