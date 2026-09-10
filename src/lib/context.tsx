'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Category } from '@/lib/types';
import { generateScreeningId } from '@/lib/utils';

export interface ScreeningState {
  screeningId: string;
  createdAt: string;
  status: 'REGISTERED' | 'LINK_SENT' | 'COMPLETED';

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

  waistCm: number;
  briValue: number;
  briCategory: Category | null;

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
    status: 'REGISTERED',
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
    waistCm: 0,
    briValue: 0,
    briCategory: null,
    sleepScore: 0,
    sleepCategory: null,
    stressScore: 0,
    stressCategory: null,
    familyHistory: null,
    medicalHistory: null,
    finalCategory: null,
  };
}

interface ScreeningContextType {
  state: ScreeningState;
  updateState: (updates: Partial<ScreeningState>) => void;
  reset: () => void;
}

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScreeningState>(createInitialState);

  const updateState = (updates: Partial<ScreeningState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const reset = () => {
    setState(createInitialState());
  };

  return (
    <ScreeningContext.Provider value={{ state, updateState, reset }}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) throw new Error('useScreening must be used within ScreeningProvider');
  return context;
}
