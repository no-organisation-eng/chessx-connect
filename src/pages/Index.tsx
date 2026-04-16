import React from 'react';
import ChessBoard from '@/components/chess/ChessBoard';
import PlayerPanel from '@/components/chess/PlayerPanel';
import MoveHistory from '@/components/chess/MoveHistory';
import GameStatus from '@/components/chess/GameStatus';
import GameActions from '@/components/chess/GameActions';
import PromotionDialog from '@/components/chess/PromotionDialog';
import PreGameLobby from '@/components/chess/PreGameLobby';
import AppLayout from '@/components/layout/AppLayout';
import { useChessGame } from '@/hooks/useChessGame';

const Index = () => {
  const {
    gameState,
    selectedSquare,
    legalMoves,
    pendingPromotion,
    handleSquareClick,
    handlePromotion,
    resetGame,
    resign,
    proposeDraw,
    proposeTakeback,
    drawProposed,
    takebackProposed,
    aiEnabled,
    aiThinking,
    timer,
    timeControlName,
    gameStarted,
    startGame,
  } = useChessGame();

  return (
    <AppLayout>
      {!gameStarted ? (
        <PreGameLobby onStartGame={startGame} />
      ) : (
        <>
          {pendingPromotion && (
            <PromotionDialog
              color={gameState.turn}
              onSelect={handlePromotion}
            />
          )}

          <div className="flex flex-col items-center w-full max-w-[560px] mx-auto gap-2">
            {/* Game status */}
            <GameStatus gameState={gameState} flagged={timer.flagged} />

            {/* Top player */}
            <PlayerPanel
              name={aiEnabled ? 'ChessX AI' : 'Player 2'}
              color="b"
              isActive={gameState.turn === 'b'}
              capturedPieces={gameState.capturedPieces.b}
              timeLeft={timer.formatTime(timer.blackTime)}
              isLowTime={!timer.isUnlimited && timer.blackTime < 30}
            />

            {/* Board */}
            <ChessBoard
              gameState={gameState}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              onSquareClick={handleSquareClick}
            />

            {/* Bottom player */}
            <PlayerPanel
              name="Player 1"
              color="w"
              isActive={gameState.turn === 'w'}
              capturedPieces={gameState.capturedPieces.w}
              timeLeft={timer.formatTime(timer.whiteTime)}
              isLowTime={!timer.isUnlimited && timer.whiteTime < 30}
            />

            {/* Horizontal move history */}
            <MoveHistory moves={gameState.moveHistory} />

            {/* Game actions: takeback, draw, resign, or new game */}
            <GameActions
              onResign={resign}
              onProposeDraw={proposeDraw}
              onProposeTakeback={proposeTakeback}
              onReset={resetGame}
              isGameOver={gameState.isGameOver}
              canTakeback={gameState.moveHistory.length > 0}
              drawProposed={drawProposed}
              takebackProposed={takebackProposed}
            />

            {aiThinking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>AI thinking...</span>
              </div>
            )}

            {/* Time control label */}
            <span className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">
              {timeControlName}
            </span>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Index;
