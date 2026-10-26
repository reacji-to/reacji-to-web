import assert from 'node:assert/strict';
import { pageDemoScript } from '../worker/page-demo.js';
import { installText } from '../worker/install.js';

const credential = process.env.SITE_BASIC_AUTH;
assert.ok(credential, 'SITE_BASIC_AUTH is required to verify the protected site.');
const headers = { Authorization: `Basic ${Buffer.from(credential).toString('base64')}` };

// Retry propagation without mistaking a cached successful response for this build.
for (let attempt = 0; attempt < 6; attempt++) {
  try {
    const fresh = `?verify=${Date.now()}`;
    const [home, bundle, health] = await Promise.all(
      ['/', '/page-demo.js', '/health'].map(path => fetch(`https://reacji.to${path}${fresh}`, {
        cache: 'no-store', headers, signal: AbortSignal.timeout(15000),
      })),
    );
    for (const response of [home, bundle, health]) assert.equal(response.status, 200);
    assert.match(await home.text(), /Hold <kbd class="try-key-name">Option<\/kbd>/);
    assert.equal(await bundle.text(), pageDemoScript, 'Live reaction bundle differs from this commit');
    assert.equal((await health.json()).configured, true, 'Worker signing credentials are missing');
    for (const path of ['/install', '/install/', '/install/agent.txt', '/install.js', '/logo.png', '/manrope-latin.woff2', '/geist-400.woff2', '/geist-600.woff2']) {
      const response = await fetch(`https://reacji.to${path}${fresh}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, `Public install resource ${path}`);
      assert.equal(response.headers.has('www-authenticate'), false, path);
      if (path === '/install/agent.txt') {
        assert.match(response.headers.get('content-type'), /^text\/plain/);
        assert.equal(await response.text(), installText, 'Live plain-text guide differs from this commit');
      } else { await response.arrayBuffer(); }
    }
    for (const path of ['/', '/octocat', '/page-demo.js', '/about', '/install/private', '/install/agent.txt/']) {
      const response = await fetch(`https://reacji.to${path}${fresh}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 401, `Protected route ${path}`);
      assert.match(response.headers.get('www-authenticate'), /^Basic /);
      await response.arrayBuffer();
    }
    console.log('Verified public install routes and exact plain-text guide, protected routes, authenticated homepage, exact reaction bundle, and Worker configuration.');
    break;
  } catch (error) {
    if (attempt === 5) throw error;
    console.log('Waiting for deployment propagation…');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
