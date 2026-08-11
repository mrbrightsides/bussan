import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppState } from './types';
import { initialAppData } from './data/initialData';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const STATE_DOC_REF = doc(db, 'app_state', 'main');

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
          onStateChange({
            competitions: data.competitions || [],
            participants: data.participants || [],
            donors: data.donors || [],
            expenses: data.expenses || [],
          });
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
    await setDoc(STATE_DOC_REF, {
      ...state,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving state to Firestore:', err);
    throw err;
  }
}
