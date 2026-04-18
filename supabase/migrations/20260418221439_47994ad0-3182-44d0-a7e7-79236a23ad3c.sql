ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS white_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS black_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS last_move_at TIMESTAMPTZ;

-- Backfill defaults for any in-progress games
UPDATE public.games
SET white_time_ms = COALESCE(white_time_ms, time_seconds * 1000),
    black_time_ms = COALESCE(black_time_ms, time_seconds * 1000)
WHERE status IN ('waiting','active');