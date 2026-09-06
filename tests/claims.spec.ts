import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const origin = 'http://127.0.0.1:4173';

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Claim sandboxes run once in desktop Chromium.');
});

test('@claim:sample-demo @claim:demo-isolation loads, resets, and leaves isolated sample data', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.setItem('reader:speech-rate', '0.8');
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('anywhere-reader', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('readings', { keyPath: 'id' });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transaction = request.result.transaction('readings', 'readwrite');
        transaction.objectStore('readings').put({ id: 'real-reading', createdAt: '2026-09-06T11:00:00.000Z', text: 'REAL DATA', changed: ['REAL DATA'] });
        transaction.oncomplete = () => { request.result.close(); resolve(); };
      };
    });
  });

  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#changedOutput')).toContainText('ACCESS PANEL');
  await expect(page.locator('#historyList article')).toHaveCount(3);
  await page.locator('#speechRate').fill('1.4');
  await page.getByRole('button', { name: 'Clear history' }).click();
  await page.getByRole('button', { name: 'Confirm clear all' }).click();
  await expect(page.locator('#historyList article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#historyList article')).toHaveCount(3);
  await expect(page.locator('#changedOutput')).toContainText('Press Enter to continue');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('reader:speech-rate'))).toBe('0.8');

  await page.getByRole('link', { name: 'Start for real' }).first().click();
  await page.waitForURL(/\/#reader$/);
  await expect(page.locator('#historyList')).toContainText('REAL DATA');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('reader:speech-rate'))).toBe('0.8');
});

test('@claim:local-private-ocr @claim:changed-line-speech @claim:no-account-or-control @claim:copy-repeat reads the updated sample locally', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.addInitScript(() => {
    const spoken: string[] = [];
    Object.defineProperty(window, '__spoken', { value: spoken });
    speechSynthesis.cancel = () => undefined;
    speechSynthesis.speak = utterance => { spoken.push(utterance.text); };
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Show an updated screen' }).click();
  await page.getByRole('button', { name: /Read visible region/ }).click();
  await expect(page.locator('#readState')).toHaveText('1 changed line', { timeout: 90_000 });
  await expect(page.locator('#changedOutput')).toHaveText('Signed in as Guest');
  expect(await page.evaluate(() => (window as typeof window & { __spoken: string[] }).__spoken.at(-1))).toBe('Signed in as Guest');
  expect(requests.every(url => new URL(url).origin === origin)).toBe(true);
  await expect(page.locator('input[type="password"], input[type="email"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Copy text' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('Signed in as Guest');
  const before = await page.evaluate(() => (window as typeof window & { __spoken: string[] }).__spoken.length);
  await page.getByRole('button', { name: 'Repeat' }).click();
  expect(await page.evaluate(() => (window as typeof window & { __spoken: string[] }).__spoken.length)).toBe(before + 1);
});

test('@claim:camera-consent @claim:photo-fallback requires consent and recovers with a valid photo', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(window, '__cameraCalls', { get: () => calls });
    navigator.mediaDevices.getUserMedia = async () => {
      calls += 1;
      throw new DOMException('Denied for test', 'NotAllowedError');
    };
  });
  await page.goto('/');
  const allow = page.getByRole('button', { name: 'Allow camera' });
  await expect(allow).toBeDisabled();
  expect(await page.evaluate(() => (window as typeof window & { __cameraCalls: number }).__cameraCalls)).toBe(0);
  await page.getByLabel(/I understand and consent/).check();
  await allow.click();
  await expect(page.locator('#readerMessage')).toContainText('Camera permission was not granted');
  expect(await page.evaluate(() => (window as typeof window & { __cameraCalls: number }).__cameraCalls)).toBe(1);
  await page.getByRole('button', { name: /Read visible region/ }).click();
  await expect(page.locator('#readerMessage')).toContainText('There is no screen image to read');
  await page.locator('#photoInput2').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await expect(page.locator('#readerMessage')).toContainText('not an image');
  await page.locator('#photoInput2').setInputFiles('tests/fixtures/screen.png');
  await expect(page.locator('#cameraState')).toHaveText('Photo ready');
  await expect(page.locator('#readerMessage')).toBeHidden();
});

