-- Attach Elo trigger so ratings auto-update when match.result is set
DROP TRIGGER IF EXISTS trg_apply_elo_on_completion ON public.matches;
CREATE TRIGGER trg_apply_elo_on_completion
BEFORE UPDATE OF result ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.apply_elo_on_completion();

-- Enable realtime on users so clients see live rating changes
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Also ensure matches realtime is enabled (no-op if already added)
ALTER TABLE public.matches REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;