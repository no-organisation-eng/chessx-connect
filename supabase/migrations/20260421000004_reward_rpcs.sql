-- ============================================================
-- Phase 3B: Reward System RPCs
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.increment_chx_balance(
  target_user_id UUID,
  amount NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET chx_balance = chx_balance + amount
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
