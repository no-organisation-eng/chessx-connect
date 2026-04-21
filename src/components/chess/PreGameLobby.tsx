import React, { useState, useEffect } from 'react';
import { Clock, Swords, Bot, User, Link2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TIME_CONTROLS } from '@/hooks/useChessTimer';
import type { AIDifficulty } from '@/hooks/useChessAI';
import { buildInviteUrl, copyInvite, generateInviteCode } from '@/lib/invite';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ThemePicker from './ThemePicker';

interface PreGameLobbyProps {
  onStartGame: (timeControl: string, vsAI: boolean, difficulty: AIDifficulty) => void;
}

const TIME_CATEGORIES = {
  Bullet: ['Bullet 1+0', 'Bullet 2+1'],
  Blitz: ['Blitz 3+0', 'Blitz 5+3'],
  Rapid: ['Rapid 10+5', 'Classical 15+10'],
  Unlimited: ['Unlimited'],
};

const STAKES = [
  { value: 0, label: 'FREE', icon: '🆓' },
  { value: 1, label: '$1 USDC', icon: '💰' },
  { value: 5, label: '$5 USDC', icon: '🔥' },
  { value: 10, label: '$10 USDC', icon: '🏆' },
];

const DIFFICULTIES: { value: AIDifficulty; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: '~800 ELO' },
  { value: 'medium', label: 'Medium', desc: '~1400 ELO' },
  { value: 'hard', label: 'Hard', desc: '~2000 ELO' },
];

const PreGameLobby: React.FC<PreGameLobbyProps> = ({ onStartGame }) => {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'ai' | 'matchmaking' | 'friend'>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [stake, setStake] = useState(0);
  const [searching, setSearching] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const vsAI = gameMode === 'ai';

  useEffect(() => {
    if (!searching) return;

    if (vsAI) {
      const t = setTimeout(() => {
        if (selectedTime) onStartGame(selectedTime, vsAI, difficulty);
      }, 1000);
      return () => clearTimeout(t);
    }

    // PvP Matchmaking logic
    let interval: number;
    const startMatchmaking = async () => {
      try {
        const cfg = TIME_CONTROLS[selectedTime!];
        
        // 1. Enter queue
        const { data, error } = await supabase.functions.invoke('matchmaking', {
          body: {
            path: 'queue',
            time_control: selectedTime,
            stake_usdc: stake,
            time_seconds: cfg.initialTime === Infinity ? 0 : cfg.initialTime,
            increment_seconds: cfg.increment,
          },
        });

        if (error) throw error;
        if (data.status === 'matched') {
          navigate(`/play?m=${data.match_id}`);
          return;
        }

        // 2. Poll for status
        interval = window.setInterval(async () => {
          const { data: statusData } = await supabase.functions.invoke('matchmaking', {
            body: { path: 'status' },
          });
          if (statusData?.match_id) {
            clearInterval(interval);
            navigate(`/play?m=${statusData.match_id}`);
          }
        }, 2000);
      } catch (e: any) {
        toast.error('Matchmaking failed', { description: e.message });
        setSearching(false);
      }
    };

    startMatchmaking();
    return () => clearInterval(interval);
  }, [searching, vsAI, selectedTime, stake, navigate, onStartGame, difficulty]);

  const handlePlay = async () => {
    if (!selectedTime) return;
    
    if (gameMode === 'friend') {
      try {
        const cfg = TIME_CONTROLS[selectedTime];
        const { data, error } = await supabase.functions.invoke('create-match-invite', {
          body: {
            time_control: selectedTime,
            time_seconds: cfg.initialTime === Infinity ? 0 : cfg.initialTime,
            increment_seconds: cfg.increment,
            stake_usdc: stake,
            creator_color: 'random'
          }
        });
        
        if (error) throw error;
        if (data.ok) {
          const url = buildInviteUrl(`/play/${data.invite.code}`);
          setInviteUrl(url);
          toast.success('Invite link generated!');
        }
      } catch (e: any) {
        toast.error('Could not create invite', { description: e.message });
      }
    } else {
      setSearching(true);
    }
  };

  const handleCancel = async () => {
    setSearching(false);
    setInviteUrl(null);
    if (gameMode === 'matchmaking') {
      await supabase.functions.invoke('matchmaking', { body: { path: 'cancel' } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 w-full max-w-md mx-auto px-4">
      {searching ? (
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-display text-sm tracking-widest uppercase text-muted-foreground">
            {vsAI ? 'Setting up AI opponent...' : 'Finding opponent...'}
          </p>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground">{selectedTime}</p>
            {stake > 0 && (
              <span className="text-[10px] text-accent font-bold tracking-widest px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                STAKE: ${stake} USDC
              </span>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="text-xs text-destructive hover:underline mt-2 font-display tracking-widest uppercase"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <Swords className="mx-auto mb-3 text-primary" size={32} />
            <h2 className="font-display text-xl tracking-wider text-foreground">NEW GAME</h2>
            <p className="text-sm text-muted-foreground mt-1">Stakeless or Compeitive Play</p>
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => { setGameMode('ai'); setStake(0); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-xs font-medium transition-all border ${
                gameMode === 'ai' ? 'bg-primary/15 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Bot size={14} /> AI
            </button>
            <button
              onClick={() => setGameMode('matchmaking')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-xs font-medium transition-all border ${
                gameMode === 'matchmaking' ? 'bg-primary/15 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <User size={14} /> HUMAN
            </button>
            <button
              onClick={() => setGameMode('friend')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-xs font-medium transition-all border ${
                gameMode === 'friend' ? 'bg-primary/15 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Link2 size={14} /> FRIEND
            </button>
          </div>

          {!vsAI && (
            <div className="w-full space-y-2">
              <span className="text-[10px] text-muted-foreground font-display tracking-widest uppercase flex items-center gap-1.5">
                <Wallet size={12} /> {gameMode === 'friend' ? 'Match Stake' : 'Choose Stake'} (USDC)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {STAKES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStake(s.value)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all border flex flex-col items-center gap-1 ${
                      stake === s.value ? 'bg-accent/10 text-accent border-accent/50' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    <span className="text-base">{s.icon}</span>
                    <span className="text-xs">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {vsAI && (
            <div className="w-full space-y-2">
              <span className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">Difficulty</span>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                      difficulty === d.value ? 'bg-primary/15 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] opacity-60 font-normal">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                        selectedTime === name ? 'bg-primary/15 text-primary border-primary/30 neon-glow' : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/20'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <ThemePicker />

          {inviteUrl ? (
            <div className="w-full p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col gap-3 animate-in slide-in-from-bottom-2">
              <div className="space-y-1">
                <p className="text-[10px] text-accent font-bold tracking-widest uppercase">Invite Link Ready</p>
                <p className="text-xs text-muted-foreground">Ask your friend to open this link to join:</p>
              </div>
              <div className="p-3 bg-background border border-border rounded-lg text-[10px] font-mono break-all text-foreground">
                {inviteUrl}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyInvite(inviteUrl)}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-[10px] tracking-widest uppercase font-bold hover:bg-primary/90"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setInviteUrl(null)}
                  className="px-4 py-3 rounded-lg bg-secondary text-muted-foreground font-display text-[10px] tracking-widest uppercase hover:text-foreground"
                >
                  New
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handlePlay}
              disabled={!selectedTime}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-widest uppercase font-bold hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all neon-glow"
            >
              {gameMode === 'friend' ? 'CREATE INVITE' : (stake > 0 ? `STAKE $${stake} & PLAY` : 'START SEARCH')}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PreGameLobby;
