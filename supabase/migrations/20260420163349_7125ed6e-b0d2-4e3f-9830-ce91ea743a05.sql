ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS pending_draw_from TEXT,
  ADD COLUMN IF NOT EXISTS pending_takeback_from TEXT;