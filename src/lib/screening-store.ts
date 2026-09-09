import { ScreeningState } from '@/lib/context';

const STORAGE_KEY = 'drmudhiwalla_screenings';

export function loadScreeningById(screeningId: string): ScreeningState | null {
  try {
    if (typeof window === 'undefined') return null;
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return existing[screeningId] || null;
  } catch {
    return null;
  }
}

export function saveScreeningData(state: ScreeningState): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    existing[state.screeningId] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage might be unavailable
  }
}

export function loadAllScreenings(): ScreeningState[] {
  try {
    if (typeof window === 'undefined') return [];
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.values(existing) as ScreeningState[];
  } catch {
    return [];
  }
}
