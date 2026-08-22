import { test, expect } from '@playwright/test';

/**
 * E2E test for Track B: Homepage Mobile Fold
 *
 * Verifies that the .hero-grounding-badge is fully visible above the fold
 * at mobile viewport (390×844) when the homepage loads with scrollY 0.
 *
 * NOTE: This test should only be run when port 3000 is free.
 * Per plan rules: if port 3000 is busy, mark [!] and let coordinator run post-merge.
 */

test.describe('Track B: Homepage Mobile Fold', () => {
  test('should display grounding badge fully in viewport at 390×844 without scrolling', async ({ page }) => {
    // Set mobile viewport (iPhone 12/13 Pro dimensions)
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to homepage with no scroll
    await page.goto('/', { waitUntil: 'networkidle' });

    // Ensure we're at scroll position 0
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);

    // Get the grounding badge element
    const badge = page.locator('.hero-grounding-badge');
    await expect(badge).toBeVisible();

    // Get bounding box and viewport dimensions
    const badgeBox = await badge.boundingBox();
    const viewportHeight = 844; // Our set viewport height

    // Assert badge is fully within viewport
    // badgeBox.top should be >= 0 (not scrolled above viewport)
    // badgeBox.top + badgeBox.height should be <= viewportHeight (not below fold)
    expect(badgeBox).not.toBeNull();
    if (badgeBox) {
      expect(badgeBox.top).toBeGreaterThanOrEqual(0);
      expect(badgeBox.top + badgeBox.height).toBeLessThanOrEqual(viewportHeight);
    }
  });

  test('should not have horizontal scroll at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      const documentWidth = document.documentElement.scrollWidth;
      const viewportWidth = window.innerWidth;
      return documentWidth > viewportWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});