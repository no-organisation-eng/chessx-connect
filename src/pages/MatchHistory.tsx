import React from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

const terminationLabels: Record<string, string> = {
  checkmate: 'Checkmate',
  timeout: 'Timeout',
  resign: 'Resignation',
  stalemate: 'Stalemate',
  agreement: 'Agreement',
};

const MatchHistory = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from('users').select('id, username').eq('user_id', userId!).maybeSingle();
      return data;
    },
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matchHistory', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`white_user_id.eq.${userId},black_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const username = profile?.username ?? '';

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </AppLayout>
    );
  }

  const games = matches ?? [];

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground">MATCH HISTORY</h2>
          <span className="text-xs text-muted-foreground">{games.length} games</span>
        </div>

        {games.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No games played yet.</div>
        )}

        <div className="space-y-3">
          {games.map((m) => {
            const isWhite = m.white_user_id === userId;
            const opponent = isWhite ? m.black_username : m.white_username;
            const won = (m.result === 'white' && isWhite) || (m.result === 'black' && !isWhite);
            const drew = m.result === 'draw';
            const ratingDelta = isWhite
              ? (m.white_rating_after ?? 0) - (m.white_rating_before ?? 0)
              : (m.black_rating_after ?? 0) - (m.black_rating_before ?? 0);
            const accuracy = isWhite ? m.white_accuracy : m.black_accuracy;
            const resultLabel = won ? 'WIN' : drew ? 'DRAW' : 'LOSS';
            const resultColor = won ? 'text-primary bg-primary/10 border-primary/30' : drew ? 'text-muted-foreground bg-muted/30 border-border' : 'text-destructive bg-destructive/10 border-destructive/30';

            return (
              <div key={m.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-display text-xs font-bold tracking-wider px-2 py-0.5 rounded border ${resultColor}`}>
                      {resultLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isWhite ? '♔ White' : '♚ Black'}
                    </span>
                  </div>
                  <span className={`font-display text-sm font-bold flex items-center gap-1 ${ratingDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {ratingDelta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {ratingDelta >= 0 ? '+' : ''}{ratingDelta}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-foreground font-semibold">vs {opponent ?? 'Unknown'}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.termination && terminationLabels[m.termination]} · {new Date(m.started_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {m.time_control} {m.time_seconds / 60}+{m.increment_seconds}
                  </span>
                  {accuracy !== null && (
                    <span className="flex items-center gap-1">
                      <BarChart3 size={12} />
                      {accuracy}% accuracy
                    </span>
                  )}
                  {m.stake_usdc > 0 && (
                    <span className="flex items-center gap-1 text-accent">
                      <DollarSign size={12} />
                      ${m.stake_usdc} stake
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default MatchHistory;
