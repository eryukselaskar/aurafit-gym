import { test, expect } from '@playwright/test';

/**
 * Yapısal erişilebilirlik taraması.
 *
 * Her ekranda dört şey kontrol edilir:
 *  - başlık hiyerarşisi (görünür tek h1, atlanan seviye yok)
 *  - her form alanının bir etiketi var (label[for], sarmalayan label veya aria)
 *  - ikon butonların erişilebilir adı var
 *  - img öğelerinin alt metni var
 *
 * İlk taramada bulunanlar: LoginScreen dışındaki yedi ekranda başlık seviyesi
 * atlaması, Programlar'da iki adsız ikon buton, Düzenleyici'de üç ve
 * Kütüphane'de iki etiketsiz alan, Geçmiş'te yinelenen h1.
 */

test('hiçbir ekranda yapısal erişilebilirlik sorunu olmamalı', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const audit = async (label: string) => {
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const issues: Record<string, string[]> = {};
      const add = (k: string, v: string) => { (issues[k] ||= []).push(v); };

      // 1) Baslik hiyerarsisi
      const heads = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .filter(h => (h as HTMLElement).offsetParent !== null);
      const levels = heads.map(h => Number(h.tagName[1]));
      if (levels.filter(l => l === 1).length === 0) add('h1yok', 'görünür h1 yok');
      if (levels.filter(l => l === 1).length > 1) add('coklu_h1', String(levels.filter(l => l === 1).length));
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) add('atlanan_seviye', `h${levels[i-1]} -> h${levels[i]}: ${heads[i].textContent?.trim().slice(0,25)}`);
      }

      // 2) label - input baglantisi
      document.querySelectorAll<HTMLElement>('input,select,textarea').forEach(el => {
        if ((el as HTMLElement).offsetParent === null) return;
        const id = el.getAttribute('id');
        const hasFor = id ? Boolean(document.querySelector(`label[for="${id}"]`)) : false;
        const wrapped = Boolean(el.closest('label'));
        const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (!hasFor && !wrapped && !aria) {
          add('etiketsiz_input', `${el.tagName}[${el.getAttribute('type') || ''}] ph="${el.getAttribute('placeholder') || ''}"`);
        }
      });

      // 3) Erisilebilir adi olmayan ikon butonlar
      document.querySelectorAll<HTMLElement>('button,a[href]').forEach(el => {
        if (el.offsetParent === null) return;
        const text = (el.textContent || '').trim();
        const aria = el.getAttribute('aria-label') || el.getAttribute('title');
        if (!text && !aria) add('adsiz_buton', el.className.toString().slice(0, 35));
      });

      // 4) Alt metni olmayan gorseller
      document.querySelectorAll<HTMLImageElement>('img').forEach(el => {
        if (el.offsetParent === null) return;
        if (!el.hasAttribute('alt')) add('alt_yok', el.src.slice(-30));
      });

      return issues;
    });
    const summary = Object.entries(r)
      .map(([kind, items]) => `${kind}: ${items.slice(0, 3).join(' | ')}`)
      .join(' // ');
    expect(summary, `${label} ekranı`).toBe('');
  };

  await page.getByRole('button', { name: 'Misafir Olarak Devam Et' }).waitFor();
  await audit('LoginScreen');
  await page.getByRole('button', { name: 'Misafir Olarak Devam Et' }).click();
  await page.waitForTimeout(2500);
  await audit('Ozet Panel');

  await page.locator('.sidebar-nav button').nth(1).click(); await audit('Programlar');
  await page.locator('.card-minor-actions .btn-card-action').first().click(); await audit('Duzenleyici');
  await page.locator('.sidebar-nav button').nth(2).click(); await audit('Kutuphane');
  await page.locator('.mobile-avatar-btn').click(); await audit('Profil');
  await page.getByText('Geçmiş', { exact: false }).first().click().catch(() => {}); await audit('Gecmis');
  await page.getByText('Ölçümler', { exact: false }).first().click().catch(() => {}); await audit('Olcumler');
});
