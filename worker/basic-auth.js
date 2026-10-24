const encoder = new TextEncoder();

function sameText(left, right) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let different = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) different |= (a[index] || 0) ^ (b[index] || 0);
  return different === 0;
}

export function siteAuthorized(request, env) {
  const expected = env.SITE_BASIC_AUTH;
  if (!expected) return true;
  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Basic ')) return false;
  try {
    return sameText(atob(authorization.slice(6)), expected);
  } catch {
    return false;
  }
}

export function authenticationRequired() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'WWW-Authenticate': 'Basic realm="reacji.to", charset="UTF-8"',
    },
  });
}
