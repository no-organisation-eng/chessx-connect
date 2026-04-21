
-- Create updatable views that map legacy code names (profiles/games + white_id/black_id) 
-- to the real tables (users/matches + white_user_id/black_user_id).

-- profiles view → users table
CREATE OR REPLACE VIEW public.profiles
WITH (security_invoker=on) AS
SELECT
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  email,
  wallet_address,
  wallet_verified_at,
  platform_rating,
  skill_tier,
  trust_score,
  wins,
  losses,
  draws,
  total_earnings_usdc,
  usdc_balance,
  chx_balance,
  lichess_username,
  lichess_verified_at,
  lichess_rating_blitz,
  lichess_rating_bullet,
  lichess_rating_rapid,
  is_banned,
  risk_level,
  referral_code,
  referred_by,
  created_at,
  updated_at
FROM public.users;

-- games view → matches table, aliasing white_user_id/black_user_id to white_id/black_id
CREATE OR REPLACE VIEW public.games
WITH (security_invoker=on) AS
SELECT
  id,
  white_user_id  AS white_id,
  black_user_id  AS black_id,
  white_username,
  black_username,
  status,
  result,
  termination,
  pgn,
  live_fen,
  turn,
  time_control,
  time_seconds,
  increment_seconds,
  stake_usdc,
  white_funded,
  black_funded,
  white_time_ms,
  black_time_ms,
  last_move_at,
  pending_draw_from,
  pending_takeback_from,
  white_rating_before,
  white_rating_after,
  black_rating_before,
  black_rating_after,
  white_accuracy,
  black_accuracy,
  invite_id,
  tournament_id,
  escrow_tx_hash,
  payout_tx_hash,
  anticheat_flag,
  started_at,
  ended_at,
  created_at
FROM public.matches;

-- Grant access
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.games TO authenticated, anon;

-- Make handle_new_user trigger work: it inserts into public.profiles (the view).
-- The view's INSERT will rewrite into public.users automatically since it's a simple
-- single-table view. No additional changes needed.
