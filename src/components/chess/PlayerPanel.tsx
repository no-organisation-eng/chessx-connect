import React from 'react';
import ChessPiece from './ChessPiece';

interface PlayerPanelProps {
  name: string;
  rating?: number;
  color: 'w' | 'b';
  isActive: boolean;
  capturedPieces: string[];
  timeLeft?: string;
  isLowTime?: boolean;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  name,
  rating,
  color,
  isActive,
  capturedPieces,
  timeLeft = '∞',
  isLowTime = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 ${
        isActive
          ? 'bg-secondary border border-primary/30 neon-glow'
          : 'bg-card border border-border'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-display font-bold ${
            color === 'w'
              ? 'bg-foreground/90 text-background'
              : 'bg-muted text-foreground'
          }`}
        >
          {name[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{name}</span>
            {rating && <span className="text-xs text-muted-foreground">({rating})</span>}
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            )}
          </div>
          <div className="flex gap-0.5 mt-0.5 min-h-[20px]">
            {capturedPieces.map((p, i) => (
              <ChessPiece
                key={i}
                type={p}
                color={color === 'w' ? 'b' : 'w'}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className={`font-display text-xl font-bold tabular-nums px-3 py-1 rounded transition-colors ${
          isLowTime
            ? 'text-destructive bg-destructive/10'
            : isActive
              ? 'text-primary neon-text'
              : 'text-muted-foreground'
        }`}
      >
        {timeLeft}
      </div>
    </div>
  );
};

export default PlayerPanel;
