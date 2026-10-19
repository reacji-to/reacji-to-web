import { test, expect } from '@playwright/test';
import { publicPage } from '../../worker/pages.js';

async function routeSite(page) {
  await page.route('https://reacji.to/**', async route => {
    const response = await publicPage(new URL(route.request().url()));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
}
test('shared picker shows top categories and persists frequency ranking across reloads', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await routeSite(page);
  await page.goto('https://reacji.to/',{waitUntil:'domcontentloaded'});
  const trigger = page.locator('#post-x .trigger');
  for (const emoji of ['🚀', '🚀', '💙']) {
    await trigger.click();
    await page.getByRole('searchbox').fill(emoji);
    await page.locator('.grid .emoji').click();
    await page.locator('#post-x .chip').click();
  }
  await page.reload();
  await trigger.click();
  const toolbar=page.getByRole('toolbar',{name:'Emoji categories'});
  const frequent=page.getByRole('region',{name:'Frequently used',exact:true});
  await expect(frequent.locator('.emoji').nth(0)).toHaveText('🚀');
  await expect(frequent.locator('.emoji').nth(1)).toHaveText('💙');
  expect((await toolbar.boundingBox()).y).toBeLessThan((await page.getByRole('searchbox').boundingBox()).y);
  await toolbar.getByRole('button',{name:'Animals & Nature'}).click();
  await expect(toolbar.getByRole('button',{name:'Animals & Nature'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('searchbox').fill('rocket');
  await expect(page.locator('.grid').getByRole('button',{name:'rocket',exact:true})).toBeVisible();
  await toolbar.getByRole('button',{name:'Frequently used'}).click();
  await page.getByRole('searchbox').focus();
  await page.getByRole('dialog').screenshot({path:'artifacts/picker-categories-website.png'});
});
test('demo supports private/public, changing/removing, platform persistence and keyboard navigation without writes', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());});
  await routeSite(page);
  await page.goto('https://reacji.to/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:'Play demo'})).toBeVisible();
  await expect(page.locator('.hero-eyes')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'reacji.to on GitHub'})).toHaveAttribute('href','https://github.com/reacji-to');
  await page.locator('.sample-post:not([hidden]) .trigger').click();
  await page.getByRole('searchbox').fill('🔥');
  await page.getByRole('button',{name:'fire',exact:true}).click();
  await expect(page.locator('#post-x .chip')).toHaveText('🔥');
  await expect(page.locator('#post-x .trigger')).toBeHidden();
  // Social chips remove your reaction on click, exactly as in the installed extension.
  await page.locator('#post-x .chip').click();
  await expect(page.locator('#post-x .chip')).toHaveCount(0);
  await page.locator('#post-x .trigger').click();
  await page.getByRole('button',{name:'Private',exact:true}).click();
  await page.getByRole('searchbox').fill('🧠');
  await page.getByRole('button',{name:'brain',exact:true}).click();
  await expect(page.locator('#post-x .chip')).toHaveText('🧠');
  await page.mouse.move(0, 0);
  await expect(page.locator('#post-x .chip')).toHaveCSS('background-color', 'rgb(213, 217, 223)');
  await page.locator('#post-x .chip').click();
  await page.locator('#post-x .trigger').click();
  await page.getByRole('button',{name:'Public',exact:true}).click();
  await page.getByRole('searchbox').fill('🔥');
  await page.getByRole('button',{name:'fire',exact:true}).click();
  await expect(page.locator('#post-x .chip')).toHaveText('🔥');
  await page.getByRole('tab',{name:'X',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'LinkedIn',exact:true})).toBeFocused();
  await expect(page.locator('#post-linkedin')).toBeVisible();
  await expect(page.locator('#post-linkedin .chip')).toBeHidden();
  await page.keyboard.press('End');
  await expect(page.locator('#post-web')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#post-devnull')).toBeVisible();
  await page.locator('.sample-post:not([hidden]) .trigger').click();
  await page.getByRole('searchbox').fill('🎉');
  await page.getByRole('button',{name:'party popper',exact:true}).click();
  await expect(page.locator('#post-devnull .chip')).toHaveText('🎉');
  await expect(page.locator('#post-devnull .trigger')).toBeHidden();
  await page.getByRole('tab',{name:'X',exact:true}).click();
  await expect(page.locator('#post-x .chip')).toHaveText('🔥');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#post-x .chip').click();
  await page.locator('#post-x .trigger').click();
  const box=await page.locator('reacji-to-reactions .panel').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('script plays all four examples, and pauses on manual interaction', async ({page}) => {
  test.setTimeout(45000);
  await routeSite(page);
  await page.goto('https://reacji.to/',{waitUntil:'domcontentloaded'});
  await page.locator('.reaction-demo').scrollIntoViewIfNeeded();
  await expect(page.locator('#post-x .chip')).toHaveText('🔥',{timeout:12000});
  await expect(page.locator('#post-linkedin .chip')).toHaveText('🧠',{timeout:12000});
  await expect(page.locator('#post-devnull .chip')).toHaveText('🎉',{timeout:12000});
  await expect(page.locator('.pin .chip')).toHaveText('🐶',{timeout:14000});
  expect(await page.evaluate(()=>localStorage.getItem('reacji.to:emoji-usage'))).toBeNull();
  await expect(page.locator('#post-x')).toBeVisible({timeout:6000});
  await expect(page.locator('#post-x .trigger')).toBeVisible();
  await expect(page.locator('#post-x .chip')).toHaveCount(0);
  await page.getByRole('button',{name:'Pause demo'}).click();
  await expect(page.getByRole('button',{name:'Play demo'})).toBeVisible();
  await page.getByRole('tab',{name:'X',exact:true}).click();
  await expect(page.locator('.demo-stage > .demo-cursor')).toBeHidden();
  await expect(page.getByRole('tab',{name:'X',exact:true})).toHaveAttribute('aria-selected','true');
});

test('X matches the selected post and keeps reacji after the heart in six equal action slots', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await routeSite(page);
  await page.goto('https://reacji.to/',{waitUntil:'domcontentloaded'});
  const post=page.locator('#post-x');
  await expect(post.locator('.post-copy')).toContainText('The best outcome of Twitter is getting off Twitter.');
  await expect(post.locator('.post-source')).toHaveText('7:51 PM · Mar 15, 2022');
  await expect(post.locator('.x-body > .native-post-link')).toHaveAttribute('href','https://x.com/swyx/status/1503926848073322500');
  await expect(post.locator('.post-actions > :nth-child(3)')).toHaveClass(/action-like/);
  await expect(post.locator('.post-actions > :nth-child(4)')).toHaveJSProperty('localName','reacji-to-reactions');
  for(const width of [1440,1024,390,320]) {
    await page.setViewportSize({width,height:900});
    await expect.poll(()=>post.locator('.post-actions > *').evaluateAll(els=>{
      const centers=els.map(el=>{const icon=el.querySelector('svg') || el.shadowRoot.querySelector('.trigger:not([hidden]),.chip');const r=icon.getBoundingClientRect();return r.x+r.width/2;});
      const gaps=centers.slice(1).map((x,i)=>x-centers[i]);
      return Math.max(...gaps)-Math.min(...gaps);
    })).toBeLessThan(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({width:1440,height:1000});
  await post.screenshot({path:'.impeccable/review/home-x-post.png'});
});


test('website passage supports Option-click placement, editing and removal without a counter', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await routeSite(page);await page.goto('https://reacji.to/',{waitUntil:'domcontentloaded'});
  await page.getByRole('tab',{name:'Website',exact:true}).click();
  const post=page.locator('#post-web');
  await expect(post.locator('.web-headline')).toHaveAttribute('href','https://www.sciencealert.com/dogs-seem-to-agree-with-humans-that-bouba-is-round-and-kiki-is-spiky');
  const before=await post.evaluate(el=>({height:el.getBoundingClientRect().height,text:el.querySelector('.web-summary').textContent,paragraphHeight:el.querySelector('.web-summary').getBoundingClientRect().height}));
  await post.locator('.web-quote').click({modifiers:['Alt']});
  await page.getByRole('searchbox').fill('🐶');await page.getByRole('button',{name:'dog face',exact:true}).click();
  await expect(page.locator('.pin .chip')).toHaveText('🐶');
  await expect(page.locator('.pin .chip span')).toHaveCount(0);
  const after=await post.evaluate(el=>({height:el.getBoundingClientRect().height,text:el.querySelector('.web-summary').textContent,paragraphHeight:el.querySelector('.web-summary').getBoundingClientRect().height}));
  expect(after).toEqual(before);
  await expect.poll(()=>page.locator('.pin .chip').evaluate(el=>{const host=el.getRootNode().host;return host && getComputedStyle(host).position;})).toBe('absolute');
  expect(await post.locator('.web-quote').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await page.setViewportSize({width:390,height:900});
  await post.scrollIntoViewIfNeeded();
  await post.screenshot({path:'.impeccable/review/sciencealert-demo.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('.pin .chip').click();
  await page.getByRole('searchbox').fill('🐶');await page.getByRole('button',{name:'dog face',exact:true}).click();
  await expect(page.locator('.pin .chip')).toBeHidden();
});

test('sample demo ignores saved reactions and starts with eyes again after reload', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(() => localStorage.setItem('reacji.to:page-demo:v1:1503926848073322500:public', JSON.stringify({users:{1:{login:'you',emoji:'🔥'}}})));
  await routeSite(page); await page.goto('https://reacji.to/');
  await expect(page.locator('#post-x .trigger')).toBeVisible();
  await expect(page.locator('#post-x .chip')).toHaveCount(0);
  await page.locator('#post-x .trigger').click();
  await page.getByRole('button',{name:'Public',exact:true}).click();
  await page.getByRole('searchbox').fill('🎉');
  await page.getByRole('button',{name:'party popper',exact:true}).click();
  await expect(page.locator('#post-x .trigger')).toBeHidden();
  await page.mouse.move(0, 0);
  await expect(page.locator('#post-x .chip')).toHaveCSS('background-color','rgb(238, 240, 242)');
  await page.reload();
  await expect(page.locator('#post-x .trigger')).toBeVisible();
  await expect(page.locator('#post-x .chip')).toHaveCount(0);
});

for (const [platform, tab] of [['x', 'X'], ['linkedin', 'LinkedIn'], ['devnull', 'dev-null']]) test(`${tab}: shared action spacing and identical eyes/emoji bounds`, async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await routeSite(page);
  await page.goto('https://reacji.to/', {waitUntil:'domcontentloaded'});
  await page.getByRole('tab', {name:tab, exact:true}).click();
  const post=page.locator(`#post-${platform}`), eyes=post.locator('.trigger');
  const centers=()=>post.locator('.post-actions').evaluate(row=>[...row.querySelectorAll('[data-reacji-actions-action],reacji-to-reactions')].filter(el=>el.getClientRects().length).map(el=>{
    const icon=el.shadowRoot?.querySelector('.reaction-slot') || el.querySelector('svg');
    const b=icon.getBoundingClientRect();return b.x+b.width/2;
  }));
  for(const width of [1440,760,390,320]) {
    await page.setViewportSize({width,height:1000});
    await expect(eyes).toBeVisible();
    await expect.poll(async()=>{const x=await centers(), gaps=x.slice(1).map((v,i)=>v-x[i]);return Math.max(...gaps)-Math.min(...gaps);}).toBeLessThan(1);
    await eyes.scrollIntoViewIfNeeded();
    const before=await centers(), box=await eyes.boundingBox();
    await eyes.click();await page.getByRole('searchbox').fill('💙');await page.getByRole('button',{name:'blue heart',exact:true}).click();
    await expect(eyes).toBeHidden();
    await expect.poll(()=>post.locator('.chip').boundingBox()).toEqual(box);
    expect(await centers()).toEqual(before);
    await post.locator('.chip').click();await expect(eyes).toBeVisible();
    expect(await centers()).toEqual(before);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if(width===1440 || width===320) await post.screenshot({path:`artifacts/${platform}-spacing-${width}.png`});
  }
});
