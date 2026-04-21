import React from 'react';
import { Trophy, Medal, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

const tierColors: Record<string, string> = {
  Beginner: 'text-muted-foreground border-muted',
  Intermediate: 'text-blue-400 border-blue-400/30',
  Advanced: 'text-accent border-accent/30',
  Pro: 'text-primary border-primary/30',
};

const rankIcons = [
  <Trophy key={0} size={18} className="text-yellow-400" />,
  <Medal key={1} size={18} className="text-gray-300" />,
  <Medal key={2} size={18} className="text-amber-600" />,
];

const Leaderboard = () => {
  const { data: players, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('platform_rating', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const list = players ?? [];

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground">LEADERBOARD</h2>
          <span className="text-xs text-muted-foreground font-display tracking-widest">TOP PLAYERS</span>
        </div>

        {list.length >= 3 && (
          <div className="grid grid-cols-3 gap-2">
            {list.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className={`bg-card border rounded-xl p-4 text-center ${i === 0 ? 'border-yellow-400/30 neon-glow' : 'border-border'}`}
              >
                <div className="flex justify-center mb-2">{rankIcons[i]}</div>
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-display text-sm font-bold text-primary mb-2">
                  {(p.username ?? 'U')[0]}
                </div>
                <div className="font-semibold text-sm text-foreground truncate">{p.username ?? 'Player'}</div>
                <div className="font-display text-lg font-bold text-primary mt-1">{p.platform_rating}</div>
                <div className={`text-xs font-display tracking-wider mt-1 ${tierColors[p.skill_tier] ?? 'text-muted-foreground'}`}>
                  {p.skill_tier}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px_60px] gap-2 px-4 py-2 text-xs text-muted-foreground font-display tracking-wider border-b border-border">
            <span>#</span>
            <span>PLAYER</span>
            <span className="text-right">RATING</span>
            <span className="text-right">W/L</span>
          </div>
          {list.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">No players yet.</div>
          )}
          {list.map((p, i) => (
            <div
              key={p.id}
              className="grid grid-cols-[40px_1fr_80px_60px] gap-2 px-4 py-3 items-center text-sm border-b border-border/50 last:border-0"
            >
              <span className="font-display font-bold text-muted-foreground">{i + 1}</span>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-display text-xs font-bold text-foreground shrink-0">
                  {(p.username ?? 'U')[0]}
                </div>
                <span className="font-semibold text-foreground truncate">{p.username ?? 'Player'}</span>
                {p.trust_score >= 95 && <Shield size={12} className="text-primary shrink-0" />}
              </div>
              <span className="font-display font-bold text-primary text-right">{p.platform_rating}</span>
              <span className="text-xs text-muted-foreground text-right">{p.wins}/{p.losses}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
