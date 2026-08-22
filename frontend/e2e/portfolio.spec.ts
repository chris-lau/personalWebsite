import { test, expect } from '@playwright/test';

test.describe('Portfolio E2E Tests', () => {
  test('navigates through all core page routes', async ({ page }) => {
    // 1. Home page — human-first hero leads with the name as the dominant heading
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Chris Lau', level: 1 })).toBeVisible();

    // 2. About page
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'ABOUT ME' })).toBeVisible();

    // 3. Experience page
    await page.goto('/experience');
    await expect(page.getByRole('heading', { name: 'CAREER & EXPERIENCE' })).toBeVisible();

    // 4. Now page
    await page.goto('/now');
    await expect(page.getByRole('heading', { name: "WHAT I'M DOING NOW" })).toBeVisible();

    // 5. Projects page
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'FEATURED PORTFOLIO PROJECTS' })).toBeVisible();

    // 6. Blog page
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'TECHNICAL BLOG' })).toBeVisible();

    // 7. Book / Guidebook page
    await page.goto('/guidebook');
    await expect(page.getByRole('heading', { name: 'SOFTWARE ENGINEERING GUIDEBOOK SERIES' })).toBeVisible();

    // 8. Stack / How this site works page
    await page.goto('/how-this-site-works');
    await expect(page.getByRole('heading', { name: 'HOW THIS SITE WORKS' })).toBeVisible();

    // 9. Ops / Monitoring page
    await page.goto('/monitoring');
    await expect(page.getByRole('heading', { name: 'FULL-STACK OPERATIONAL MONITORING & TELEMETRY', exact: true })).toBeVisible();

    // 10. Contact page (top-level nav link)
    const headerNav = page.getByRole('navigation', { name: 'Main Navigation' });
    await headerNav.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL('/contact');
    await expect(page.getByRole('heading', { name: 'GET IN TOUCH' })).toBeVisible();
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

  test('recruiter path: hero delivers the story and core nav is dropdown-free', async ({ page }) => {
    await page.goto('/');

    // First 10 seconds: name, role headline, value prop, current role band, both CTAs.
    await expect(page.getByRole('heading', { name: 'Chris Lau', level: 1 })).toBeVisible();
    await expect(page.getByText('Staff Product Manager, AI at Global Relay')).toBeVisible();
    await expect(page.getByText(/Technical product leader in AI who actually builds/i)).toBeVisible();
    await expect(page.getByText('Staff Product Manager, Artificial Intelligence @ Global Relay')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Experience' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get in Touch' })).toBeVisible();

    // Chat survives as an exhibit, not as the hero container.
    await expect(page.getByRole('heading', { name: 'ASK THIS SITE' })).toBeVisible();

    const headerNav = page.getByRole('navigation', { name: 'Main Navigation' });

    // Home → Experience → Projects → Contact with zero dropdowns.
    await headerNav.getByRole('link', { name: 'Experience', exact: true }).click();
    await expect(page).toHaveURL('/experience');
    await expect(page.getByRole('heading', { name: 'CAREER & EXPERIENCE' })).toBeVisible();

    await headerNav.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL('/projects');

    await headerNav.getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL('/contact');
  });

  test('demoted pages stay reachable via About/Lab dropdowns and the footer safety net', async ({ page }) => {
    await page.goto('/');
    const headerNav = page.getByRole('navigation', { name: 'Main Navigation' });

    // Old nav groups are gone; About and Lab are the only dropdowns.
    await expect(headerNav.getByRole('button', { name: 'Work & Writing' })).toHaveCount(0);
    await expect(headerNav.getByRole('button', { name: 'System & Ops' })).toHaveCount(0);

    // /guidebook lives under About ▾
    await headerNav.getByRole('button', { name: 'About', exact: true }).click();
    await headerNav.getByRole('menuitem', { name: 'Engineering Guidebook' }).click();
    await expect(page).toHaveURL('/guidebook');

    // /monitoring lives under Lab ▾
    await headerNav.getByRole('button', { name: 'Lab', exact: true }).click();
    await headerNav.getByRole('menuitem', { name: 'Live Ops Dashboard' }).click();
    await expect(page).toHaveURL('/monitoring');

    // Footer safety net links every demoted page (second independent path).
    const footerNav = page.getByRole('navigation', { name: 'Footer Navigation' });
    for (const label of ['Bio', 'Now', 'Blog', 'Guidebook', 'How This Site Works', 'Ops Dashboard', 'Amazon Suite']) {
      await expect(footerNav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await footerNav.getByRole('link', { name: 'Amazon Suite', exact: true }).click();
    await expect(page).toHaveURL('/amazon-tools');
    await expect(page.getByText(/Live product demo:/i)).toBeVisible();
  });

  test('toggles theme between Modern, ASCII, and CLI modes', async ({ page }) => {
    await page.goto('/');

    // First visit defaults to Modern.
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'modern');
    await expect(page.locator('.modern-layout-container')).toBeVisible();

    // Open the compact theme switcher and pick ASCII.
    const trigger = page.getByRole('button', { name: /Theme: .+ — select theme/ });
    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'ASCII' }).click();
    await expect(htmlElement).toHaveAttribute('data-theme', 'ascii');
    await expect(page.locator('.ascii-layout-container')).toBeVisible();

    // Switch to CLI.
    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'CLI' }).click();
    await expect(htmlElement).toHaveAttribute('data-theme', 'cli');
    await expect(page.locator('.cli-layout-container')).toBeVisible();

    // The CLI theme keeps a prompt-style home link back to /.
    await page.locator('.cli-prompt-link').click();
    await expect(page).toHaveURL('/');

    // Switch back to Modern.
    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Modern' }).click();
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
    await page.getByRole('tab', { name: 'Live GitHub Activity' }).click();
    await expect(page.getByRole('heading', { name: 'LIVE GITHUB ACTIVITY & REPOSITORIES' })).toBeVisible();
    await expect(page.getByPlaceholder('Lookup any GitHub user / org...')).toBeVisible();
  });

  test('handles 404 routes correctly', async ({ page }) => {
    await page.goto('/unknown-page');
    await expect(page.getByRole('heading', { name: 'ERROR 404' })).toBeVisible();

    // Click return home link
    await page.click('text=Return Home');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Chris Lau', level: 1 })).toBeVisible();
  });
});
