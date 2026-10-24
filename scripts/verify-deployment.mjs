import assert from 'node:assert/strict';
import { pageDemoScript } from '../worker/page-demo.js';

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
    console.log('Verified reacji.to homepage, exact reaction bundle, and Worker configuration.');
    break;
  } catch (error) {
    if (attempt === 5) throw error;
    console.log('Waiting for deployment propagation…');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
