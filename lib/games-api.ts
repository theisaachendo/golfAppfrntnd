import { apiRequest } from '@/lib/api';

export type PendingChange = { byId: string; winnerId: string | null; tied: boolean };

export type Hole = {
  holeNumber: number;
  par?: number;
  winnerId?: string | null;
  tied?: boolean;
  pending?: PendingChange | null;
};

export type Game = {
  id: string;
  code: string;
  name: string;
  stakePerHole: number;
  numHoles?: number;
  status: string;
  players?: { id?: string; displayName: string }[];
  currentHole?: number;
  holes?: Hole[];
  leaderboard?: { playerId: string; name: string; skinsWon: number; totalEarnings: number }[];
  completedAt?: string;
};

export type CreateGameBody = { name: string; stakePerHole: number; numHoles?: number };
export type CreateGameResponse = {
  id: string;
  code: string;
  name: string;
  stakePerHole: number;
  numHoles: number;
  status: string;
};

export async function createGame(body: CreateGameBody): Promise<CreateGameResponse> {
  return apiRequest<CreateGameResponse>('/api/games', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type JoinGameBody = { code: string };
export type JoinGameResponse = { gameId: string; id: string; code: string; name: string; stakePerHole: number };

export async function joinGame(body: JoinGameBody): Promise<JoinGameResponse> {
  return apiRequest<JoinGameResponse>('/api/games/join', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getGame(gameId: string): Promise<Game> {
  return apiRequest<Game>(`/api/games/${gameId}`);
}

export async function startGame(gameId: string): Promise<Game> {
  return apiRequest<Game>(`/api/games/${gameId}/start`, { method: 'POST' });
}

export type HoleResultResponse = {
  status: 'applied' | 'pending' | 'noop';
  holes: Game['holes'];
  currentHole: number;
  leaderboard: Game['leaderboard'];
};

// Set a hole result: a winner, or a tie (carryover). First entry applies
// directly; changing a decided hole returns status 'pending' until accepted.
export async function setHoleResult(
  gameId: string,
  holeNumber: number,
  result: { winnerId: string } | { tied: true }
): Promise<HoleResultResponse> {
  return apiRequest(`/api/games/${gameId}/holes/${holeNumber}`, {
    method: 'PATCH',
    body: JSON.stringify(result),
  });
}

export async function acceptHoleChange(gameId: string, holeNumber: number): Promise<HoleResultResponse> {
  return apiRequest(`/api/games/${gameId}/holes/${holeNumber}/accept`, { method: 'POST' });
}

export async function rejectHoleChange(gameId: string, holeNumber: number): Promise<HoleResultResponse> {
  return apiRequest(`/api/games/${gameId}/holes/${holeNumber}/reject`, { method: 'POST' });
}

export async function endGame(gameId: string): Promise<{ id: string; status: string; completedAt: string }> {
  return apiRequest(`/api/games/${gameId}/end`, { method: 'POST' });
}

export type ResultRow = { playerId: string; name: string; skinsWon: number; payout: number };

export async function getGameResults(gameId: string): Promise<ResultRow[]> {
  return apiRequest<ResultRow[]>(`/api/games/${gameId}/results`);
}

// "Who owes whom" for a completed game (friends settle off-app).
export type Settlement = {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
  settled: boolean;
  settledAt?: string | null;
  involvesViewer: boolean;
  viewerOwes: boolean;
};

export async function getGameSettlements(gameId: string): Promise<Settlement[]> {
  return apiRequest<Settlement[]>(`/api/games/${gameId}/settlements`);
}

export async function markSettlementSettled(
  settlementId: string,
  settled = true
): Promise<{ id: string; settled: boolean; settledAt?: string | null }> {
  return apiRequest(`/api/users/me/settlements/${settlementId}/settle`, {
    method: 'POST',
    body: JSON.stringify({ settled }),
  });
}
