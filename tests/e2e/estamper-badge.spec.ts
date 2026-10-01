import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildPublicStamp } from '../../src/security/build.js';
import { defaultSecurity } from '../../src/security/policy.js';

test('documentation has a locked chip and no public report JSON', async ({ page, request }) => {
  const requests: string[] = []; page.on('request', req => requests.push(req.url()));
  await page.goto('/'); await page.locator('.estamper__badge').click();
  await expect(page.getByRole('status')).toContainText('not configured');
  expect(requests.some(url => url.endsWith('/estamper.json'))).toBe(false);
  expect((await request.get('/estamper.json')).status()).toBe(404);
});

test('settings import/export, independent levels, invalid input and mobile layout', async ({ page }) => {
  await page.goto('/settings/'); const selectors = page.locator('[data-security]');
  await expect(selectors).toHaveCount(4);
  for (let i=0; i<4; i++) await expect(selectors.nth(i)).toHaveValue('mid');
  await page.getByRole('button', { name:'build-demo', exact:true }).click();
  await page.getByLabel('Estamper password').fill('estamper-demo-only');
  await page.getByRole('button', { name:'Unlock', exact:true }).click();
  await expect(page.locator('.estamper__report')).toContainText('synthetic-demo');
  await page.getByRole('button', { name:'Close Estamper' }).click();
  await page.locator('[data-security="access"]').selectOption('max');
  await expect(page.locator('[data-security="exports"]')).toHaveValue('mid');
  const dl = page.waitForEvent('download'); await page.getByRole('button',{name:'Download JSON',exact:true}).click();
  const file = await dl; const content = await readFile((await file.path())!, 'utf8');
  expect(JSON.parse(content).security.access).toBe('max'); expect(content).not.toContain('estamper-demo-only');
  await page.getByRole('button',{name:'Reset defaults'}).click();
  await page.locator('[data-import]').setInputFiles({name:'settings.json',mimeType:'application/json',buffer:Buffer.from(content)});
  await expect(page.locator('[data-security="access"]')).toHaveValue('max');
  await page.locator('[data-config]').fill('security: { access: nope }');
  await page.getByRole('button',{name:'Apply editor'}).click();
  await expect(page.locator('[data-status]')).toContainText('min, mid or max');
  await expect(page.locator('[data-security="access"]')).toHaveValue('max');
  for (const width of [320,402,1440]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({width:320,height:900});
  await page.getByRole('button',{name:'Reset defaults'}).click();
  await page.screenshot({path:'test-results/settings-mobile.png',fullPage:true});
});

test('real browser password, bad credentials, no plaintext before unlock, re-lock and exports', async ({ page }) => {
  const password = 'synthetic-browser-test-42';
  const report = { stamp:'secret-test-report',parts:{ mode:'emoji' as const, commit:'abcdef1', user:'private-test-actor' } };
  const payload = await buildPublicStamp(report, { ...defaultSecurity, disclosure:'min', exports:'min' }, password);
  await page.route('**/test-lib/**', async route => {
    const path = new URL(route.request().url()).pathname.slice('/test-lib/'.length);
    const full = resolve('dist', path); if (!full.startsWith(resolve('dist') + '/')) throw new Error('Invalid test path');
    await route.fulfill({contentType:'text/javascript',body:await readFile(full,'utf8')});
  });
  await page.goto('/settings/');
  await page.evaluate(async payload => {
    const module = await import(/* @vite-ignore */ '/test-lib/browser/index.js');
    document.querySelector('[data-settings]')!.replaceChildren();
    module.mountEstamper({stamp:payload.stamp,payload,rootId:'test-badge',position:'custom',target:document.querySelector('[data-settings]')});
  }, payload);
  expect(await page.locator('body').textContent()).not.toContain('private-test-actor');
  await page.locator('#test-badge .estamper__badge').click();
  await page.getByLabel('Estamper password').fill('wrong-password-value'); await page.getByRole('button',{name:'Unlock',exact:true}).click();
  await expect(page.locator('#test-badge [role="status"]')).toContainText('Unable');
  await page.getByLabel('Estamper password').fill(password); await page.getByRole('button',{name:'Unlock',exact:true}).click();
  await expect(page.locator('.estamper__report')).toContainText('private-test-actor');
  const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Download JSON',exact:true}).click();
  expect(JSON.parse(await readFile((await (await download).path())!,'utf8'))).toEqual(report);
  await page.keyboard.press('Escape');
  expect(await page.locator('body').textContent()).not.toContain('private-test-actor');
  await expect(page.locator('#test-badge .estamper__badge')).toBeFocused();
  await page.locator('#test-badge .estamper__badge').click(); await expect(page.getByLabel('Estamper password')).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify({...localStorage,...sessionStorage}))).not.toContain(password);
});
