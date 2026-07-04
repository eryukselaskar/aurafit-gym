import { test, expect } from '@playwright/test';

test.describe('AuraFit Visual Verification', () => {
  test('Capture Mobile Screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    // 1. Landing Page
    await page.goto('/');
    await page.screenshot({ path: 'verify-mobile-01-login.png' });

    // 2. Guest Login -> Dashboard
    const guestBtn = page.getByRole('button', { name: 'Misafir Olarak Devam Et' });
    await expect(guestBtn).toBeVisible();
    await guestBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify-mobile-02-dashboard.png' });

    // 3. Navigate to Programs Tab
    const programsTab = page.locator('.sidebar-nav button').nth(1);
    await programsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verify-mobile-03-programs.png' });

    // 4. Navigate to Exercises Tab
    const exercisesTab = page.locator('.sidebar-nav button').nth(2);
    await exercisesTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verify-mobile-04-exercises.png' });

    // 5. Navigate back to Dashboard and start a workout
    const dashboardTab = page.locator('.sidebar-nav button').first();
    await dashboardTab.click();
    await page.waitForTimeout(500);

    const quickPlayBtn = page.locator('#quick-play-btn').first();
    await quickPlayBtn.click();
    await page.waitForTimeout(500);

    const sessionBtn = page.locator('button.selector-item', { hasText: 'PAZARTESİ' }).first();
    await sessionBtn.click();
    await page.waitForTimeout(1000);

    // Capture active workout screen (showing empty inputs and placeholders)
    await page.screenshot({ path: 'verify-mobile-05-active-workout.png' });

    // Complete a set to trigger rest timer
    const firstCheckbox = page.locator('#set-complete-btn-mobile-0-0');
    await firstCheckbox.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify-mobile-06-rest-timer.png' });
  });

  test('Capture Desktop Screens', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Landing Page
    await page.goto('/');
    const guestBtn = page.getByRole('button', { name: 'Misafir Olarak Devam Et' });
    await guestBtn.click();
    await page.waitForTimeout(1000);

    // 2. Start workout
    const quickPlayBtn = page.locator('#quick-play-btn').first();
    await quickPlayBtn.click();
    await page.waitForTimeout(500);

    const sessionBtn = page.locator('button.selector-item', { hasText: 'PAZARTESİ' }).first();
    await sessionBtn.click();
    await page.waitForTimeout(1000);

    // Capture active workout screen in desktop mode
    await page.screenshot({ path: 'verify-desktop-01-active-workout.png' });
  });
});
