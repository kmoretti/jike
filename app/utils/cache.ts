const CACHE_PREFIX = 'jike:cache:'

interface CacheEntry<T> {
  data: T
  ts: number
}

export function getCachedData<T>(key: string, ttlMs: number): T | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.ts > ttlMs) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCachedData<T>(key: string, data: T) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // ignore quota or serialization errors
  }
}

export function clearCachedData(key: string) {
  if (!import.meta.client) return
  localStorage.removeItem(CACHE_PREFIX + key)
}
