import React from 'react';

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
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl md:text-5xl',
};

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, size = 'lg' }) => {
  return (
    <span
      className={`${sizeClasses[size]} select-none leading-none drop-shadow-lg transition-transform duration-150 hover:scale-110`}
      style={{
        filter: color === 'w'
          ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
        color: color === 'w' ? '#f0e6d3' : '#1a1a2e',
        WebkitTextStroke: color === 'b' ? '1px #555' : 'none',
      }}
    >
      {PIECE_UNICODE[color]?.[type] || ''}
    </span>
  );
};

export default ChessPiece;
