import { useEffect, useRef, useState, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RealtimeGameRow {
  id: string;
  white_id: string | null;
  black_id: string | null;
  white_username: string | null;
  black_username: string | null;
  live_fen: string | null;
  turn: 'w' | 'b' | null;
  status: 'waiting' | 'active' | 'completed' | 'aborted';
  pgn: string | null;
  result: string | null;
  termination: string | null;
  time_control: string;
  time_seconds: number;
  increment_seconds: number;
  stake_usdc: number;
  white_funded: boolean;
  black_funded: boolean;
  white_time_ms: number | null;
  black_time_ms: number | null;
  last_move_at: string | null;
  pending_draw_from: 'w' | 'b' | null;
  pending_takeback_from: 'w' | 'b' | null;
}

export interface RealtimeGameState {
  fen: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isGameOver: boolean;
  moveHistory: Move[];
  lastMove: { from: Square; to: Square } | null;
  capturedPieces: { w: string[]; b: string[] };
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function deriveFromChess(g: Chess): RealtimeGameState {
  const history = g.history({ verbose: true });
  const lastMove = history.length > 0
    ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
    : null;
  const captured: { w: string[]; b: string[] } = { w: [], b: [] };
  history.forEach((m) => {
    if (m.captured) {
      if (m.color === 'w') captured.b.push(m.captured);
      else captured.w.push(m.captured);
    }
  });
  return {
    fen: g.fen(),
    turn: g.turn() as 'w' | 'b',
    isCheck: g.isCheck(),
    isCheckmate: g.isCheckmate(),
    isDraw: g.isDraw(),
    isStalemate: g.isStalemate(),
    isGameOver: g.isGameOver(),
    moveHistory: history,
    lastMove,
    capturedPieces: captured,
  };
}

export function useRealtimeGame(gameId: string | null, userId: string | null) {
  const [game] = useState(() => new Chess());
  const [row, setRow] = useState<RealtimeGameRow | null>(null);
  const [gameState, setGameState] = useState<RealtimeGameState>(() => deriveFromChess(game));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const myColor: 'w' | 'b' | null =
    !row || !userId ? null : row.white_id === userId ? 'w' : row.black_id === userId ? 'b' : null;

  const applyRow = useCallback((r: RealtimeGameRow) => {
    setRow(r);
    if (r.pgn) {
      try {
        game.loadPgn(r.pgn);
      } catch {
        if (r.live_fen) game.load(r.live_fen);
      }
    } else if (r.live_fen) {
      game.load(r.live_fen);
    } else {
      game.load(STARTING_FEN);
    }
    setGameState(deriveFromChess(game));
  }, [game]);

  // Initial load
  useEffect(() => {
    if (!gameId) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .maybeSingle();
      if (!active) return;
      if (error) {
        toast.error('Could not load game');
        setLoading(false);
        return;
      }
      if (data) applyRow(data as unknown as RealtimeGameRow);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [gameId, applyRow]);

  // Realtime subscription
  useEffect(() => {
    if (!gameId) return;
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => applyRow(payload.new as unknown as RealtimeGameRow),
      )
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, [gameId, applyRow]);

  const pushMove = useCallback(async (move: Move) => {
    if (!gameId || !row) return;
    const newFen = game.fen();
    const newPgn = game.pgn();
    const turn = game.turn() as 'w' | 'b';
    const isOver = game.isGameOver();
    let result: 'white' | 'black' | 'draw' | null = null;
    let termination: string | null = null;
    if (game.isCheckmate()) {
      result = turn === 'w' ? 'black' : 'white';
      termination = 'checkmate';
    } else if (game.isStalemate()) {
      result = 'draw'; termination = 'stalemate';
    } else if (game.isDraw()) {
      result = 'draw'; termination = 'agreement';
    }

    // Compute clock: subtract elapsed since last_move_at from the side that just moved,
    // then add the increment.
    const moverColor = move.color as 'w' | 'b';
    const now = Date.now();
    const lastTs = row.last_move_at ? new Date(row.last_move_at).getTime() : now;
    const baseRemaining = moverColor === 'w'
      ? row.white_time_ms ?? row.time_seconds * 1000
      : row.black_time_ms ?? row.time_seconds * 1000;
    const elapsed = Math.max(0, now - lastTs);
    const increment = (row.increment_seconds ?? 0) * 1000;
    const newRemaining = Math.max(0, baseRemaining - elapsed + increment);

    const flagged = newRemaining <= 0 && !isOver;
    if (flagged) {
      result = moverColor === 'w' ? 'black' : 'white';
      termination = 'timeout';
    }

    const baseUpdate = {
      live_fen: newFen,
      pgn: newPgn,
      turn,
      last_move_at: new Date(now).toISOString(),
      ...(moverColor === 'w'
        ? { white_time_ms: newRemaining }
        : { black_time_ms: newRemaining }),
    };

    const update = (isOver || flagged)
      ? {
          ...baseUpdate,
          status: 'completed' as const,
          result: result ?? undefined,
          termination: termination ?? undefined,
          ended_at: new Date().toISOString(),
        }
      : baseUpdate;

    const { error } = await supabase.from('games').update(update).eq('id', gameId);
    if (error) {
      toast.error('Move failed: ' + error.message);
      game.undo();
      setGameState(deriveFromChess(game));
    }
  }, [game, gameId, row]);

  const isPromotion = useCallback((from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (!piece || piece.type !== 'p') return false;
    const toRank = to[1];
    return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1');
  }, [game]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!row || row.status !== 'active') return;
    if (gameState.isGameOver || pendingPromotion) return;
    if (myColor !== game.turn()) return; // not your turn

    if (selectedSquare) {
      if (isPromotion(selectedSquare, square)) {
        const moves = game.moves({ square: selectedSquare, verbose: true });
        if (moves.some((m) => m.to === square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
      }
      try {
        const move = game.move({ from: selectedSquare, to: square, promotion: 'q' });
        if (move) {
          setGameState(deriveFromChess(game));
          setSelectedSquare(null);
          setLegalMoves([]);
          pushMove(move);
          return;
        }
      } catch { /* invalid */ }
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn() && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [row, gameState.isGameOver, pendingPromotion, myColor, selectedSquare, isPromotion, game, pushMove]);

  const handlePromotion = useCallback((piece: string) => {
    if (!pendingPromotion) return;
    try {
      const move = game.move({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
      if (move) {
        setGameState(deriveFromChess(game));
        pushMove(move);
      }
    } catch { /* invalid */ }
    setPendingPromotion(null);
  }, [game, pendingPromotion, pushMove]);

  const resign = useCallback(async () => {
    if (!gameId || !myColor) return;
    const result = myColor === 'w' ? 'black' : 'white';
    await supabase.from('games').update({
      status: 'completed',
      result,
      termination: 'resign',
      ended_at: new Date().toISOString(),
    }).eq('id', gameId);
  }, [gameId, myColor]);

  const offerDraw = useCallback(async () => {
    if (!gameId || !myColor || !row || row.status !== 'active') return;
    if (row.pending_draw_from) return;
    await supabase.from('games').update({ pending_draw_from: myColor }).eq('id', gameId);
    toast.success('Draw offer sent');
  }, [gameId, myColor, row]);

  const acceptDraw = useCallback(async () => {
    if (!gameId || !row?.pending_draw_from || row.pending_draw_from === myColor) return;
    await supabase.from('games').update({
      status: 'completed',
      result: 'draw',
      termination: 'agreement',
      ended_at: new Date().toISOString(),
      pending_draw_from: null,
    }).eq('id', gameId);
  }, [gameId, row, myColor]);

  const declineDraw = useCallback(async () => {
    if (!gameId) return;
    await supabase.from('games').update({ pending_draw_from: null }).eq('id', gameId);
  }, [gameId]);

  const offerTakeback = useCallback(async () => {
    if (!gameId || !myColor || !row || row.status !== 'active') return;
    if (row.pending_takeback_from) return;
    if (game.history().length === 0) return;
    await supabase.from('games').update({ pending_takeback_from: myColor }).eq('id', gameId);
    toast.success('Takeback request sent');
  }, [gameId, myColor, row, game]);

  const acceptTakeback = useCallback(async () => {
    if (!gameId || !row?.pending_takeback_from || row.pending_takeback_from === myColor) return;
    // Undo the last move (made by the requester)
    game.undo();
    const newFen = game.fen();
    const newPgn = game.pgn();
    const newTurn = game.turn() as 'w' | 'b';
    await supabase.from('games').update({
      live_fen: newFen,
      pgn: newPgn,
      turn: newTurn,
      pending_takeback_from: null,
      last_move_at: new Date().toISOString(),
    }).eq('id', gameId);
    setGameState(deriveFromChess(game));
  }, [gameId, row, myColor, game]);

  const declineTakeback = useCallback(async () => {
    if (!gameId) return;
    await supabase.from('games').update({ pending_takeback_from: null }).eq('id', gameId);
  }, [gameId]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!row || row.status !== 'active') return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [row?.status, row?.last_move_at]);

  const computeRemaining = (color: 'w' | 'b'): number => {
    if (!row) return 0;
    const stored = (color === 'w' ? row.white_time_ms : row.black_time_ms)
      ?? row.time_seconds * 1000;
    if (row.status !== 'active' || row.turn !== color) return Math.max(0, stored);
    const lastTs = row.last_move_at ? new Date(row.last_move_at).getTime() : now;
    return Math.max(0, stored - (now - lastTs));
  };

  const whiteTimeMs = computeRemaining('w');
  const blackTimeMs = computeRemaining('b');

  // Auto-flag: if it's my turn and my clock hits 0, push timeout result
  useEffect(() => {
    if (!row || !gameId || !myColor || row.status !== 'active') return;
    if (row.turn !== myColor) return;
    const myTime = myColor === 'w' ? whiteTimeMs : blackTimeMs;
    if (myTime > 0) return;
    const result = myColor === 'w' ? 'black' : 'white';
    supabase.from('games').update({
      status: 'completed',
      result,
      termination: 'timeout',
      ended_at: new Date().toISOString(),
      ...(myColor === 'w' ? { white_time_ms: 0 } : { black_time_ms: 0 }),
    }).eq('id', gameId);
  }, [whiteTimeMs, blackTimeMs, row, myColor, gameId]);

  return {
    row,
    gameState,
    selectedSquare,
    legalMoves,
    pendingPromotion,
    handleSquareClick,
    handlePromotion,
    resign,
    loading,
    myColor,
    whiteTimeMs,
    blackTimeMs,
  };
}
