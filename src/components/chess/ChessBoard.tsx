import React from 'react';
import { Square } from 'chess.js';
import ChessPiece from './ChessPiece';
import { GameState } from '@/hooks/useChessGame';

interface ChessBoardProps {
  gameState: GameState;
  selectedSquare: Square | null;
  legalMoves: Square[];
  onSquareClick: (square: Square) => void;
  flipped?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function parseFen(fen: string) {
  const board: (null | { type: string; color: 'w' | 'b' })[][] = [];
  const rows = fen.split(' ')[0].split('/');
  for (const row of rows) {
    const rank: (null | { type: string; color: 'w' | 'b' })[] = [];
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch); i++) rank.push(null);
      } else {
        const color = ch === ch.toUpperCase() ? 'w' : 'b';
        rank.push({ type: ch.toLowerCase(), color });
      }
    }
    board.push(rank);
  }
  return board;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  selectedSquare,
  legalMoves,
  onSquareClick,
  flipped = false,
}) => {
  const board = parseFen(gameState.fen);
  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  return (
    <div className="relative">
      <div className="rounded-lg overflow-hidden neon-glow border border-border">
        <div className="grid grid-cols-8 grid-rows-8 aspect-square w-full max-w-[560px]">
          {ranks.map((rank, ri) =>
            files.map((file, fi) => {
              const square = `${file}${rank}` as Square;
              const isLight = (ri + fi) % 2 === 0;
              const piece = board[RANKS.indexOf(rank)][FILES.indexOf(file)];
              const isSelected = selectedSquare === square;
              const isLegal = legalMoves.includes(square);
              const isLastMove =
                gameState.lastMove?.from === square ||
                gameState.lastMove?.to === square;

              let bgClass = isLight ? 'bg-board-light' : 'bg-board-dark';
              if (isSelected) bgClass = 'bg-board-highlight/60';
              else if (isLastMove) bgClass = isLight ? 'bg-board-last-move/30' : 'bg-board-last-move/20';

              return (
                <button
                  key={square}
                  className={`${bgClass} relative flex items-center justify-center transition-colors duration-100 cursor-pointer aspect-square w-full h-full`}
                  onClick={() => onSquareClick(square)}
                >
                  {isLegal && !piece && (
                    <div className="absolute w-3 h-3 rounded-full bg-board-highlight/50" />
                  )}
                  {isLegal && piece && (
                    <div className="absolute inset-1 rounded-full border-[3px] border-board-highlight/50" />
                  )}
                  {piece && <ChessPiece type={piece.type} color={piece.color} />}
                  {fi === 0 && (
                    <span className="absolute top-0.5 left-1 text-[10px] font-semibold opacity-70 font-body select-none"
                      style={{ color: isLight ? 'hsl(var(--board-dark))' : 'hsl(var(--board-light))' }}>
                      {rank}
                    </span>
                  )}
                  {ri === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-[10px] font-semibold opacity-70 font-body select-none"
                      style={{ color: isLight ? 'hsl(var(--board-dark))' : 'hsl(var(--board-light))' }}>
                      {file}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
