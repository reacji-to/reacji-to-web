import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions, Response as RuntimeResponse } from 'miniflare';
import { pagePost } from '../shared/web.js';

test('Workers runtime authenticates, commits public and private reactions, and refuses redirects', async () => {
  const privateKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs1', format: 'pem' });
  const bundle = await build({ entryPoints: ['worker/index.js'], bundle: true, write: false, format: 'esm', platform: 'node', external: ['cloudflare:workers'], target: 'es2022' });
  const calls = [];
  let redirectIdentity = false;
  const json = value => new RuntimeResponse(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
  const runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: bundle.outputFiles[0].text,
    compatibilityDate: '2026-10-18', compatibilityFlags: ['nodejs_compat'],
    bindings: { GITHUB_APP_ID: '123', GITHUB_APP_PRIVATE_KEY: privateKey },
    durableObjects: { WRITERS: { className: 'RepositoryWriter', useSQLite: true } },
    outboundService: async request => {
      const url = new URL(request.url), path = url.pathname;
      assert.equal(url.origin, 'https://api.github.com');
      calls.push({ path, body: request.method === 'GET' ? null : await request.json() });
      if (path === '/user') return redirectIdentity
        ? new RuntimeResponse('', { status: 302, headers: { Location: 'https://untrusted.example/collect' } })
        : json({ id: 42, login: 'octocat' });
      if (path === '/repos/reacji-to/reacji-to-data') return json({ id: 1424709515, full_name: 'reacji-to/reacji-to-data', private: false, default_branch: 'main' });
      if (path === '/repos/octocat/private') return json({ id: 77, full_name: 'octocat/private', private: true, default_branch: 'main', owner: { id: 42, type: 'User' }, permissions: { push: true } });
      if (path.endsWith('/installation')) return json({ id: 55, app_id: 123 });
      if (path.endsWith('/access_tokens')) return json({ token: 'test-installation-token' });
      if (path.includes('/git/ref/heads/')) return json({ object: { sha: 'head' } });
      if (path.endsWith('/git/commits/head')) return json({ tree: { sha: 'base' } });
      if (path.includes('/contents/')) return request.method === 'PUT' ? json({ commit: { sha: 'private-commit' } }) : new RuntimeResponse('', { status: 404 });
      if (path.endsWith('/git/trees')) return json({ sha: 'tree' });
      if (path.endsWith('/git/commits')) return json({ sha: 'public-commit' });
      if (path.includes('/git/refs/heads/')) return json({});
      assert.fail(`Unexpected GitHub path: ${path}`);
    },
  }));
  try {
    const post = await pagePost('https://imbue.com/');
    const placement = { id: crypto.randomUUID(), selector: 'html:nth-of-type(1) > body:nth-of-type(1) > p:nth-of-type(1)', tag: 'p', quote: 'Test target', x: 500, y: 500 };
    const send = (visibility, requestId = crypto.randomUUID()) => runtime.dispatchFetch('https://reacji.test/v1/react', {
      method: 'POST', headers: { Authorization: 'Bearer test-user-token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility, repository: 'octocat/private', requestId, event: { version: 1, post, placement, emoji: '💙' } }),
    });
    for (const visibility of ['public', 'private']) {
      const requestId = crypto.randomUUID();
      const response = await send(visibility, requestId), result = await response.json();
      assert.equal(response.status, 200, JSON.stringify(result));
      assert.equal(result.sha, `${visibility}-commit`);
      assert.equal(result.document.placements[placement.id].users[42].emoji, '💙');
      const repeated = await send(visibility, requestId);
      assert.equal((await repeated.json()).duplicate, true);
    }
    assert.deepEqual(calls.filter(c => c.path.endsWith('/access_tokens')).map(c => c.body.repository_ids), [[1424709515], [77]]);
    redirectIdentity = true;
    const count = calls.length;
    const response = await send('public');
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /unexpected redirect/);
    assert.equal(calls.length, count + 1, 'must not follow redirects or reach the writer');
  } finally { await runtime.dispose(); }
});
