import { test, expect } from '@playwright/test';

test.describe('Portfolio E2E Tests', () => {
  test('navigates through all core page routes', async ({ page }) => {
    // 1. Home page
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'WELCOME' })).toBeVisible();

    // 2. About page
    await page.click('nav.modern-nav >> text="About"');
    await expect(page.getByRole('heading', { name: 'ABOUT ME' })).toBeVisible();
    await expect(page).toHaveURL('/about');

    // 3. Projects page
    await page.click('nav.modern-nav >> text="Projects"');
    await expect(page.getByRole('heading', { name: 'FEATURED PORTFOLIO PROJECTS' })).toBeVisible();
    await expect(page).toHaveURL('/projects');

    // 4. Blog page
    await page.click('nav.modern-nav >> text="Blog"');
    await expect(page.getByRole('heading', { name: 'TECHNICAL BLOG' })).toBeVisible();
    await expect(page).toHaveURL('/blog');

    // 4b. Book / Guidebook page
    await page.click('nav.modern-nav >> text="Book"');
    await expect(page.getByRole('heading', { name: 'SOFTWARE ENGINEERING GUIDEBOOK SERIES' })).toBeVisible();
    await expect(page).toHaveURL('/guidebook');

    // 5. Experience page
    await page.click('nav.modern-nav >> text="Experience"');
    await expect(page.getByRole('heading', { name: 'CAREER & EXPERIENCE' })).toBeVisible();
    await expect(page).toHaveURL('/experience');

    // 6. Now page
    await page.click('nav.modern-nav >> text="Now"');
    await expect(page.getByRole('heading', { name: "WHAT I'M DOING NOW" })).toBeVisible();
    await expect(page).toHaveURL('/now');

    // 7. Stack / How this site works page
    await page.click('nav.modern-nav >> text="Stack"');
    await expect(page.getByRole('heading', { name: 'HOW THIS SITE WORKS' })).toBeVisible();
    await expect(page).toHaveURL('/how-this-site-works');

    // 8. Contact page
    await page.click('nav.modern-nav >> text="Contact"');
    await expect(page.getByRole('heading', { name: 'GET IN TOUCH' })).toBeVisible();
    await expect(page).toHaveURL('/contact');
  });

  test('searches and navigates to blog post detail view', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'TECHNICAL BLOG' })).toBeVisible();

    // Type in search box
    const searchInput = page.getByPlaceholder('Search posts by keyword or topic...');
    await searchInput.fill('Architecture');

    // Click on the matching blog post title
    await page.click('text=Demystifying Modern React Architecture');
    await expect(page).toHaveURL(/\/blog\/demystifying-react-architecture-and-dev-tools/);

    // Verify blog detail header
    await expect(page.getByRole('heading', { name: /Demystifying Modern React Architecture/ })).toBeVisible();
    await expect(page.locator('text=By Chris Lau')).toBeVisible();

    // Click back link
    await page.click('text=← Back to all blog posts');
    await expect(page).toHaveURL('/blog');
  });


  test('toggles theme between MODERN, ASCII, and CLI modes', async ({ page }) => {
    await page.goto('/');
    
    // Check initial state has data-theme attribute
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'modern');
    await expect(page.locator('.modern-layout-container')).toBeVisible();

    // Click theme segment button to switch to ASCII
    await page.click('button[aria-label="Set theme to ASCII"]');
    await expect(htmlElement).toHaveAttribute('data-theme', 'ascii');
    await expect(page.locator('.ascii-layout-container')).toBeVisible();

    // Click theme segment button to switch to CLI
    await page.click('button[aria-label="Set theme to CLI"]');
    await expect(htmlElement).toHaveAttribute('data-theme', 'cli');
    await expect(page.locator('.cli-layout-container')).toBeVisible();

    // Switch back to MODERN
    await page.click('button[aria-label="Set theme to MODERN"]');
    await expect(htmlElement).toHaveAttribute('data-theme', 'modern');
  });


  test('filters projects by technology tag and switches to Live GitHub Activity tab', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'FEATURED PORTFOLIO PROJECTS' })).toBeVisible();

    // Click React tag filter button
    const reactBtn = page.getByRole('button', { name: '#React' });
    if (await reactBtn.isVisible()) {
      await reactBtn.click();
      await expect(reactBtn).toHaveClass(/active/);
    }

    // Switch to Live GitHub Activity tab
    await page.click('role=tab[name="🐙 Live GitHub Activity"]');
    await expect(page.getByRole('heading', { name: 'LIVE GITHUB ACTIVITY & REPOSITORIES' })).toBeVisible();
    await expect(page.getByPlaceholder('Lookup any GitHub user / org...')).toBeVisible();
  });

  test('handles 404 routes correctly', async ({ page }) => {
    await page.goto('/unknown-page');
    await expect(page.getByRole('heading', { name: 'ERROR 404' })).toBeVisible();

    // Click return home link
    await page.click('text=Return Home');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'WELCOME' })).toBeVisible();
  });
});
