/* global Response, console */
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  degradedFromError,
  degradedResponse,
  getAccessToken,
  resetTokenCache,
  UpstreamError,
} from './spotify.ts';

const SECRETS = {
  SPOTIFY_CLIENT_ID: 'test-client-id-1234',
  SPOTIFY_CLIENT_SECRET: 'test-client-secret-5678',
  SPOTIFY_REFRESH_TOKEN: 'test-refresh-token-9012',
};

function withEnv(
  env: Record<string, string | undefined>,
  fn: () => Promise<void>
) {
  return async () => {
    const saved: Record<string, string | undefined> = {};
    for (const k of Object.keys(env)) {
      saved[k] = process.env[k];
      if (env[k] === undefined) delete process.env[k];
      else process.env[k] = env[k];
    }
    try {
      await fn();
    } finally {
      for (const k of Object.keys(saved)) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
      mock.restoreAll();
      resetTokenCache();
    }
  };
}

test(
  'revoked refresh token (invalid_grant) is a logged, flagged failure',
  withEnv(SECRETS, async () => {
    mock.method(
      globalThis,
      'fetch',
      async () =>
        new Response(JSON.stringify({ error: 'invalid_grant' }), {
          status: 400,
        })
    );
    const logged: string[] = [];
    mock.method(console, 'error', (line: string) => logged.push(line));

    const result = await getAccessToken();
    assert.equal(result.ok, false);
    assert.ok(!result.ok);
    assert.equal(result.reason, 'token_refresh_failed');
    assert.match(result.detail, /HTTP 400 invalid_grant/);

    const res = degradedResponse('now-playing', result.reason, result.detail, {
      title: 'mock',
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.degraded, true);
    assert.equal(body.degradedReason, 'token_refresh_failed');
    assert.equal(body.title, 'mock');

    assert.equal(logged.length, 1);
    const entry = JSON.parse(logged[0]);
    assert.equal(entry.route, 'now-playing');
    assert.equal(entry.reason, 'token_refresh_failed');
    for (const secret of Object.values(SECRETS)) {
      assert.ok(!logged[0].includes(secret), 'log must not leak credentials');
    }
  })
);

test(
  'missing credentials report no_credentials without calling Spotify',
  withEnv(
    {
      SPOTIFY_CLIENT_ID: undefined,
      SPOTIFY_CLIENT_SECRET: undefined,
      SPOTIFY_REFRESH_TOKEN: undefined,
    },
    async () => {
      const fetchMock = mock.method(globalThis, 'fetch', async () => {
        throw new Error('must not be called');
      });
      const result = await getAccessToken();
      assert.ok(!result.ok);
      assert.equal(result.reason, 'no_credentials');
      assert.equal(fetchMock.mock.callCount(), 0);
    }
  )
);

test(
  'a successful refresh returns the token',
  withEnv(SECRETS, async () => {
    mock.method(
      globalThis,
      'fetch',
      async () =>
        new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 })
    );
    const result = await getAccessToken();
    assert.deepEqual(result, { ok: true, token: 'tok' });
  })
);

test(
  'degradedFromError maps upstream vs internal errors',
  withEnv({}, async () => {
    mock.method(console, 'error', () => {});
    const up = await degradedFromError(
      'top-tracks',
      new UpstreamError('top tracks', 401),
      {}
    ).json();
    assert.equal(up.degradedReason, 'upstream_error');
    const internal = await degradedFromError(
      'top-tracks',
      new TypeError('boom'),
      {}
    ).json();
    assert.equal(internal.degradedReason, 'internal_error');
  })
);

test(
  'access token is reused until near expiry (one token call, not one per request)',
  withEnv(SECRETS, async () => {
    const fetchMock = mock.method(
      globalThis,
      'fetch',
      async () =>
        new Response(
          JSON.stringify({ access_token: 'tok', expires_in: 3600 }),
          {
            status: 200,
          }
        )
    );
    const a = await getAccessToken();
    const b = await getAccessToken();
    assert.deepEqual(a, { ok: true, token: 'tok' });
    assert.deepEqual(b, { ok: true, token: 'tok' });
    assert.equal(fetchMock.mock.callCount(), 1);
  })
);
