import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { createService } from '../worker/service.js';
import { pagePost } from '../shared/web.js';
const commit = '01a14f9d-76a7-72d9-a92d-48ae9ea999cb';
const user = { id: 42, login: 'octocat' };
const repo = { id: 77, name: 'octocat/private', branch: 'main', visibility: 'private' };
const privateKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
function fixture(handler, repositoryMetadata = () => Response.json({ id: 77, private: true, owner: { id: 42, type: 'User' } })) {
  const calls = [];
  return { calls, service: createService({ GITHUB_APP_PRIVATE_KEY: privateKey, GITHUB_APP_ID: '123' }, async (url, init) => {
    const path = new URL(url).pathname, body = init.body && JSON.parse(init.body); calls.push({ path, body, init });
    if (path.endsWith('/installation')) return Response.json({ id: 55, app_id: 123 });
    if (path.endsWith('/access_tokens')) return Response.json({ token: 'installation-token' });
    if (path === '/repos/octocat/private' && init.headers.Authorization === 'Bearer installation-token') return repositoryMetadata();
    return handler(path, init, body);
  }) };
}
test('multi-reaction writes preserve legacy emoji, survive conflicts, and remove only the named emoji', async () => {
  let document={version:1,commit,users:{42:{login:'octocat',emoji:'👍'},99:{login:'friend',emoji:'🔥'}}};
  let writes=0;
  const f=fixture((path,init,body)=>{
    if(init.method==='PUT'){
      if(++writes===1){document.users[42]={login:'octocat',emoji:'👍',emojis:['👍','💙']};return new Response('',{status:409});}
      document=JSON.parse(Buffer.from(body.content,'base64'));return Response.json({commit:{sha:'saved'}});
    }
    return Response.json({encoding:'base64',size:1000,sha:'old',content:Buffer.from(JSON.stringify(document)).toString('base64')});
  });
  const send=(emoji,operation)=>f.service.write(repo,user,{version:1,commit,emoji,operation},crypto.randomUUID());
  await send('🔥','add');
  assert.deepEqual(document.users[42].emojis,['👍','💙','🔥']);
  assert.equal((await send('🔥','add')).changed,false);
  await send('💙','remove');
  assert.deepEqual(document.users[42].emojis,['👍','🔥']);
  assert.equal((await send('💙','remove')).changed,false);
  await send('🔥','remove');await send('👍','remove');
  assert.equal(document.users[42],undefined);assert.equal(document.users[99].emoji,'🔥');
});
test('public profiles retain all post emoji until the last reaction is removed', async () => {
  let document = { version: 1, commit, users: {} }, profile = { version: 1, id: 42, reactions: {} };
  const f = fixture((path, init, body) => {
    if (path.includes('/git/ref/heads/')) return Response.json({ object: { sha: 'head' } });
    if (path.includes('/git/commits/head')) return Response.json({ tree: { sha: 'base' } });
    if (path.includes('/contents/')) return Response.json({ encoding: 'base64', content: Buffer.from(JSON.stringify(path.includes('/profiles/') ? profile : document)).toString('base64') });
    if (path.endsWith('/git/trees')) {
      document = JSON.parse(body.tree[0].content); profile = JSON.parse(body.tree[1].content);
      return Response.json({ sha: 'tree' });
    }
    if (path.endsWith('/git/commits')) return Response.json({ sha: 'commit' });
    if (path.includes('/git/refs/heads/')) return Response.json({});
    throw new Error(path);
  });
  const send = (emoji, operation) => f.service.write({ ...repo, visibility: 'public' }, user, { version: 1, commit, emoji, operation }, crypto.randomUUID());
  await send('🔥', 'add'); await send('💙', 'add');
  assert.deepEqual(Object.values(profile.reactions)[0].emojis, ['🔥', '💙']);
  await send('🔥', 'remove');
  assert.deepEqual(Object.values(profile.reactions)[0].emojis, ['💙']);
  assert.equal(Object.values(profile.reactions)[0].emoji, '💙');
  await send('💙', 'remove');
  assert.deepEqual(profile.reactions, {}); assert.deepEqual(document.users, {});
});

