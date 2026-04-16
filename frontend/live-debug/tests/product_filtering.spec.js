import { test, expect } from '@playwright/test';

test.describe('Product Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show all products by default', async ({ page }) => {
    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCount(12);
    
    // Check if 'All Pieces' is active
    const allButton = page.locator('button:has-text("All Pieces")');
    await expect(allButton).toHaveClass(/active/);
  });

  test('should filter by Evening category', async ({ page }) => {
    await page.click('button:has-text("Evening")');
    
    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCount(5);
    
    // Check if Evening button is active
    const eveningButton = page.locator('button:has-text("Evening")');
    await expect(eveningButton).toHaveClass(/active/);
    
    // Check that all visible products are evening
    const categoryTags = page.locator('.product-category-tag');
    const counts = await categoryTags.count();
    for (let i = 0; i < counts; i++) {
        await expect(categoryTags.nth(i)).toHaveText(/evening/i);
    }
  });

  test('should filter by Casual category', async ({ page }) => {
    await page.click('button:has-text("Casual")');
    
    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCount(5);
    
    const casualButton = page.locator('button:has-text("Casual")');
    await expect(casualButton).toHaveClass(/active/);
    
    const categoryTags = page.locator('.product-category-tag');
    const counts = await categoryTags.count();
    for (let i = 0; i < counts; i++) {
        await expect(categoryTags.nth(i)).toHaveText(/casual/i);
    }
  });

  test('should show "No products found" for empty categories', async ({ page }) => {
    // Summer now has products, so we use Workwear which is currently empty
    const workwearButton = page.locator('button:has-text("Workwear")');
    await workwearButton.click();
    
    const noProductsMsg = page.locator('text=No products found');
    await expect(noProductsMsg).toBeVisible();
  });
});
