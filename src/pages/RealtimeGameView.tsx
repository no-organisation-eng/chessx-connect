import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeGame } from '@/hooks/useRealtimeGame';
import ChessBoard from '@/components/chess/ChessBoard';
import PlayerBar from '@/components/chess/PlayerBar';
import MoveHistory from '@/components/chess/MoveHistory';
import GameStatus from '@/components/chess/GameStatus';
import GameActions from '@/components/chess/GameActions';
import PromotionDialog from '@/components/chess/PromotionDialog';
import AppLayout from '@/components/layout/AppLayout';
import { buildInviteUrl, copyInvite } from '@/lib/invite';

interface RealtimeGameViewProps {
  matchId?: string | null;
}

const RealtimeGameView: React.FC<RealtimeGameViewProps> = ({ matchId }) => {
  const { inviteCode } = useParams<{ inviteCode?: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(matchId ?? null);
  const [resolving, setResolving] = useState(!matchId && !!inviteCode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Resolve invite code → game id (creating if needed)
  useEffect(() => {
    if (!inviteCode || !userId) return;
    let active = true;
    (async () => {
      setResolving(true);
      setErrorMsg(null);

      // Look up invite
      const { data: invite, error } = await supabase
        .from('match_invites')
        .select('*')
        .eq('code', inviteCode)
        .maybeSingle();

      if (!active) return;
      if (error || !invite) {
        setErrorMsg('Invite not found');
        setResolving(false);
        return;
      }

      // Already has a game? Just open it.
      if (invite.game_id) {
        setGameId(invite.game_id);
        setResolving(false);
        return;
      }

      // Creator viewing their own open invite → wait for opponent
      if (invite.creator_id === userId) {
        setResolving(false);
        return;
      }

      // Joiner: call accept-match-invite
      const { data: acceptData, error: aErr } = await supabase.functions.invoke(
        'accept-match-invite',
        { body: { code: inviteCode } },
      );
      if (!active) return;
      if (aErr || !acceptData?.ok) {
        setErrorMsg(acceptData?.error ?? aErr?.message ?? 'Could not join');
        setResolving(false);
        return;
      }
      setGameId(acceptData.game_id);
      setResolving(false);
    })();
    return () => { active = false; };
  }, [inviteCode, userId]);

  // Subscribe to invite changes so the creator sees the game start when joiner arrives
  useEffect(() => {
    if (!inviteCode || gameId) return;
    const channel = supabase
      .channel(`invite:${inviteCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'match_invites', filter: `code=eq.${inviteCode}` },
        (payload) => {
          const newRow = payload.new as { game_id?: string };
          if (newRow.game_id) setGameId(newRow.game_id);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [inviteCode, gameId]);

  const game = useRealtimeGame(gameId);

  if (resolving) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-display tracking-widest uppercase">JOINING GAME...</p>
        </div>
      </AppLayout>
    );
  }

  if (errorMsg) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-destructive font-display tracking-widest uppercase">{errorMsg}</p>
          <button
            onClick={() => navigate('/play')}
            className="text-xs text-primary hover:underline"
          >
            Back to lobby
          </button>
        </div>
      </AppLayout>
    );
  }

  // Creator waiting for opponent
  if (!gameId) {
    const inviteUrl = buildInviteUrl(`/play/${inviteCode}`);
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12 gap-5 max-w-md mx-auto text-center">
          <Loader2 className="animate-spin text-primary" size={32} />
          <h2 className="font-display text-lg tracking-wider text-foreground">WAITING FOR OPPONENT</h2>
          <p className="text-sm text-muted-foreground">Share this link with someone to start the game.</p>
          <div className="w-full bg-secondary border border-border rounded-lg p-3 text-xs font-mono break-all">
            {inviteUrl}
          </div>
          <button
            onClick={() => copyInvite(inviteUrl, 'Game invite')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-xs tracking-widest uppercase hover:bg-primary/90"
          >
            <Link2 size={14} /> COPY LINK
          </button>
        </div>
      </AppLayout>
    );
  }

  if (game.loading || !game.row) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const opponentName = game.myColor === 'w' ? game.row.black_username : game.row.white_username;
  const myName = game.myColor === 'w' ? game.row.white_username : game.row.black_username;
  const flipped = game.myColor === 'b';

  const fmt = (ms: number) => {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const myTimeMs = game.myColor === 'w' ? game.whiteTimeMs : game.blackTimeMs;
  const oppTimeMs = game.myColor === 'w' ? game.blackTimeMs : game.whiteTimeMs;

  return (
    <AppLayout>
      {game.pendingPromotion && (
        <PromotionDialog color={game.gameState.turn} onSelect={game.handlePromotion} />
      )}

      <div className="flex flex-col w-full max-w-[640px] mx-auto gap-1.5">
        <GameStatus gameState={game.gameState} />

        {game.row.status === 'pending' && (
          <div className="text-center py-2 text-xs text-accent font-display tracking-widest uppercase">
            Waiting for stake payments…
          </div>
        )}

        {game.row.pending_draw_from && game.row.pending_draw_from !== game.myColor && game.row.status === 'active' && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-xs">
            <span className="font-display tracking-widest uppercase text-accent">Opponent offers a draw</span>
            <div className="flex gap-2">
              <button onClick={game.acceptDraw} className="px-3 py-1 rounded bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider uppercase hover:bg-primary/90">Accept</button>
              <button onClick={game.declineDraw} className="px-3 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-semibold tracking-wider uppercase hover:bg-secondary/80">Decline</button>
            </div>
          </div>
        )}
        {game.row.pending_draw_from && game.row.pending_draw_from === game.myColor && game.row.status === 'active' && (
          <div className="text-center py-1.5 text-[10px] text-muted-foreground font-display tracking-widest uppercase">
            Draw offer pending…
          </div>
        )}

        {game.row.pending_takeback_from && game.row.pending_takeback_from !== game.myColor && game.row.status === 'active' && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-xs">
            <span className="font-display tracking-widest uppercase text-accent">Opponent requests takeback</span>
            <div className="flex gap-2">
              <button onClick={game.acceptTakeback} className="px-3 py-1 rounded bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider uppercase hover:bg-primary/90">Allow</button>
              <button onClick={game.declineTakeback} className="px-3 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-semibold tracking-wider uppercase hover:bg-secondary/80">Deny</button>
            </div>
          </div>
        )}
        {game.row.pending_takeback_from && game.row.pending_takeback_from === game.myColor && game.row.status === 'active' && (
          <div className="text-center py-1.5 text-[10px] text-muted-foreground font-display tracking-widest uppercase">
            Takeback request pending…
          </div>
        )}

        <PlayerBar
          name={opponentName ?? 'Opponent'}
          color={flipped ? 'w' : 'b'}
          isActive={game.gameState.turn !== game.myColor}
          capturedPieces={flipped ? game.gameState.capturedPieces.w : game.gameState.capturedPieces.b}
          timeLeft={fmt(oppTimeMs)}
        />

        <ChessBoard
          gameState={game.gameState}
          selectedSquare={game.selectedSquare}
          legalMoves={game.legalMoves}
          onSquareClick={game.handleSquareClick}
          flipped={flipped}
        />

        <PlayerBar
          name={myName ?? 'You'}
          color={flipped ? 'b' : 'w'}
          isActive={game.gameState.turn === game.myColor}
          capturedPieces={flipped ? game.gameState.capturedPieces.b : game.gameState.capturedPieces.w}
          timeLeft={fmt(myTimeMs)}
        />

        <MoveHistory moves={game.gameState.moveHistory} />

        <GameActions
          onResign={game.resign}
          onProposeDraw={game.offerDraw}
          onProposeTakeback={game.offerTakeback}
          onReset={() => navigate('/play')}
          isGameOver={game.gameState.isGameOver || game.row.status === 'completed'}
          canTakeback={game.gameState.moveHistory.length > 0}
          drawProposed={game.row.pending_draw_from === game.myColor}
          takebackProposed={game.row.pending_takeback_from === game.myColor}
        />

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-display tracking-widest uppercase px-1">
          <span>{game.row.time_control}</span>
          <span>LIVE PVP</span>
        </div>
      </div>
    </AppLayout>
  );
};

export default RealtimeGameView;
