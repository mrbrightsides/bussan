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
          // If existing Firestore document doesn't have brackets or community modules, fallback to initial seeded data
          const brackets = (Array.isArray(data.brackets) && data.brackets.length > 0)
            ? data.brackets
            : (initialAppData.brackets || []);

          // Check if clean migration is needed for mediaGallery, marketplace, events & posts to start clean & empty
          const needsCleanStartMigration = !data.cleanPortalDataVersion || data.cleanPortalDataVersion < 3;

          const posts = needsCleanStartMigration
            ? []
            : (Array.isArray(data.posts) ? data.posts : (initialAppData.posts || []));

          const events = needsCleanStartMigration
            ? []
            : (Array.isArray(data.events) ? data.events : (initialAppData.events || []));

          const mediaGallery = needsCleanStartMigration
            ? []
            : (Array.isArray(data.mediaGallery) ? data.mediaGallery : (initialAppData.mediaGallery || []));

          const emergencyContacts = Array.isArray(data.emergencyContacts)
            ? data.emergencyContacts
            : (initialAppData.emergencyContacts || []);

          const marketplace = needsCleanStartMigration
            ? []
            : (Array.isArray(data.marketplace) ? data.marketplace : (initialAppData.marketplace || []));

          // Check if rtCash needs migration/syncing to the official RT 22 transaction records
          const needsRTCashSync =
            !data.rtCashVersion ||
            data.rtCashVersion < 4 ||
            !Array.isArray(data.rtCash) ||
            data.rtCash.length === 0 ||
            data.rtCash.some((item: any) => item.amount === 5400000);

          const rtCash = needsRTCashSync ? (initialAppData.rtCash || []) : data.rtCash;
          const monthlyFees = Array.isArray(data.monthlyFees)
            ? data.monthlyFees
            : (initialAppData.monthlyFees || []);

          const loadedState: AppState = {
            posts,
            events,
            mediaGallery,
            emergencyContacts,
            marketplace,
            rtCash,
            monthlyFees,
            competitions: data.competitions || [],
            participants: data.participants || [],
            donors: data.donors || [],
            expenses: data.expenses || [],
            brackets: brackets,
          };

          // If Firestore was missing any of the community modules or needed sync, write back the updated state
          if (
            needsRTCashSync ||
            needsCleanStartMigration ||
            !Array.isArray(data.posts) ||
            !Array.isArray(data.emergencyContacts)
          ) {
            saveAppStateToFirestore({
              ...loadedState,
              rtCashVersion: 4,
              cleanPortalDataVersion: 3,
            } as any).catch((err) => {
              console.warn('Syncing updated state to Firestore:', err);
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
