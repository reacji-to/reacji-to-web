import { test, expect } from '@playwright/test';
import { publicPage } from '../../worker/pages.js';

async function setup(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://reacji.to/**', async route => {
    const response = await publicPage(new URL(route.request().url()));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.goto('https://reacji.to/');
}

test('social eyes match native icon size and ink across desktop and mobile', async ({ page }) => {
  await setup(page);
  for (const width of [1440, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, id] of [['X', 'x'], ['LinkedIn', 'linkedin'], ['dev-null', 'devnull']]) {
      await page.getByRole('tab', { name, exact: true }).click();
      const post = page.locator(`#post-${id}`), eyes = post.locator('.native-eyes');
      await expect(eyes).toBeVisible();
      await expect(post.locator('.trigger img')).toHaveCount(0);
      const box = await eyes.boundingBox();
      expect(box.width / box.height).toBeCloseTo(232 / 180, 2);
      await expect.poll(() => post.evaluate(post => {
        const native = [...post.querySelectorAll('.post-actions .native-action')].find(el => !el.matches('.action-like,.action-star')).querySelector('svg');
        const ours = post.querySelector('reacji-to-reactions').shadowRoot.querySelector('.native-eyes');
        const shape = native.querySelector('path');
        const style = getComputedStyle(shape);
        const color = style.stroke !== 'none' ? style.stroke : style.fill;
        return { heightDifference: Math.abs(native.getBoundingClientRect().height - ours.getBoundingClientRect().height), sameColor: color === getComputedStyle(ours).color };
      })).toEqual({ heightDifference: 0, sameColor: true });
      await expect(eyes.locator('ellipse[stroke]')).toHaveCount(id === 'devnull' ? 2 : 0);
      await post.screenshot({ path: `.impeccable/review/native-eyes-${id}-${width}.png` });
    }
  }
});

test('header pupils move together, stay bounded and reset when the pointer leaves', async ({ page }) => {
  await setup(page);
  const left = page.locator('.eye-left'), right = page.locator('.eye-right');
  const offset = eye => eye.evaluate(el => ({ x: parseFloat(getComputedStyle(el).getPropertyValue('--look-x')) || 0, y: parseFloat(getComputedStyle(el).getPropertyValue('--look-y')) || 0 }));
  const box = await page.locator('.eyes').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(async () => Math.abs((await offset(left)).x)).toBeLessThan(1);
  expect(await offset(left)).toEqual(await offset(right));
  await page.mouse.move(1200, 800);
  for (const eye of [left, right]) {
    await expect.poll(async () => (await offset(eye)).x).toBeGreaterThan(0);
    await expect.poll(async () => (await offset(eye)).y).toBeGreaterThan(0);
    const size = await eye.boundingBox(), travel = await offset(eye);
    expect(Math.abs(travel.x)).toBeLessThan(size.width / 2);
    expect(Math.abs(travel.y)).toBeLessThan(size.height / 2);
  }
  expect(await offset(left)).toEqual(await offset(right));
  await page.locator('.brand').screenshot({ path: '.impeccable/review/eyes-following.png' });
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await offset(left)).x).toBeLessThan(0);
  expect(await offset(left)).toEqual(await offset(right));
  await page.locator('html').dispatchEvent('pointerleave');
  await expect.poll(() => offset(left)).toEqual({ x: 0, y: 0 });
  await expect.poll(() => offset(right)).toEqual({ x: 0, y: 0 });
});
