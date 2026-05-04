import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Evita inicializar múltiplas vezes em hot-reload (Vite/dev)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Serviços exportados
export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const storage  = getStorage(app);

// Analytics só roda no browser (não em SSR/Node)
export const analytics = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);

// Providers de OAuth
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
