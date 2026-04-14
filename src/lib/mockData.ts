// Mock data for UI pages before backend integration

export interface MockUser {
  id: string;
  username: string;
  platform_rating: number;
  skill_tier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  trust_score: number;
  lichess_username?: string;
  lichess_verified_at?: string;
  lichess_rating_blitz?: number;
  wallet_address?: string;
  chx_balance: number;
  usdc_balance: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  avatar_url?: string;
  created_at: string;
}

export interface MockMatch {
  id: string;
  white_username: string;
  black_username: string;
  white_rating_before: number;
  black_rating_before: number;
  white_rating_after: number | null;
  black_rating_after: number | null;
  time_control: string;
  time_seconds: number;
  increment_seconds: number;
  stake_usdc: number;
  status: 'pending' | 'active' | 'completed' | 'aborted';
  result: 'white' | 'black' | 'draw' | 'aborted' | null;
  termination: 'checkmate' | 'timeout' | 'resign' | 'stalemate' | 'agreement' | null;
  white_accuracy: number | null;
  black_accuracy: number | null;
  started_at: string;
  ended_at: string | null;
}

export interface MockTournament {
  id: string;
  name: string;
  format: 'swiss' | 'round_robin' | 'single_elim' | 'double_elim';
  time_control: string;
  entry_fee_usdc: number;
  prize_pool_usdc: number;
  max_players: number;
  current_players: number;
  min_rating: number | null;
  max_rating: number | null;
  status: 'registration' | 'active' | 'completed' | 'cancelled';
  started_at: string | null;
  created_at: string;
}

export interface MockRatingHistory {
  date: string;
  rating: number;
}

export const currentUser: MockUser = {
  id: 'u-001',
  username: 'NeonKnight',
  platform_rating: 1542,
  skill_tier: 'Advanced',
  trust_score: 95,
  lichess_username: 'NeonKnight42',
  lichess_verified_at: '2026-03-15T10:00:00Z',
  lichess_rating_blitz: 1680,
  wallet_address: '0x1a2b...9f3e',
  chx_balance: 2450.5,
  usdc_balance: 125.00,
  games_played: 347,
  wins: 198,
  losses: 121,
  draws: 28,
  streak: 5,
  created_at: '2026-01-10T08:00:00Z',
};

export const leaderboard: MockUser[] = [
  { id: 'u-100', username: 'GrandMstr_X', platform_rating: 2341, skill_tier: 'Pro', trust_score: 100, chx_balance: 15200, usdc_balance: 890, games_played: 1203, wins: 892, losses: 245, draws: 66, streak: 12, created_at: '2025-11-01T00:00:00Z' },
  { id: 'u-101', username: 'QuantumBishop', platform_rating: 2198, skill_tier: 'Pro', trust_score: 98, chx_balance: 11300, usdc_balance: 560, games_played: 987, wins: 701, losses: 220, draws: 66, streak: 8, created_at: '2025-12-05T00:00:00Z' },
  { id: 'u-102', username: 'CryptoRook', platform_rating: 2054, skill_tier: 'Pro', trust_score: 97, chx_balance: 9800, usdc_balance: 420, games_played: 856, wins: 589, losses: 211, draws: 56, streak: 3, created_at: '2025-12-20T00:00:00Z' },
  { id: 'u-103', username: 'BaseKing', platform_rating: 1987, skill_tier: 'Advanced', trust_score: 96, chx_balance: 7600, usdc_balance: 310, games_played: 723, wins: 478, losses: 198, draws: 47, streak: 6, created_at: '2026-01-02T00:00:00Z' },
  { id: 'u-104', username: 'NeonKnight', platform_rating: 1542, skill_tier: 'Advanced', trust_score: 95, chx_balance: 2450, usdc_balance: 125, games_played: 347, wins: 198, losses: 121, draws: 28, streak: 5, created_at: '2026-01-10T00:00:00Z' },
  { id: 'u-105', username: 'ZK_Pawn', platform_rating: 1489, skill_tier: 'Intermediate', trust_score: 92, chx_balance: 1800, usdc_balance: 80, games_played: 290, wins: 155, losses: 110, draws: 25, streak: 2, created_at: '2026-01-15T00:00:00Z' },
  { id: 'u-106', username: 'DefiGambit', platform_rating: 1423, skill_tier: 'Intermediate', trust_score: 88, chx_balance: 1200, usdc_balance: 55, games_played: 215, wins: 110, losses: 85, draws: 20, streak: 0, created_at: '2026-02-01T00:00:00Z' },
  { id: 'u-107', username: 'L2_Checkmate', platform_rating: 1398, skill_tier: 'Intermediate', trust_score: 90, chx_balance: 980, usdc_balance: 40, games_played: 178, wins: 89, losses: 72, draws: 17, streak: 1, created_at: '2026-02-10T00:00:00Z' },
  { id: 'u-108', username: 'OnChainQueen', platform_rating: 1355, skill_tier: 'Intermediate', trust_score: 94, chx_balance: 750, usdc_balance: 30, games_played: 145, wins: 72, losses: 58, draws: 15, streak: 4, created_at: '2026-02-20T00:00:00Z' },
  { id: 'u-109', username: 'BlockPusher', platform_rating: 1201, skill_tier: 'Beginner', trust_score: 85, chx_balance: 320, usdc_balance: 10, games_played: 45, wins: 18, losses: 22, draws: 5, streak: 0, created_at: '2026-03-01T00:00:00Z' },
];

