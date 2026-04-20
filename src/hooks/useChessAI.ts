import { useCallback, useRef } from 'react';
import { Chess, Move } from 'chess.js';

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const PST: Record<string, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
};

function evaluateBoard(game: Chess): number {
  const board = game.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] || 0;
      const pst = PST[piece.type]?.[piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c] || 0;
      score += piece.color === 'w' ? (val + pst) : -(val + pst);
    }
  }
  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) return maximizing ? -99999 : 99999;
    if (game.isDraw()) return 0;
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  moves.sort((a, b) => {
    const aScore = a.captured ? PIECE_VALUES[a.captured] || 0 : 0;
    const bScore = b.captured ? PIECE_VALUES[b.captured] || 0 : 0;
    return bScore - aScore;
  });

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

const DEPTH_MAP: Record<AIDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export function useChessAI() {
  const thinkingRef = useRef(false);

  const getBestMove = useCallback((fen: string, difficulty: AIDifficulty): Move | null => {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const depth = DEPTH_MAP[difficulty];

    if (difficulty === 'easy' && Math.random() < 0.3) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const isMaximizing = game.turn() === 'w';
    let bestMove = moves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
      game.undo();

      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }, []);

  const getAIMove = useCallback(async (fen: string, difficulty: AIDifficulty): Promise<Move | null> => {
    if (thinkingRef.current) return null;
    thinkingRef.current = true;

    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

    const move = getBestMove(fen, difficulty);
    thinkingRef.current = false;
    return move;
  }, [getBestMove]);

  return { getAIMove, isThinking: thinkingRef.current };
}
