DROP TRIGGER IF EXISTS trg_apply_elo_on_completion ON public.matches;

CREATE OR REPLACE FUNCTION public.apply_elo_on_completion()
RETURNS trigger
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
  IF NEW.result IS NULL OR OLD.result IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.white_user_id IS NULL OR NEW.black_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT platform_rating INTO white_rating FROM public.users WHERE user_id = NEW.white_user_id;
  SELECT platform_rating INTO black_rating FROM public.users WHERE user_id = NEW.black_user_id;

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

  UPDATE public.users
  SET
    platform_rating = white_rating + delta_white,
    wins = wins + CASE WHEN NEW.result = 'white' THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN NEW.result = 'black' THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN NEW.result = 'draw' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE user_id = NEW.white_user_id;

  UPDATE public.users
  SET
    platform_rating = black_rating + delta_black,
    wins = wins + CASE WHEN NEW.result = 'black' THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN NEW.result = 'white' THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN NEW.result = 'draw' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE user_id = NEW.black_user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_elo_on_completion
BEFORE UPDATE OF result ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.apply_elo_on_completion();

ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;