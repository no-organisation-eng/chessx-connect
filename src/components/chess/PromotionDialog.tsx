import React from 'react';
import ChessPiece from './ChessPiece';

interface PromotionDialogProps {
  color: 'w' | 'b';
  onSelect: (piece: string) => void;
}

const PIECES = ['q', 'r', 'b', 'n'] as const;
const LABELS: Record<string, string> = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };

const PromotionDialog: React.FC<PromotionDialogProps> = ({ color, onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-primary/30 rounded-xl p-6 neon-glow animate-in zoom-in-95 duration-200">
        <h3 className="font-display text-sm tracking-widest uppercase text-primary mb-4 text-center neon-text">
          Promote Pawn
        </h3>
        <div className="flex gap-3">
          {PIECES.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-primary/20 border border-border hover:border-primary/40 transition-all duration-150 hover:scale-105 cursor-pointer group"
              title={LABELS[piece]}
            >
              <ChessPiece type={piece} color={color} size="lg" />
              <span className="text-xs font-body text-muted-foreground group-hover:text-primary transition-colors">
                {LABELS[piece]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionDialog;
