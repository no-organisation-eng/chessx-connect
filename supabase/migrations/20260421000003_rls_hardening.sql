-- ============================================================
-- Phase 3A: RLS Hardening for Infrastructure Tables
-- ============================================================

BEGIN;

-- 1. Secure MOVE table
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view moves of their match" ON public.moves;
CREATE POLICY "Players can view moves of their match" ON public.moves
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.matches
            WHERE id = moves.match_id
            AND (white_user_id = auth.uid() OR black_user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Players can insert moves into their match" ON public.moves;
CREATE POLICY "Players can insert moves into their match" ON public.moves
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.matches
            WHERE id = moves.match_id
            AND (white_user_id = auth.uid() OR black_user_id = auth.uid())
        )
    );

-- 2. Secure RATINGS table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ratings are publicly readable" ON public.ratings;
CREATE POLICY "Ratings are publicly readable" ON public.ratings
    FOR SELECT
    USING (true);

-- System only updates - handled by Service Role (no RLS policy needed for service_role)

-- 3. Secure ANTICHEAT_FLAGS table
ALTER TABLE public.anticheat_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own flags" ON public.anticheat_flags;
CREATE POLICY "Users can view their own flags" ON public.anticheat_flags
    FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Secure NOTIFICATIONS table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL
    USING (auth.uid() = user_id);

-- 5. Secure REWARDS table
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own rewards" ON public.rewards;
CREATE POLICY "Users can view their own rewards" ON public.rewards
    FOR SELECT
    USING (auth.uid() = user_id);

-- 6. Secure SESSIONS table
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.sessions;
CREATE POLICY "Users can manage their own sessions" ON public.sessions
    FOR ALL
    USING (auth.uid() = user_id);

COMMIT;
