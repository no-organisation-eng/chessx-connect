-- ============================================================
-- 1. Profile additions for wallet verification
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wallet_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address
  ON public.profiles (wallet_address)
  WHERE wallet_address IS NOT NULL;

-- ============================================================
-- 2. Games: live state for realtime PvP
-- ============================================================
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS live_fen TEXT,
  ADD COLUMN IF NOT EXISTS turn TEXT CHECK (turn IN ('w','b')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('waiting','active','completed','aborted')),
  ADD COLUMN IF NOT EXISTS white_funded BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS black_funded BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS invite_id UUID;

CREATE INDEX IF NOT EXISTS idx_games_status ON public.games (status);
CREATE INDEX IF NOT EXISTS idx_games_invite_id ON public.games (invite_id);

-- ============================================================
-- 3. match_invites table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  creator_id UUID NOT NULL,
  time_control TEXT NOT NULL DEFAULT 'Blitz 5+3',
  time_seconds INTEGER NOT NULL DEFAULT 300,
  increment_seconds INTEGER NOT NULL DEFAULT 3,
  stake_usdc NUMERIC NOT NULL DEFAULT 0,
  creator_color TEXT NOT NULL DEFAULT 'random' CHECK (creator_color IN ('w','b','random')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','accepted','cancelled','expired')),
  game_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_match_invites_code ON public.match_invites (code);
CREATE INDEX IF NOT EXISTS idx_match_invites_creator ON public.match_invites (creator_id);
CREATE INDEX IF NOT EXISTS idx_match_invites_status ON public.match_invites (status);

ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authed can read open invites" ON public.match_invites;
CREATE POLICY "Anyone authed can read open invites"
ON public.match_invites FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create their own invites" ON public.match_invites;
CREATE POLICY "Users can create their own invites"
ON public.match_invites FOR INSERT TO authenticated
WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creator can update or cancel" ON public.match_invites;
CREATE POLICY "Creator can update or cancel"
ON public.match_invites FOR UPDATE TO authenticated
USING (auth.uid() = creator_id);

-- ============================================================
-- 4. payments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  game_id UUID,
  invite_id UUID,
  amount_usdc NUMERIC NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('base-sepolia','base-mainnet')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','verified','failed','refunded')),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_game ON public.payments (game_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;
CREATE POLICY "Users can read their own payments"
ON public.payments FOR SELECT TO authenticated
USING (auth.uid() = user_id);
-- inserts/updates intentionally backend-only (service role)

-- ============================================================
-- 5. Refine games RLS for live PvP
-- ============================================================
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can read their games" ON public.games;
CREATE POLICY "Players can read their games"
ON public.games FOR SELECT TO authenticated
USING (auth.uid() = white_id OR auth.uid() = black_id OR status = 'completed');

DROP POLICY IF EXISTS "Players can insert their own games" ON public.games;
CREATE POLICY "Players can insert their own games"
ON public.games FOR INSERT TO authenticated
WITH CHECK (auth.uid() = white_id OR auth.uid() = black_id);

DROP POLICY IF EXISTS "Players can update their own games" ON public.games;
CREATE POLICY "Players can update their own games"
ON public.games FOR UPDATE TO authenticated
USING (auth.uid() = white_id OR auth.uid() = black_id);

-- ============================================================
-- 6. Elo on game completion (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_elo_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k_factor CONSTANT INTEGER := 32;
  white_rating INTEGER;
  black_rating INTEGER;
  expected_white NUMERIC;
  expected_black NUMERIC;
  score_white NUMERIC;
  score_black NUMERIC;
  delta_white INTEGER;
  delta_black INTEGER;
BEGIN
  -- Only run when result transitions from null to a value
  IF NEW.result IS NULL OR OLD.result IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.white_id IS NULL OR NEW.black_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT platform_rating INTO white_rating FROM public.profiles WHERE user_id = NEW.white_id;
  SELECT platform_rating INTO black_rating FROM public.profiles WHERE user_id = NEW.black_id;

  white_rating := COALESCE(white_rating, 1200);
  black_rating := COALESCE(black_rating, 1200);

  expected_white := 1.0 / (1.0 + POWER(10, (black_rating - white_rating)::NUMERIC / 400.0));
  expected_black := 1.0 - expected_white;

  IF NEW.result = 'white' THEN
    score_white := 1; score_black := 0;
  ELSIF NEW.result = 'black' THEN
    score_white := 0; score_black := 1;
  ELSE
    score_white := 0.5; score_black := 0.5;
  END IF;

  delta_white := ROUND(k_factor * (score_white - expected_white));
  delta_black := ROUND(k_factor * (score_black - expected_black));

  NEW.white_rating_before := white_rating;
  NEW.black_rating_before := black_rating;
  NEW.white_rating_after := white_rating + delta_white;
  NEW.black_rating_after := black_rating + delta_black;

  UPDATE public.profiles
  SET
    platform_rating = white_rating + delta_white,
    wins   = wins   + CASE WHEN NEW.result = 'white' THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN NEW.result = 'black' THEN 1 ELSE 0 END,
    draws  = draws  + CASE WHEN NEW.result = 'draw'  THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE user_id = NEW.white_id;

  UPDATE public.profiles
  SET
    platform_rating = black_rating + delta_black,
    wins   = wins   + CASE WHEN NEW.result = 'black' THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN NEW.result = 'white' THEN 1 ELSE 0 END,
    draws  = draws  + CASE WHEN NEW.result = 'draw'  THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE user_id = NEW.black_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_games_apply_elo ON public.games;
CREATE TRIGGER trg_games_apply_elo
BEFORE UPDATE OF result ON public.games
FOR EACH ROW
WHEN (OLD.result IS NULL AND NEW.result IS NOT NULL)
EXECUTE FUNCTION public.apply_elo_on_completion();

-- Also handle the case where a game is INSERTED already completed (e.g. AI games)
CREATE OR REPLACE FUNCTION public.apply_elo_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k_factor CONSTANT INTEGER := 32;
  white_rating INTEGER;
  black_rating INTEGER;
  expected_white NUMERIC;
  score_white NUMERIC;
  score_black NUMERIC;
  delta_white INTEGER;
  delta_black INTEGER;
BEGIN
  IF NEW.result IS NULL OR NEW.white_id IS NULL OR NEW.black_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT platform_rating INTO white_rating FROM public.profiles WHERE user_id = NEW.white_id;
  SELECT platform_rating INTO black_rating FROM public.profiles WHERE user_id = NEW.black_id;
  white_rating := COALESCE(white_rating, 1200);
  black_rating := COALESCE(black_rating, 1200);

  expected_white := 1.0 / (1.0 + POWER(10, (black_rating - white_rating)::NUMERIC / 400.0));
  IF NEW.result = 'white' THEN score_white := 1; score_black := 0;
  ELSIF NEW.result = 'black' THEN score_white := 0; score_black := 1;
  ELSE score_white := 0.5; score_black := 0.5; END IF;

  delta_white := ROUND(k_factor * (score_white - expected_white));
  delta_black := ROUND(k_factor * (score_black - (1.0 - expected_white)));

  NEW.white_rating_before := white_rating;
  NEW.black_rating_before := black_rating;
  NEW.white_rating_after := white_rating + delta_white;
  NEW.black_rating_after := black_rating + delta_black;

  UPDATE public.profiles
  SET platform_rating = white_rating + delta_white,
      wins   = wins   + CASE WHEN NEW.result = 'white' THEN 1 ELSE 0 END,
      losses = losses + CASE WHEN NEW.result = 'black' THEN 1 ELSE 0 END,
      draws  = draws  + CASE WHEN NEW.result = 'draw'  THEN 1 ELSE 0 END,
      updated_at = now()
  WHERE user_id = NEW.white_id;

  UPDATE public.profiles
  SET platform_rating = black_rating + delta_black,
      wins   = wins   + CASE WHEN NEW.result = 'black' THEN 1 ELSE 0 END,
      losses = losses + CASE WHEN NEW.result = 'white' THEN 1 ELSE 0 END,
      draws  = draws  + CASE WHEN NEW.result = 'draw'  THEN 1 ELSE 0 END,
      updated_at = now()
  WHERE user_id = NEW.black_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_games_apply_elo_insert ON public.games;
CREATE TRIGGER trg_games_apply_elo_insert
BEFORE INSERT ON public.games
FOR EACH ROW
WHEN (NEW.result IS NOT NULL)
EXECUTE FUNCTION public.apply_elo_on_insert();

-- ============================================================
-- 7. Realtime publications
-- ============================================================
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.match_invites REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'games'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'match_invites'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_invites;
  END IF;
END $$;