import admin from 'firebase-admin';
import { localFirestore } from './localFirestoreMock.js';

let isLiveFirebase = false;
let dbInstance = localFirestore;
let authInstance = null;
let storageInstance = null;

export function initializeFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

  if (emulatorHost) {
    console.log(`🔥 Connecting to Firebase Emulator at ${emulatorHost}`);
    admin.initializeApp({ projectId: projectId || 'demo-wayward-flagon' });
    isLiveFirebase = true;
    dbInstance = admin.firestore();
    authInstance = admin.auth();
    storageInstance = admin.storage();
    return;
  }

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`
      });
      isLiveFirebase = true;
      dbInstance = admin.firestore();
      authInstance = admin.auth();
      storageInstance = admin.storage();
      console.log(`🔥 Initialized Cloud Firebase for Project: ${projectId}`);
    } catch (err) {
      console.warn(`⚠️ Failed to initialize Firebase Admin with credentials, falling back to local persistence:`, err.message);
      isLiveFirebase = false;
      dbInstance = localFirestore;
    }
  } else {
    console.log(`📁 Operating in Persistent Local Mode (Atomic JSON storage at .data/firestore/)`);
    isLiveFirebase = false;
    dbInstance = localFirestore;
  }
}

// Self-initialize on import
initializeFirebaseAdmin();

export function getFirestore() {
  return dbInstance;
}

export function getAuth() {
  return authInstance;
}

export function getStorage() {
  return storageInstance;
}

export function isFirebaseLive() {
  return isLiveFirebase;
}
