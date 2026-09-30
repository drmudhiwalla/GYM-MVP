'use client';

import { useEffect, useState } from 'react';
import { ScreeningState } from './context';

function mapScreening(d: Record<string, unknown>): ScreeningState {
  const n = (v: unknown) => (typeof v === 'number' ? v : 0);
  const opt = <T>(v: unknown) => (v as T) ?? null;
  return {
    screeningId: d.screeningId as string,
    createdAt: d.createdAt as string,
    status: d.status as ScreeningState['status'],
    whatsappNumber: (d.whatsappNumber as string) || '',
    name: (d.name as string) || '',
    age: n(d.age),
    gender: (d.gender as string) || '',
    workingStatus: (d.workingStatus as string) || '',
    consent1: Boolean(d.consent1),
    consent2: Boolean(d.consent2),
    consent3: Boolean(d.consent3),
    bpSystolic: n(d.bpSystolic),
    bpDiastolic: n(d.bpDiastolic),
    bpCategory: opt<ScreeningState['bpCategory']>(d.bpCategory),
    heightCm: n(d.heightCm),
    weightKg: n(d.weightKg),
    bmiValue: n(d.bmiValue),
    bmiCategory: opt<ScreeningState['bmiCategory']>(d.bmiCategory),
    waistCm: n(d.waistCm),
    briValue: n(d.briValue),
    briCategory: opt<ScreeningState['briCategory']>(d.briCategory),
    sleepScore: n(d.sleepScore),
    sleepCategory: opt<ScreeningState['sleepCategory']>(d.sleepScore ? d.sleepCategory : null),
    stressScore: n(d.stressScore),
    stressCategory: opt<ScreeningState['stressCategory']>(d.stressScore ? d.stressCategory : null),
    familyHistory: d.familyHistory as boolean | null,
    medicalHistory: d.medicalHistory as boolean | null,
    smokingCurrent: d.smokingCurrent as boolean | null,
    smokingPast: d.smokingPast as boolean | null,
    smokingCategory: opt<ScreeningState['smokingCategory']>(d.smokingCategory),
    finalCategory: opt<ScreeningState['finalCategory']>(d.finalCategory),
  };
}

export function useScreening(id: string) {
  const [screening, setScreening] = useState<ScreeningState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/api/screening/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (alive && data.success && data.data) setScreening(mapScreening(data.data));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return { screening, loading };
}

export async function patchScreening(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/screening/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to save screening');
  return res.json();
}
