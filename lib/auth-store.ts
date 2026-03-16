import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@golf_skins_token';

// 1) Prefer localStorage when available (web).
// 2) Else use AsyncStorage (native); if it throws "Native module is null", fall back to in-memory.
// In-memory only lasts for the session (no persistence across reloads).
function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

const memoryStore = new Map<string, string>();
let useMemoryFallback = false;

async function getStorageItem(key: string): Promise<string | null> {
  if (canUseLocalStorage()) {
    return Promise.resolve(window.localStorage.getItem(key));
  }
  if (useMemoryFallback) {
    return Promise.resolve(memoryStore.get(key) ?? null);
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    useMemoryFallback = true;
    return memoryStore.get(key) ?? null;
  }
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  }
  if (useMemoryFallback) {
    memoryStore.set(key, value);
    return Promise.resolve();
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    useMemoryFallback = true;
    memoryStore.set(key, value);
  }
}

async function removeStorageItem(key: string): Promise<void> {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  }
  if (useMemoryFallback) {
    memoryStore.delete(key);
    return Promise.resolve();
  }
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    useMemoryFallback = true;
    memoryStore.delete(key);
  }
}

export async function getToken(): Promise<string | null> {
  return getStorageItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await setStorageItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await removeStorageItem(TOKEN_KEY);
}
