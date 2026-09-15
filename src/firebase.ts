import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppState } from './types';
import { initialAppData } from './data/initialData';

const app = initializeApp(firebaseConfig);

// Use standard Firestore instance with fallback
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

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
    { includeMetadataChanges: false },
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.competitions && data.donors && data.expenses) {
          const brackets =
            Array.isArray(data.brackets) && data.brackets.length > 0
              ? data.brackets
              : initialAppData.brackets || [];

          // Always trust and load user arrays if present in Firestore
          const posts = Array.isArray(data.posts) ? data.posts : [];
          const events = Array.isArray(data.events) ? data.events : [];
          const mediaGallery = Array.isArray(data.mediaGallery) ? data.mediaGallery : [];
          const emergencyContacts = Array.isArray(data.emergencyContacts)
            ? data.emergencyContacts
            : initialAppData.emergencyContacts || [];
          const facilityReports = Array.isArray(data.facilityReports) ? data.facilityReports : [];
          const inventoryItems = Array.isArray(data.inventoryItems) ? data.inventoryItems : [];
          const marketplace = Array.isArray(data.marketplace) ? data.marketplace : [];

          // Check if rtCash needs migration/syncing to the official RT 22 transaction records (Periode 15 Agu - 14 Sep 2026)
          const needsRTCashSync =
            !data.rtCashVersion ||
            data.rtCashVersion < 5 ||
            !Array.isArray(data.rtCash) ||
            data.rtCash.length === 0 ||
            !data.rtCash.some((item: any) => item.id === 'cash-16');

          // Check if monthly fees need syncing to include August 2026 data
          const needsMonthlyFeesSync =
            !data.monthlyFeesVersion ||
            data.monthlyFeesVersion < 3 ||
            !Array.isArray(data.monthlyFees) ||
            !data.monthlyFees.some((h: any) => h.payments?.aug);

          const rtCash = needsRTCashSync ? initialAppData.rtCash || [] : data.rtCash;
          const monthlyFees = needsMonthlyFeesSync
            ? initialAppData.monthlyFees || []
            : data.monthlyFees;

          const loadedState: AppState = {
            posts,
            events,
            mediaGallery,
            emergencyContacts,
            facilityReports,
            inventoryItems,
            marketplace,
            rtCash,
            monthlyFees,
            competitions: data.competitions || [],
            participants: data.participants || [],
            donors: data.donors || [],
            expenses: data.expenses || [],
            brackets: brackets,
          };

          // One-time schema writeback if fields are missing or data updated
          if (
            needsRTCashSync ||
            needsMonthlyFeesSync ||
            !data.cleanPortalDataVersion ||
            !Array.isArray(data.mediaGallery) ||
            !Array.isArray(data.posts) ||
            !Array.isArray(data.emergencyContacts)
          ) {
            saveAppStateToFirestore(loadedState).catch((err) => {
              console.warn('Syncing initial schema state to Firestore:', err);
            });
          }

          onStateChange(loadedState);
          return;
        }
      }
      // If doc doesn't exist yet in Firestore, seed initialAppData into Firestore
      saveAppStateToFirestore(initialAppData).catch((err) => {
        console.warn('Could not seed initial data to Firestore yet (may be offline):', err);
      });
      onStateChange(initialAppData);
    },
    (error) => {
      console.warn('Firestore snapshot notice (client operating in local cache / offline mode):', error?.message || error);
      if (onError) onError(error);
    }
  );
}

export async function saveAppStateToFirestore(state: AppState) {
  try {
    const cleanState = cleanForFirestore(state);
    await setDoc(STATE_DOC_REF, {
      ...cleanState,
      rtCashVersion: 5,
      monthlyFeesVersion: 3,
      cleanPortalDataVersion: 5,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ State successfully synced to Firestore!');
  } catch (err: any) {
    console.warn('⚠️ Saved locally. Will auto-sync to Firestore when connected:', err?.message || err);
  }
}