test('public mirrors isolate the owner in public/, reconcile moves and removals, and retry conflicts', async () => {
  const post = await pagePost('https://example.test/article');
  const anchor = { id: crypto.randomUUID(), selector: 'body', tag: 'body', quote: '', x: 500, y: 500 };
  const moved = { ...anchor, id: crypto.randomUUID(), x: 250 };
  const reaction = { login: 'octocat', emoji: '🚀', at: '2026-10-19T00:00:00Z' };
  const source = { version: 1, commit: post.id, post, users: {}, placements: {
    [anchor.id]: { anchor, users: { 42: reaction, 99: { emoji: '🔥' } } },
    other: { anchor, users: { 99: { emoji: '🔥' } } },
  } };
  let saved, puts = 0;
  const f = fixture((path, init, body) => {
    assert.equal(path, `/repos/octocat/private/contents/public/data/web/${post.id}.json`);
    if (init.method === 'PUT') {
      if (++puts === 1) return new Response('', { status: 409 });
      saved = JSON.parse(Buffer.from(body.content, 'base64'));
      return Response.json({ commit: { sha: 'mirror' } });
    }
    return saved ? Response.json({ encoding: 'base64', size: 1000, sha: 'old', content: Buffer.from(JSON.stringify(saved)).toString('base64') }) : new Response('', { status: 404 });
  });
  assert.equal((await f.service.mirror(repo, user, source)).status, 'saved');
  assert.equal(puts, 2);
  assert.deepEqual(saved.placements, { [anchor.id]: { anchor, users: { 42: reaction } } });
  assert.equal(saved.visibility, 'public');
  assert.equal((await f.service.mirror(repo, user, source)).changed, false);
  delete source.placements[anchor.id];
  source.placements[moved.id] = { anchor: moved, users: { 42: reaction } };
  await f.service.mirror(repo, user, source);
  assert.deepEqual(Object.keys(saved.placements), [moved.id]);
  delete source.placements[moved.id];
  await f.service.mirror(repo, user, source);
  assert.deepEqual(saved.placements, {});
  assert.deepEqual(saved.users, {});
  assert.equal(f.calls.some(c => c.path.includes('/contents/data/')), false);
});

