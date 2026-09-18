# AuraFit

Antrenman programlarını planlayıp seansları canlı takip eden bir fitness uygulaması.
Tek bir React kod tabanından **web**, **Android** (Capacitor) ve **Windows masaüstü**
(Electron) olarak çalışır.

## Neler var

- **Program oluşturucu** — çok günlü split'ler, sürükle-bırak sıralama, set/tekrar/RIR
  hedefleri, min–max tekrar aralıkları
- **Canlı antrenman ekranı** — süre takibi, dinlenme sayacı, arka plan bildirimleri
  (Android'de foreground service), kaldığı yerden devam
- **Otomatik progresyon** — seans bitince gerçekleşen ağırlık/tekrar değerleri
  programa geri yazılır
- **Kişisel rekorlar** — Epley formülüyle tahmini 1RM, rekor kırıldığında kutlama
- **Ölçüm takibi** — kilo, vücut yağı, çevre ölçüleri
- **Egzersiz kütüphanesi** — ~1500 hareketlik katalog + kendi eklediklerin
- **Topluluk** — program paylaşma, beğenme, kopyalama
- **Çevrimdışı çalışır** — Firestore kalıcı önbelleği + localStorage; misafir olarak
  başlayıp sonra Google hesabına geçince yerel veriler hesaba taşınır

## Kurulum

```bash
npm install
npm run dev          # http://localhost:5188
```

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu (port 5188, sabit) |
| `npm run build` | Tip kontrolü + üretim derlemesi (`dist/`) |
| `npm run lint` | ESLint |
| `npm test` | Birim testleri (Vitest) |
| `npm run test:watch` | Birim testleri, izleme modunda |
| `npm run test:e2e` | Uçtan uca testler (Playwright) |
| `npm run test:e2e:ui` | Playwright arayüzüyle |
| `npm run electron:start` | Masaüstü uygulamasını çalıştır (önce `build` gerekir) |
| `npm run electron:build` | Windows kurulumu üret (`dist-electron/`) |

E2E testleri ilk çalıştırmadan önce tarayıcı gerekir: `npx playwright install chromium`

## Android

```bash
npm run build
npx cap sync android
npx cap open android      # Android Studio'da aç
```

Uygulama kimliği `com.aurafit.app`. Google ile giriş yerel
`@capawesome/capacitor-google-sign-in` eklentisini kullanır; imzalama sertifikasının
SHA-1'i Firebase konsolunda kayıtlı olmalıdır.

## Masaüstü (Electron)

`main.cjs` `dist/` klasörünü `localhost` üzerinde rastgele bir portta sunar — Google
girişinin yetkili alan adı kontrolünü geçmesi için `file://` yerine bu gerekli.

Giriş akışı: uygulama `/api/open-external-login` çağırır → sistem tarayıcısında
`public/desktop-login.html` açılır (port ve `state` parametreleriyle) → tarayıcı
kimlik bilgisini `/api/auth-callback`'e gönderir → `state` doğrulanır ve
`window.handleExternalAuth` tetiklenir.

## Firebase

```bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

Firestore düzeni:

- `users/{uid}/{exercises,programs,history,weightLogs,personalRecords}` — yalnızca
  sahibi okur/yazar
- `public_programs/{id}` — giriş yapmış herkes okur; yalnızca sahibi düzenler,
  diğerleri sadece kendi oyunu bir artırıp azaltabilir

`src/utils/firebase.ts` içindeki `apiKey` gizli bilgi değildir; Firebase web
anahtarları herkese açıktır ve güvenlik tamamen `firestore.rules` ile sağlanır.

## Proje yapısı

```
src/
  App.tsx                  Yönlendirme, auth, Firestore ↔ localStorage senkronizasyonu
  components/              Ekranlar (Dashboard, ProgramBuilder, ActiveWorkout, ...)
  utils/
    localStorage.ts        Yerel kalıcılık + dahili egzersiz/program katalogu
    datasetExercises.ts    ~1300 hareketlik veri seti (ayrı parça, sonradan yüklenir)
    firebaseSync.ts        Firestore okuma/yazma
    personalRecords.ts     1RM ve rekor hesabı (saf, test edilmiş)
    repTarget.ts           Tekrar hedefi biçimlendirme/doğrulama (saf, test edilmiş)
    workoutService.ts      Android foreground service köprüsü
e2e-tests/                 Playwright
maestro/                   Maestro akışı (Android cihazda)
```

## Notlar

- Egzersiz katalogu koda gömülüdür; localStorage'da **yalnızca** kullanıcının kendi
  eklediği hareketler tutulur.
- Veri seti ilk boyamadan sonra dinamik `import()` ile yüklenir, bu yüzden kütüphane
  açılıştan kısa süre sonra dolar.
