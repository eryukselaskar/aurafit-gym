import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithCredential
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';

/**
 * Firebase ayarları ortam değişkenlerinden okunur; koda gömülü değildir.
 *
 * Projeyi kendi başına çalıştıran herkesin kendi Firebase projesini kullanması
 * içindir: aksi halde tüm kurulumlar tek bir projenin kotasını ve verisini
 * paylaşırdı. Kurulum için .env.example dosyasına bakın.
 *
 * Ayar yoksa uygulama çökmez, yalnızca yerel modda çalışır: programlar,
 * antrenmanlar ve ölçümler cihazda saklanır; bulut eşitlemesi ve Google ile
 * giriş devre dışı kalır.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/** Android'de yerel Google Sign-In eklentisinin kullandığı OAuth istemci kimliği. */
export const googleClientId: string | undefined =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

/** Bulut özelliklerinin açık olup olmadığı. false ise uygulama yalnızca yereldir. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);

  // Disk üzerinde önbellek: uygulama tamamen çevrimdışı çalışabilir ve bağlantı
  // gelince kendiliğinden eşitlenir.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  auth = getAuth(app);
} else {
  console.info(
    'Firebase ayarı bulunamadı; uygulama yerel modda çalışıyor. ' +
    'Bulut eşitlemesi için .env dosyanızı oluşturun (bkz. .env.example).'
  );
}

/*
 * Bunlar yalnızca isFirebaseConfigured true iken kullanılır ve çağrı yerlerinin
 * tamamı o kontrolün arkasındadır. Yirmi dört çağrı noktasını null kontrolüyle
 * sarmak yerine tip düzeyinde kesin kabul ediliyor.
 */
const dbOrThrow = db as Firestore;
const authOrThrow = auth as Auth;

export {
  app,
  dbOrThrow as db,
  authOrThrow as auth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithCredential
};
export type { User };