test('mirrors refuse public or transferred destinations without writing a copy', async () => {
  for (const bad of [{ private: false }, { id: 88 }, { owner: { id: 99, type: 'User' } }]) {
    const f = fixture(() => new Response('', { status: 404 }), () => Response.json({ id: 77, private: true, owner: { id: 42, type: 'User' }, ...bad }));
    await assert.rejects(f.service.mirror(repo, user, { version: 1, commit, users: { 42: { emoji: '🚀' } } }), /no longer a private repository/);
    assert.equal(f.calls.some(c => c.init.method === 'PUT'), false);
  }
});
test('identity comparison uses numeric GitHub IDs, rejecting a different account', async () => {
  const f = fixture(path => Response.json(path === '/user' ? user : { id: 99, login: 'other' }));
  await assert.rejects(f.service.identity('user-token', 'other'), /same account/);
  assert.equal(f.calls.length, 2);
});
test('private target must remain private and personally owned with write access', async () => {
  for (const bad of [{ private: false }, { private: null }, { private: 'true' }, { owner: { id: 99, type: 'User' } }, { permissions: { push: false } }, { owner: { id: 42, type: 'Organization' } }]) {
    const f = fixture(() => Response.json({ id: 77, full_name: repo.name, private: true, owner: { id: 42, type: 'User' }, permissions: { push: true }, ...bad }));
    await assert.rejects(f.service.target('token', user, 'private', repo.name), /Private reactions require/);
  }
});
test('public target is pinned by numeric repository ID', async () => {
  const f = fixture(() => Response.json({ id: 123, private: false, full_name: 'attacker/repo' }));
  await assert.rejects(f.service.target('token', user, 'public', 'attacker/repo'), /configured repository/);
  assert.equal(f.calls[0].path, '/repos/reacji-to/reacji-to-data');
});
test('direct commit limits installation token to one repo and writes only the post file', async () => {
  const f = fixture((path, init) => init.method === 'PUT' ? Response.json({ commit: { sha: 'abc123' } }) : new Response('', { status: 404 }));
  const result = await f.service.write(repo, user, { version: 1, commit, emoji: '🚀', actor: { id: 99 } }, crypto.randomUUID());
  assert.equal(result.document.users[42].emoji, '🚀'); assert.equal(result.document.users[99], undefined);
  assert.deepEqual(f.calls.find(c => c.path.endsWith('access_tokens')).body, { repository_ids: [77], permissions: { contents: 'write' } });
  const put = f.calls.find(c => c.init.method === 'PUT');
  assert.equal(put.path, `/repos/octocat/private/contents/data/${commit}.json`);
  assert.equal(put.init.headers.Authorization, 'Bearer installation-token');
  assert.equal(f.calls.some(c => c.path.includes('/issues')), false);
  const check = f.calls.at(-2);
  assert.equal(check.path, '/repos/octocat/private');
  assert.equal(check.init.cache, 'no-store');
});
test('private writes refuse public, unverifiable, transferred, or replaced repositories before sending content', async () => {
  for (const bad of [{ private: false }, { private: null }, { private: 'true' }, { id: 88 }, { owner: { id: 99, type: 'User' } }, { owner: { id: 42, type: 'Organization' } }]) {
    const f = fixture(() => new Response('', { status: 404 }), () => Response.json({ id: 77, private: true, owner: { id: 42, type: 'User' }, ...bad }));
    await assert.rejects(f.service.write(repo, user, { version: 1, commit, emoji: '🚀' }, crypto.randomUUID()), /no longer a private repository/);
    assert.equal(f.calls.some(c => c.init.method === 'PUT'), false);
  }
  for (const status of [403, 404, 503]) {
    const f = fixture(() => new Response('', { status: 404 }), () => new Response('', { status }));
    await assert.rejects(f.service.write(repo, user, { version: 1, commit, emoji: '🚀' }, crypto.randomUUID()), /GitHub request failed/);
    assert.equal(f.calls.some(c => c.init.method === 'PUT'), false);
  }
});
test('a conflict retry stops if the private repository has become public', async () => {
  let checks = 0;
  const f = fixture((path, init) => new Response('', { status: init.method === 'PUT' ? 409 : 404 }),
    () => Response.json({ id: 77, private: ++checks === 1, owner: { id: 42, type: 'User' } }));
  await assert.rejects(f.service.write(repo, user, { version: 1, commit, emoji: '🚀' }, crypto.randomUUID()), /no longer a private repository/);
  assert.equal(checks, 2);
  assert.equal(f.calls.filter(c => c.init.method === 'PUT').length, 1);
});
test('SHA conflict rereads and preserves another account’s reaction', async () => {
  let reads = 0, writes = 0;
  const f = fixture((path, init) => {
    if (init.method === 'PUT') return ++writes === 1 ? new Response('', { status: 409 }) : Response.json({ commit: { sha: 'saved' } });
    const document = { version: 1, commit, users: ++reads === 1 ? {} : { 99: { login: 'friend', emoji: '🔥' } } };
    return Response.json({ encoding: 'base64', size: 100, sha: `sha-${reads}`, content: Buffer.from(JSON.stringify(document)).toString('base64') });
  });
  const result = await f.service.write(repo, user, { version: 1, commit, emoji: '❤️' }, crypto.randomUUID());
  assert.equal(result.document.users[99].emoji, '🔥'); assert.equal(writes, 2);
  assert.equal(f.calls.filter(c => c.init.method === 'PUT')[1].body.sha, 'sha-2');
});
test('retrying the same request does not create another commit; removal deletes the entry', async () => {
  const requestId = crypto.randomUUID(); let document = { version: 1, commit, users: { 42: { emoji: '🔥', requestId } } };
  const f = fixture((path, init, body) => {
    if (init.method === 'PUT') { document = JSON.parse(Buffer.from(body.content, 'base64')); return Response.json({ commit: { sha: 'saved' } }); }
    return Response.json({ encoding: 'base64', size: 100, sha: 'old', content: Buffer.from(JSON.stringify(document)).toString('base64') });
  });
  assert.equal((await f.service.write(repo, user, { version: 1, commit, emoji: '🔥' }, requestId)).changed, false);
  assert.equal(f.calls.filter(c => c.init.method === 'PUT').length, 0);
  await f.service.write(repo, user, { version: 1, commit, emoji: null }, crypto.randomUUID());
  assert.equal(Object.hasOwn(document.users, 42), false);
});
test('path traversal and invalid emoji fail before requesting app credentials', async () => {
  const f = fixture(() => { throw new Error('Should not fetch'); });
  await assert.rejects(f.service.write(repo, user, { version: 1, commit: '../../secret', emoji: '🔥' }, 'x'), /Invalid post/);
  await assert.rejects(f.service.write(repo, user, { version: 1, commit, emoji: 'text' }, 'x'), /Unicode/);
  await assert.rejects(f.service.write(repo, user, { version: 1, commit, emoji: 'slack:TONE:foo' }, crypto.randomUUID()), /Slack emoji/);
  assert.equal(f.calls.length, 0);
});

