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
    if (!gameId) return;
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

    const update = isOver
      ? {
          live_fen: newFen,
          pgn: newPgn,
          turn,
          status: 'completed' as const,
          result: result ?? undefined,
          termination: termination ?? undefined,
          ended_at: new Date().toISOString(),
        }
      : { live_fen: newFen, pgn: newPgn, turn };

    const { error } = await supabase.from('games').update(update).eq('id', gameId);
    if (error) {
      toast.error('Move failed: ' + error.message);
      // rollback local
      game.undo();
      setGameState(deriveFromChess(game));
    }
  }, [game, gameId]);

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
  };
}
