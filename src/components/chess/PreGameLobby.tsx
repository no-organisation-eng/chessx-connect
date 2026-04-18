import React, { useState, useEffect } from 'react';
import { Clock, Swords, Bot, User, Link2 } from 'lucide-react';
import { TIME_CONTROLS } from '@/hooks/useChessTimer';
import type { AIDifficulty } from '@/hooks/useChessAI';
import { buildInviteUrl, copyInvite, generateInviteCode } from '@/lib/invite';

interface PreGameLobbyProps {
  onStartGame: (timeControl: string, vsAI: boolean, difficulty: AIDifficulty) => void;
}

const TIME_CATEGORIES = {
  Bullet: ['Bullet 1+0', 'Bullet 2+1'],
  Blitz: ['Blitz 3+0', 'Blitz 5+3'],
  Rapid: ['Rapid 10+5', 'Classical 15+10'],
  Unlimited: ['Unlimited'],
};

const DIFFICULTIES: { value: AIDifficulty; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: '~800 ELO' },
  { value: 'medium', label: 'Medium', desc: '~1400 ELO' },
  { value: 'hard', label: 'Hard', desc: '~2000 ELO' },
];

const PreGameLobby: React.FC<PreGameLobbyProps> = ({ onStartGame }) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [vsAI, setVsAI] = useState(true);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searching) return;
    const t = setTimeout(() => {
      if (selectedTime) onStartGame(selectedTime, vsAI, difficulty);
    }, vsAI ? 800 : 2000);
    return () => clearTimeout(t);
  }, [searching]);

  const handlePlay = () => {
    if (!selectedTime) return;
    setSearching(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 w-full max-w-md mx-auto px-4">
      {searching ? (
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-display text-sm tracking-widest uppercase text-muted-foreground">
            {vsAI ? 'Setting up AI opponent...' : 'Finding opponent...'}
          </p>
          <p className="text-xs text-muted-foreground">{selectedTime}</p>
          <button
            onClick={() => setSearching(false)}
            className="text-xs text-destructive hover:underline mt-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <Swords className="mx-auto mb-3 text-primary" size={32} />
            <h2 className="font-display text-xl tracking-wider text-foreground">NEW GAME</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose your time control</p>
          </div>

          {/* Opponent toggle */}
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setVsAI(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all border ${
                vsAI
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Bot size={16} /> vs AI
            </button>
            <button
              onClick={() => setVsAI(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all border ${
                !vsAI
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <User size={16} /> vs Human
            </button>
          </div>

          {/* AI Difficulty */}
          {vsAI && (
            <div className="w-full space-y-2">
              <span className="text-xs text-muted-foreground font-display tracking-widest uppercase">Difficulty</span>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                      difficulty === d.value
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] opacity-60">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time controls */}
          <div className="w-full space-y-3">
            {Object.entries(TIME_CATEGORIES).map(([category, controls]) => (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">{category}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {controls.map((name) => (
                    <button
                      key={name}
                      onClick={() => setSelectedTime(name)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        selectedTime === name
                          ? 'bg-primary/15 text-primary border-primary/30 neon-glow'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/20'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Play button */}
          <button
            onClick={handlePlay}
            disabled={!selectedTime}
            className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm tracking-widest uppercase font-semibold hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all neon-glow"
          >
            PLAY
          </button>

          {!vsAI && (
            <button
              onClick={async () => {
                if (!selectedTime) return;
                try {
                  const cfg = TIME_CONTROLS[selectedTime];
                  const { supabase } = await import('@/integrations/supabase/client');
                  const { data, error } = await supabase.functions.invoke('create-match-invite', {
                    body: {
                      time_control: selectedTime,
                      time_seconds: cfg.initialTime === Infinity ? 0 : cfg.initialTime,
                      increment_seconds: cfg.increment,
                    },
                  });
                  if (error) throw error;
                  if (!data?.ok) throw new Error(data?.error ?? 'Could not create invite');
                  const url = buildInviteUrl(`/play/${data.invite.code}`);
                  await copyInvite(url, 'Game invite');
                } catch (e) {
                  const { toast } = await import('sonner');
                  toast.error('Could not create invite', {
                    description: e instanceof Error ? e.message : 'Unknown error',
                  });
                }
              }}
              disabled={!selectedTime}
              className="w-full -mt-3 py-2.5 rounded-lg bg-secondary text-foreground font-display text-xs tracking-widest uppercase font-medium hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-border"
            >
              <Link2 size={14} /> CREATE INVITE LINK
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PreGameLobby;