test('removing a legacy null entry deletes it and keeps other users at the placement', async () => {
  const post = await pagePost('https://example.test/');
  const anchor = { id: crypto.randomUUID(), selector: 'html:nth-of-type(1) > body:nth-of-type(1)', tag: 'body', quote: '', x: 500, y: 500 };
  const other = { login: 'friend', emoji: '🔥' };
  let document = { version: 1, commit: post.id, post, users: {}, placements: { [anchor.id]: { anchor, users: { 42: { login: 'octocat', emoji: null }, 99: other } } } };
  const f = fixture((path, init, body) => {
    if (init.method === 'PUT') { document = JSON.parse(Buffer.from(body.content, 'base64')); return Response.json({ commit: { sha: 'saved' } }); }
    return Response.json({ encoding: 'base64', size: 1000, sha: 'old', content: Buffer.from(JSON.stringify(document)).toString('base64') });
  });
  await f.service.write(repo, user, { version: 1, post, placement: anchor, emoji: null }, crypto.randomUUID());
  assert.equal(Object.hasOwn(document.placements[anchor.id].users, 42), false);
  assert.deepEqual(document.placements[anchor.id].users[99], other);
  const again = await f.service.write(repo, user, { version: 1, post, placement: anchor, emoji: null }, crypto.randomUUID());
  assert.equal(again.changed, false);
  assert.equal(f.calls.filter(c => c.init.method === 'PUT').length, 1);
});
test('public post and profile publish atomically, and a head conflict merges both again', async () => {
  let attempt = 0;
  const f = fixture((path, init, body) => {
    if (path.includes('/git/ref/heads/')) { attempt++; return Response.json({ object: { sha: `head${attempt}` } }); }
    if (path.includes('/git/commits/head')) return Response.json({ tree: { sha: `base${attempt}` } });
    if (path.includes('/contents/data/')) return Response.json({ encoding: 'base64', content: Buffer.from(JSON.stringify({ version: 1, commit: '123456789', post: { platform: 'x', id: '123456789' }, users: attempt === 1 ? {} : { 99: { emoji: '🔥' } } })).toString('base64') });
    if (path.includes('/contents/profiles/')) return Response.json({ encoding: 'base64', content: Buffer.from(JSON.stringify({ version: 1, id: 42, reactions: attempt === 1 ? {} : { 'linkedin:987654321': { post: { platform: 'linkedin', id: '987654321' }, emoji: '❤️' } } })).toString('base64') });
    if (path.endsWith('/git/trees')) return Response.json({ sha: 'tree' });
    if (path.endsWith('/git/commits')) return Response.json({ sha: `commit${attempt}` });
    if (path.includes('/git/refs/heads/')) { assert.equal(body.force, false); return attempt === 1 ? new Response('', { status: 422 }) : Response.json({}); }
    throw new Error(path);
  });
  const result = await f.service.write({ ...repo, visibility: 'public' }, user, { version: 1, post: { platform: 'x', id: '123456789' }, emoji: '🚀' }, crypto.randomUUID());
  assert.equal(attempt, 2); assert.equal(result.document.users[99].emoji, '🔥');
  const tree = f.calls.filter(c => c.path.endsWith('/git/trees')).at(-1).body;
  assert.equal(tree.base_tree, 'base2'); assert.deepEqual(tree.tree.map(f => f.path), ['data/x/123456789.json','profiles/42.json']);
  assert.equal(JSON.parse(tree.tree[1].content).reactions['linkedin:987654321'].emoji, '❤️');
  assert.equal(JSON.parse(tree.tree[1].content).reactions['x:123456789'].url, 'https://x.com/i/status/123456789');
});
test('a renamed dev-null account cannot substitute a different immutable avatar ID', async () => {
  const f = fixture(() => Response.json(user));
  await assert.rejects(f.service.identity('token', 'octocat', 99), /same account/);
});
test('multiple page placements share one file and preserve each other when changed or removed', async () => {
  const post=await pagePost('https://example.test/article');let document={version:1,commit:post.id,post,users:{},placements:{}};
  const f=fixture((path,init,body)=>{
    if(init.method==='PUT'){document=JSON.parse(Buffer.from(body.content,'base64'));return Response.json({commit:{sha:'saved'}});}
    return Response.json({encoding:'base64',size:1000,sha:'old',content:Buffer.from(JSON.stringify(document)).toString('base64')});
  });
  const anchor={id:crypto.randomUUID(),selector:'html:nth-of-type(1) > body:nth-of-type(1) > p:nth-of-type(1)',tag:'p',quote:'A sentence.',x:500,y:500};
  const second={...anchor,id:crypto.randomUUID(),quote:'Another sentence.'};
  await f.service.write(repo,user,{version:1,post,placement:anchor,emoji:'💙'},crypto.randomUUID());
  await f.service.write(repo,user,{version:1,post,placement:second,emoji:'🔥'},crypto.randomUUID());
  await f.service.write(repo,user,{version:1,post,placement:anchor,emoji:null},crypto.randomUUID());
  assert.equal(Object.hasOwn(document.placements,anchor.id),false);assert.equal(document.placements[second.id].users[42].emoji,'🔥');
  assert.equal(new Set(f.calls.filter(c=>c.init.method==='PUT').map(c=>c.path)).size,1);
  assert.equal(document.post.url,'https://example.test/article');
});

