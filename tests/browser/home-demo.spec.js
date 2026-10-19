import { test, expect } from '@playwright/test';
import { publicPage } from '../../worker/pages.js';

async function routeSite(page) {
  await page.route('https://reacji.to/**', async route => {
    const response = await publicPage(new URL(route.request().url()));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
}
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
  await expect(page.locator('#post-x .chip')).toHaveText('🔒 🧠');
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
  await expect(post.locator('.post-actions > :nth-child(4)')).toHaveClass('reacji-action');
  for(const width of [1440,1024,390,320]) {
    await page.setViewportSize({width,height:900});
    const cells=await post.locator('.post-actions > *').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,x:r.x,y:r.y};}));
    expect(cells).toHaveLength(6);
    expect(Math.max(...cells.map(c=>c.width))-Math.min(...cells.map(c=>c.width))).toBeLessThan(1);
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
  expect(await page.locator('.pin .chip').evaluate(el=>getComputedStyle(el.getRootNode().host).position)).toBe('absolute');
  expect(await post.locator('.web-quote').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await page.setViewportSize({width:390,height:900});
  await post.scrollIntoViewIfNeeded();
  await post.screenshot({path:'.impeccable/review/sciencealert-demo.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('.pin .chip').click();
  await page.getByRole('searchbox').fill('🐶');await page.getByRole('button',{name:'dog face',exact:true}).click();
  await expect(page.locator('.pin .chip')).toBeHidden();
});
