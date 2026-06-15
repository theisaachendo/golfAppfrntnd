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

/**
 * Fetch with base URL and optional Bearer token for /api/* routes.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const url = apiUrl(path);
  const needsAuth = path.startsWith('/api') && !skipAuth;
  const headers: HeadersInit = { ...(init.headers as HeadersInit) };

  if (needsAuth) {
    const token = await getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  if (
    init.body &&
    (typeof init.body === 'string' ||
      (typeof init.body === 'object' &&
        !(init.body instanceof FormData) &&
        !(init.body instanceof URLSearchParams)))
  ) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (__DEV__) {
    const method = init.method ?? 'GET';
    let bodyLog: unknown = init.body;
    if (typeof bodyLog === 'string') {
      try {
        bodyLog = JSON.parse(bodyLog);
      } catch {
        bodyLog = init.body;
      }
    }
    const bodyStr = bodyLog !== undefined ? `\n${JSON.stringify({ body: bodyLog }, null, 2)}` : '';
    console.log(`[API] → ${method} ${url}${bodyStr}`);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...(init.headers as HeadersInit), ...headers },
    });
  } catch (networkErr) {
    if (__DEV__) {
      console.error('[API] network error', init.method ?? 'GET', url, networkErr);
    }
    throw new ApiError(
      networkErr instanceof Error ? networkErr.message : 'Network request failed',
      0,
      undefined
    );
  }

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
    if (res.status === 401) {
      await clearToken();
    }
    const msg =
      res.status === 401
        ? 'Session expired. Please sign in again.'
        : (data && typeof data === 'object' && 'message' in data && String((data as { message: unknown }).message)) ||
          res.statusText ||
          `Request failed (${res.status})`;
    const err = new ApiError(String(msg), res.status, data);
    if (__DEV__) {
      // Expected client errors (e.g. 401 before login) log as warnings so they
      // don't surface as a red error overlay; only 5xx server errors are errors.
      const log = res.status >= 500 ? console.error : console.warn;
      log(`[API] ✗ ${init.method ?? 'GET'} ${url} ${res.status}`);
    }
    throw err;
  }

  if (__DEV__) {
    console.log(`[API] ✓ ${res.status} ${url}\n${JSON.stringify(data, null, 2)}`);
  }

  return data as T;
}
