
-- Fix games: only players can update their own games
DROP POLICY "Players can update own games" ON public.games;
CREATE POLICY "Players can update own games" ON public.games FOR UPDATE TO authenticated
  USING (auth.uid() = white_id OR auth.uid() = black_id)
  WITH CHECK (auth.uid() = white_id OR auth.uid() = black_id);

-- Fix tournaments: remove overly permissive update, restrict inserts
DROP POLICY "Authenticated can update tournaments" ON public.tournaments;

-- Fix game inserts: only allow if user is one of the players
DROP POLICY "Authenticated users can create games" ON public.games;
CREATE POLICY "Players can create own games" ON public.games FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = white_id OR auth.uid() = black_id);
