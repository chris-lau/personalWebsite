import { test, expect } from '@playwright/test';

test.describe('Operational Monitoring Dashboard E2E Tests', () => {
  test('navigates to /monitoring and renders Full-Stack Monitoring Dashboard', async ({ page }) => {
    // 1. Navigate to /monitoring
    await page.goto('/monitoring');
    await expect(page.getByRole('heading', { name: 'FULL-STACK OPERATIONAL MONITORING & TELEMETRY', exact: true })).toBeVisible();

    // 2. Verify Monitoring Dashboard Container
    await expect(
      page.getByRole('heading', { name: /FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD/ })
    ).toBeVisible();

    // 3. Verify Topology Nodes
    await expect(page.getByText('React 18 SPA', { exact: true })).toBeVisible();
    await expect(page.getByText('FastAPI Backend', { exact: true })).toBeVisible();
    await expect(page.getByText('GitHub REST API', { exact: true })).toBeVisible();

    // 4. Verify Interactive Action Buttons
    await expect(page.getByRole('button', { name: '🔄 Ping Health' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Run Full E2E Diagnostic Test/i })).toBeVisible();
    await expect(page.getByRole('button', { name: '🧹 Flush Cache' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Simulate Offline Mode/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Diagnostic Log/i })).toBeVisible();
  });

  test('runs automated synthetic diagnostic suite on user interaction', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Click diagnostic test button
    const diagBtn = page.getByRole('button', { name: /Run Full E2E Diagnostic Test/i });
    await diagBtn.click();

    // Assert synthetic diagnostics checklist renders items
    await expect(page.getByText('> 4. AUTOMATED SYNTHETIC DIAGNOSTICS')).toBeVisible();
    await expect(page.getByText('Client Storage & Cache Integrity')).toBeVisible();
    await expect(page.getByText('Network RTT & CORS Validation')).toBeVisible();
  });

  test('toggles simulated offline mode toggle button', async ({ page }) => {
    await page.goto('/monitoring');

    const offlineToggleBtn = page.getByRole('button', { name: /Simulate Offline Mode/i });
    await offlineToggleBtn.click();

    const activeToggleBtn = page.getByRole('button', { name: '⚙️ Simulated Offline: ON' });
    await expect(activeToggleBtn).toBeVisible();

    await activeToggleBtn.click();
    await expect(page.getByRole('button', { name: '🔌 Simulate Offline Mode' })).toBeVisible();
  });
});
