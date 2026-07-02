import Redis from 'ioredis';
import { env } from './env';

// ============================================================================
// Optional Redis cache (ioredis).
// The legacy API used Redis to cache the Viator destination taxonomy. Caching
// is OFF unless REDIS_URL is set — cacheGet/cacheSet become no-ops so callers
// never need to branch on availability.
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

/** Read + JSON-parse a cached value. Returns null on miss, disabled cache, or error. */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** JSON-serialize + store a value with an optional TTL (seconds). No-op when cache is disabled. */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    /* ignore cache write errors */
  }
}
