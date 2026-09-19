import { test, expect } from '@playwright/test';

/**
 * Onay/uyarı pencereleri regresyon testi.
 *
 * Uygulama window.confirm ve alert kullanıyordu: mobil WebView'da bu native
 * diyaloglar tüm JavaScript'i bloke ediyor, Electron'da pencerenin arkasında
 * kalabiliyor ve uygulamanın görsel diliyle uyuşmuyordu.
 */

test('onay penceresi native diyalog yerine uygulama içinde açılır', async ({ page }) => {
  let nativeDialogs = 0;
  page.on('dialog', async d => { nativeDialogs++; await d.dismiss(); });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Misafir Olarak Devam Et' }).click();
  await page.waitForTimeout(2500);

  // Devam eden antrenman varken baskasini baslatmayi dene
  await page.locator('#quick-play-btn').first().click();
  await page.waitForTimeout(500);
  await page.locator('button.selector-item', { hasText: 'PAZARTESİ' }).first().click();
  await page.waitForTimeout(1500);

  await page.locator('.sidebar-nav button').nth(1).click();
  await page.waitForTimeout(900);
  await page.locator('.btn-run-now').first().click();
  await page.waitForTimeout(800);

  const dlg = page.locator('[role="alertdialog"]');
  await expect(dlg).toBeVisible();
  await expect(dlg).toContainText('Devam eden antrenman');

  // Esc ile kapanmali
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await expect(dlg).toHaveCount(0);
  expect(nativeDialogs).toBe(0);
});
