/* global Response, URLSearchParams, setTimeout */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createResponseCache, normalizeTopParams } from './response-cache.ts';

function json(body: unknown, cacheControl: string) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
    },
  });
}

test('repeat requests within the window do not reach upstream again', async () => {
  let t = 0;
  const cache = createResponseCache({ now: () => t });
  let upstream = 0;
  const produce = async () => {
    upstream++;
    return json({ n: upstream }, 'public, s-maxage=60');
  };
  for (let i = 0; i < 100; i++) {
    const res = await cache.cachedResponse('k', produce);
    assert.deepEqual(await res.json(), { n: 1 });
  }
  assert.equal(upstream, 1);

  t = 61_000; // past s-maxage
  const res = await cache.cachedResponse('k', produce);
  assert.deepEqual(await res.json(), { n: 2 });
  assert.equal(upstream, 2);
});

test('concurrent misses coalesce into one upstream call', async () => {
  const cache = createResponseCache();
  let upstream = 0;
  const produce = async () => {
    upstream++;
    await new Promise(r => setTimeout(r, 20));
    return json({ ok: true }, 'public, s-maxage=60');
  };
  const results = await Promise.all(
    Array.from({ length: 25 }, () => cache.cachedResponse('k', produce))
  );
  assert.equal(upstream, 1);
  for (const r of results) assert.deepEqual(await r.json(), { ok: true });
});

test('degraded (short s-maxage) responses are only briefly cached', async () => {
  let t = 0;
  const cache = createResponseCache({ now: () => t });
  let upstream = 0;
  const produce = async () => {
    upstream++;
    return json({ degraded: true }, 'public, s-maxage=30');
  };
  await cache.cachedResponse('k', produce);
  t = 10_000;
  await cache.cachedResponse('k', produce);
  assert.equal(upstream, 1, 'failure is negatively cached for its s-maxage');
  t = 31_000;
  await cache.cachedResponse('k', produce);
  assert.equal(upstream, 2, 'and retried after it expires');
});

test('a response without s-maxage is not cached; a throw is not cached', async () => {
  const cache = createResponseCache();
  let upstream = 0;
  await cache.cachedResponse('a', async () => {
    upstream++;
    return json({}, 'no-store');
  });
  await cache.cachedResponse('a', async () => {
    upstream++;
    return json({}, 'no-store');
  });
  assert.equal(upstream, 2);

  await assert.rejects(
    cache.cachedResponse('b', async () => {
      throw new Error('boom');
    })
  );
  const ok = await cache.cachedResponse('b', async () =>
    json({ ok: 1 }, 'public, s-maxage=60')
  );
  assert.deepEqual(await ok.json(), { ok: 1 });
});

test('entry count is capped (cache-busting keys cannot grow memory)', async () => {
  const cache = createResponseCache({ maxEntries: 5 });
  for (let i = 0; i < 50; i++) {
    await cache.cachedResponse(`k${i}`, async () =>
      json({ i }, 'public, s-maxage=60')
    );
  }
  assert.ok(cache.size() <= 5);
});

test('normalizeTopParams collapses arbitrary query strings', () => {
  const norm = (q: string) => normalizeTopParams(new URLSearchParams(q));
  assert.deepEqual(norm(''), { timeRange: 'medium_term', limit: 10 });
  assert.deepEqual(norm('time_range=short_term&limit=10'), {
    timeRange: 'short_term',
    limit: 10,
  });
  assert.deepEqual(norm('time_range=evil&limit=999999&_=123&cb=abc'), {
    timeRange: 'medium_term',
    limit: 50,
  });
  assert.deepEqual(norm('limit=-4'), { timeRange: 'medium_term', limit: 1 });
  assert.deepEqual(norm('limit=abc'), { timeRange: 'medium_term', limit: 10 });
});

test('100 cache-busting requests produce one upstream call per distinct normalized key', async () => {
  const cache = createResponseCache();
  let upstream = 0;
  for (let i = 0; i < 100; i++) {
    const { timeRange, limit } = normalizeTopParams(
      new URLSearchParams(`time_range=short_term&limit=10&bust=${i}`)
    );
    await cache.cachedResponse(`${timeRange}:${limit}`, async () => {
      upstream++;
      return json({}, 'public, s-maxage=3600, stale-while-revalidate=1800');
    });
  }
  assert.equal(upstream, 1);
});
