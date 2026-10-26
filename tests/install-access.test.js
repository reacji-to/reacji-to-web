import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { installText } from '../worker/install.js';

test('the built Worker exposes only the install guide and its dependencies without the site password', async () => {
  const bundle = await build({ entryPoints: ['worker/index.js'], bundle: true, write: false, format: 'esm', platform: 'node', external: ['cloudflare:workers'], target: 'es2022' });
  const runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: bundle.outputFiles[0].text,
    compatibilityDate: '2026-10-18', compatibilityFlags: ['nodejs_compat'],
    bindings: { SITE_BASIC_AUTH: 'test-user:test-password' },
    durableObjects: { WRITERS: { className: 'RepositoryWriter', useSQLite: true } },
    outboundService: () => { assert.fail('Unauthenticated guide requests must not read GitHub data'); },
  }));
  const get = (path, options) => runtime.dispatchFetch(`https://reacji.test${path}`, options);
  try {
    for (const path of ['/install', '/install/', '/install?agent=1', '/install/agent.txt', '/install.js', '/logo.png', '/manrope-latin.woff2', '/geist-400.woff2', '/geist-600.woff2']) {
      const response = await get(path);
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.has('www-authenticate'), false, path);
      await response.arrayBuffer();
      const head = await get(path, { method: 'HEAD' });
      assert.equal(head.status, 200, `HEAD ${path}`);
      assert.equal(await head.text(), '', `HEAD ${path}`);
    }
    for (const path of ['/', '/?handle=octocat', '/octocat', '/about', '/about/', '/home-demo.js', '/page-demo.js', '/logo.svg', '/not-found', '/install/private', '/install/agent.txt/', '/install.js/private', '/install.txt', '/Install', '/%69nstall', '/v1/private/read']) {
      for (const method of ['GET', 'HEAD']) {
        const response = await get(path, { method });
        assert.equal(response.status, 401, `${method} ${path}`);
        assert.match(response.headers.get('www-authenticate'), /^Basic /);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        await response.arrayBuffer();
      }
    }
    const text = await get('/install/agent.txt?agent=1');
    assert.equal(text.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert.equal(text.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(await text.text(), installText);
    assert.match(installText, /Written by AI for AI, human content is on reacji.to \(https:\/\/reacji.to\/\)/);
    assert.match(installText, /https:\/\/github.com\/reacji-to\/reacji-to\/releases\/latest/);
    assert.match(installText, /## What your agent should verify/);
    assert.doesNotMatch(installText, /<\/?(?:article|section|script|a|h1|p)\b|wireSetupCopy|On this page|Read as plain text/);
    for (const authorization of ['Basic !!!', `Basic ${btoa('test-user:wrong')}`]) {
      const guide = await get('/install', { headers: { Authorization: authorization } });
      assert.equal(guide.status, 200);
      await guide.arrayBuffer();
      const home = await get('/', { headers: { Authorization: authorization } });
      assert.equal(home.status, 401);
      await home.arrayBuffer();
    }
    const home = await get('/', { headers: { Authorization: `Basic ${btoa('test-user:test-password')}` } });
    assert.equal(home.status, 200);
    assert.equal(home.headers.get('cache-control'), 'private, no-store');
    assert.match(home.headers.get('vary'), /Authorization/);
    await home.arrayBuffer();
    for (const path of ['/v1/react', '/v1/private/read', '/v1/private/validate']) {
      const api = await get(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(api.status, 401, path);
      await api.arrayBuffer();
    }
    const post = await get('/install', { method: 'POST' });
    assert.equal(post.status, 404);
    await post.arrayBuffer();
  } finally { await runtime.dispose(); }
});
