import { test, expect } from '@playwright/test';

test.describe('Backend API Fallback E2E Tests', () => {

  test('gracefully falls back to local data when backend API requests fail', async ({ page }) => {
    // Intercept backend API routes specifically (port 8000) and simulate network failure
    await page.route('http://localhost:8000/api/**', (route) => {
      route.abort('failed');
    });

    // Navigate to Projects page
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'FEATURED PORTFOLIO PROJECTS' })).toBeVisible();

    // Verify projects page renders static local case rows
    const caseRows = page.locator('.case-row');
    await expect(caseRows.first()).toBeVisible();

    // Navigate to Now page
    await page.goto('/now');
    await expect(page.getByRole('heading', { name: "WHAT I'M DOING NOW" })).toBeVisible();

    // Verify Now page renders content successfully without crash
    await expect(page.locator('.work-row').first()).toBeVisible();
  });

});
