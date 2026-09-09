'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Category } from '@/lib/types';
import { generateScreeningId } from '@/lib/utils';

export interface ScreeningState {
  screeningId: string;
  createdAt: string;
  status: 'PARTIAL' | 'LINK_SENT' | 'COMPLETED';

  whatsappNumber: string;
  name: string;
  age: number;
  gender: string;
  workingStatus: string;
  consent1: boolean;
  consent2: boolean;
  consent3: boolean;

  bpSystolic: number;
  bpDiastolic: number;
  bpCategory: Category | null;

  heightCm: number;
  weightKg: number;
  bmiValue: number;
  bmiCategory: Category | null;

  sleepScore: number;
  sleepCategory: Category | null;

  stressScore: number;
  stressCategory: Category | null;

  familyHistory: boolean | null;
  medicalHistory: boolean | null;

  finalCategory: Category | null;
}

function createInitialState(): ScreeningState {
  return {
    screeningId: generateScreeningId(),
    createdAt: new Date().toISOString(),
    status: 'PARTIAL',
    whatsappNumber: '',
    name: '',
    age: 0,
    gender: '',
    workingStatus: '',
    consent1: false,
    consent2: false,
    consent3: false,
    bpSystolic: 0,
    bpDiastolic: 0,
    bpCategory: null,
    heightCm: 0,
    weightKg: 0,
    bmiValue: 0,
    bmiCategory: null,
    sleepScore: 0,
    sleepCategory: null,
    stressScore: 0,
    stressCategory: null,
    familyHistory: null,
    medicalHistory: null,
    finalCategory: null,
  };
}

const STORAGE_KEY = 'drmudhiwalla_screenings';

function saveScreening(state: ScreeningState) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    existing[state.screeningId] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage might be unavailable
  }
}

function loadScreening(screeningId: string): ScreeningState | null {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return existing[screeningId] || null;
  } catch {
    return null;
  }
}

function loadAllScreenings(): ScreeningState[] {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.values(existing) as ScreeningState[];
  } catch {
    return [];
  }
}

interface ScreeningContextType {
  state: ScreeningState;
  updateState: (updates: Partial<ScreeningState>) => void;
  reset: () => void;
  loadById: (screeningId: string) => ScreeningState | null;
  loadAll: () => ScreeningState[];
}

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScreeningState>(createInitialState);

  const updateState = (updates: Partial<ScreeningState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      saveScreening(next);
      return next;
    });
  };

  const reset = () => {
    const fresh = createInitialState();
    setState(fresh);
  };

  const loadById = (screeningId: string) => loadScreening(screeningId);
  const loadAll = () => loadAllScreenings();

  return (
    <ScreeningContext.Provider value={{ state, updateState, reset, loadById, loadAll }}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) throw new Error('useScreening must be used within ScreeningProvider');
  return context;
}
