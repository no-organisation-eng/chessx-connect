-- Wipe all user data so we can start fresh
DELETE FROM public.transactions;
DELETE FROM public.moves;
DELETE FROM public.ratings;
DELETE FROM public.rewards;
DELETE FROM public.anticheat_flags;
DELETE FROM public.notifications;
DELETE FROM public.lichess_verifications;
DELETE FROM public.sessions;
DELETE FROM public.tournament_participants;
DELETE FROM public.match_invites;
DELETE FROM public.matches;
DELETE FROM public.users;
DELETE FROM auth.users;