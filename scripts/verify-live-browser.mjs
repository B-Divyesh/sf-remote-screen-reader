import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const url = process.env.RELEASE_URL || 'https://remote-screen-reader.sociobot.in';
const expectedOrigin = new URL(url).origin;
const browser = await chromium.launch();
const reports = [];

function assert(condition, message) {
  if (!condition) throw new Error(`Live browser check failed: ${message}`);
}

try {
  for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    const origins = new Set();
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(String(error)));
    page.on('request', request => origins.add(new URL(request.url()).origin));
    await page.goto(url, { waitUntil: 'networkidle' });

    const structure = await page.evaluate(() => {
      const undersizedLinks = [...document.querySelectorAll('a')]
        .filter(link => {
          const rect = link.getBoundingClientRect();
          const style = getComputedStyle(link);
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        })
        .map(link => link.textContent?.trim());
      return {
        h1: document.querySelectorAll('h1').length,
        main: document.querySelectorAll('main').length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        undersizedLinks,
      };
    });
    await page.keyboard.press('Tab');
    const keyboard = await page.evaluate(() => ({
      label: document.activeElement?.textContent?.trim(),
      outline: getComputedStyle(document.activeElement).outlineStyle,
      outlineWidth: getComputedStyle(document.activeElement).outlineWidth,
    }));
    const axe = await new AxeBuilder({ page }).analyze();
    const severe = axe.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const moving = await page.locator('*').evaluateAll(elements => elements.filter(element => {
      const style = getComputedStyle(element);
      const durations = `${style.animationDuration},${style.transitionDuration}`.split(',').map(value => value.trim());
      return durations.some(value => {
        const milliseconds = value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
        return milliseconds > 0.01;
      });
    }).length);

    assert(errors.length === 0, `${viewport.name} emitted console/page errors: ${errors.join('; ')}`);
    assert([...origins].every(origin => origin === expectedOrigin), `${viewport.name} initial load contacted an unexpected origin`);
    assert(structure.h1 === 1 && structure.main === 1 && !structure.overflow, `${viewport.name} semantic/responsive structure failed`);
    assert(structure.undersizedLinks.length === 0, `${viewport.name} has undersized links: ${structure.undersizedLinks.join(', ')}`);
    assert(moving === 0, `${viewport.name} reduced-motion styles still animate`);
    assert(severe.length === 0, `${viewport.name} axe found serious/critical violations`);
    assert(keyboard.label === 'Skip to main content' && keyboard.outline !== 'none' && keyboard.outlineWidth === '3px', `${viewport.name} skip-link keyboard focus is not visible`);

    if (viewport.name === 'mobile') {
      await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 });
      await context.setOffline(true);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert(await page.getByText('Offline mode.').isVisible(), 'mobile offline reload did not show the offline state');
    }
    reports.push({ viewport: viewport.name, structure: { ...structure, moving }, axeSeriousOrCritical: severe.length, keyboard, errors, origins: [...origins] });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ url, reports }, null, 2));
