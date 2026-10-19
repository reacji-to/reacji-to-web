import { test, expect } from '@playwright/test';
import { publicPage } from '../../worker/pages.js';
import { mkdir } from 'node:fs/promises';
test('public profile filters, long handles, mobile, and empty states', async ({page}) => {
  await mkdir('.impeccable/review',{recursive:true});
  await page.route('https://reacji.to/**', async route => {
    const response = await publicPage(new URL(route.request().url()),{},async url=>url.includes('/users/')?Response.json({id:42,login:'a-very-long-github-handle-for-a-profile'}):Response.json({version:1,id:42,reactions:Object.fromEntries(['x','linkedin','devnull'].map((platform,i)=>[platform,{post:{platform,id:platform==='devnull'?'01a14f9d-76a7-72d9-a92d-48ae9ea999cb':'123456789',author:'octocat'},emoji:['🚀','💡','👀'][i],at:'2026-10-18T00:00:00Z'}]))}));
    await route.fulfill({status:response.status,contentType:response.headers.get('content-type'),body:Buffer.from(await response.arrayBuffer())});
  });
  await page.setViewportSize({width:1440,height:1000}); await page.goto('https://reacji.to/octocat');
  await expect(page.locator('.feed li')).toHaveCount(3); await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});
  await page.getByRole('link',{name:'LinkedIn',exact:true}).click(); await expect(page.locator('.feed li')).toHaveCount(1);
  await page.getByRole('link',{name:'All',exact:true}).click(); await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({path:'.impeccable/review/mobile.png',fullPage:true});
  await page.goto('https://reacji.to/');
  await page.screenshot({path:'.impeccable/review/home-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'.impeccable/review/home-desktop.png',fullPage:true});
  await page.emulateMedia({colorScheme:'dark'});
  await page.screenshot({path:'.impeccable/review/home-dark.png',fullPage:true});
  await page.locator('#post-x .trigger').click();
  await page.getByRole('searchbox').fill('🔥');
  await page.getByRole('button',{name:'fire',exact:true}).click();
  await expect(page.locator('#post-x .chip')).toHaveText('🔥');
});
