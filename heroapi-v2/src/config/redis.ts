import Redis from 'ioredis';
import { env } from './env';

// ============================================================================
// Cache (ioredis when REDIS_URL is set, in-memory otherwise).
// The legacy API used Redis to cache the Viator destination taxonomy. Without
// REDIS_URL, cacheGet/cacheSet previously became pure no-ops — which meant
// every hot, near-static Viator taxonomy call (destinations, category tags)
// hit the live API on every single request with zero caching in any
// environment that hasn't provisioned Redis (this dev environment included).
// Combined with several frontend components independently fetching the same
// taxonomy on mount, that's what was burning through the sandbox's per-minute
// rate limit and surfacing as 429s on /destinations and friends.
//
// Fix: fall back to a simple in-process Map with TTL when Redis isn't
// configured, so caching always works. Redis is still preferred when
// available (shared across instances); the in-memory fallback is a
// single-process safety net, not a replacement for Redis in production.
// ============================================================================

let client: Redis | null = null;

if (env.REDIS_URL) {
  client = new Redis(env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
  });
  client.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[Redis] error:', err.message);
  });
}

export const redis = client;
export const isRedisEnabled = client !== null;

// ─── In-memory fallback (used whenever Redis is not configured) ──────────
interface MemEntry {
  value: string;
  expiresAt: number;
}
const memStore = new Map<string, MemEntry>();

function memGet(key: string): string | null {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memStore.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds: number): void {
  memStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Read + JSON-parse a cached value. Returns null on miss or error. */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const raw = client ? await client.get(key) : memGet(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** JSON-serialize + store a value with an optional TTL (seconds). */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  try {
    const raw = JSON.stringify(value);
    if (client) {
      await client.set(key, raw, 'EX', ttlSeconds);
    } else {
      memSet(key, raw, ttlSeconds);
    }
  } catch {
    /* ignore cache write errors */
  }
}
