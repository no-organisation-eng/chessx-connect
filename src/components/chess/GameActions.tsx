import React from 'react';
import { Flag, Undo2, Handshake, RotateCcw, Zap } from 'lucide-react';

interface GameActionsProps {
  onResign: () => void;
  onProposeDraw: () => void;
  onProposeTakeback: () => void;
  onReset: () => void;
  isGameOver: boolean;
  canTakeback: boolean;
  drawProposed: boolean;
  takebackProposed: boolean;
}

const GameActions: React.FC<GameActionsProps> = ({
  onResign,
  onProposeDraw,
  onProposeTakeback,
  onReset,
  isGameOver,
  canTakeback,
  drawProposed,
  takebackProposed,
}) => {
  if (isGameOver) {
    return (
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-display font-semibold tracking-wide"
        >
          <Zap size={16} /> New Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onProposeTakeback}
        disabled={!canTakeback || takebackProposed}
        title="Propose Takeback"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-medium"
      >
        <Undo2 size={14} />
        <span className="hidden sm:inline">{takebackProposed ? 'Proposed' : 'Takeback'}</span>
      </button>
      <button
        onClick={onProposeDraw}
        disabled={drawProposed}
        title="Propose Draw"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-medium"
      >
        <Handshake size={14} />
        <span className="hidden sm:inline">{drawProposed ? 'Proposed' : 'Draw'}</span>
      </button>
      <button
        onClick={onResign}
        title="Resign"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-xs font-medium border border-destructive/20"
      >
        <Flag size={14} />
        <span className="hidden sm:inline">Resign</span>
      </button>
    </div>
  );
};

export default GameActions;
