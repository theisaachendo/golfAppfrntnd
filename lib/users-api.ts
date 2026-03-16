import { apiRequest } from '@/lib/api';

export type User = {
  id: string;
  displayName: string;
  email?: string;
  balance: number;
  isGuest?: boolean;
};

export async function getMe(): Promise<User> {
  return apiRequest<User>('/api/users/me');
}

export async function getBalance(): Promise<{ balance: number }> {
  return apiRequest<{ balance: number }>('/api/users/me/balance');
}

export async function withdraw(amount: number): Promise<{ success: true; balance: number }> {
  return apiRequest<{ success: true; balance: number }>('/api/users/me/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export type MatchHistoryItem = {
  id: string;
  code: string;
  name: string;
  date: string;
  completedAt?: string;
  result: 'Won' | 'Lost';
  payout: number;
  playerCount: number;
};

export async function getMyGames(): Promise<MatchHistoryItem[]> {
  return apiRequest<MatchHistoryItem[]>('/api/users/me/games');
}

export type ActiveGame = { id: string } | null;

/** GET /api/users/me/active-game — current in-progress game, if any. */
export async function getActiveGame(): Promise<{ game: ActiveGame }> {
  return apiRequest<{ game: ActiveGame }>('/api/users/me/active-game');
}
