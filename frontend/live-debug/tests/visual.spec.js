import { test, expect } from '@playwright/test';

test('homepage visual snapshot', async ({ page }) => {
  await page.goto('./');
  // Wait for some stability if needed, e.g. images loaded
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
  });
});
