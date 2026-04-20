import React from 'react';
import { Trophy, Users, Clock, Zap, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { buildInviteUrl, copyInvite } from '@/lib/invite';

const statusStyles: Record<string, { label: string; cls: string }> = {
  registration: { label: 'OPEN', cls: 'text-primary bg-primary/10 border-primary/30' },
  active: { label: 'LIVE', cls: 'text-accent bg-accent/10 border-accent/30' },
  completed: { label: 'ENDED', cls: 'text-muted-foreground bg-muted/30 border-border' },
  cancelled: { label: 'CANCELLED', cls: 'text-destructive bg-destructive/10 border-destructive/30' },
};

const formatLabels: Record<string, string> = {
  swiss: 'Swiss',
  round_robin: 'Round Robin',
  single_elim: 'Single Elim',
  double_elim: 'Double Elim',
};

const Tournaments = () => {
  const { data: tournamentList, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </AppLayout>
    );
  }

  const list = tournamentList ?? [];

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground">TOURNAMENTS</h2>
          <span className="text-xs text-muted-foreground font-display tracking-widest">
            {list.filter((t) => t.status === 'registration').length} OPEN
          </span>
        </div>

        {list.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No tournaments available yet.</div>
        )}

        <div className="space-y-3">
          {list.map((t) => {
            const st = statusStyles[t.status] ?? statusStyles.completed;
            const currentPlayers = 0; // Column removed in V1; needs aggregate query
            const spotsLeft = (t.max_players || 0) - currentPlayers;
            const fillPct = t.max_players ? (currentPlayers / t.max_players) * 100 : 0;

            return (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-accent" />
                      <h3 className="font-display text-sm font-bold text-foreground">{t.name}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatLabels[t.format] ?? t.format}</span>
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {t.time_control}</span>
                    </div>
                  </div>
                  <span className={`font-display text-xs font-bold tracking-wider px-2 py-0.5 rounded border ${st.cls}`}>
                    {t.status === 'active' && <Zap size={10} className="inline mr-1" />}
                    {st.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-secondary rounded-lg px-3 py-2">
                    <div className="text-xs text-muted-foreground">Prize Pool</div>
                    <div className="font-display font-bold text-accent">${Number(t.prize_pool_usdc).toLocaleString()}</div>
                  </div>
                  <div className="bg-secondary rounded-lg px-3 py-2">
                    <div className="text-xs text-muted-foreground">Entry Fee</div>
                    <div className="font-display font-bold text-foreground">
                      {Number(t.entry_fee_usdc) > 0 ? `$${t.entry_fee_usdc}` : 'FREE'}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1"><Users size={10} /> {currentPlayers}/{t.max_players}</span>
                    {spotsLeft > 0 && t.status === 'registration' && (
                      <span className="text-primary">{spotsLeft} spots left</span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {(t.min_rating || t.max_rating) && (
                  <div className="text-xs text-muted-foreground mb-3">
                    Rating: {t.min_rating ?? '0'} – {t.max_rating ?? '∞'}
                  </div>
                )}

                <div className="flex gap-2">
                  {t.status === 'registration' && (
                    <Button
                      className="flex-1 font-display text-xs tracking-wider bg-primary text-primary-foreground hover:bg-primary/90"
                      size="sm"
                    >
                      {Number(t.entry_fee_usdc) > 0 ? `ENTER — $${t.entry_fee_usdc}` : 'ENTER FREE'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-display text-xs tracking-wider"
                    onClick={() => copyInvite(buildInviteUrl(`/tournaments?t=${t.id}`), 'Tournament invite')}
                    title="Copy invite link"
                  >
                    <Link2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tournaments;
