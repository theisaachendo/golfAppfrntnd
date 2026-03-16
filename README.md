# Golf Skins — Frontend

Expo (React Native) app for **Golf Skins**: create/join games, track holes and skins, view results, and manage balance/withdrawals. This README describes the current UI and data expectations so you can connect a backend.

---

## Tech stack

- **Expo SDK 55** — React Native with Expo Go / dev builds
- **expo-router** — File-based routing (stack + tabs)
- **React 19**, **TypeScript**
- **react-native-reanimated** — Animations
- **expo-blur**, **expo-linear-gradient**, **expo-haptics** — UI and feedback

---

## How to run

```bash
npm install
npm run ios    # or: npm start, then press i for iOS
npm run android
npm run web
```

- **iOS**: Xcode + simulator, or Expo Go on device.
- **Android**: Android Studio emulator or Expo Go.
- **Web**: `npm run web` (Expo web).

---

## Testing with the backend

The app is wired to the Golf Skins API. To test against your backend:

1. **Set the API URL**
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - Edit `.env` and set `EXPO_PUBLIC_API_URL`:
     - Local backend: `http://localhost:3000`
     - Physical device (backend on your machine): use your machine’s LAN IP, e.g. `http://192.168.1.10:3000`
     - Production: `https://golf-app-api-gv91.onrender.com`

2. **Restart the dev server** after changing `.env` (Expo reads env at start).

3. **Demo login** (if your backend seeds a demo user):
   - Email: `demo@example.com`
   - Password: `password`

4. **Flows to test**
   - **Login** → Sign in or “Continue as guest”.
   - **Create game** → Name + stake → Lobby shows game code; share code to join from another device/session.
   - **Join game** → Enter code → Lobby.
   - **Lobby** → Start game → Match screen: tap holes to set skin winner, then “End game & see results”.
   - **Profile** → Balance from API; “Request withdrawal” → Withdraw screen; Match history from API.
   - **Sign out** → Clears token and returns to login.

---

## App structure & navigation

### Routes (expo-router)

| Route | File | Purpose |
|-------|------|--------|
| `/login` | `app/login.tsx` | Sign in or continue as guest |
| `/(tabs)` | `app/(tabs)/_layout.tsx` | Tab navigator: **Home**, **Profile** |
| `/(tabs)` (index) | `app/(tabs)/index.tsx` | Home: New game / Join game |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | Balance, keep/withdraw, match history, sign out |
| `/create` | `app/create.tsx` | Create new game (name, stake) → lobby |
| `/join` | `app/join.tsx` | Enter game code → lobby |
| `/lobby` | `app/lobby.tsx` | Waiting room; game code + players; start game |
| `/match/[id]` | `app/match/[id].tsx` | Active match: leaderboard, holes, end game |
| `/result/[id]` | `app/result/[id].tsx` | Post-match: winner, standings, payouts |
| `/match-history` | `app/match-history.tsx` | List of past matches (from Profile) |
| `/withdraw` | `app/withdraw.tsx` | Request withdrawal (amount) |

### Query / dynamic params

- **Lobby**: `gameId` — e.g. `/lobby?gameId=abc123` or `/lobby?gameId=new` (after create).
- **Match**: `id` — game/match id, e.g. `/match/abc123`.
- **Result**: `id` — same game id, e.g. `/result/abc123`.

### Flow summary

1. **Login** → Sign in (or guest) → `/(tabs)` (Home).
2. **Home** → “New game” → `/create` → “Create & go to lobby” → `/lobby?gameId=new`.
3. **Home** → “Join game” → `/join` → “Join game” → `/lobby?gameId=demo`.
4. **Lobby** → “Start game” → `/match/:id`.
5. **Active match** → “End game & see results” → `/result/:id` → “Back to home” → `/(tabs)`.
6. **Profile** → “Match history” → `/match-history` → tap row → `/result/:id`.
7. **Profile** → “Sign out” → `/login`.

---

## Screens and backend integration points

### 1. Login (`/login`)

