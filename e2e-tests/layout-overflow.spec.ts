import { test, expect } from '@playwright/test';

/**
 * Yatay taşma regresyon testi.
 *
 * Program düzenleyici dar ekranlarda ekrandan taşıyordu: ızgara öğelerinin
 * varsayılan `min-width: auto` değeri, track'i gün sekmeleri şeridinin
 * min-content genişliğine (~500px) kilitliyor ve kartları ekran dışına
 * itiyordu. `overflow-x: clip` taşmayı gizlediği için hata sessizce
 * içerik kırpılması olarak görünüyordu.
 */

const WIDTHS = [360, 441, 768];

/** Kasıtlı yatay kaydırma alanlarının dışında kalan taşan öğeleri döndürür. */
const findOverflowing = async (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: Array<{ sel: string; right: number; width: number }> = [];

    document.querySelectorAll<HTMLElement>('body *').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Yatay kaydırmalı bir konteynerin içi kasıtlı olarak taşar.
      for (let p = el.parentElement; p; p = p.parentElement) {
        const overflowX = getComputedStyle(p).overflowX;
        if (overflowX === 'auto' || overflowX === 'scroll') return;
      }

      if (rect.right > vw + 1 || rect.left < -1) {
        const cls = String(el.className).trim().split(/\s+/).slice(0, 2).join('.');
        out.push({
          sel: `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
    });

    return out;
  });

for (const width of WIDTHS) {
  test(`hiçbir ekran ${width}px genişlikte yatay taşma yapmamalı`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Misafir Olarak Devam Et' }).click();
    await page.waitForTimeout(1500);

    const tabs = [
      { index: 0, name: 'Özet Panel' },
      { index: 1, name: 'Programlarım' },
      { index: 2, name: 'Egzersizler' },
    ];

    for (const tab of tabs) {
      await page.locator('.sidebar-nav button').nth(tab.index).click();
      await page.waitForTimeout(500);
      expect(await findOverflowing(page), `${tab.name} sekmesi`).toEqual([]);
    }

    // Split programın düzenleyicisi: asıl hatanın çıktığı ekran.
    await page.locator('.sidebar-nav button').nth(1).click();
    await page.waitForTimeout(400);
    await page.locator('.card-minor-actions .btn-card-action').first().click();
    await page.waitForTimeout(800);
    expect(await findOverflowing(page), 'Program düzenleyici').toEqual([]);
  });
}
