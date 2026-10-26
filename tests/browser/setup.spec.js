import { test, expect } from '@playwright/test';
import { publicPage } from '../../worker/pages.js';
import { setupPrompt } from '../../worker/setup.js';
import { installText } from '../../worker/install.js';

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

test('install is the canonical agent guide and copies the same instruction', async ({ page }) => {
  await page.route('https://reacji.to/**', async route => {
    const response = await publicPage(new URL(route.request().url()));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async text => { window.copiedSetup = text; },
  } }));
  await page.goto('https://reacji.to/install');
  await expect(page.getByRole('heading', { name: 'Make reacji.to work your way.' })).toBeVisible();
  await expect(page.getByText('Written by AI for AI, human content is on')).toBeVisible();
  await expect(page.getByRole('link', { name: 'reacji.to', exact: true }).last()).toHaveAttribute('href', '/');
  await expect(page.getByRole('cell', { name: 'design', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Privacy and local storage' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Optional emoji actions' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Things to decide' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read as plain text' })).toHaveAttribute('href', '/install/agent.txt');
  // Every guide section is represented in the agent format, from the same source.
  for (const heading of await page.locator('.install-content h2, .install-content h3').allTextContents()) {
    expect(installText).toContain(heading);
  }
  await page.getByRole('button', { name: 'Copy setup instructions' }).click();
  expect(await page.evaluate(() => window.copiedSetup)).toBe(setupPrompt);
  await page.getByRole('link', { name: 'Read as plain text' }).click();
  expect(await page.locator('body').innerText()).toBe(installText);
});

test('old about links redirect to the install guide', async () => {
  const response = await publicPage(new URL('https://reacji.to/about'));
  expect(response.status).toBe(301);
  expect(response.headers.get('location')).toBe('https://reacji.to/install');
});
