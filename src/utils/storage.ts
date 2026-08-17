import { AppState } from '../types';
import { initialAppData } from '../data/initialData';

const STORAGE_KEY = 'green_bussan_17an_app_state_v9';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialAppData;
    const parsed = JSON.parse(raw);
    if (!parsed.competitions || !parsed.participants || !parsed.donors || !parsed.expenses) {
      return initialAppData;
    }
    return {
      posts: Array.isArray(parsed.posts) ? parsed.posts : (initialAppData.posts || []),
      events: Array.isArray(parsed.events) ? parsed.events : (initialAppData.events || []),
      mediaGallery: Array.isArray(parsed.mediaGallery) ? parsed.mediaGallery : (initialAppData.mediaGallery || []),
      emergencyContacts: Array.isArray(parsed.emergencyContacts) ? parsed.emergencyContacts : (initialAppData.emergencyContacts || []),
      marketplace: Array.isArray(parsed.marketplace) ? parsed.marketplace : (initialAppData.marketplace || []),
      rtCash: Array.isArray(parsed.rtCash) ? parsed.rtCash : (initialAppData.rtCash || []),
      monthlyFees: Array.isArray(parsed.monthlyFees) ? parsed.monthlyFees : (initialAppData.monthlyFees || []),
      competitions: Array.isArray(parsed.competitions) ? parsed.competitions : initialAppData.competitions,
      participants: Array.isArray(parsed.participants) ? parsed.participants : initialAppData.participants,
      donors: Array.isArray(parsed.donors) ? parsed.donors : initialAppData.donors,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : initialAppData.expenses,
      brackets: Array.isArray(parsed.brackets) ? parsed.brackets : (initialAppData.brackets || []),
    };
  } catch (e) {
    console.error('Failed to parse localStorage, resetting to initial', e);
    return initialAppData;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function resetAppState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
  return initialAppData;
}
