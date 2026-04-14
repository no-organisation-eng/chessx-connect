import React from 'react';
import ChessBoard from '@/components/chess/ChessBoard';
import PlayerPanel from '@/components/chess/PlayerPanel';
import MoveHistory from '@/components/chess/MoveHistory';
import GameControls from '@/components/chess/GameControls';
import GameStatus from '@/components/chess/GameStatus';
import PromotionDialog from '@/components/chess/PromotionDialog';
import AIControls from '@/components/chess/AIControls';
import TimeControlSelect from '@/components/chess/TimeControlSelect';
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
    undoMove,
    aiEnabled,
    aiDifficulty,
    aiThinking,
    toggleAI,
    setAiDifficulty,
    timer,
    timeControlName,
    changeTimeControl,
  } = useChessGame();

  const gameInProgress = gameState.moveHistory.length > 0;

  return (
    <AppLayout>
      {pendingPromotion && (
        <PromotionDialog
          color={gameState.turn}
          onSelect={handlePromotion}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        <div className="flex flex-col gap-3 w-full max-w-md mx-auto lg:mx-0">
          <PlayerPanel
            name={aiEnabled ? 'ChessX AI' : 'Player 2'}
            color="b"
            isActive={gameState.turn === 'b'}
            capturedPieces={gameState.capturedPieces.b}
            timeLeft={timer.formatTime(timer.blackTime)}
            isLowTime={!timer.isUnlimited && timer.blackTime < 30}
          />
          <ChessBoard
            gameState={gameState}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            onSquareClick={handleSquareClick}
          />
          <PlayerPanel
            name="Player 1"
            color="w"
            isActive={gameState.turn === 'w'}
            capturedPieces={gameState.capturedPieces.w}
            timeLeft={timer.formatTime(timer.whiteTime)}
            isLowTime={!timer.isUnlimited && timer.whiteTime < 30}
          />
        </div>

        <div className="w-full lg:w-64 flex flex-col gap-4">
          <GameStatus gameState={gameState} flagged={timer.flagged} />
          <AIControls
            aiEnabled={aiEnabled}
            aiDifficulty={aiDifficulty}
            aiThinking={aiThinking}
            onToggleAI={toggleAI}
            onDifficultyChange={setAiDifficulty}
          />
          <TimeControlSelect
            selected={timeControlName}
            onChange={changeTimeControl}
            disabled={gameInProgress}
          />
          <MoveHistory moves={gameState.moveHistory} />
          <GameControls
            onReset={resetGame}
            onUndo={undoMove}
            isGameOver={gameState.isGameOver}
            canUndo={gameState.moveHistory.length > 0}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
