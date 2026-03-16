/**
 * Backend API base URL.
 * - Dev: use http://localhost:3000 (or your machine's LAN IP for physical device).
 * - Prod: set EXPO_PUBLIC_API_URL in .env or when building (e.g. https://golf-app-api.onrender.com).
 */
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3000';

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