test('public writes and removals ignore forged actor fields and preserve other users', async () => {
  const post = { platform: 'x', id: '123456789' };
  const victim = { login: 'friend', emoji: '🔥', requestId: 'unchanged', at: '2026-10-18T00:00:00Z' };
  for (const emoji of ['💙', null]) {
    const f = fixture((path, init, body) => {
      if (path === '/user') {
        assert.equal(init.headers.Authorization, 'Bearer verified-user-token');
        return Response.json(user);
      }
      if (path.includes('/git/ref/heads/')) return Response.json({ object: { sha: 'head' } });
      if (path.endsWith('/git/commits/head')) return Response.json({ tree: { sha: 'base' } });
      if (path.includes('/contents/data/')) return Response.json({ encoding: 'base64', size: 1000, content: Buffer.from(JSON.stringify({ version: 1, commit: post.id, post, users: { 42: { login: 'octocat', emoji: '🚀' }, 99: victim } })).toString('base64') });
      if (path.includes('/contents/profiles/')) {
        assert.match(path, /\/profiles\/42\.json$/);
        return new Response('', { status: 404 });
      }
      if (path.endsWith('/git/trees')) return Response.json({ sha: 'tree' });
      if (path.endsWith('/git/commits')) return Response.json({ sha: 'commit' });
      if (path.includes('/git/refs/heads/')) return Response.json({});
      throw new Error(path);
    });
    const authenticated = await f.service.actor('verified-user-token');
    const result = await f.service.write({ ...repo, visibility: 'public' }, authenticated, {
      version: 1, post, emoji, actor: { id: 99, login: 'friend' }, user: { id: 99 }, githubId: 99,
      users: { 99: { emoji } }, path: 'profiles/99.json', profile: { id: 99 },
    }, crypto.randomUUID());
    assert.deepEqual(result.actor, user);
    if (emoji === null) assert.equal(Object.hasOwn(result.document.users, 42), false);
    else assert.equal(result.document.users[42].emoji, emoji);
    assert.deepEqual(result.document.users[99], victim);
    const tree = f.calls.find(call => call.path.endsWith('/git/trees')).body.tree;
    assert.deepEqual(tree.map(file => file.path), ['data/x/123456789.json', 'profiles/42.json']);
    assert.equal(JSON.parse(tree[1].content).id, 42);
  }
});

