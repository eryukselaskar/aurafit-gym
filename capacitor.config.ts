import type { CapacitorConfig } from '@capacitor/cli';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * `.env` dosyasından tek bir değer okur.
 *
 * Capacitor yapılandırması Node tarafında, Vite devrede değilken çalıştırılır;
 * bu yüzden `import.meta.env` yoktur ve `npx cap sync` `.env` dosyasını
 * kendiliğinden yüklemez. Yeni bir bağımlılık eklemek yerine dosyayı burada
 * okuyoruz. Ortam değişkeni zaten tanımlıysa o öncelikli.
 */
const readEnv = (key: string): string => {
  if (process.env[key]) return process.env[key] as string;

  try {
    const content = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;
      if (trimmed.slice(0, separator).trim() !== key) continue;
      return trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // .env yoksa sorun değil: bulut özellikleri olmadan da derlenebilir.
  }

  return '';
};

const config: CapacitorConfig = {
  appId: 'com.aurafit.app',
  appName: 'AuraFit',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'accounts.google.com',
      '*.firebaseapp.com',
      '*.googleapis.com',
      '*.google.com',
      '*.googleusercontent.com'
    ]
  },
  android: {
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
  },
  plugins: {
    GoogleSignIn: {
      // Kendi Firebase projenizin OAuth istemci kimliği (Web tipi).
      clientId: readEnv('VITE_GOOGLE_CLIENT_ID')
    }
  }
};

export default config;
