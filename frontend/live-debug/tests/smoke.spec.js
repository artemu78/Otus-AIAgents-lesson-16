import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/ÉLISE | Luxury Dresses/);
});

test('root element is present', async ({ page }) => {
  await page.goto('./');
  const root = page.locator('#root');
  await expect(root).toBeVisible();
});