test('moving a placement atomically moves only the verified actor and is retry-safe', async () => {
  const post=await pagePost('https://example.test/article');
  const source={id:crypto.randomUUID(),selector:'html:nth-of-type(1) > body:nth-of-type(1)',tag:'body',quote:'',x:500,y:500};
  const target={...source,id:crypto.randomUUID(),x:250,y:750,mode:'point'};
  const other={login:'friend',emoji:'🔥'};
  let document={version:1,commit:post.id,post,users:{},placements:{[source.id]:{anchor:source,users:{42:{login:'octocat',emoji:'💙'},99:other}}}};
  const f=fixture((path,init,body)=>{
    if(init.method==='PUT'){document=JSON.parse(Buffer.from(body.content,'base64'));return Response.json({commit:{sha:'moved'}});}
    return Response.json({encoding:'base64',size:1000,sha:'old',content:Buffer.from(JSON.stringify(document)).toString('base64')});
  });
  const requestId=crypto.randomUUID(),event={version:1,post,placement:target,moveFrom:source.id,emoji:'💙'};
  await f.service.write(repo,user,event,requestId);
  assert.deepEqual(document.placements[source.id],{anchor:source,users:{99:other}});
  assert.deepEqual(document.placements[target.id].anchor,target);
  assert.equal(document.placements[target.id].users[42].emoji,'💙');
  assert.equal((await f.service.write(repo,user,event,requestId)).changed,false);
  assert.equal((await f.service.write(repo,user,event,crypto.randomUUID())).changed,false);
  assert.equal(f.calls.filter(c=>c.init.method==='PUT').length,1);
  await assert.rejects(f.service.write(repo,user,{...event,placement:{...target,id:crypto.randomUUID()}},crypto.randomUUID()),/Your reaction has changed/);
  assert.equal(f.calls.filter(c=>c.init.method==='PUT').length,1);
});

test('public moves update the placement and profile in the same commit', async () => {
  const post=await pagePost('https://example.test/article');
  const source={id:crypto.randomUUID(),selector:'html:nth-of-type(1) > body:nth-of-type(1)',tag:'body',quote:'',x:500,y:500};
  const target={...source,id:crypto.randomUUID(),mode:'point'};
  const f=fixture((path,init,body)=>{
    if(path.includes('/git/ref/heads/'))return Response.json({object:{sha:'head'}});
    if(path.includes('/git/commits/head'))return Response.json({tree:{sha:'base'}});
    if(path.includes('/contents/data/'))return Response.json({encoding:'base64',content:Buffer.from(JSON.stringify({version:1,commit:post.id,post,users:{},placements:{[source.id]:{anchor:source,users:{42:{emoji:'💙'}}}}})).toString('base64')});
    if(path.includes('/contents/profiles/'))return Response.json({encoding:'base64',content:Buffer.from(JSON.stringify({version:1,id:42,reactions:{[`web:${post.id}:${source.id}`]:{post,placement:source,emoji:'💙'}}})).toString('base64')});
    if(path.endsWith('/git/trees'))return Response.json({sha:'tree'});
    if(path.endsWith('/git/commits'))return Response.json({sha:'commit'});
    if(path.includes('/git/refs/heads/'))return Response.json({});
    throw new Error(path);
  });
  await f.service.write({...repo,visibility:'public'},user,{version:1,post,placement:target,moveFrom:source.id,emoji:'💙'},crypto.randomUUID());
  const files=f.calls.find(c=>c.path.endsWith('/git/trees')).body.tree;
  const document=JSON.parse(files[0].content),profile=JSON.parse(files[1].content);
  assert.equal(document.placements[source.id],undefined);
  assert.equal(profile.reactions[`web:${post.id}:${source.id}`],undefined);
  assert.deepEqual(profile.reactions[`web:${post.id}:${target.id}`].placement,target);
  assert.equal(f.calls.filter(c=>c.path.includes('/git/refs/heads/')).length,1);
});
