import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { PIECE_SETS, type PieceSetId } from '@/lib/pieceThemes';
import { BOARD_THEMES, type BoardThemeId } from '@/lib/boardThemes';

const PIECE_OPTIONS: PieceSetId[] = ['cburnett', 'merida', 'pixel', 'unicode'];
const BOARD_OPTIONS: BoardThemeId[] = ['brown', 'green', 'wood', 'blue', 'ice', 'neon'];

const ThemePicker: React.FC = () => {
  const { pieceSet, boardTheme, setPieceSet, setBoardTheme } = useTheme();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <Palette size={12} className="text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">
          Appearance
        </span>
      </div>

      {/* Piece set previews */}
      <div className="grid grid-cols-4 gap-2">
        {PIECE_OPTIONS.map((id) => {
          const set = PIECE_SETS[id];
          const isActive = pieceSet === id;
          return (
            <button
              key={id}
              onClick={() => setPieceSet(id)}
              className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                isActive
                  ? 'bg-primary/15 border-primary/40 neon-glow'
                  : 'bg-secondary border-border hover:border-primary/20'
              }`}
            >
              <div className="grid grid-cols-2 w-full aspect-square rounded overflow-hidden">
                <div className="bg-board-light flex items-center justify-center">
                  {set.pieces ? (
                    <img src={set.pieces.wk} alt="" className="w-full h-full p-0.5" draggable={false} />
                  ) : (
                    <span className="text-base" style={{ color: '#f0e6d3', WebkitTextStroke: '0.5px #555' }}>♔</span>
                  )}
                </div>
                <div className="bg-board-dark flex items-center justify-center">
                  {set.pieces ? (
                    <img src={set.pieces.bn} alt="" className="w-full h-full p-0.5" draggable={false} />
                  ) : (
                    <span className="text-base" style={{ color: '#1a1a2e', WebkitTextStroke: '0.5px #555' }}>♞</span>
                  )}
                </div>
                <div className="bg-board-dark flex items-center justify-center">
                  {set.pieces ? (
                    <img src={set.pieces.wp} alt="" className="w-full h-full p-0.5" draggable={false} />
                  ) : (
                    <span className="text-base" style={{ color: '#f0e6d3', WebkitTextStroke: '0.5px #555' }}>♙</span>
                  )}
                </div>
                <div className="bg-board-light flex items-center justify-center">
                  {set.pieces ? (
                    <img src={set.pieces.bq} alt="" className="w-full h-full p-0.5" draggable={false} />
                  ) : (
                    <span className="text-base" style={{ color: '#1a1a2e', WebkitTextStroke: '0.5px #555' }}>♛</span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-display tracking-wider uppercase ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {set.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Board color swatches */}
      <div className="grid grid-cols-6 gap-2">
        {BOARD_OPTIONS.map((id) => {
          const theme = BOARD_THEMES[id];
          const isActive = boardTheme === id;
          return (
            <button
              key={id}
              onClick={() => setBoardTheme(id)}
              title={theme.name}
              className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                isActive ? 'border-primary neon-glow' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="grid grid-cols-2 w-full h-full">
                <div style={{ background: `hsl(${theme.light})` }} />
                <div style={{ background: `hsl(${theme.dark})` }} />
                <div style={{ background: `hsl(${theme.dark})` }} />
                <div style={{ background: `hsl(${theme.light})` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemePicker;
