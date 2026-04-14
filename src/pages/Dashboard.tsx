import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Trophy, Swords, Target, Flame, Wallet, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentUser, recentMatches, ratingHistory } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import AppLayout from '@/components/layout/AppLayout';

const tierColors: Record<string, string> = {
  Beginner: 'text-muted-foreground',
  Intermediate: 'text-blue-400',
  Advanced: 'text-accent',
  Pro: 'text-primary',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const u = currentUser;
  const winRate = Math.round((u.wins / u.games_played) * 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-display text-2xl font-bold text-primary neon-glow">
              {u.username[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display text-xl font-bold text-foreground">{u.username}</h2>
                <span className={`font-display text-xs tracking-widest uppercase ${tierColors[u.skill_tier]}`}>
                  {u.skill_tier}
                </span>
                {u.lichess_username && (
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                    <Shield size={10} className="text-primary" /> Lichess Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span>Trust: {u.trust_score}%</span>
              </div>
            </div>
            <Button onClick={() => navigate('/play')} className="font-display tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 neon-glow">
              <Swords className="mr-2 h-4 w-4" /> FIND MATCH
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Trophy size={18} />} label="Rating" value={u.platform_rating.toString()} accent="text-primary" />
          <StatCard icon={<Target size={18} />} label="Win Rate" value={`${winRate}%`} accent="text-primary" />
          <StatCard icon={<Flame size={18} />} label="Streak" value={`${u.streak}W`} accent="text-accent" />
          <StatCard icon={<Swords size={18} />} label="Games" value={u.games_played.toString()} accent="text-foreground" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-display font-bold text-primary">{u.wins}</div>
            <div className="text-xs text-muted-foreground mt-1">Wins</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-display font-bold text-destructive">{u.losses}</div>
            <div className="text-xs text-muted-foreground mt-1">Losses</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-display font-bold text-muted-foreground">{u.draws}</div>
            <div className="text-xs text-muted-foreground mt-1">Draws</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display text-sm font-semibold tracking-wider text-foreground mb-4">RATING HISTORY</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingHistory}>
                <XAxis dataKey="date" tick={{ fill: 'hsl(215 12% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 50', 'dataMax + 50']} tick={{ fill: 'hsl(215 12% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 14% 18%)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(210 20% 92%)' }}
                />
                <Line type="monotone" dataKey="rating" stroke="hsl(145 80% 42%)" strokeWidth={2} dot={{ fill: 'hsl(145 80% 42%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display text-sm font-semibold tracking-wider text-foreground mb-3 flex items-center gap-2">
            <Wallet size={16} /> WALLET
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-xs text-muted-foreground">USDC</div>
              <div className="font-display font-bold text-foreground">${u.usdc_balance.toFixed(2)}</div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-xs text-muted-foreground">CHX</div>
              <div className="font-display font-bold text-accent">{u.chx_balance.toLocaleString()}</div>
            </div>
          </div>
          {u.wallet_address && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <span className="font-mono">{u.wallet_address}</span>
              <ExternalLink size={10} />
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-semibold tracking-wider text-foreground">RECENT GAMES</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/history')}>
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {recentMatches.slice(0, 3).map((m) => {
              const isWhite = m.white_username === u.username;
              const won = (m.result === 'white' && isWhite) || (m.result === 'black' && !isWhite);
              const drew = m.result === 'draw';
              const ratingDelta = isWhite
                ? (m.white_rating_after ?? 0) - m.white_rating_before
                : (m.black_rating_after ?? 0) - m.black_rating_before;

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
