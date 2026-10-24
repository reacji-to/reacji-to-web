import { test, expect } from '@playwright/test';
import { publicPage } from '../../worker/pages.js';
import { setupPrompt } from '../../worker/setup.js';

test('agent setup copies the complete guide prompt and offers manual copy when blocked', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://reacji.to/**', async route => {
    const response = await publicPage(new URL(route.request().url()));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async text => {
        if (window.blockClipboard) throw new Error('Clipboard blocked');
        window.copiedSetup = text;
      },
    } });
  });
  await page.goto('https://reacji.to/');
  await page.getByRole('button', { name: 'Copy setup instructions' }).click();
  expect(await page.evaluate(() => window.copiedSetup)).toBe(setupPrompt);
  await expect(page.locator('.setup-status')).toHaveText('Copied!');
  await expect(page.getByRole('button', { name: 'Copy setup instructions' })).toHaveAttribute('data-copied', '');
  await page.evaluate(() => { window.blockClipboard = true; });
  await page.getByRole('button', { name: 'Copy setup instructions' }).click();
  await expect(page.locator('.setup-status')).toContainText('Select and copy');
  expect(await page.evaluate(() => getSelection().toString())).toBe(setupPrompt);
  await expect(page.locator('footer .github-mark')).toHaveCount(1);
  await expect(page.locator('footer')).not.toContainText('·');
});

test('about is the canonical agent guide and copies the same complete instruction', async ({ page }) => {
  await page.route('https://reacji.to/**', async route => {
    const response = await publicPage(new URL(route.request().url()));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async text => { window.copiedSetup = text; },
  } }));
  await page.goto('https://reacji.to/about');
  await expect(page.getByRole('heading', { name: 'Make reacji.to yours.' })).toBeVisible();
  await expect(page.getByText('design', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Copy setup instructions' }).click();
  expect(await page.evaluate(() => window.copiedSetup)).toBe(setupPrompt);
});
