# Katkıda bulunma

Katkılar memnuniyetle karşılanır. Küçük düzeltmeler için doğrudan PR açabilirsin;
daha büyük bir değişiklik düşünüyorsan önce bir issue açıp konuşalım.

## Geliştirme ortamı

```bash
npm install
npm run dev          # http://localhost:5188
```

E2E testleri ilk kez çalıştırmadan önce tarayıcı gerekir:

```bash
npx playwright install chromium
```

## PR açmadan önce

Bunların hepsi geçmeli — CI de aynılarını koşuyor:

```bash
npm run build     # tip kontrolü + derleme
npm run lint      # 0 hata olmalı
npm test          # birim testleri
npm run test:e2e  # uçtan uca testler
```

## Testler hakkında

Regresyon testleri gerçek hataların üzerine yazıldı, her biri neyi koruduğunu
kendi başlığında anlatıyor:

| Dosya | Neyi koruyor |
|---|---|
| `e2e-tests/layout-overflow.spec.ts` | Beş ekran genişliğinde yatay taşma olmaması |
| `e2e-tests/accessibility.spec.ts` | Kontrast, klavye odağı, azaltılmış hareket, menü etiketleri |
| `e2e-tests/a11y-structure.spec.ts` | Başlık hiyerarşisi, form etiketleri, ikon buton adları |
| `e2e-tests/set-targets.spec.ts` | Hareket seviyesi hedeflerinin antrenman ekranına yansıması |
| `e2e-tests/dialogs.spec.ts` | Native `alert`/`confirm` kullanılmaması |
| `e2e-tests/error-boundary.spec.ts` | Render çökmesinde beyaz ekran yerine kurtarma ekranı |
| `e2e-tests/offline.spec.ts` | Bağlantı kesilince antrenmanın tamamlanabilmesi |

Davranış değiştiren bir PR açıyorsan ilgili testi de güncelle. Yeni bir hata
düzeltiyorsan, önce hatayı yakalayan bir test yazman en iyisi.

## Kod düzeni

- Bileşen stilleri ayrı `.css` dosyalarında; `<style>` bloğu eklemeyin
- Renkler `src/index.css`'teki token'lardan gelir, sabit hex/rgba yazmayın
- Kullanıcıya görünen metinler Türkçe
- Onay/uyarı için `ConfirmDialog` kullanın, `window.confirm`/`alert` değil

## Sürüm ve dağıtım

Windows kurulumu üretmek için:

```bash
npm run electron:build
```

Windows Defender'ın derleme klasörünü taraması `EPERM` hatasına yol açabiliyor;
proje klasörünü dışlamalara eklemek gerekebilir.
