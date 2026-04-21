import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { PIECE_SETS, type PieceKey } from '@/lib/pieceThemes';

const PIECE_UNICODE: Record<string, Record<string, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

interface ChessPieceProps {
  type: string;
  color: 'w' | 'b';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-5 h-5 text-lg',
  md: 'w-7 h-7 text-2xl',
  lg: 'w-full h-full text-4xl md:text-5xl',
};

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, size = 'lg' }) => {
  const { pieceSet } = useTheme();
  const set = PIECE_SETS[pieceSet];

  if (set.pieces) {
    const key = `${color}${type}` as PieceKey;
    const src = set.pieces[key];
    if (!src) return null;
    return (
      <img
        src={src}
        alt={`${color}${type}`}
        draggable={false}
        className={`${sizeClasses[size]} select-none pointer-events-none transition-transform duration-150 hover:scale-110`}
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}
      />
    );
  }

  // Unicode fallback
  return (
    <span
      className={`${sizeClasses[size]} flex items-center justify-center select-none leading-none drop-shadow-lg transition-transform duration-150 hover:scale-110`}
      style={{
        color: color === 'w' ? '#f0e6d3' : '#1a1a2e',
        WebkitTextStroke: color === 'b' ? '1px #555' : 'none',
        filter: color === 'w'
          ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
      }}
    >
      {PIECE_UNICODE[color]?.[type] || ''}
    </span>
  );
};

export default ChessPiece;
