import {test,expect} from '@playwright/test';
import {publicPage} from '../../worker/pages.js';
async function setup(page){
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://reacji.to/**',async route=>{const r=await publicPage(new URL(route.request().url()));await route.fulfill({status:r.status,headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())});});
 await page.goto('https://reacji.to/');
}
async function place(page,emoji,name){
 await page.locator('.hero-promise').click({modifiers:['Alt']});
 await page.locator('reacji-to-reactions').getByRole('searchbox').fill(emoji);
 await page.locator('reacji-to-reactions').getByRole('button',{name,exact:true}).click();
}
test('actual extension picker saves page placements only in browser storage and survives reload',async({page})=>{
 const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());});
 await setup(page);
 await expect(page.getByText('Try it on this site!',{exact:true})).toBeVisible();
 await place(page,'💙','blue heart');
 const chip=page.locator('reacji-to-reactions .pin .chip');
 await expect(chip).toHaveText('💙');await expect(chip.locator('span')).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('reacji.to:page-demo:')).length)).toBe(1);
 await page.reload();await expect(chip).toHaveText('💙');
 await chip.click();await page.locator('reacji-to-reactions').getByRole('searchbox').fill('💙');await page.locator('reacji-to-reactions').getByRole('button',{name:'blue heart',exact:true}).click();
 await expect(chip).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('reacji.to:page-demo:')).length)).toBe(0);
 expect(errors).toEqual([]);expect(writes).toEqual([]);
});
test('storage failures roll back placements and show a recovery message',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Storage blocked','QuotaExceededError');};});
 await setup(page);await place(page,'💙','blue heart');
 await expect(page.getByText(/Browser storage is unavailable/)).toBeVisible();
 await expect(page.locator('reacji-to-reactions .pin .chip')).toHaveCount(0);
});
test('homepage typography, banner and invitation fit desktop and mobile',async({page})=>{
 await setup(page);await page.evaluate(()=>document.fonts.ready);
 for(const width of [1440,1024,800,390,320]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  const heading=await page.locator('h1').evaluate(el=>({height:el.offsetHeight,line:parseFloat(getComputedStyle(el).lineHeight),font:getComputedStyle(el).fontFamily}));
  expect(heading.height).toBeLessThan(heading.line*1.5);expect(heading.font).toContain('Manrope');
  if(width===1440||width===390)await page.screenshot({path:`.impeccable/review/polished-home-${width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({colorScheme:'dark'});
 await page.screenshot({path:'.impeccable/review/polished-home-dark.png',fullPage:true});
});

test('Public and Private trial choices stay separate and both remain local',async({page})=>{
 await setup(page);await place(page,'💙','blue heart');
 const chip=page.locator('reacji-to-reactions .pin .chip');await expect(chip).toHaveText('💙');
 await chip.click();await page.locator('reacji-to-reactions').getByRole('button',{name:'Private',exact:true}).click();
 await page.locator('reacji-to-reactions').getByRole('searchbox').fill('🔥');await page.locator('reacji-to-reactions').getByRole('button',{name:'fire',exact:true}).click();
 await expect(chip).toHaveText('🔥');
 const scopes=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('reacji.to:page-demo:')).map(k=>({scope:k.split(':').at(-1),users:Object.values(JSON.parse(localStorage.getItem(k)).placements)[0].users})));
 expect(scopes).toHaveLength(2);expect(scopes.find(s=>s.scope==='public').users['1'].emoji).toBe('💙');expect(scopes.find(s=>s.scope==='private').users['1'].emoji).toBe('🔥');
 await page.reload();await expect(chip).toHaveCount(1);
 await chip.click();await page.locator('reacji-to-reactions').getByRole('button',{name:'Private',exact:true}).click();
 await expect(chip).toHaveText('🔥');
});

test('a placed trial reaction can be dragged and keeps its new position after reload',async({page})=>{
 await setup(page);await place(page,'💙','blue heart');
 const chip=page.locator('reacji-to-reactions .pin .chip');
 await expect(chip).toBeVisible();
 // The shared app replaces chips while a save completes; retry a detached geometry read.
 let before;
 await expect.poll(async()=>Boolean(before=await chip.boundingBox())).toBe(true);
 const target=await page.locator('h1').boundingBox();
 await page.mouse.move(before.x+before.width/2,before.y+before.height/2);await page.mouse.down();
 await page.mouse.move(target.x+target.width*.6,target.y+target.height*.5,{steps:8});await page.mouse.up();
 await expect(page.locator('reacji-to-reactions').getByRole('dialog')).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>{
  const docs=Object.keys(localStorage).filter(k=>k.startsWith('reacji.to:page-demo:')).map(k=>JSON.parse(localStorage.getItem(k)));
  return docs.flatMap(d=>Object.values(d.placements)).map(p=>({mode:p.anchor.mode,tag:p.anchor.tag}));
 })).toEqual([{mode:'point',tag:'h1'}]);
 let moved;await expect.poll(async()=>{moved=await chip.boundingBox();return moved?.y ?? Infinity;}).toBeLessThan(before.y);
 await page.reload({waitUntil:'domcontentloaded'});await expect(chip).toBeVisible();
 await expect.poll(async()=>Math.abs(((await chip.boundingBox())?.y ?? Infinity)-moved.y)).toBeLessThan(2);
 await chip.click();await expect(page.locator('reacji-to-reactions').getByRole('dialog')).toBeVisible();
});

test('Option/Alt uses the extension eyes cursor and picker, consumes links, and persists locally',async({page})=>{
 const errors=[],writes=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.method()!=='GET')writes.push(request.url());});
 await setup(page);
 const target=page.locator('.hero .cta');
 await target.hover();await page.keyboard.down('Alt');
 await expect.poll(()=>target.evaluate(el=>getComputedStyle(el).cursor)).toContain('data:image/png;base64,');
 await target.click();await page.keyboard.up('Alt');
 expect(page.url()).toBe('https://reacji.to/');
 await expect(page.getByRole('dialog')).toHaveCount(1);
 await expect(page.getByRole('searchbox')).toBeFocused();
 await page.getByRole('searchbox').fill('💙');await page.getByRole('button',{name:'blue heart',exact:true}).click();
 await expect(page.locator('.pin .chip')).toHaveText('💙');
 await page.reload();await expect(page.locator('.pin .chip')).toHaveText('💙');
 // The saved reaction now covers the click point at the center of the link.
 await target.hover({position:{x:5,y:5}});await page.keyboard.down('Alt');await page.keyboard.up('Alt');
 await expect.poll(()=>target.evaluate(el=>getComputedStyle(el).cursor)).not.toContain('data:image/png;base64,');
 expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('right-click keeps the browser menu and the invitation says to hold down Option',async({page})=>{
 await setup(page);
 await expect(page.locator('.try-site')).toContainText('Hold down Option');
 await page.locator('.try-site').screenshot({path:'.impeccable/review/hold-option.png'});
 await page.locator('.hero-promise').evaluate(el=>el.addEventListener('contextmenu',event=>{queueMicrotask(()=>window.contextPrevented=event.defaultPrevented);}));
 await page.locator('.hero-promise').click({button:'right'});
 expect(await page.evaluate(()=>window.contextPrevented)).toBe(false);
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('reacji-page-menu')).toHaveCount(0);
});

test('page trial reactions remain centered on the clicked point after scrolling and reload',async({page})=>{
 await setup(page);await page.evaluate(()=>document.fonts.ready);
 const target=page.locator('.hero-promise'),chip=page.locator('.pin .chip');
 const box=await target.boundingBox();
 await target.click({position:{x:box.width*.3,y:box.height*.4},modifiers:['Alt']});
 await page.getByRole('searchbox').fill('💙');await page.getByRole('button',{name:'blue heart',exact:true}).click();
 const assertPosition=async()=>{
  await expect(chip).toBeVisible();
  await expect.poll(async()=>{
   const b=await target.boundingBox(),c=await chip.boundingBox();
   return !b || !c ? Infinity : Math.max(Math.abs(c.x+c.width/2-(b.x+b.width*.3)),Math.abs(c.y+c.height/2-(b.y+b.height*.4)));
  }).toBeLessThan(2);
 };
 await assertPosition();
 await page.evaluate(()=>scrollBy(0,100));await assertPosition();
 await page.reload();await page.evaluate(()=>document.fonts.ready);await assertPosition();
});
