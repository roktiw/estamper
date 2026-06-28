import { expect, test } from '@playwright/test';

test('website shows its own Estamper badge', async ({ page }) => {
  await page.goto('/');

  const badge = page.locator('.estamper__badge');

  await expect(badge).toBeVisible();
  await expect(badge).toContainText(/@/);
  await expect(badge).toContainText(/prd|dev|pre|stg/);
});
