import { test, expect } from '@playwright/test';

test.describe('AuraFit End-to-End Workout Flow', () => {
  test('should launch, start a workout, complete a set, skip rest, and complete the workout', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');

    // 2. Pass the login screen by continuing as guest
    const guestBtn = page.getByRole('button', { name: 'Misafir Olarak Devam Et' });
    await expect(guestBtn).toBeVisible();
    await guestBtn.click();

    // 3. Verify landing on Dashboard
    await expect(page.locator('.welcome-title')).toContainText('Hoş Geldin');
    await expect(page.getByText('Hızlı Antrenman Başlat')).toBeVisible();

    // 4. Click the play button for the first program in the quick launch list using its test ID
    const quickPlayBtn = page.locator('#quick-play-btn').first();
    await expect(quickPlayBtn).toBeVisible();
    await quickPlayBtn.click();

    // 5. Select the first session (Pazartesi) in the modal
    const sessionBtn = page.locator('button.selector-item', { hasText: 'PAZARTESİ' }).first();
    await expect(sessionBtn).toBeVisible();
    await sessionBtn.click();

    // 6. Verify active workout page has loaded
    await expect(page.locator('.active-badge')).toContainText('CANLI SEANS');
    await expect(page.locator('.active-ex-name').first()).toContainText('Incline Chest Press');

    // 7. Complete the first set using its mobile test ID
    const firstCheckbox = page.locator('#set-complete-btn-mobile-0-0');
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.click();

    // 8. Verify rest timer banner appears (either resting class or DİNLENME SÜRESİ text)
    const restBanner = page.locator('.mobile-horizontal-rest');
    await expect(restBanner).toBeVisible();
    await expect(restBanner.getByText('DİNLENME SÜRESİ')).toBeVisible();

    // 9. Skip the rest timer using its mobile test ID
    const skipRestBtn = page.locator('#skip-rest-btn-mobile');
    await expect(skipRestBtn).toBeVisible();
    await skipRestBtn.click();

    // 10. Verify rest banner closes / goes idle
    await expect(restBanner).not.toBeVisible();

    // 11. Finish the workout
    const finishBtn = page.locator('.btn-finish');
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // 12. Handle PR broken celebration overlay if it pops up, otherwise wait to return to dashboard
    const prTitle = page.locator('.pr-congrats-title');
    if (await prTitle.isVisible()) {
      const prDoneBtn = page.getByRole('button', { name: 'Kaydet ve Devam Et' });
      await expect(prDoneBtn).toBeVisible();
      await prDoneBtn.click();
    }

    // 13. Verify return to dashboard
    await expect(page.locator('.welcome-title')).toContainText('Hoş Geldin');
  });
});
