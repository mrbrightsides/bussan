import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppState } from './types';
import { initialAppData } from './data/initialData';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const STATE_DOC_REF = doc(db, 'app_state', 'main');

// Deep sanitize helper to eliminate any undefined properties that cause Firestore setDoc to fail
export function cleanForFirestore<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) => (value === undefined ? null : value)));
}

export function subscribeToAppState(
  onStateChange: (state: AppState) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    STATE_DOC_REF,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.competitions && data.donors && data.expenses) {
          // If existing Firestore document doesn't have brackets or has empty brackets, fallback to initial seeded brackets
          const brackets = (Array.isArray(data.brackets) && data.brackets.length > 0)
            ? data.brackets
            : (initialAppData.brackets || []);

          const loadedState: AppState = {
            competitions: data.competitions || [],
            participants: data.participants || [],
            donors: data.donors || [],
            expenses: data.expenses || [],
            brackets: brackets,
          };

          // If Firestore was missing brackets, update Firestore with the merged state
          if (!data.brackets || (Array.isArray(data.brackets) && data.brackets.length === 0 && brackets.length > 0)) {
            saveAppStateToFirestore(loadedState).catch((err) => {
              console.warn('Initial bracket migration to Firestore:', err);
            });
          }

          onStateChange(loadedState);
          return;
        }
      }
      // If doc doesn't exist yet in Firestore, seed initialAppData into Firestore
      saveAppStateToFirestore(initialAppData).catch((err) => {
        console.error('Failed to seed initial data to Firestore:', err);
      });
      onStateChange(initialAppData);
    },
    (error) => {
      console.error('Firestore snapshot error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveAppStateToFirestore(state: AppState) {
  try {
    const cleanState = cleanForFirestore(state);
    await setDoc(STATE_DOC_REF, {
      ...cleanState,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ State successfully synced to Firestore!');
  } catch (err) {
    console.error('❌ Error saving state to Firestore:', err);
    throw err;
  }
}