test('@claim:keyboard-region @claim:region-presets @claim:text-zoom @claim:speech-rate applies reader controls', async ({ page }) => {
  await page.goto('/demo');
  const selection = page.locator('#selection');
  await page.getByRole('button', { name: 'Move top left corner' }).focus();
  await page.keyboard.press('Shift+ArrowRight');
  await expect(selection).toHaveCSS('left', /[1-9]/);
  expect(await selection.evaluate(element => (element as HTMLElement).style.left)).toBe('13%');
  await page.getByRole('button', { name: 'Top half' }).click();
  expect(await selection.evaluate(element => ({ top: (element as HTMLElement).style.top, height: (element as HTMLElement).style.height }))).toEqual({ top: '2%', height: '48%' });
  await page.getByRole('button', { name: 'Whole screen' }).click();
  expect(await selection.evaluate(element => ({ left: (element as HTMLElement).style.left, width: (element as HTMLElement).style.width }))).toEqual({ left: '0%', width: '100%' });
  await page.locator('#textZoom').fill('52');
  await expect(page.locator('#zoomValue')).toHaveText('52px');
  await expect(page.locator('#changedOutput p').first()).toHaveCSS('font-size', '52px');
  await page.locator('#speechRate').fill('0.6');
  await expect(page.locator('#rateValue')).toHaveText('0.6×');
  expect(await page.evaluate(() => localStorage.getItem('demo:reader:speech-rate'))).toBe('0.6');
});

test('@claim:free-history @claim:history-persistence @claim:json-export-import @claim:clear-history stores, moves, and deletes sample readings', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#historyList article')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('#historyList article')).toHaveCount(3);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export history' }).click();
  const download = await downloadPromise;
  const exportPath = await download.path();
  expect(exportPath).toBeTruthy();
  const exported = JSON.parse(await (await import('node:fs/promises')).readFile(exportPath!, 'utf8'));
  expect(exported.product).toBe('Anywhere Reader');
  expect(exported.readings).toHaveLength(3);

  await page.locator('#importHistory').setInputFiles({ name: 'wrong.json', mimeType: 'application/json', buffer: Buffer.from('{"not":"history"}') });
  await expect(page.locator('#readerMessage')).toContainText('not an Anywhere Reader history export');
  const readings = Array.from({ length: 7 }, (_, index) => ({ id: `import-${index}`, createdAt: `2026-09-06T12:${String(index).padStart(2, '0')}:00.000Z`, text: `Imported row ${index}`, changed: [`Imported row ${index}`] }));
  await page.locator('#importHistory').setInputFiles({ name: 'history.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ readings })) });
  await expect(page.locator('#readerMessage')).toHaveText('5 local readings imported.');
  await expect(page.locator('#historyList article')).toHaveCount(5);
  await page.getByRole('button', { name: 'Clear history' }).click();
  await page.getByRole('button', { name: 'Confirm clear all' }).click();
  await expect(page.locator('#historyList article')).toHaveCount(0);
  await expect(page.locator('#readerMessage')).toHaveText('Local reading history cleared.');
});

test('@claim:offline-demo reloads the sample while the browser is offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#changedOutput')).toContainText('SYSTEM READY');
  await expect(page.getByText('Offline mode.')).toBeVisible();
  await context.close();
});

test('@claim:offline-ocr reads the changed sample offline after one online reading', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Show an updated screen' }).click();
  await page.getByRole('button', { name: /Read visible region/ }).click();
  await expect(page.locator('#readState')).toHaveText('1 changed line', { timeout: 90_000 });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Show an updated screen' }).click();
  await page.getByRole('button', { name: /Read visible region/ }).click();
  await expect(page.locator('#changedOutput')).toHaveText('Signed in as Guest', { timeout: 90_000 });
  await expect(page.locator('#readState')).toHaveText('1 changed line');
  await context.close();
});

