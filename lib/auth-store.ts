import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Auth token storage.
// - Native (iOS/Android): expo-secure-store (Keychain / Keystore) — encrypted at rest.
// - Web: localStorage (SecureStore isn't available in the browser).
// - Fallback: in-memory (session only) if a platform store throws.

const TOKEN_KEY = 'golf_skins_token'; // SecureStore keys must be alphanumeric/._-

const isWeb = Platform.OS === 'web';
const canUseLocalStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const memory = new Map<string, string>();
let useMemory = false;

export async function getToken(): Promise<string | null> {
  if (isWeb) return canUseLocalStorage() ? window.localStorage.getItem(TOKEN_KEY) : memory.get(TOKEN_KEY) ?? null;
  if (useMemory) return memory.get(TOKEN_KEY) ?? null;
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    useMemory = true;
    return memory.get(TOKEN_KEY) ?? null;
  }
}

export async function setToken(token: string): Promise<void> {
  if (isWeb) {
    if (canUseLocalStorage()) window.localStorage.setItem(TOKEN_KEY, token);
    else memory.set(TOKEN_KEY, token);
    return;
  }
  if (useMemory) {
    memory.set(TOKEN_KEY, token);
    return;
  }
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    useMemory = true;
    memory.set(TOKEN_KEY, token);
  }
}

export async function clearToken(): Promise<void> {
  if (isWeb) {
    if (canUseLocalStorage()) window.localStorage.removeItem(TOKEN_KEY);
    else memory.delete(TOKEN_KEY);
    return;
  }
  if (useMemory) {
    memory.delete(TOKEN_KEY);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    useMemory = true;
    memory.delete(TOKEN_KEY);
  }
}
