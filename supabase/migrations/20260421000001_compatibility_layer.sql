-- ============================================================
-- Compatibility Layer & Stability Fixes
-- ============================================================

BEGIN;

-- 0. Inject missing columns into users (formerly profiles)
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS usdc_balance NUMERIC(18,6) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chx_balance NUMERIC(18,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_rating INTEGER DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS skill_tier TEXT DEFAULT 'Beginner',
  ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS total_earnings_usdc NUMERIC(18,6) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS device_fingerprint TEXT[],
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 1. COMPATIBILITY VIEWS
CREATE TABLE IF NOT EXISTS public.anticheat_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  flag_type TEXT,
  severity TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lichess_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  lichess_username TEXT,
  challenge_code TEXT,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id),
  source TEXT,
  chx_amount NUMERIC(18,8),
  daily_cap_date DATE,
  status TEXT DEFAULT 'pending',
  distributed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Map new 'users' table back to 'profiles'
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    id,
    user_id,
    username,
    display_name,
    avatar_url,
    platform_rating,
    skill_tier,
    trust_score,
    wallet_address,
    total_earnings_usdc,
    wins,
    losses,
    draws,
    created_at,
    updated_at
FROM public.users;

-- Rename columns in 'matches' if they are still using the old 'games' schema names
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='white_id') THEN
    ALTER TABLE public.matches RENAME COLUMN white_id TO white_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='black_id') THEN
    ALTER TABLE public.matches RENAME COLUMN black_id TO black_user_id;
  END IF;
END $$;

-- Map new 'matches' table back to 'games'
CREATE OR REPLACE VIEW public.games AS
SELECT
    id,
    white_user_id AS white_id,
    black_user_id AS black_id,
    white_username,
    black_username,
    result,
    termination,
    pgn,
    time_control,
    time_seconds,
    increment_seconds,
    stake_usdc,
    white_rating_before,
    white_rating_after,
    black_rating_before,
    black_rating_after,
    white_accuracy,
    black_accuracy,
    started_at,
    ended_at,
    created_at,
    live_fen,
    turn,
    last_move_at,
    pending_draw_from,
    pending_takeback_from
FROM public.matches;

-- 2. TRIGGER FIX
-- Repair handle_new_user to insert into the actual table 'users'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. RLS HARDENING for system tables
ALTER TABLE public.anticheat_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own flags" ON public.anticheat_flags FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.lichess_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications" ON public.lichess_verifications FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Moves are publicly viewable" ON public.moves FOR SELECT USING (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings are publicly viewable" ON public.ratings FOR SELECT USING (true);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rewards" ON public.rewards FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);

COMMIT;