test('@claim:pro-history @claim:pro-regions unlocks the two paid convenience limits after verification', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sb_license:remote-screen-reader', 'valid-pro-token'));
  await page.route('https://api.sociobot.in/api/v1/products/remote-screen-reader/verify**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/');
  await expect(page.locator('#licenseState')).toHaveText('PRO UNLOCKED');
  const readings = Array.from({ length: 55 }, (_, index) => ({ id: `pro-${index}`, createdAt: `2026-09-06T${String(Math.floor(index / 60)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00.000Z`, text: `Pro row ${index}`, changed: [`Pro row ${index}`] }));
  await page.locator('#importHistory').setInputFiles({ name: 'pro-history.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ readings })) });
  await expect(page.locator('#readerMessage')).toHaveText('50 local readings imported.');
  await expect(page.locator('#historyList article')).toHaveCount(50);

  await page.locator('#photoInput').setInputFiles('tests/fixtures/screen.png');
  await expect(page.locator('#proRegionTools')).toBeVisible();
  for (let index = 1; index <= 10; index += 1) {
    await page.locator('#regionName').fill(`Desk ${index}`);
    await page.getByRole('button', { name: 'Save current frame' }).click();
  }
  await expect(page.locator('#savedRegions option')).toHaveCount(11);
  await page.locator('#regionName').fill('Desk 11');
  await page.getByRole('button', { name: 'Save current frame' }).click();
  await expect(page.locator('#regionMessage')).toHaveText('Ten regions are already saved. Reuse a name to replace one.');
});

test('@claim:license-recovery captures, restores, and removes inactive Pro access', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:remote-screen-reader', 'old-token');
    localStorage.setItem('sb_license:remote-screen-reader:verdict', JSON.stringify({ valid: false, checkedAt: Date.now(), token: 'old-token' }));
  });
  await page.route('https://api.sociobot.in/api/v1/products/remote-screen-reader/verify**', route => {
    const token = new URL(route.request().url()).searchParams.get('license');
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: token === 'new-valid-token', reason: token === 'new-valid-token' ? 'ok' : 'revoked' }) });
  });
  await page.goto('/?license=new-valid-token#pro');
  await expect(page.locator('#licenseState')).toHaveText('PRO UNLOCKED');
  expect(page.url()).not.toContain('license=');
  await page.getByText('Have a license? Restore it').click();
  await page.locator('#licenseInput').fill('revoked-token');
  await page.getByRole('button', { name: 'Verify pasted license' }).click();
  await expect(page.locator('#licenseState')).toHaveText('NOT UNLOCKED');
  await expect(page.locator('#licenseMessage')).toContainText('could not be verified');
});

test('@claim:license-cache rechecks a saved license no more than once per day', async ({ page }) => {
  let checks = 0;
  await page.addInitScript(() => {
    const token = 'cached-valid-token';
    if (!localStorage.getItem('sb_license:remote-screen-reader')) {
      localStorage.setItem('sb_license:remote-screen-reader', token);
      localStorage.setItem('sb_license:remote-screen-reader:verdict', JSON.stringify({ valid: true, checkedAt: Date.now(), token }));
    }
  });
  await page.route('https://api.sociobot.in/api/v1/products/remote-screen-reader/verify**', route => {
    checks += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/');
  await expect(page.locator('#licenseState')).toHaveText('PRO UNLOCKED');
  expect(checks).toBe(0);
  await page.evaluate(() => {
    const token = localStorage.getItem('sb_license:remote-screen-reader');
    localStorage.setItem('sb_license:remote-screen-reader:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() - 86_400_001, token }));
  });
  await page.reload();
  await expect.poll(() => checks).toBe(1);
});

test('@claim:android-bundle packages the production reader and offline OCR model in Capacitor', async () => {
  const output = execFileSync('node', ['scripts/verify-android-bundle.mjs'], { cwd: process.cwd(), encoding: 'utf8' });
  expect(output).toContain('Android bundle checks passed');
});

test('@claim:android-download @claim:one-time-pro-offer @claim:hosted-payment exposes the published Android package and live offer', async ({ request, page }) => {
  const release = await (await request.get('/android-release.json')).json();
  expect(release.version).toBe('1.0.1');
  expect(release.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect((await request.head(release.downloadUrl)).ok()).toBe(true);
  const checksum = await request.get(release.checksumUrl);
  expect(await checksum.text()).toContain(release.sha256);

  const catalog = await (await request.get('https://api.sociobot.in/api/v1/products')).json();
  const product = catalog.data.find((item: { slug: string }) => item.slug === 'remote-screen-reader');
  expect(product).toMatchObject({ currency: 'INR', price_minor: 49900 });
  const checkout = await request.get('https://api.sociobot.in/api/v1/products/remote-screen-reader/checkout', { maxRedirects: 0 });
  expect(checkout.status()).toBe(303);
  expect(checkout.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
  await page.goto('/');
  await expect(page.locator('input[autocomplete^="cc-"], input[name*="card" i]')).toHaveCount(0);
});

test('@claim:route-pages gives every route its title and returns a useful 404', async ({ page }) => {
  const routes = [
    ['/', 'Anywhere Reader — read a screen with your phone'],
    ['/demo', 'Demo — Anywhere Reader'],
    ['/privacy', 'Privacy — Anywhere Reader'],
    ['/terms', 'Terms — Anywhere Reader'],
  ];
  for (const [route, title] of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(route === '/' ? '/$' : `${route}$`));
  }
  const missing = await page.goto('/not-a-real-page');
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Anywhere Reader');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});
