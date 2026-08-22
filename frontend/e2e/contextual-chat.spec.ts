import { test, expect } from '@playwright/test';

/**
 * E2E Test: Contextual Chat Entry Points (Track C)
 *
 * IMPORTANT: This test requires Track A's merged chat:open listener to work.
 * DO NOT RUN this test during Track C development - it will fail because the listener
 * doesn't exist in this worktree. The coordinator will run this post-merge.
 *
 * This test verifies that clicking "Ask about this" buttons on Projects and Experience pages
 * properly opens the chat dialog with the correct starter message sent.
 */

test.describe('Contextual Chat Links', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the projects page
    await page.goto('/projects');
  });

  test('should open chat dialog when clicking "Ask about this" on a project', async ({ page }) => {
    // Find the first "Ask about this" button
    const askButton = page.getByText('Ask about this').first();
    await expect(askButton).toBeVisible();

    // Click the button
    await askButton.click();

    // Wait for the chat dialog to open (role="dialog", name="Chat with Chris")
    const chatDialog = page.getByRole('dialog', { name: 'Chat with Chris' });
    await expect(chatDialog).toBeVisible({ timeout: 5000 });

    // Verify that a message was sent (user messages render as .chat-msg--user)
    // The starter should be something like "Tell me about the [project name] project."
    const userMessages = chatDialog.locator('.chat-msg--user');
    await expect(userMessages.first()).toBeVisible();

    // Verify the message contains project-related content
    const firstMessage = userMessages.first();
    const messageText = await firstMessage.textContent();
    expect(messageText).toMatch(/project/i);
  });

  test('should include correct aria-label on project "Ask about this" buttons', async ({ page }) => {
    // Check that the button has proper accessibility label
    const askButton = page.getByRole('button', { name: /ask about this project/i }).first();
    await expect(askButton).toBeVisible();
  });

  test('should open chat dialog when clicking "Ask about this" on experience page', async ({ page }) => {
    // Navigate to experience page
    await page.goto('/experience');

    // Find the first "Ask about this" button
    const askButton = page.getByText('Ask about this').first();
    await expect(askButton).toBeVisible();

    // Click the button
    await askButton.click();

    // Wait for the chat dialog to open
    const chatDialog = page.getByRole('dialog', { name: 'Chat with Chris' });
    await expect(chatDialog).toBeVisible({ timeout: 5000 });

    // Verify that a message was sent about the role
    const userMessages = chatDialog.locator('.chat-msg--user');
    const firstMessage = userMessages.first();
    await expect(firstMessage).toBeVisible();

    const messageText = await firstMessage.textContent();
    expect(messageText).toMatch(/role at/i);
  });

  test('should include correct aria-label on experience "Ask about this" buttons', async ({ page }) => {
    // Navigate to experience page
    await page.goto('/experience');

    // Check that the button has proper accessibility label
    const askButton = page.getByRole('button', { name: /ask about this role/i }).first();
    await expect(askButton).toBeVisible();
  });
});