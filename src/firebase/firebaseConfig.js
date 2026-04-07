import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { invariant } from '../utils/guards.js';

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];

export function createFirebaseClients(firebaseConfig) {
  for (const key of requiredKeys) {
    invariant(firebaseConfig?.[key], `Firebase config ausente: ${key}`);
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  return { app, db };
}
