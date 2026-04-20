
-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  platform_rating INTEGER NOT NULL DEFAULT 1200,
  skill_tier TEXT NOT NULL DEFAULT 'Beginner',
  trust_score INTEGER NOT NULL DEFAULT 100,
  wallet_address TEXT,
  total_earnings_usdc NUMERIC(12,2) NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GAMES
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  white_id UUID REFERENCES public.profiles(user_id),
  black_id UUID REFERENCES public.profiles(user_id),
  white_username TEXT,
  black_username TEXT,
  result TEXT CHECK (result IN ('white','black','draw')),
  termination TEXT CHECK (termination IN ('checkmate','timeout','resign','stalemate','agreement')),
  pgn TEXT,
  time_control TEXT NOT NULL DEFAULT 'blitz',
  time_seconds INTEGER NOT NULL DEFAULT 300,
  increment_seconds INTEGER NOT NULL DEFAULT 0,
  stake_usdc NUMERIC(12,2) NOT NULL DEFAULT 0,
  white_rating_before INTEGER,
  white_rating_after INTEGER,
  black_rating_before INTEGER,
  black_rating_after INTEGER,
  white_accuracy NUMERIC(5,2),
  black_accuracy NUMERIC(5,2),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games viewable by everyone" ON public.games FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create games" ON public.games FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Players can update own games" ON public.games FOR UPDATE TO authenticated USING (auth.uid() = white_id OR auth.uid() = black_id);

-- TOURNAMENTS
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'swiss' CHECK (format IN ('swiss','round_robin','single_elim','double_elim')),
  time_control TEXT NOT NULL DEFAULT 'blitz',
  status TEXT NOT NULL DEFAULT 'registration' CHECK (status IN ('registration','active','completed','cancelled')),
  max_players INTEGER NOT NULL DEFAULT 16,
  current_players INTEGER NOT NULL DEFAULT 0,
  prize_pool_usdc NUMERIC(12,2) NOT NULL DEFAULT 0,
  entry_fee_usdc NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_rating INTEGER,
  max_rating INTEGER,
  starts_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments viewable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Authenticated can update tournaments" ON public.tournaments FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TOURNAMENT PARTICIPANTS
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);

ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by everyone" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave tournaments" ON public.tournament_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);
