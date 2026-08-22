import { test, expect } from '@playwright/test';

/**
 * E2E for Track A: labeled "Ask this site" launcher.
 * Covers the discoverability goal: the pill is visible in the first viewport
 * on a non-home page, opens the chat panel, and closes cleanly via Escape
 * with focus returned to the launcher.
 */

test.describe('Chat launcher', () => {
  test('labeled pill is visible in the first viewport and opens the chat panel', async ({ page }) => {
    await page.goto('/experience');

    const launcher = page.getByRole('button', { name: 'Ask this site' });
    await expect(launcher).toBeVisible();

    // Visible without scrolling: fully inside the current viewport
    const box = await launcher.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    if (box && viewport) {
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }

    // Clicking opens the chat dialog
    await launcher.click();
    const dialog = page.getByRole('dialog', { name: 'Chat with Chris' });
    await expect(dialog).toBeVisible();
  });

  test('Escape closes the panel and returns focus to the launcher', async ({ page }) => {
    await page.goto('/experience');

    const launcher = page.getByRole('button', { name: 'Ask this site' });
    await expect(launcher).toBeVisible();
    await launcher.click();

    const dialog = page.getByRole('dialog', { name: 'Chat with Chris' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Focus returns to the launcher button
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('aria-label') ?? el?.textContent ?? '';
    });
    expect(focused).toContain('Ask this site');
  });
});
