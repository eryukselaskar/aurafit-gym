import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithCredential
} from 'firebase/auth';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB1NvMP8OUsTejg_p8WkRpCsgeKE0Kz6gU",
  authDomain: "aurafit-app-2026.firebaseapp.com",
  projectId: "aurafit-app-2026",
  storageBucket: "aurafit-app-2026.firebasestorage.app",
  messagingSenderId: "586826078940",
  appId: "1:586826078940:web:42ca79d267f1bc5b977219"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Offline Persistence enabled out-of-the-box!
// This ensures that Firestore caches data on disk, enabling it to work fully offline on PC & Android,
// and syncs automatically back up when connection is restored.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);

export { 
  app, 
  db, 
  auth, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithCredential
};
export type { User };
