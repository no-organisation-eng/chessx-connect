import React from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { recentMatches, currentUser } from '@/lib/mockData';
import AppLayout from '@/components/layout/AppLayout';

const terminationLabels: Record<string, string> = {
  checkmate: 'Checkmate',
  timeout: 'Timeout',
  resign: 'Resignation',
  stalemate: 'Stalemate',
  agreement: 'Agreement',
};

const MatchHistory = () => {
  const u = currentUser;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground">MATCH HISTORY</h2>
          <span className="text-xs text-muted-foreground">{recentMatches.length} games</span>
        </div>

        <div className="space-y-3">
          {recentMatches.map((m) => {
            const isWhite = m.white_username === u.username;
            const opponent = isWhite ? m.black_username : m.white_username;
            const won = (m.result === 'white' && isWhite) || (m.result === 'black' && !isWhite);
            const drew = m.result === 'draw';
            const ratingDelta = isWhite
              ? (m.white_rating_after ?? 0) - m.white_rating_before
              : (m.black_rating_after ?? 0) - m.black_rating_before;
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
                    <span className="text-foreground font-semibold">vs {opponent}</span>
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
