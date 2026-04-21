

## Add Themeable Piece Sets & Board Themes

Right now pieces are rendered as Unicode glyphs (`♙♘♗`) inside `ChessPiece.tsx` and the board only has one wood color scheme defined via CSS variables. To get crisp pieces like your reference (cburnett/Lichess-style SVGs) plus support multiple visual themes, we'll switch to SVG-based piece sets with a theme selector.

### What you'll get

- **Crisp SVG pieces** that look like the reference image (no more font rendering quirks)
- **Multiple piece sets** to choose from: Cburnett (classic Lichess), Merida, Neo (modern flat), Chess24, and Pixel (8-bit retro)
- **Multiple board themes**: Wood (current), Brown (reference image), Green (chess.com), Blue, Ice, and Neon (matches app vibe)
- **Theme picker** in the Pre-Game Lobby and a quick toggle in the game footer
- **Persisted choice** in localStorage so it stays across sessions

### Implementation

1. **SVG piece assets** — Add `src/assets/pieces/<set>/<color><type>.svg` for 5 sets × 12 pieces. Use the public-domain cburnett set (used by Lichess) and other CC0/MIT sets bundled inline. Each svg sized 45×45 viewBox so they scale cleanly.

2. **Piece set registry** (`src/lib/pieceThemes.ts`)
   ```ts
   export const PIECE_SETS = {
     cburnett: { name: 'Cburnett', pieces: { wp: wpCburnett, ... } },
     merida:   { name: 'Merida',   pieces: { ... } },
     neo:      { name: 'Neo',      pieces: { ... } },
     pixel:    { name: 'Pixel',    pieces: { ... } },
     unicode:  { name: 'Classic',  pieces: null }, // fallback to current glyphs
   };
   ```

3. **Board theme registry** (`src/lib/boardThemes.ts`) — Each theme exports light/dark/highlight/lastMove HSL values:
   ```ts
   brown: { light:'30 55% 80%', dark:'27 40% 50%', ... }   // matches your image
   green: { light:'60 25% 92%', dark:'95 30% 45%', ... }   // chess.com
   neon:  { light:'220 18% 18%', dark:'220 22% 10%', ... } // current dark vibe
   ```

4. **Theme context** (`src/contexts/ThemeContext.tsx`) — Holds `pieceSet` + `boardTheme`, persists to localStorage, and writes board CSS variables (`--board-light`, `--board-dark`, etc.) onto `document.documentElement` so existing Tailwind classes (`bg-board-light`) automatically reflect the theme.

5. **Refactor `ChessPiece.tsx`** — Read `pieceSet` from context; if SVG set, render `<img src={set.pieces[color+type]} />`; if `unicode`, fall back to current glyph rendering.

6. **`ThemePicker.tsx` component** — Visual grid showing each piece set rendered on a 2×2 mini-board preview, plus board-color swatches. Mounted in `PreGameLobby` ("Appearance" section) and accessible via a small palette icon in the game footer.

### Technical notes

- SVG assets imported via Vite's `?url` so they're hashed/cached and tree-shaken if unused
- Coordinate label colors in `ChessBoard.tsx` currently hardcode wood-theme HSLs (lines 80, 86) — switch to reading from CSS vars (`hsl(var(--board-light))`) so they adapt
- No backend changes; pure frontend
- The reference image's piece style matches the **cburnett** set, which will be the default

### Files touched

```text
NEW  src/assets/pieces/cburnett/{wp,wn,wb,wr,wq,wk,bp,bn,bb,br,bq,bk}.svg
NEW  src/assets/pieces/merida/...
NEW  src/assets/pieces/neo/...
NEW  src/assets/pieces/pixel/...
NEW  src/lib/pieceThemes.ts
NEW  src/lib/boardThemes.ts
NEW  src/contexts/ThemeContext.tsx
NEW  src/components/chess/ThemePicker.tsx
EDIT src/components/chess/ChessPiece.tsx       (SVG rendering)
EDIT src/components/chess/ChessBoard.tsx       (label color from CSS vars)
EDIT src/components/chess/PreGameLobby.tsx     (mount ThemePicker)
EDIT src/pages/Index.tsx                       (palette button in footer)
EDIT src/App.tsx                               (wrap with ThemeProvider)
```

