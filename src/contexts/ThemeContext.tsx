import React, { createContext, useContext, useEffect, useState } from 'react';
import { PIECE_SETS, DEFAULT_PIECE_SET, type PieceSetId } from '@/lib/pieceThemes';
import { BOARD_THEMES, DEFAULT_BOARD_THEME, applyBoardTheme, type BoardThemeId } from '@/lib/boardThemes';

interface ThemeContextValue {
  pieceSet: PieceSetId;
  boardTheme: BoardThemeId;
  setPieceSet: (id: PieceSetId) => void;
  setBoardTheme: (id: BoardThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const LS_PIECE = 'chessx.pieceSet';
const LS_BOARD = 'chessx.boardTheme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pieceSet, setPieceSetState] = useState<PieceSetId>(() => {
    const saved = localStorage.getItem(LS_PIECE) as PieceSetId | null;
    return saved && PIECE_SETS[saved] ? saved : DEFAULT_PIECE_SET;
  });
  const [boardTheme, setBoardThemeState] = useState<BoardThemeId>(() => {
    const saved = localStorage.getItem(LS_BOARD) as BoardThemeId | null;
    return saved && BOARD_THEMES[saved] ? saved : DEFAULT_BOARD_THEME;
  });

  useEffect(() => {
    applyBoardTheme(BOARD_THEMES[boardTheme]);
  }, [boardTheme]);

  const setPieceSet = (id: PieceSetId) => {
    setPieceSetState(id);
    localStorage.setItem(LS_PIECE, id);
  };
  const setBoardTheme = (id: BoardThemeId) => {
    setBoardThemeState(id);
    localStorage.setItem(LS_BOARD, id);
  };

  return (
    <ThemeContext.Provider value={{ pieceSet, boardTheme, setPieceSet, setBoardTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
