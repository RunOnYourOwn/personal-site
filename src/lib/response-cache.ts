/* global Response, URLSearchParams */
/**
 * Small in-process response cache for the public /api/spotify/* routes.
 *
 * Why: the routes are unauthenticated and previously forwarded every request
 * (including cache-busting query strings) to Spotify, so a client could drain
 * the owner's API quota. Entries are keyed by the caller's NORMALIZED
 * parameters, concurrent misses share one in-flight upstream call, and the
 * entry lifetime follows the response's own `s-maxage` (so degraded fallbacks,
 * which use a short s-maxage, are negatively cached briefly instead of
 * hammering Spotify while it is failing).
 */

interface Stored {
  status: number;
  body: string;
  headers: Array<[string, string]>;
}

interface Entry {
  expires: number;
  value: Promise<Stored>;
}

export interface ResponseCacheOptions {
  /** Hard cap on cached keys; oldest entry is evicted first. */
  maxEntries?: number;
  /** Upper bound on any entry's lifetime, whatever s-maxage says. */
  maxTtlMs?: number;
  /** Injectable clock for tests. */
  now?: () => number;
}

function ttlFromCacheControl(value: string | null, maxTtlMs: number): number {
  const match = value?.match(/s-maxage=(\d+)/);
  const ttl = match ? Number(match[1]) * 1000 : 0;
  return Math.min(ttl, maxTtlMs);
}

export function createResponseCache(options: ResponseCacheOptions = {}) {
  const maxEntries = options.maxEntries ?? 200;
  const maxTtlMs = options.maxTtlMs ?? 5 * 60 * 1000;
  const now = options.now ?? Date.now;
  const entries = new Map<string, Entry>();

  function toResponse(stored: Stored): Response {
    return new Response(stored.body, {
      status: stored.status,
      headers: stored.headers,
    });
  }

  async function cachedResponse(
    key: string,
    produce: () => Promise<Response>
  ): Promise<Response> {
    const hit = entries.get(key);
    if (hit && hit.expires > now()) {
      return toResponse(await hit.value);
    }

    const entry: Entry = {
      // Provisional lifetime so concurrent callers coalesce on this promise.
      expires: now() + maxTtlMs,
      value: (async () => {
        const res = await produce();
        return {
          status: res.status,
          body: await res.text(),
          headers: [...res.headers.entries()],
        };
      })(),
    };
    entries.delete(key);
    entries.set(key, entry);
    while (entries.size > maxEntries) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }

    try {
      const stored = await entry.value;
      const cacheControl =
        stored.headers.find(([name]) => name === 'cache-control')?.[1] ?? null;
      entry.expires = now() + ttlFromCacheControl(cacheControl, maxTtlMs);
      return toResponse(stored);
    } catch (error) {
      if (entries.get(key) === entry) entries.delete(key);
      throw error;
    }
  }

  return { cachedResponse, size: () => entries.size };
}

const TIME_RANGES = ['short_term', 'medium_term', 'long_term'];

/**
 * Collapse arbitrary query strings onto the small set Spotify actually
 * serves, so cache-busting params cannot create unbounded distinct keys.
 */
export function normalizeTopParams(searchParams: URLSearchParams): {
  timeRange: string;
  limit: number;
} {
  const requested = searchParams.get('time_range') ?? '';
  const timeRange = TIME_RANGES.includes(requested) ? requested : 'medium_term';
  const parsed = parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Number.isNaN(parsed) ? 10 : Math.min(Math.max(parsed, 1), 50);
  return { timeRange, limit };
}
