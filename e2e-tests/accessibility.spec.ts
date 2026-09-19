import { test, expect } from '@playwright/test';

/**
 * P1 erişilebilirlik regresyon testleri.
 *
 * Bu dördü de bir denetimde eksik bulundu: yardımcı metin rengi WCAG AA'nın
 * altındaydı, klavye odağının hiçbir görsel izi yoktu, prefers-reduced-motion
 * hiç dikkate alınmıyordu ve mobil alt menü etiketsiz üç ikondan ibaretti.
 */

const relativeLuminance = (rgb: string): number => {
  const [r, g, b] = rgb.match(/\d+/g)!.slice(0, 3)
    .map(Number)
    .map(v => v / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a: string, b: string): number => {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

const continueAsGuest = async (page: import('@playwright/test').Page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Misafir Olarak Devam Et' }).click();
  await page.waitForTimeout(2500);
};

test('yardımcı metin rengi WCAG AA kontrastını karşılar', async ({ page }) => {
  await continueAsGuest(page);

  const { muted, surfaces } = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const toRgb = (value: string) => {
      const probe = document.createElement('div');
      probe.style.color = value;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    };
    return {
      muted: toRgb(root.getPropertyValue('--text-muted').trim()),
      surfaces: ['--bg-primary', '--bg-card-solid', '--bg-card-hover']
        .map(name => toRgb(root.getPropertyValue(name).trim())),
    };
  });

  for (const surface of surfaces) {
    expect(contrastRatio(muted, surface)).toBeGreaterThanOrEqual(4.5);
  }
});

test('klavye odağı görünür bir halka bırakır', async ({ page }) => {
  await continueAsGuest(page);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);

  const focus = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as HTMLElement);
    return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
  });

  expect(focus.width).toBeGreaterThanOrEqual(2);
  expect(focus.style).not.toBe('none');
});

test('alt menü öğeleri etiketli ve dokunulabilir boyutta', async ({ page }) => {
  await continueAsGuest(page);

  const items = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('.sidebar-nav .nav-item')).map(el => {
      const label = el.querySelector<HTMLElement>('.nav-label');
      return {
        text: label?.textContent?.trim() ?? '',
        labelVisible: label ? getComputedStyle(label).display !== 'none' : false,
        height: Math.round(el.getBoundingClientRect().height),
      };
    }));

  expect(items.length).toBeGreaterThan(0);
  for (const item of items) {
    expect(item.labelVisible, `"${item.text}" etiketi görünür olmalı`).toBe(true);
    expect(item.text.length).toBeGreaterThan(0);
    expect(item.height, `"${item.text}" dokunma hedefi`).toBeGreaterThanOrEqual(44);
  }
});

test('prefers-reduced-motion uzun animasyonları durdurur', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await continueAsGuest(page);

  const stillAnimating = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('body *')).filter(el => {
      const style = getComputedStyle(el);
      return (parseFloat(style.animationDuration) || 0) > 0.05
        || (parseFloat(style.transitionDuration) || 0) > 0.05;
    }).length);

  expect(stillAnimating).toBe(0);
});
