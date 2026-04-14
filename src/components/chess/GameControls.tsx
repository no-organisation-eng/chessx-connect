import React from 'react';
import { RotateCcw, Undo2, Zap } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  onUndo: () => void;
  isGameOver: boolean;
  canUndo: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onUndo,
  isGameOver,
  canUndo,
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
      >
        <Undo2 size={16} /> Undo
      </button>
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-display font-semibold tracking-wide"
      >
        {isGameOver ? (
          <>
            <Zap size={16} /> New Game
          </>
        ) : (
          <>
            <RotateCcw size={16} /> Restart
          </>
        )}
      </button>
    </div>
  );
};

export default GameControls;
