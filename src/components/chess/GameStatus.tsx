import React from 'react';
import { GameState } from '@/hooks/useChessGame';
import { Trophy, AlertTriangle, Handshake, Clock } from 'lucide-react';

interface GameStatusProps {
  gameState: GameState;
  flagged?: 'w' | 'b' | null;
}

const GameStatus: React.FC<GameStatusProps> = ({ gameState, flagged }) => {
  if (gameState.resignation) {
    const winner = gameState.resignation === 'w' ? 'Black' : 'White';
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30">
        <Trophy className="text-accent" size={20} />
        <span className="font-display text-sm font-bold text-destructive">
          RESIGNED — {winner} wins!
        </span>
      </div>
    );
  }

  if (gameState.agreedDraw) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 amber-glow">
        <Handshake className="text-accent" size={20} />
        <span className="font-display text-sm font-bold text-accent">DRAW — By agreement</span>
      </div>
    );
  }

  if (flagged) {
    const winner = flagged === 'w' ? 'Black' : 'White';
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30">
        <Clock className="text-destructive" size={20} />
        <span className="font-display text-sm font-bold text-destructive">
          TIME OUT — {winner} wins!
        </span>
      </div>
    );
  }

  if (!gameState.isGameOver && !gameState.isCheck) return null;

  if (gameState.isCheckmate) {
    const winner = gameState.turn === 'w' ? 'Black' : 'White';
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/30 neon-glow">
        <Trophy className="text-accent" size={20} />
        <span className="font-display text-sm font-bold text-primary neon-text">
          CHECKMATE — {winner} wins!
        </span>
      </div>
    );
  }

  if (gameState.isDraw || gameState.isStalemate) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 amber-glow">
        <Handshake className="text-accent" size={20} />
        <span className="font-display text-sm font-bold text-accent">
          DRAW — {gameState.isStalemate ? 'Stalemate' : 'Game drawn'}
        </span>
      </div>
    );
  }

  if (gameState.isCheck) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30">
        <AlertTriangle className="text-destructive" size={16} />
        <span className="text-sm font-semibold text-destructive">Check!</span>
      </div>
    );
  }

  return null;
};

export default GameStatus;
