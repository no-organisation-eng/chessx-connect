import React, { createContext, useContext } from 'react';
import { useChessGame } from '@/hooks/useChessGame';

type ChessGameValue = ReturnType<typeof useChessGame>;

const ChessGameContext = createContext<ChessGameValue | null>(null);

export const ChessGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const game = useChessGame();
  return <ChessGameContext.Provider value={game}>{children}</ChessGameContext.Provider>;
};

export function useChessGameContext() {
  const ctx = useContext(ChessGameContext);
  if (!ctx) throw new Error('useChessGameContext must be used inside ChessGameProvider');
  return ctx;
}
