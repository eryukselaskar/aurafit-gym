import { test, expect } from '@playwright/test';

/**
 * Hata sınırı regresyon testi.
 *
 * Bir bileşen render sırasında patlarsa kullanıcı beyaz ekran görüyordu.
 * Antrenman ortasında bu veri kaybı gibi görünür. ErrorBoundary eklendi ama
 * gerçek bir çökmeyle hiç denenmemişti.
 *
 * Burada yapay bir hata fırlatılmıyor: kaydedilmiş aktif antrenman durumu
 * bozuluyor (exercises: null), bu da render sırasında gerçek bir çökmeye yol
 * açıyor — eski bir sürümden kalan ya da yarım yazılmış state'in gerçekçi
 * karşılığı.
 */
test('render çökmesinde beyaz ekran yerine kurtarma ekranı gösterilir', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    localStorage.setItem('aurafit_continue_as_guest', 'true');
    localStorage.setItem('aurafit_workout_active_state', JSON.stringify({
      activeProgram: { id: 'bozuk', name: 'Bozuk Program', exercises: null, createdAt: '2026-01-01' },
      exercises: null,
      isTimerRunning: true,
      workoutStartTime: Date.now(),
      accumulatedTime: 0,
    }));
  });

  await page.reload();

  const boundary = page.locator('.error-boundary-screen');
  await expect(boundary).toBeVisible();
  await expect(boundary).toContainText('Bir şeyler ters gitti');
  // Kullanıcıya verisinin durduğu söylenmeli.
  await expect(boundary).toContainText('cihazınızda kayıtlı');

  // Teknik ayrıntı istendiğinde açılabilmeli.
  await expect(page.getByText('Teknik ayrıntı')).toBeVisible();

  // Kurtarma yolu çalışmalı: state temizlenince uygulama normal açılır.
  await expect(page.getByRole('button', { name: 'Yeniden Yükle' })).toBeVisible();

  await page.evaluate(() => localStorage.removeItem('aurafit_workout_active_state'));
  await page.getByRole('button', { name: 'Yeniden Yükle' }).click();
  await page.waitForTimeout(2500);

  await expect(page.locator('.error-boundary-screen')).toHaveCount(0);
  await expect(page.locator('.app-container')).toBeVisible();
});
