import { Link2, Palette } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import ChessBoard from '@/components/chess/ChessBoard';
import PlayerBar from '@/components/chess/PlayerBar';
import MoveHistory from '@/components/chess/MoveHistory';
import GameStatus from '@/components/chess/GameStatus';
import GameActions from '@/components/chess/GameActions';
import PromotionDialog from '@/components/chess/PromotionDialog';
import PreGameLobby from '@/components/chess/PreGameLobby';
import AppLayout from '@/components/layout/AppLayout';
import RealtimeGameView from './RealtimeGameView';
import { useChessGameContext } from '@/contexts/ChessGameContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BOARD_THEMES } from '@/lib/boardThemes';
import { buildInviteUrl, copyInvite, generateInviteCode } from '@/lib/invite';

const Index = () => {
  const { inviteCode } = useParams<{ inviteCode?: string }>();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('m');

  if (inviteCode || matchId) return <RealtimeGameView matchId={matchId} />;

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
  } = useChessGameContext();

  const { boardTheme, setBoardTheme } = useTheme();
  const cycleBoardTheme = () => {
    const ids = Object.keys(BOARD_THEMES) as (keyof typeof BOARD_THEMES)[];
    const idx = ids.indexOf(boardTheme);
    setBoardTheme(ids[(idx + 1) % ids.length]);
  };

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

          <div className="flex flex-col w-full max-w-[640px] mx-auto gap-1.5">
            <GameStatus gameState={gameState} flagged={timer.flagged} />

            <PlayerBar
              name={aiEnabled ? 'ChessX AI' : 'Opponent'}
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

            <PlayerBar
              name="You"
              color="w"
              isActive={gameState.turn === 'w'}
              capturedPieces={gameState.capturedPieces.w}
              timeLeft={timer.formatTime(timer.whiteTime)}
              isLowTime={!timer.isUnlimited && timer.whiteTime < 30}
            />

            <MoveHistory moves={gameState.moveHistory} />

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

            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-display tracking-widest uppercase px-1">
              <span>{timeControlName}</span>
              <div className="flex items-center gap-3">
                {aiThinking && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 border border-primary border-t-transparent rounded-full animate-spin" />
                    AI THINKING
                  </span>
                )}
                <button
                  onClick={cycleBoardTheme}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                  title={`Board: ${BOARD_THEMES[boardTheme].name} (click to cycle)`}
                >
                  <Palette size={11} /> {BOARD_THEMES[boardTheme].name.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Index;
