import { apiUrl } from '@/constants/api';
import { clearToken, getToken } from '@/lib/auth-store';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = RequestInit & { skipAuth?: boolean };

// Transient failures worth retrying (server waking up / briefly overloaded).
// A free-tier host returns 503 *instantly* while it boots (can take 30-60s),
// so we retry several times with escalating backoff to ride out a cold start.
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 5;
const ATTEMPT_TIMEOUT_MS = 20000;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const backoffMs = (attempt: number) => Math.min(2000 * attempt, 8000); // 2s,4s,6s,8s

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch with base URL, optional Bearer token, and automatic retry of transient
 * failures (network errors + 502/503/504) so a sleeping/slow backend doesn't
 * surface as a hard error mid-game.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const url = apiUrl(path);
  const method = init.method ?? 'GET';
  const needsAuth = path.startsWith('/api') && !skipAuth;
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };

  if (needsAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (
    init.body &&
    (typeof init.body === 'string' ||
      (typeof init.body === 'object' &&
        !(init.body instanceof FormData) &&
        !(init.body instanceof URLSearchParams)))
  ) {
    headers['Content-Type'] = 'application/json';
  }

  if (__DEV__) console.log(`[API] → ${method} ${url}`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // --- send request (network/timeout failures are retryable) ---
    let res: Response;
    try {
      res = await fetchWithTimeout(url, { ...init, headers }, ATTEMPT_TIMEOUT_MS);
    } catch (networkErr) {
      if (attempt < MAX_ATTEMPTS) {
        if (__DEV__) console.warn(`[API] network issue (try ${attempt}/${MAX_ATTEMPTS}) ${method} ${url}`);
        await delay(backoffMs(attempt));
        continue;
      }
      if (__DEV__) console.error('[API] network error', method, url, networkErr);
      throw new ApiError(
        networkErr instanceof Error ? networkErr.message : 'Network request failed',
        0,
        undefined
      );
    }

    // --- parse body ---
    let data: unknown;
    const ct = res.headers.get('content-type');
    if (ct?.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        data = undefined;
      }
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      // Retry transient server errors before giving up.
      if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_ATTEMPTS) {
        if (__DEV__) console.warn(`[API] ${res.status} (try ${attempt}/${MAX_ATTEMPTS}) ${method} ${url}`);
        await delay(backoffMs(attempt));
        continue;
      }

      if (res.status === 401) await clearToken();
      const msg =
        res.status === 401
          ? 'Session expired. Please sign in again.'
          : (data && typeof data === 'object' && 'message' in data && String((data as { message: unknown }).message)) ||
            res.statusText ||
            `Request failed (${res.status})`;
      const err = new ApiError(String(msg), res.status, data);
      if (__DEV__) {
        const log = res.status >= 500 ? console.error : console.warn;
        log(`[API] ✗ ${method} ${url} ${res.status}`);
      }
      throw err;
    }

    if (__DEV__) console.log(`[API] ✓ ${res.status} ${url}`);
    return data as T;
  }

  // Unreachable (loop always returns or throws), but satisfies the type checker.
  throw new ApiError('Request failed after retries', 0, undefined);
}
