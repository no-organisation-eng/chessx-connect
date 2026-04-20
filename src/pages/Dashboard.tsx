import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Trophy, Swords, Target, Flame, Wallet, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

const tierColors: Record<string, string> = {
  Beginner: 'text-muted-foreground',
  Intermediate: 'text-blue-400',
  Advanced: 'text-accent',
  Pro: 'text-primary',
};

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: recentGames } = useQuery({
    queryKey: ['recentGames', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`white_user_id.eq.${userId},black_user_id.eq.${userId}`)
        .order('started_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p>No profile found. Please log in.</p>
          <Button className="mt-4" onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
      </AppLayout>
    );
  }

  const u = profile;
  const wins = u.wins ?? 0;
  const losses = u.losses ?? 0;
  const draws = u.draws ?? 0;
  const rating = u.platform_rating ?? 1200;
  const earnings = u.total_earnings_usdc ?? 0;
  const trust = u.trust_score ?? 100;
  const tier = u.skill_tier ?? 'Beginner';
  const gamesPlayed = wins + losses + draws;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-display text-2xl font-bold text-primary neon-glow">
              {(u.username ?? 'U')[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display text-xl font-bold text-foreground">{u.username ?? 'Player'}</h2>
                <span className={`font-display text-xs tracking-widest uppercase ${tierColors[tier] ?? 'text-muted-foreground'}`}>
                  {tier}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span>Trust: {trust}%</span>
              </div>
            </div>
            <Button onClick={() => navigate('/play')} className="font-display tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 neon-glow">
              <Swords className="mr-2 h-4 w-4" /> FIND MATCH
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Trophy size={18} />} label="Rating" value={String(rating)} accent="text-primary" />
          <StatCard icon={<Target size={18} />} label="Win Rate" value={`${winRate}%`} accent="text-primary" />
          <StatCard icon={<Flame size={18} />} label="Games" value={String(gamesPlayed)} accent="text-accent" />
          <StatCard icon={<Swords size={18} />} label="Earnings" value={`$${earnings}`} accent="text-foreground" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-display font-bold text-primary">{wins}</div>
            <div className="text-xs text-muted-foreground mt-1">Wins</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-display font-bold text-destructive">{losses}</div>
            <div className="text-xs text-muted-foreground mt-1">Losses</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-display font-bold text-muted-foreground">{draws}</div>
            <div className="text-xs text-muted-foreground mt-1">Draws</div>
          </div>
        </div>

        {u.wallet_address && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-foreground mb-3 flex items-center gap-2">
              <Wallet size={16} /> WALLET
            </h3>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="font-mono">{u.wallet_address}</span>
              <ExternalLink size={10} />
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-semibold tracking-wider text-foreground">RECENT GAMES</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/history')}>
              View All
            </Button>
          </div>
          {recentGames && recentGames.length > 0 ? (
            <div className="space-y-2">
              {recentGames.slice(0, 3).map((m) => {
                const isWhite = m.white_user_id === userId;
                const won = (m.result === 'white' && isWhite) || (m.result === 'black' && !isWhite);
                const drew = m.result === 'draw';
                const ratingDelta = isWhite
                  ? (m.white_rating_after ?? 0) - (m.white_rating_before ?? 0)
                  : (m.black_rating_after ?? 0) - (m.black_rating_before ?? 0);

                return (
                  <div key={m.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${won ? 'bg-primary' : drew ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                      <span className="text-sm text-foreground">
                        vs <span className="font-semibold">{isWhite ? m.black_username : m.white_username}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{m.time_control}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.stake_usdc > 0 && (
                        <span className="text-xs text-accent">${m.stake_usdc}</span>
                      )}
                      <span className={`text-xs font-display font-bold flex items-center gap-0.5 ${ratingDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {ratingDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {ratingDelta >= 0 ? '+' : ''}{ratingDelta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No games played yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className={`flex items-center gap-1.5 mb-1 ${accent}`}>
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className={`font-display text-xl font-bold ${accent}`}>{value}</div>
  </div>
);

export default Dashboard;
