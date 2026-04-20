import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { useChessTimer, TimerConfig, TIME_CONTROLS } from './useChessTimer';
import { useChessSounds } from './useChessSounds';
import { useChessAI, AIDifficulty } from './useChessAI';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GameState {
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
  resignation?: 'w' | 'b';
  agreedDraw?: boolean;
}

function deriveState(g: Chess): GameState {
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

export function useChessGame() {
  const [game] = useState(() => new Chess());
  const [gameState, setGameState] = useState<GameState>(() => deriveState(game));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [drawProposed, setDrawProposed] = useState(false);
  const [takebackProposed, setTakebackProposed] = useState(false);

  // Game started state
  const [gameStarted, setGameStarted] = useState(false);

  // AI
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [aiThinking, setAiThinking] = useState(false);
  const { getAIMove } = useChessAI();

  // Timer
  const [timeControlName, setTimeControlName] = useState('Blitz 5+3');
  const [timerConfig, setTimerConfig] = useState<TimerConfig>(TIME_CONTROLS['Blitz 5+3']);
  const timer = useChessTimer(timerConfig);

  // Sounds
  const sounds = useChessSounds();

  const gameStartedRef = useRef(false);

  const playMoveSound = useCallback((move: Move, state: GameState) => {
    if (state.isCheckmate) sounds.playCheckmate();
    else if (state.isGameOver) sounds.playGameOver();
    else if (state.isCheck) sounds.playCheck();
    else if (move.flags.includes('k') || move.flags.includes('q')) sounds.playCastle();
    else if (move.flags.includes('p')) sounds.playPromotion();
    else if (move.captured) sounds.playCapture();
    else sounds.playMove();
  }, [sounds]);

  const afterMove = useCallback((move: Move) => {
    const newState = deriveState(game);
    setGameState(newState);
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveCount((c) => c + 1);
    setDrawProposed(false);
    setTakebackProposed(false);
    playMoveSound(move, newState);

    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      timer.startClock(newState.turn);
    } else if (!newState.isGameOver) {
      timer.switchClock(newState.turn);
    } else {
      timer.stopClock();
    }
  }, [game, timer, playMoveSound]);

  const isPromotion = useCallback((from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (!piece || piece.type !== 'p') return false;
    const toRank = to[1];
    return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1');
  }, [game]);

  const handlePromotion = useCallback((piece: string) => {
    if (!pendingPromotion) return;
    try {
      const move = game.move({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
      if (move) afterMove(move);
    } catch { /* invalid */ }
    setPendingPromotion(null);
  }, [game, pendingPromotion, afterMove]);

  const handleSquareClick = useCallback((square: Square) => {
    if (gameState.isGameOver || pendingPromotion) return;
    if (aiEnabled && game.turn() === 'b') return;

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
          afterMove(move);
          return;
        }
      } catch { /* invalid */ }
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [game, selectedSquare, gameState.isGameOver, pendingPromotion, afterMove, isPromotion, aiEnabled]);

  // AI move
  useEffect(() => {
    if (!aiEnabled || gameState.isGameOver || gameState.turn !== 'b' || pendingPromotion) return;

    let cancelled = false;
    setAiThinking(true);

    getAIMove(gameState.fen, aiDifficulty).then((aiMove) => {
      if (cancelled || !aiMove) {
        setAiThinking(false);
        return;
      }
      try {
        const move = game.move(aiMove);
        if (move) afterMove(move);
      } catch { /* invalid */ }
      setAiThinking(false);
    });

    return () => { cancelled = true; };
  }, [aiEnabled, gameState.turn, gameState.isGameOver, gameState.fen, aiDifficulty, pendingPromotion]);

  // Flag timeout
  useEffect(() => {
    if (timer.flagged && !gameState.isGameOver) {
      sounds.playFlag();
      setGameState((prev) => ({ ...prev, isGameOver: true }));
      timer.stopClock();
    }
  }, [timer.flagged]);

  // Save game on completion
  const savedRef = useRef(false);
  useEffect(() => {
    if (!gameState.isGameOver || savedRef.current || !gameStarted) return;
    savedRef.current = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('username, platform_rating')
        .eq('id', user.id)
        .maybeSingle();

      let result: 'white' | 'black' | 'draw' | null = null;
      let termination: string | null = null;

      if (gameState.resignation) {
        result = gameState.resignation === 'w' ? 'black' : 'white';
        termination = 'resign';
      } else if (gameState.isCheckmate) {
        result = gameState.turn === 'w' ? 'black' : 'white';
        termination = 'checkmate';
      } else if (timer.flagged) {
        result = gameState.turn === 'w' ? 'black' : 'white';
        termination = 'timeout';
      } else if (gameState.agreedDraw) {
        result = 'draw';
        termination = 'agreement';
      } else if (gameState.isStalemate) {
        result = 'draw';
        termination = 'stalemate';
      } else if (gameState.isDraw) {
        result = 'draw';
        termination = 'agreement';
      }

      if (!result) return;

      const { error } = await supabase.from('matches').insert({
        white_user_id: user.id,
        white_username: profile?.username ?? 'You',
        black_username: aiEnabled ? 'ChessX AI' : 'Opponent',
        result,
        termination,
        pgn: game.pgn(),
        time_control: timeControlName,
        time_seconds: timerConfig.initialTime,
        increment_seconds: timerConfig.increment,
        white_rating_before: profile?.platform_rating ?? 1200,
        ended_at: new Date().toISOString(),
      });

      if (!error) toast.success('Game saved to history');
    })();
  }, [gameState.isGameOver]);

  const resign = useCallback(() => {
    const loser = game.turn() as 'w' | 'b';
    timer.stopClock();
    setGameState((prev) => ({ ...prev, isGameOver: true, resignation: loser }));
    sounds.playGameOver();
  }, [game, timer, sounds]);

  const proposeDraw = useCallback(() => {
    if (aiEnabled) {
      // AI accepts draw ~30% of the time
      const accepted = Math.random() < 0.3;
      if (accepted) {
        timer.stopClock();
        setGameState((prev) => ({ ...prev, isGameOver: true, isDraw: true, agreedDraw: true }));
        sounds.playGameOver();
      } else {
        setDrawProposed(true);
      }
    } else {
      // In local play, draw is accepted immediately
      timer.stopClock();
      setGameState((prev) => ({ ...prev, isGameOver: true, isDraw: true, agreedDraw: true }));
      sounds.playGameOver();
    }
  }, [aiEnabled, timer, sounds]);

  const proposeTakeback = useCallback(() => {
    if (aiEnabled) {
      // AI accepts takeback ~50% of time
      const accepted = Math.random() < 0.5;
      if (accepted) {
        game.undo();
        game.undo();
        setGameState(deriveState(game));
        setSelectedSquare(null);
        setLegalMoves([]);
        setPendingPromotion(null);
      } else {
        setTakebackProposed(true);
      }
    } else {
      game.undo();
      setGameState(deriveState(game));
      setSelectedSquare(null);
      setLegalMoves([]);
      setPendingPromotion(null);
    }
  }, [game, aiEnabled]);

  const resetGame = useCallback(() => {
    game.reset();
    setGameState(deriveState(game));
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    setMoveCount(0);
    setAiThinking(false);
    setDrawProposed(false);
    setTakebackProposed(false);
    setGameStarted(false);
    gameStartedRef.current = false;
    savedRef.current = false;
    timer.resetTimer();
  }, [game, timer]);

  const startGame = useCallback((timeControl: string, vsAI: boolean, difficulty: AIDifficulty) => {
    setTimeControlName(timeControl);
    setTimerConfig(TIME_CONTROLS[timeControl]);
    setAiEnabled(vsAI);
    setAiDifficulty(difficulty);
    game.reset();
    setGameState(deriveState(game));
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    setMoveCount(0);
    setAiThinking(false);
    setDrawProposed(false);
    setTakebackProposed(false);
    gameStartedRef.current = false;
    savedRef.current = false;
    setGameStarted(true);
  }, [game]);

  return {
    gameState,
    selectedSquare,
    legalMoves,
    pendingPromotion,
    handleSquareClick,
    handlePromotion,
    resetGame,
    resign,
    proposeDraw,
    proposeTakeback,
    drawProposed,
    takebackProposed,
    aiEnabled,
    aiDifficulty,
    aiThinking,
    timer,
    timeControlName,
    gameStarted,
    startGame,
  };
}
