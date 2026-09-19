import { test, expect } from '@playwright/test';

/**
 * Hareket seviyesi hedeflerinin aktif antrenman ekranında uygulanması.
 *
 * Model hedefleri iki seviyede tutuyor: hareket seviyesi (tüm setler için) ve
 * set seviyesi. Program düzenleyici hareket seviyesindeki değeri gösterip ilgili
 * set sütununu kilitliyordu, ama aktif antrenman ekranı set seviyesindeki eski
 * değerleri gösteriyordu. Yani "80 kg'a sabitlendi" denen bir harekete
 * başlandığında ekranda 20 kg yazıyordu.
 */
test('hareket seviyesi hedefleri antrenman ekranında gösterilir', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Misafir Olarak Devam Et' }).click();
  await page.waitForTimeout(2000);

  // Hareket seviyesi: 80 kg, RIR 0, 5-8 tekrar.
  // Set seviyesi (çelişkili, geçersiz kılınmalı): 20 kg, RIR 2, 10 tekrar.
  await page.evaluate(() => {
    localStorage.setItem('aurafit_programs', JSON.stringify([{
      id: 'prog-hedef-testi',
      name: 'Hedef Testi',
      createdAt: new Date().toISOString(),
      exercises: [{
        id: 'we-1',
        exerciseId: 'ex-2',
        name: 'Barbell Bench Press',
        category: 'Göğüs',
        restTime: 60,
        minReps: 5,
        maxReps: 8,
        weight: 80,
        rir: 0,
        sets: [{ id: 's-1', reps: 10, weight: 20, rir: 2, completed: false }],
      }],
    }]));
  });

  await page.reload();
  await page.waitForTimeout(3000);
  await page.locator('.sidebar-nav button').nth(1).click();
  await page.waitForTimeout(1200);

  const runButtons = page.locator('.btn-run-now');
  const index = await runButtons.evaluateAll((nodes) =>
    nodes.findIndex(n => n.closest('[class*="card"]')?.textContent?.includes('Hedef Testi')));
  await runButtons.nth(index >= 0 ? index : 1).click();
  await page.waitForTimeout(2000);

  const target = page.locator('.set-target-desc').first();
  await expect(target).toContainText('80kg');
  await expect(target).toContainText('5-8');
  await expect(target).toContainText('RIR 0');

  // Kaydedilecek varsayılan da hedef aralığın içinde olmalı (10 -> 8).
  const pill = page.locator('.mobile-set-log-pill').first();
  await expect(pill).toContainText('80 kg');
  await expect(pill).toContainText('8 tek');
  await expect(pill).toContainText('RIR 0');
});
