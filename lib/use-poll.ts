import { useEffect, useRef } from 'react';

/**
 * Calls `callback` on a fixed interval while `enabled` is true.
 * Used to give lobby/match screens a near-real-time feel without websockets.
 */
export function usePolling(callback: () => void, intervalMs: number, enabled = true) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => cb.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
