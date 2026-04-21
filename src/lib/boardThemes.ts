export type BoardThemeId = 'wood' | 'brown' | 'green' | 'blue' | 'ice' | 'neon';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  // HSL values WITHOUT hsl() wrapper, e.g. "30 55% 80%"
  light: string;
  dark: string;
  highlight: string;
  lastMove: string;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    light: '35 30% 72%',
    dark: '145 25% 28%',
    highlight: '145 80% 42%',
    lastMove: '45 90% 55%',
  },
  brown: {
    id: 'brown',
    name: 'Brown',
    light: '30 55% 80%',
    dark: '27 40% 50%',
    highlight: '50 90% 55%',
    lastMove: '50 90% 55%',
  },
  green: {
    id: 'green',
    name: 'Green',
    light: '60 25% 92%',
    dark: '95 30% 45%',
    highlight: '50 95% 60%',
    lastMove: '50 95% 60%',
  },
  blue: {
    id: 'blue',
    name: 'Ocean',
    light: '210 35% 88%',
    dark: '210 45% 45%',
    highlight: '190 90% 55%',
    lastMove: '195 90% 60%',
  },
  ice: {
    id: 'ice',
    name: 'Ice',
    light: '200 60% 95%',
    dark: '210 30% 70%',
    highlight: '195 95% 55%',
    lastMove: '195 95% 60%',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    light: '220 18% 18%',
    dark: '220 22% 10%',
    highlight: '145 80% 42%',
    lastMove: '38 95% 55%',
  },
};

export const DEFAULT_BOARD_THEME: BoardThemeId = 'brown';

export function applyBoardTheme(theme: BoardTheme) {
  const root = document.documentElement;
  root.style.setProperty('--board-light', theme.light);
  root.style.setProperty('--board-dark', theme.dark);
  root.style.setProperty('--board-highlight', theme.highlight);
  root.style.setProperty('--board-last-move', theme.lastMove);
}
