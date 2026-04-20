-- ============================================================
-- ChessX Platform Blueprint v1.0.0 Migration
-- ============================================================

BEGIN;

-- 1. ENUMS (Create new ones as needed)
DO $$ BEGIN
    CREATE TYPE public.skill_tier_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Pro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.risk_level_enum AS ENUM ('low', 'medium', 'high', 'banned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.match_status_enum AS ENUM ('pending', 'active', 'completed', 'aborted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. REORGANIZE PROFILES -> USERS
-- Rename existing table to avoid conflict if necessary, but we'll modify it in place if possible
-- or rename it to users if that's preferred.
ALTER TABLE IF EXISTS public.profiles RENAME TO users;

-- Add missing columns to users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS passkey_credential JSONB,
  ADD COLUMN IF NOT EXISTS lichess_username TEXT,
  ADD COLUMN IF NOT EXISTS lichess_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lichess_rating_bullet SMALLINT,
  ADD COLUMN IF NOT EXISTS lichess_rating_blitz SMALLINT,
  ADD COLUMN IF NOT EXISTS lichess_rating_rapid SMALLINT,
  ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS chx_balance NUMERIC(18,8) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usdc_balance NUMERIC(18,6) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS device_fingerprint TEXT[],
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Add constraints and unique indexes
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE public.users ADD CONSTRAINT users_referral_code_unique UNIQUE (referral_code);

-- 3. REORGANIZE GAMES -> MATCHES
ALTER TABLE IF EXISTS public.games RENAME TO matches;

-- Rename columns to match blueprint
ALTER TABLE public.matches RENAME COLUMN white_id TO white_user_id;
ALTER TABLE public.matches RENAME COLUMN black_id TO black_user_id;

-- Add missing columns to matches
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS escrow_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS anticheat_flag TEXT,
  ADD COLUMN IF NOT EXISTS tournament_id UUID,
  ADD COLUMN IF NOT EXISTS payout_tx_hash TEXT;

-- 4. NEW TABLES

-- moves
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

CREATE INDEX IF NOT EXISTS idx_moves_match_id ON public.moves (match_id);
CREATE INDEX IF NOT EXISTS idx_moves_match_ply ON public.moves (match_id, ply);

-- ratings history
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

CREATE INDEX IF NOT EXISTS idx_ratings_user ON public.ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_match ON public.ratings (match_id);

-- transactions (Transitioning from payments)
ALTER TABLE IF EXISTS public.payments RENAME TO transactions;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USDC',
  ADD COLUMN IF NOT EXISTS direction TEXT,
  ADD COLUMN IF NOT EXISTS on_chain_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Map old columns if needed
ALTER TABLE public.transactions RENAME COLUMN amount_usdc TO amount;
ALTER TABLE public.transactions RENAME COLUMN tx_id TO on_chain_tx_hash_old; -- Keep old mapping safe

-- sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- lichess_verifications
CREATE TABLE IF NOT EXISTS public.lichess_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lichess_username TEXT NOT NULL,
  challenge_code TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bio_code', 'game_challenge')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
  verified_at TIMESTAMPTZ,
  attempts SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rewards
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('match_win', 'tournament_win', 'referral', 'daily_bonus', 'streak')),
  chx_amount NUMERIC(18,8) NOT NULL,
  match_id UUID REFERENCES public.matches(id),
  tournament_id UUID REFERENCES public.tournaments(id),
  daily_cap_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'cancelled')),
  distributed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- anticheat_flags
CREATE TABLE IF NOT EXISTS public.anticheat_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id),
  flag_type TEXT NOT NULL CHECK (flag_type IN ('engine_use', 'accuracy_spike', 'win_rate_anomaly', 'collusion', 'multi_account', 'reward_farming')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  reviewed_by UUID REFERENCES public.users(id),
  resolution TEXT CHECK (resolution IN ('dismissed', 'warned', 'banned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('match_found', 'game_result', 'payout', 'tournament', 'reward', 'warning')),
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. REFINING TOURNAMENTS
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS entry_fee_usdc NUMERIC(18,6) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prize_pool_usdc NUMERIC(18,6) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

ALTER TABLE public.tournament_participants
  ADD COLUMN IF NOT EXISTS seed INTEGER,
  ADD COLUMN IF NOT EXISTS score NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS placement INTEGER,
  ADD COLUMN IF NOT EXISTS prize_usdc NUMERIC(18,6),
  ADD COLUMN IF NOT EXISTS entry_tx_hash TEXT;

COMMIT;
