import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const GUEST_UID_KEY = 'wayward_flagon_guest_uid';

// Helper to generate or retrieve persistent guest UID
export function getPersistentGuestUid() {
  try {
    let uid = localStorage.getItem(GUEST_UID_KEY);
    if (!uid) {
      uid = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      localStorage.setItem(GUEST_UID_KEY, uid);
    }
    return uid;
  } catch {
    return `guest_fallback_${Date.now()}`;
  }
}

let firebaseApp = null;
let firebaseAuth = null;
let isLiveFirebase = false;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize if API key is provided
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY') {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
    isLiveFirebase = true;
    console.log('🔥 Initialized client Firebase SDK');
  } catch (err) {
    console.warn('⚠️ Client Firebase SDK init failed, falling back to persistent guest mode:', err.message);
    isLiveFirebase = false;
  }
} else {
  // Offline / local guest mode
  isLiveFirebase = false;
}

export { firebaseAuth, isLiveFirebase };

/**
 * Returns auth headers for API requests (Bearer token if authenticated, otherwise x-guest-uid)
 */
export async function getAuthHeaders() {
  if (isLiveFirebase && firebaseAuth && firebaseAuth.currentUser) {
    try {
      const token = await firebaseAuth.currentUser.getIdToken();
      return {
        'Authorization': `Bearer ${token}`
      };
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID token, using guest UID header:', e);
    }
  }

  const guestUid = getPersistentGuestUid();
  return {
    'x-guest-uid': guestUid
  };
}

/**
 * Sign in anonymously if Firebase Auth is live
 */
export async function loginAnonymously() {
  if (isLiveFirebase && firebaseAuth) {
    return await signInAnonymously(firebaseAuth);
  }
  return {
    user: {
      uid: getPersistentGuestUid(),
      isAnonymous: true
    }
  };
}