- **UI**: Email, password, “Sign in”, “Continue as guest.”
- **Stubbed**: Sign in and guest both navigate to `/(tabs)`; no API call.
- **Backend**:
  - **POST** sign-in (e.g. `/auth/login` or `/api/auth/session`) with `{ email, password }`; return session/token and optionally user (id, displayName).
  - Optional: guest mode (e.g. anonymous token or skip auth); frontend will call `router.replace('/(tabs)')` on success.
  - Frontend will need to store token (e.g. secure store) and send it on subsequent requests.

---

### 2. Create game (`/create`)

- **UI**: Game name (text), Stake per hole (number, e.g. dollars).
- **Stubbed**: Navigates to `/lobby?gameId=new`; no API call.
- **Backend**:
  - **POST** create game, e.g. `POST /games` with body:
    - `name: string`
    - `stakePerHole: number` (or `stakePerHoleCents`)
  - Response should include:
    - `id: string` (game id)
    - `code: string` (shareable code, e.g. `ABC-1234`)
  - Frontend will then navigate to `/lobby?gameId={id}` and display `code` in the lobby.

---

### 3. Join game (`/join`)

- **UI**: Single field “Game code” (e.g. `ABC-1234`).
- **Stubbed**: Navigates to `/lobby?gameId=demo`; no validation.
- **Backend**:
  - **POST** join game, e.g. `POST /games/join` with body `{ code: string }`.
  - Validate code; return `gameId` (and optionally game summary).
  - Frontend will navigate to `/lobby?gameId={gameId}`.

---

### 4. Lobby (`/lobby?gameId=...`)

- **UI**: Game code, list of players, “Start game.”
- **Stubbed**: Game code from `gameId` (or mock “ABC-1234”); players = `['You', 'Alex', 'Jordan']`.
- **Backend**:
  - **GET** game by id, e.g. `GET /games/:gameId` (or by code for join flow).
  - Response should include:
    - `id`, `code`, `name`, `stakePerHole`
    - `players: Array<{ id?, displayName }>` (or similar)
  - **POST** start game, e.g. `POST /games/:gameId/start` → marks game in progress; frontend navigates to `/match/:gameId`.
  - Optional: WebSocket or polling for live player list updates.

---

### 5. Active match (`/match/[id]`)