export const recentMatches: MockMatch[] = [
  { id: 'm-001', white_username: 'NeonKnight', black_username: 'ZK_Pawn', white_rating_before: 1535, black_rating_before: 1495, white_rating_after: 1542, black_rating_after: 1489, time_control: 'blitz', time_seconds: 300, increment_seconds: 3, stake_usdc: 5, status: 'completed', result: 'white', termination: 'checkmate', white_accuracy: 87.5, black_accuracy: 72.3, started_at: '2026-04-14T09:00:00Z', ended_at: '2026-04-14T09:12:00Z' },
  { id: 'm-002', white_username: 'DefiGambit', black_username: 'NeonKnight', white_rating_before: 1430, black_rating_before: 1528, white_rating_after: 1423, black_rating_after: 1535, time_control: 'blitz', time_seconds: 300, increment_seconds: 3, stake_usdc: 10, status: 'completed', result: 'black', termination: 'resign', white_accuracy: 65.1, black_accuracy: 91.2, started_at: '2026-04-13T20:00:00Z', ended_at: '2026-04-13T20:08:00Z' },
  { id: 'm-003', white_username: 'NeonKnight', black_username: 'BaseKing', white_rating_before: 1540, black_rating_before: 1990, white_rating_after: 1528, black_rating_after: 1987, time_control: 'rapid', time_seconds: 600, increment_seconds: 5, stake_usdc: 25, status: 'completed', result: 'black', termination: 'timeout', white_accuracy: 78.9, black_accuracy: 88.4, started_at: '2026-04-13T15:00:00Z', ended_at: '2026-04-13T15:22:00Z' },
  { id: 'm-004', white_username: 'CryptoRook', black_username: 'NeonKnight', white_rating_before: 2060, black_rating_before: 1545, white_rating_after: 2054, black_rating_after: 1540, time_control: 'bullet', time_seconds: 60, increment_seconds: 0, stake_usdc: 2, status: 'completed', result: 'draw', termination: 'stalemate', white_accuracy: 82.0, black_accuracy: 80.5, started_at: '2026-04-12T22:00:00Z', ended_at: '2026-04-12T22:02:00Z' },
  { id: 'm-005', white_username: 'NeonKnight', black_username: 'L2_Checkmate', white_rating_before: 1530, black_rating_before: 1405, white_rating_after: 1545, black_rating_after: 1398, time_control: 'blitz', time_seconds: 180, increment_seconds: 0, stake_usdc: 5, status: 'completed', result: 'white', termination: 'checkmate', white_accuracy: 93.2, black_accuracy: 68.7, started_at: '2026-04-12T18:00:00Z', ended_at: '2026-04-12T18:06:00Z' },
];

export const tournaments: MockTournament[] = [
  { id: 't-001', name: 'Base Blitz Arena', format: 'swiss', time_control: 'blitz', entry_fee_usdc: 10, prize_pool_usdc: 500, max_players: 64, current_players: 48, min_rating: null, max_rating: null, status: 'registration', started_at: null, created_at: '2026-04-10T00:00:00Z' },
  { id: 't-002', name: 'Pro Rapid Championship', format: 'single_elim', time_control: 'rapid', entry_fee_usdc: 50, prize_pool_usdc: 2500, max_players: 32, current_players: 32, min_rating: 1800, max_rating: null, status: 'active', started_at: '2026-04-14T12:00:00Z', created_at: '2026-04-05T00:00:00Z' },
  { id: 't-003', name: 'Beginner Friendly Cup', format: 'round_robin', time_control: 'rapid', entry_fee_usdc: 0, prize_pool_usdc: 100, max_players: 16, current_players: 12, min_rating: null, max_rating: 1400, status: 'registration', started_at: null, created_at: '2026-04-12T00:00:00Z' },
  { id: 't-004', name: 'Bullet Madness', format: 'swiss', time_control: 'bullet', entry_fee_usdc: 5, prize_pool_usdc: 250, max_players: 128, current_players: 128, min_rating: null, max_rating: null, status: 'completed', started_at: '2026-04-11T18:00:00Z', created_at: '2026-04-08T00:00:00Z' },
  { id: 't-005', name: 'CHX Invitational', format: 'double_elim', time_control: 'classical', entry_fee_usdc: 100, prize_pool_usdc: 5000, max_players: 16, current_players: 8, min_rating: 2000, max_rating: null, status: 'registration', started_at: null, created_at: '2026-04-13T00:00:00Z' },
];

export const ratingHistory: MockRatingHistory[] = [
  { date: '2026-01', rating: 1200 },
  { date: '2026-02', rating: 1320 },
  { date: '2026-03', rating: 1410 },
  { date: '2026-04-W1', rating: 1480 },
  { date: '2026-04-W2', rating: 1542 },
];
