import { test, expect } from '@playwright/test';

/**
 * Çevrimdışı davranış.
 *
 * Giriş ekranı "İnternetiniz olmasa bile antrenman yapmaya devam
 * edebilirsiniz" diyor. Burada doğrulanan kısım bu: uygulama açıkken bağlantı
 * kesilse de antrenman tamamlanabiliyor ve veriler cihazda kalıyor.
 *
 * Kapsam dışı: bağlantı yokken sayfanın SIFIRDAN açılması. Web sürümünde
 * service worker olmadığı için bu çalışmaz (Android ve Electron sürümleri
 * varlıkları yerelden yüklediği için etkilenmez).
 */
test('bağlantı kesilse de antrenman tamamlanır ve veri korunur', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Misafir Olarak Devam Et' }).click();
  await page.waitForTimeout(3000);

  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('aurafit_history') || '[]').length);

  await page.locator('#quick-play-btn').first().click();
  await page.waitForTimeout(600);
  await page.locator('button.selector-item', { hasText: 'PAZARTESİ' }).first().click();
  await page.waitForTimeout(1500);

  // Antrenmanın ortasında bağlantı kesiliyor.
  await context.setOffline(true);
  await page.waitForTimeout(500);

  await page.locator('#set-complete-btn-mobile-0-0').click();
  await page.waitForTimeout(1000);
  await expect(page.locator('#set-complete-btn-mobile-0-0')).toHaveClass(/checked/);
  await expect(page.locator('.mobile-horizontal-rest')).toBeVisible();

  await page.locator('#skip-rest-btn-mobile').click();
  await page.waitForTimeout(500);
  await page.getByText('Antrenmanı Bitir').click();
  await page.waitForTimeout(900);

  const saveBtn = page.getByText('Kaydet ve Devam Et');
  if (await saveBtn.count()) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
  }

  // Panele dönülmüş ve antrenman cihazda kaydedilmiş olmalı.
  await expect(page.locator('.welcome-title')).toBeVisible();
  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('aurafit_history') || '[]').length);
  expect(after).toBe(before + 1);

  // Bağlantı gelince uygulama çalışmaya devam etmeli.
  await context.setOffline(false);
  await page.waitForTimeout(1500);
  await expect(page.locator('.app-container')).toBeVisible();
});
