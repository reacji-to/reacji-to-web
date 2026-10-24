import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticationRequired, siteAuthorized } from '../worker/basic-auth.js';

test('site auth stays off without a secret and accepts only the configured basic credential', () => {
  const request = value => new Request('https://reacji.to/', { headers: value ? { Authorization: value } : {} });
  assert.equal(siteAuthorized(request(), {}), true);
  assert.equal(siteAuthorized(request(), { SITE_BASIC_AUTH: 'imbue:postit' }), false);
  assert.equal(siteAuthorized(request('Bearer nope'), { SITE_BASIC_AUTH: 'imbue:postit' }), false);
  assert.equal(siteAuthorized(request('Basic !!!'), { SITE_BASIC_AUTH: 'imbue:postit' }), false);
  assert.equal(siteAuthorized(request(`Basic ${btoa('imbue:wrong')}`), { SITE_BASIC_AUTH: 'imbue:postit' }), false);
  assert.equal(siteAuthorized(request(`Basic ${btoa('imbue:postit')}`), { SITE_BASIC_AUTH: 'imbue:postit' }), true);
});

test('site auth challenge cannot be cached', () => {
  const response = authenticationRequired();
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('www-authenticate'), /^Basic /);
});
