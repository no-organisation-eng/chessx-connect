

# Plan: Import chessx-base Code into This Project

## What is chessx-base?
A competitive chess platform built on Base blockchain with USDC staking. It includes:
- A playable chess board with AI opponent, timers, and sounds
- Pages: Auth (login/signup + wallet connect), Dashboard (stats + rating chart), Leaderboard, Match History, Tournaments
- A Solidity smart contract (ChessEscrow.sol) for trustless stake management
- Dark neon-green theme with Orbitron/Inter fonts
- Uses `chess.js`, `recharts`, and mock data throughout

## What needs to happen
Since this project is a blank Lovable template and the repo code exists on GitHub, I need to recreate all the files from the chessx-base repo in this project. The project structure already shares the same base template, so I only need to add/update the changed files.

### Step 1: Install new dependency
- Add `chess.js` (version `1.0.0-beta.8`) to package.json — this is the only new dependency not already present. `recharts` is already included.

### Step 2: Update design system
- **`src/index.css`** — Replace with the chessx dark theme (dark background, neon green primary, amber accent, board colors, Orbitron + Inter fonts import, neon-glow/neon-text/amber-glow utility classes)
- **`tailwind.config.ts`** — Add `fontFamily` (display: Orbitron, body: Inter), `board` and `neon` color tokens, `elevated` surface color, `pulse-glow` animation

### Step 3: Create chess game hooks (4 files)
- `src/hooks/useChessGame.ts` — Main game state management with chess.js
- `src/hooks/useChessAI.ts` — Minimax AI with piece-square tables
- `src/hooks/useChessTimer.ts` — Clock with time controls (bullet/blitz/rapid/classical)
- `src/hooks/useChessSounds.ts` — Web Audio API sound effects

### Step 4: Create chess components (9 files)
- `src/components/chess/ChessBoard.tsx` — 8x8 board with FEN parsing
- `src/components/chess/ChessPiece.tsx` — Unicode piece rendering
- `src/components/chess/PlayerPanel.tsx` — Player info, captured pieces, timer
- `src/components/chess/MoveHistory.tsx` — Scrollable move list
- `src/components/chess/GameControls.tsx` — Reset/undo buttons
- `src/components/chess/GameStatus.tsx` — Check/checkmate/draw banners
- `src/components/chess/PromotionDialog.tsx` — Piece selection dialog
- `src/components/chess/AIControls.tsx` — AI toggle + difficulty selector
- `src/components/chess/TimeControlSelect.tsx` — Time control picker

### Step 5: Create layout component
- `src/components/layout/AppLayout.tsx` — Header with logo + bottom nav bar

### Step 6: Create mock data
- `src/lib/mockData.ts` — Types and sample data for users, matches, tournaments, rating history

### Step 7: Create pages (5 new + update 1)
- `src/pages/Index.tsx` — Chess game page (play)
- `src/pages/Auth.tsx` — Login/signup with wallet connect
- `src/pages/Dashboard.tsx` — Player stats + rating chart (uses recharts)
- `src/pages/Leaderboard.tsx` — Top players ranking
- `src/pages/MatchHistory.tsx` — Past games list
- `src/pages/Tournaments.tsx` — Tournament listings

### Step 8: Update routing
- **`src/App.tsx`** — Add routes for `/auth`, `/dashboard`, `/play`, `/leaderboard`, `/history`, `/tournaments`

### Step 9: Create smart contract
- `contracts/ChessEscrow.sol` — Solidity escrow contract (reference file, not compiled in Vite)

## Technical Details
- ~25 files to create/update
- No backend needed — all mock data
- `chess.js` is the only new npm dependency
- The dark theme replaces the default light theme entirely (no `.dark` class needed)

