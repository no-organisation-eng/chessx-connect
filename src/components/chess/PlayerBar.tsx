import React from 'react';

interface PlayerBarProps {
  name: string;
  color: 'w' | 'b';
  isActive: boolean;
  capturedPieces: string[];
  timeLeft?: string;
  isLowTime?: boolean;
  rating?: number;
}

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const PIECE_SYMBOLS: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };

const PlayerBar: React.FC<PlayerBarProps> = ({
  name,
  color,
  isActive,
  capturedPieces,
  timeLeft = '∞',
  isLowTime = false,
  rating,
}) => {
  const advantage = capturedPieces.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);

  return (
    <div className="flex items-center justify-between w-full px-2 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            isActive ? 'bg-primary animate-pulse' : 'bg-muted'
          }`}
        />
        <span className="text-sm font-semibold text-foreground truncate">
          {name} {rating !== undefined && <span className="text-xs text-muted-foreground ml-1 font-normal">({rating})</span>}
        </span>
        {capturedPieces.length > 0 && (
          <span className="text-xs text-muted-foreground truncate hidden xs:inline">
            {capturedPieces.map((p) => PIECE_SYMBOLS[p]).join('')}
            {advantage > 0 && <span className="ml-1 opacity-60">+{advantage}</span>}
          </span>
        )}
      </div>
      <div
        className={`font-display text-base font-bold tabular-nums px-2 py-0.5 rounded transition-colors ${
          isLowTime
            ? 'text-destructive bg-destructive/10'
            : isActive
              ? 'text-primary'
              : 'text-muted-foreground'
        }`}
      >
        {timeLeft}
      </div>
    </div>
  );
};

export default PlayerBar;
