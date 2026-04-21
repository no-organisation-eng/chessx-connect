-- ============================================================
-- Core Logic: Matchmaking & Wallet Escrow
-- ============================================================

BEGIN;

-- 1. Matchmaking Queue
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  elo INTEGER NOT NULL,
  stake_usdc NUMERIC(18,6) NOT NULL DEFAULT 0,
  time_control TEXT NOT NULL,
  time_seconds INTEGER NOT NULL,
  increment_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimize pairing lookups
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_pairing 
ON public.matchmaking_queue (stake_usdc, time_control, elo);

-- RLS for queue
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own queue entry" 
ON public.matchmaking_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can view all queue"
ON public.matchmaking_queue FOR SELECT USING (true); -- Service role normally ignores RLS but good practice

-- 2. Escrow Records
CREATE TABLE IF NOT EXISTS public.escrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount_usdc NUMERIC(18,6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escrow_match ON public.escrow_records (match_id);

-- RLS for escrow
ALTER TABLE public.escrow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own escrow" 
ON public.escrow_records FOR SELECT USING (auth.uid() = user_id);

-- 3. Balance Constraints
ALTER TABLE public.users 
ADD CONSTRAINT users_usdc_balance_non_negative CHECK (usdc_balance >= 0);

COMMIT;