- **UI**: “Hole X of 9”, leaderboard (name, skins, total $), list of holes (hole #, par, winner), “End game & see results.”
- **Stubbed**: Leaderboard and holes are mock arrays.
- **Backend**:
  - **GET** match state: `GET /games/:gameId` or `GET /games/:gameId/state`.
  - Response should include:
    - `currentHole: number` (1–9 or 1–18)
    - `holes: Array<{ holeNumber, par?, winnerId? }>`
    - `leaderboard` or `players`: `Array<{ name or playerId, skinsWon, totalEarnings }>` (or equivalent)
  - **PATCH/POST** to record hole winner or scores, e.g. `POST /games/:gameId/holes` or `PATCH /games/:gameId/holes/:holeNumber`.
  - **POST** end game, e.g. `POST /games/:gameId/end` → frontend then goes to `/result/:gameId`.

---

### 6. Post match / Result (`/result/[id]`)

- **UI**: Winner highlight, final standings (name, skins, payout +/-).
- **Stubbed**: Static list of results.
- **Backend**:
  - **GET** final results: `GET /games/:gameId/results` or include in `GET /games/:gameId` when status = completed.
  - Response: e.g. `Array<{ playerId/name, skinsWon, payout }>` (payout can be signed: positive = won, negative = lost).

---

### 7. Match history (`/match-history`)

- **UI**: List of past matches: date, result (Won/Lost), payout (+/-), player count. Tapping a row opens `/result/:id`.
- **Stubbed**: Hardcoded array of `{ id, date, result, payout, players }`.
- **Backend**:
  - **GET** user’s past games, e.g. `GET /users/me/games` or `GET /games?participant=me`.
  - Response: `Array<{ id, date (or completedAt), result?, payout?, playerCount }>` (and optionally `code`/`name` for display).

---

### 8. Profile (`/(tabs)/profile`)

- **UI**: Available balance, “Keep in app”, “Request withdrawal”, “Match history” button, “Sign out.”
- **Stubbed**: Balance = constant; withdrawal shows a toast only; no API.
- **Backend**:
  - **GET** user balance: e.g. `GET /users/me/balance` or `GET /wallet` → `{ balance: number }`.
  - **POST** withdrawal request: e.g. `POST /withdrawals` or `POST /users/me/withdraw` (amount, optional method). Frontend will show success/error (e.g. toast).
  - “Keep in app” is a no-op in UI; backend may still need a “default” preference or nothing.

---

## Data shapes (for backend reference)

These are the shapes the frontend currently uses with mock data. Your API can mirror these or map to them.

### Auth (login)

- **Request**: `{ email: string, password: string }`
- **Response**: session/token + optional `{ user: { id, displayName?, email? } }`

### Create game

- **Request**: `{ name: string, stakePerHole: number }`
- **Response**: `{ id: string, code: string }` (and optionally name, stakePerHole, status)

### Join game

- **Request**: `{ code: string }`
- **Response**: `{ gameId: string }` (and optionally game summary)

### Game / Lobby

- **Response**: `{ id, code, name, stakePerHole, players: Array<{ id?, displayName }> }`

### Active match state

- **Response**:  
  - `currentHole: number`  
  - `holes: Array<{ holeNumber: number, par?: number, winnerId?: string }>`  
  - Leaderboard: `Array<{ name or playerId, skinsWon: number, totalEarnings: number }>`

### Match result (post match)

- **Response**: `Array<{ name or playerId, skinsWon: number, payout: number }>` (payout signed: + win, - loss)

### Match history list item

- **Item**: `{ id: string, date: string, result: 'Won' | 'Lost', payout: string (e.g. '+$25'), players: number }`  
  Backend can return `completedAt`, `payout` as number, and `playerCount`; frontend can format.

### Profile / Wallet

- **Balance**: `{ balance: number }`
- **Withdrawal**: request body e.g. `{ amount: number }`; response success or error.

---

## Environment / API base URL

- There is **no `.env` or API base URL** in the repo yet.
- When you add the backend, create something like `.env` with `EXPO_PUBLIC_API_URL=https://your-api.com` (Expo recommends `EXPO_PUBLIC_` for client-side vars) and use it in a small API client (e.g. `api/games.ts`, `api/auth.ts`) that the screens call instead of using mock data.

---

## Integration checklist (frontend ↔ backend)

- [ ] **Auth**: Login API + store token; send token on requests; optional guest flow.
- [ ] **Create game**: POST create → get `id` + `code` → navigate to `/lobby?gameId={id}`, show `code`.
- [ ] **Join game**: POST join with code → get `gameId` → navigate to `/lobby?gameId={gameId}`.
- [ ] **Lobby**: GET game by id → show code + players; POST start → navigate to `/match/:id`.
- [ ] **Active match**: GET match state (holes, leaderboard); PATCH/POST hole winner; POST end game → navigate to `/result/:id`.
- [ ] **Result**: GET results by game id → show winner and standings.
- [ ] **Match history**: GET user’s past games → list; tap → `/result/:id`.
- [ ] **Profile**: GET balance; POST withdrawal request.

---

## Repo layout (relevant to wiring)

```
app/
  _layout.tsx          # Root stack (login, tabs, join, create, lobby, match/[id], result/[id], match-history)
  login.tsx
  join.tsx
  create.tsx
  lobby.tsx
  match/
    [id].tsx
  result/
    [id].tsx
  match-history.tsx
  (tabs)/
    _layout.tsx        # Tabs: Home, Profile
    index.tsx          # Home
    profile.tsx
components/            # NavBar, FuturisticScreen, GlassCard, GradientActionCard, etc.
constants/
  Colors.ts            # FuturisticTheme, DesignTokens
```

Use this README in your backend repo to align routes, params, and payloads so the frontend can replace mock data with real API calls.
