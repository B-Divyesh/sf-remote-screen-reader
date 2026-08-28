import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home is accessible, focused, and responsive', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Anywhere Reader/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Hear the screen/ })).toBeVisible();
  await page.getByRole('link', { name: /Try the web reader/ }).click();
  await expect(page.locator('#consentPanel')).toBeInViewport();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  expect(consoleErrors).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('every visible interactive target is at least 44 by 44 CSS pixels', async ({ page }) => {
  for (const route of ['/', '/privacy', '/terms']) {
    await page.goto(route);
    const undersized = await page.locator('a, button, summary, select, input:not(.visually-hidden):not([type="hidden"]), label.file-button, label.import-button').evaluateAll(elements => elements
      .filter(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      })
      .filter(element => !(element instanceof HTMLInputElement && ['checkbox', 'range'].includes(element.type)))
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
      })
      .filter(target => target.width < 44 || target.height < 44));
    expect(undersized, `${route} contains undersized interactive targets`).toEqual([]);
  }
});

test('a returned purchase token cannot inherit another token\'s cached verdict', async ({ page }) => {
  let verificationRequests = 0;
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:remote-screen-reader', 'old-token');
    localStorage.setItem('sb_license:remote-screen-reader:verdict', JSON.stringify({ valid: false, checkedAt: Date.now(), token: 'old-token' }));
  });
  await page.route('https://api.sociobot.in/api/v1/products/remote-screen-reader/verify**', async route => {
    verificationRequests += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });

  await page.goto('/?source=checkout&license=new-purchased-token#pro');
  await expect(page.locator('#licenseState')).toHaveText('PRO UNLOCKED');
  expect(verificationRequests).toBe(1);
  expect(page.url()).not.toContain('license=');
  const saved = await page.evaluate(() => ({
    token: localStorage.getItem('sb_license:remote-screen-reader'),
    verdict: JSON.parse(localStorage.getItem('sb_license:remote-screen-reader:verdict') || '{}'),
  }));
  expect(saved.token).toBe('new-purchased-token');
  expect(saved.verdict).toMatchObject({ valid: true, token: 'new-purchased-token' });
});

test('consent is required and camera failure offers a useful fallback', async ({ page }) => {
  await page.goto('/');
  const allow = page.getByRole('button', { name: 'Allow camera' });
  await expect(allow).toBeDisabled();
  await page.getByLabel(/I understand and consent/).check();
  await expect(allow).toBeEnabled();
  await allow.click();
  await expect(page.locator('#workspace')).toBeVisible();
});

test('photo is recognized entirely on device', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await page.locator('#photoInput').setInputFiles('tests/fixtures/screen.png');
  await expect(page.getByText('Photo ready')).toBeVisible();
  await page.getByRole('button', { name: /Read visible region/ }).click();
  await expect(page.locator('#changedOutput')).toContainText(/ACCESS|SYSTEM|READY/i, { timeout: 90_000 });
  await expect(page.locator('#readState')).not.toHaveText('Reader error');
});

test('legal routes each have one clear page heading', async ({ page }) => {
  for (const route of ['/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  }
});

test('installed shell opens while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Hear the screen/ })).toBeVisible();
  await expect(page.getByText('Offline mode.')).toBeVisible();
});
