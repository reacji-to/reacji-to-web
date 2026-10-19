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
  let privateRepository = true, becomesPublicBeforeWrite = false;
  let mirrorFails = false, pendingTree = [];
  const files = new Map();
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
      if (path === '/repos/octocat/private') return json({ id: 77, full_name: 'octocat/private', private: privateRepository && !(becomesPublicBeforeWrite && request.headers.get('Authorization') === 'Bearer test-installation-token'), default_branch: 'main', owner: { id: 42, type: 'User' }, permissions: { push: true } });
      if (path.endsWith('/installation')) return json({ id: 55, app_id: 123 });
      if (path.endsWith('/access_tokens')) return json({ token: 'test-installation-token' });
      if (path.includes('/git/ref/heads/')) return json({ object: { sha: 'head' } });
      if (path.endsWith('/git/commits/head')) return json({ tree: { sha: 'base' } });
      if (path.includes('/contents/')) {
        if (request.method === 'PUT') {
          if (mirrorFails && path.includes('/contents/public/')) return new RuntimeResponse('', { status: 503 });
          files.set(path, JSON.parse(Buffer.from(calls.at(-1).body.content, 'base64')));
          return json({ commit: { sha: 'private-commit' } });
        }
        return files.has(path) ? json({ encoding: 'base64', size: 1000, sha: 'file', content: Buffer.from(JSON.stringify(files.get(path))).toString('base64') }) : new RuntimeResponse('', { status: 404 });
      }
      if (path.endsWith('/git/trees')) { pendingTree = calls.at(-1).body.tree; return json({ sha: 'tree' }); }
      if (path.endsWith('/git/commits')) return json({ sha: 'public-commit' });
      if (path.includes('/git/refs/heads/')) {
        for (const file of pendingTree) files.set(`/repos/reacji-to/reacji-to-data/contents/${file.path}`, JSON.parse(file.content));
        return json({});
      }
      assert.fail(`Unexpected GitHub path: ${path}`);
    },
  }));
  try {
    const post = await pagePost('https://imbue.com/');
    const placement = { id: crypto.randomUUID(), selector: 'html:nth-of-type(1) > body:nth-of-type(1) > p:nth-of-type(1)', tag: 'p', quote: 'Test target', x: 500, y: 500 };
    const send = (visibility, requestId = crypto.randomUUID(), extra = {}, emoji = '💙') => runtime.dispatchFetch('https://reacji.test/v1/react', {
      method: 'POST', headers: { Authorization: 'Bearer test-user-token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility, repository: 'octocat/private', requestId, mirrorPublic: false, ...extra, event: { version: 1, post, placement, emoji } }),
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
    const mirrorPath = `/repos/octocat/private/contents/public/data/web/${post.id}.json`;
    assert.equal(files.has(mirrorPath), false, 'explicit opt-out skips mirrors');
    const noRepo = await send('public', crypto.randomUUID(), { repository: undefined, mirrorPublic: undefined });
    assert.equal((await noRepo.json()).mirror, undefined);
    const mirrored = await send('public', crypto.randomUUID(), { mirrorPublic: undefined });
    assert.equal((await mirrored.json()).mirror.status, 'saved', 'mirroring defaults on when a repo is selected');
    assert.equal(files.get(mirrorPath).placements[placement.id].users[42].emoji, '💙');
    const privatePath = `/repos/octocat/private/contents/data/web/${post.id}.json`;
    const privateBefore = structuredClone(files.get(privatePath));
    mirrorFails = true;
    const retryId = crypto.randomUUID();
    const failed = await send('public', retryId, { mirrorPublic: true }, '🔥');
    assert.equal(failed.status, 200);
    const partial = await failed.json();
    assert.equal(partial.document.placements[placement.id].users[42].emoji, '🔥');
    assert.equal(partial.mirror.status, 'failed');
    mirrorFails = false;
    const retried = await send('public', retryId, { mirrorPublic: true }, '🔥');
    assert.equal((await retried.json()).mirror.status, 'saved');
    assert.equal(files.get(mirrorPath).placements[placement.id].users[42].emoji, '🔥');
    await send('public', crypto.randomUUID(), { mirrorPublic: true }, null);
    await send('public', retryId, { mirrorPublic: true }, '🔥');
    assert.deepEqual(files.get(mirrorPath).placements, {}, 'old receipt retries mirror current state, never resurrect removals');
    assert.deepEqual(files.get(privatePath), privateBefore, 'mirror never changes private reactions');
    // A saved selection must not bypass a fresh check on subsequent requests.
    privateRepository = false;
    const invalidMirror = await send('public', crypto.randomUUID(), { mirrorPublic: true });
    assert.equal(invalidMirror.status, 200);
    assert.equal((await invalidMirror.json()).mirror.status, 'failed');
    for (const endpoint of ['react', 'private/validate', 'private/read']) {
      const before = calls.length;
      const response = await runtime.dispatchFetch(`https://reacji.test/v1/${endpoint}`, {
        method: 'POST', headers: { Authorization: 'Bearer test-user-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: 'private', repository: 'octocat/private', post, requestId: crypto.randomUUID(), event: { version: 1, post, placement, emoji: '💙' } }),
      });
      assert.equal(response.status, 403);
      assert.match((await response.json()).error, /Private reactions require/);
      assert.deepEqual(calls.slice(before).map(c => c.path), ['/user', '/repos/octocat/private']);
    }
    privateRepository = true;
    becomesPublicBeforeWrite = true;
    const unsafeMirror = await send('public', crypto.randomUUID(), { mirrorPublic: true });
    assert.equal(unsafeMirror.status, 200);
    assert.equal((await unsafeMirror.json()).mirror.status, 'failed');
    const beforeWrite = calls.length;
    const blocked = await send('private', crypto.randomUUID(), {}, '🔥');
    assert.equal(blocked.status, 403);
    assert.match((await blocked.json()).error, /no longer a private repository/);
    assert.equal(calls.slice(beforeWrite).some(c => c.path.includes('/contents/') && c.body), false);
    redirectIdentity = true;
    const count = calls.length;
    const response = await send('public');
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /unexpected redirect/);
    assert.equal(calls.length, count + 1, 'must not follow redirects or reach the writer');
  } finally { await runtime.dispose(); }
});
