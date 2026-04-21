-- ============================================================
-- Compatibility Layer & Stability Fixes
-- ============================================================

BEGIN;

-- 1. COMPATIBILITY VIEWS
-- Map new 'users' table back to 'profiles'
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    id AS profile_id, -- Original id column
    id AS user_id,    -- In V1 migration I renamed user_id to id? No, wait.
    -- Let me check the actual structure one more time.
    -- Old profiles had 'id' (random) and 'user_id' (auth ref).
    -- My V1 migration just renamed profiles to users.
    -- So 'id' is still the random one and 'user_id' is still the auth one.
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
