import { AppState } from '../types';
import { initialAppData } from '../data/initialData';

const STORAGE_KEY = 'green_bussan_17an_app_state_v5';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialAppData;
    const parsed = JSON.parse(raw);
    if (!parsed.competitions || !parsed.participants || !parsed.donors || !parsed.expenses) {
      return initialAppData;
    }
    return parsed;
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
