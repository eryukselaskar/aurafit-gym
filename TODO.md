# Yapılacaklar

Bu liste, denetim ve iyileştirme çalışmasından geriye kalanları tutar. Her madde
neden önemli olduğu ve nerede durduğuyla birlikte yazıldı; aradan zaman geçince
bağlamı hatırlamak için.

Son güncelleme: 2026-09-21

---

## Öncelikli

### 1. İngilizce arayüz (i18n)

**Durum:** Başlanmadı. Bilinçli ertelendi.

Arayüz tamamen Türkçe. README İngilizce olduğu için gelen ziyaretçi uygulamayı
indirdiğinde Türkçe buluyor — README'de açıkça yazıyor ama yine de dönüşümü
düşürüyor.

Metinler bileşenlerin içine gömülü, çeviri kataloğu yok. Yapılacak iş:

- Metinleri çıkar (`react-i18next` veya basit bir sözlük nesnesi)
- Türkçe'yi varsayılan bırak, İngilizce ekle
- Tarih/sayı biçimlendirmesi zaten `toLocaleDateString('tr-TR')` ile sabit —
  onlar da dile bağlanmalı

Tahmini kapsam: ~40 bileşen dosyası, birkaç yüz dize.

### 2. Android release derlemesi

**Durum:** Debug APK çalışıyor ve cihazda doğrulandı. Release derlemesi yok.

Dağıtım için gerekli:

- Kendi keystore'unu oluştur (`keytool -genkey -v -keystore ...`) — **anahtar
  sende kalmalı**, kaybedersen aynı uygulamayı bir daha güncelleyemezsin
- `android/app/build.gradle` içine imzalama yapılandırması ekle
- Release SHA-1'ini Firebase konsoluna kaydet (debug SHA-1'den farklı)
- APK'yı GitHub Release'e ekle

Not: `android/app/google-services.json` artık takip edilmiyor; derleyen herkesin
kendi dosyasını koyması gerekiyor (README'de yazılı).

### 3. Gerçek ekran okuyucu testi

**Durum:** Yapısal kontroller otomatik, gerçek okuma akışı denenmedi.

`e2e-tests/a11y-structure.spec.ts` başlık hiyerarşisini, form etiketlerini ve
ikon buton adlarını sekiz ekranda doğruluyor. Ama bunlar yapı kontrolü; NVDA
(Windows) veya TalkBack (Android) ile gerçek akışı kimse dinlemedi.

Özellikle bakılmalı: aktif antrenman ekranında set tamamlandığında duyuru
yapılıyor mu, dinlenme sayacı okunuyor mu, modal açılınca odak doğru yere
gidiyor mu.

Otomatikleştirilemez, elle yapılması gerekiyor.

---

## İkincil

### 4. Web sürümünde service worker yok

Bağlantı yokken uygulamayı **sıfırdan açmak** web sürümünde çalışmıyor
(`ERR_INTERNET_DISCONNECTED`). Android ve Electron varlıkları yerelden
yüklediği için etkilenmiyor.

Uygulama açıkken bağlantı kesilmesi sorunsuz — bu `e2e-tests/offline.spec.ts`
ile doğrulanmış durumda.

Çözüm: `vite-plugin-pwa` ile service worker eklemek. Bu bir özellik kararı,
sadece bir düzeltme değil.

### 5. Windows kod imzalama

Dosyalar imzasız olduğu için SmartScreen uyarı veriyor. README ve Release
notlarında nasıl geçileceği yazıyor ama indirenlerin bir kısmını kaçırıyordur.

Kod imzalama sertifikası ücretli (yıllık). Şimdilik gerek yok.

### 6. Yatay yön (landscape) test edilmedi

Tüm testler dikey yönde koştu. Telefonu yan çevirince özellikle aktif antrenman
ekranının ne olduğu bilinmiyor.

### 7. Firestore'da sahipsiz veri

Anonim hesaplar silinirse (Firebase'in otomatik temizliği veya elle) o
kullanıcının `users/{uid}/...` dokümanları Firestore'da kalıyor — kural gereği
kimse okuyamıyor ama depolamada duruyor.

Şu an sorun değil; kullanım büyürse bir temizlik işi gerekebilir.

---

## Teknik borç

### 8. ActiveWorkout hâlâ büyük

1319 satır. CSS ayrıldı, dinlenme paneli çıkarıldı ama set satırı, egzersiz
kartı ve kutlama modalı hâlâ içeride.

Bölünürse test yazmak da kolaylaşır.

### 9. Kasıtlı `exhaustive-deps` uyarıları

`ActiveWorkout.tsx` içinde üç `react-hooks/exhaustive-deps` uyarısı var. Üçü de
kasıtlı ve gerekçeleri koda yazılı: ilgili effect'ler belirli bir tetikleyiciyle
çalışıp anlık görüntü yazıyor, tüm bağımlılıkları eklemek sayaçları her
render'da sıfırlardı.

Zamanlayıcı mantığı `useRef` ile yeniden kurgulanırsa uyarılar da kalkabilir.
Riskli bir refactor, dokunmadan önce test kapsamı genişletilmeli.

### 10. Inline stiller

215 `style={{}}` bloğu var. Sabit renklerin hepsi token'lara bağlandı, geriye
kalanlar düzen (`display`, `gap`, `padding`). Tema değişimini engellemiyorlar
ama CSS dosyalarına taşınırsa tutarlılık artar.

---

## Bilinen tuzaklar

Tekrar karşılaşınca zaman kaybetmemek için:

- **Electron derlemesi `EPERM` veriyorsa** Windows Defender'ın proje klasörünü
  taraması yüzündendir. Dışlama ekle:
  `Add-MpPreference -ExclusionPath "<proje yolu>"` (yönetici PowerShell)
- **`npx cap sync` `.env` okumaz.** `capacitor.config.ts` dosyayı kendisi
  okuyor; yeni bir ortam değişkeni eklerken bunu unutma.
- **`public/` altındaki dosyalar Vite tarafından işlenmez.** Bu yüzden
  `desktop-login.html` ayarı `dist/firebase-config.js` üzerinden alıyor
  (`vite.config.ts` içindeki `emitFirebaseConfig` eklentisi).
- **Bileşen CSS'i `index.css`'ten sonra yüklenir.** Global bir sınıfı bileşen
  CSS'inde yeniden tanımlamak tüm uygulamayı etkiler — `.btn-danger` böyle
  kırılmıştı.
