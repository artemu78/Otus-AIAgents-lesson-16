import { test, expect } from '@playwright/test';

test.describe('Product Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show all products by default', async ({ page }) => {
    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCount(10);
    
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
    // This will fail until Summer or Workwear is added with 0 products
    // Or if I add them and they have no products.
    // I will add them in the next step.
    const summerButton = page.locator('button:has-text("Summer")');
    
    // If the button exists, click it. If not, this test will fail as expected for "starting with a test".
    await summerButton.click();
    
    const noProductsMsg = page.locator('text=No products found');
    await expect(noProductsMsg).toBeVisible();
  });
});
