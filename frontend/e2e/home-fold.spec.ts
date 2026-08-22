import { test, expect } from '@playwright/test';

/**
 * E2E test for Track B: Homepage Mobile Fold
 *
 * Verifies that the ASK THIS SITE tile's grounding badge (.home-chat__badge)
 * is fully visible above the fold at mobile viewport (390x844) with scrollY 0.
 * The reskinned home orders the chat tile first in the mobile bento.
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

    // Get the grounding badge element inside the ASK THIS SITE bento tile
    const badge = page.locator('#ask-this-site .home-chat__badge');
    await expect(badge).toBeVisible();

    // Get bounding box and viewport dimensions
    const badgeBox = await badge.boundingBox();
    const viewportHeight = 844; // Our set viewport height

    // Assert badge is fully within viewport
    // Playwright boundingBox() returns { x, y, width, height } — y is the top edge.
    expect(badgeBox).not.toBeNull();
    if (badgeBox) {
      expect(badgeBox.y).toBeGreaterThanOrEqual(0);
      expect(badgeBox.y + badgeBox.height).toBeLessThanOrEqual(viewportHeight);
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