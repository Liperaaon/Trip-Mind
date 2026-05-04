import {
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  updateProfile, GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from "../firebase";
// ─── Google OAuth ─────────────────────────────────────────────

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(result.user);
  return result.user;
}

// ─── Email / Senha ────────────────────────────────────────────

export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function registerWithEmail(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await ensureUserDoc(result.user, { displayName });
  return result.user;
}

// ─── Logout ───────────────────────────────────────────────────

export async function logout() {
  await signOut(auth);
}

// ─── Perfil no Firestore ──────────────────────────────────────

/** Cria o documento do usuário se ainda não existir */
async function ensureUserDoc(user, extra = {}) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName ?? extra.displayName ?? '',
      photoURL:    user.photoURL ?? null,
      plan:        'free',
      createdAt:   serverTimestamp(),
    });
  }
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}
