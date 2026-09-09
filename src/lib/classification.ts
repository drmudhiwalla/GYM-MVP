import { Category } from './types';

// ─── Blood Pressure Classification ───────────────────────────────────────────
export function classifyBP(systolic: number, diastolic: number): Category {
  if (systolic >= 160 || diastolic >= 100) return 'RED';    // Stage 2+ HTN
  if (systolic >= 140 || diastolic >= 90) return 'RED';     // Stage 2+ HTN
  if (systolic >= 130 || diastolic >= 80) return 'YELLOW';  // Stage 1 HTN
  if (systolic >= 120 && diastolic < 80) return 'YELLOW';   // Elevated
  return 'GREEN';                                            // Normal
}

// ─── BMI Classification ──────────────────────────────────────────────────────
export function classifyBMI(heightCm: number, weightKg: number): {
  value: number;
  category: Category;
} {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  let category: Category;
  if (rounded < 18.5) category = 'YELLOW';
  else if (rounded <= 22.9) category = 'GREEN';
  else if (rounded <= 24.9) category = 'YELLOW';
  else category = 'RED';

  return { value: rounded, category };
}

// ─── Sleep Classification (B-PSQI adapted, 0-15) ────────────────────────────
export function classifySleep(score: number): Category {
  if (score <= 3) return 'GREEN';
  if (score <= 6) return 'YELLOW';
  return 'RED';
}

// ─── Stress Classification (PSS-4, 0-16) ────────────────────────────────────
export function classifyStress(score: number): Category {
  if (score <= 4) return 'GREEN';
  if (score <= 7) return 'YELLOW';
  return 'RED';
}

// ─── Final Category Logic ────────────────────────────────────────────────────
export function calculateFinalCategory(params: {
  bpCategory: Category;
  medicalHistory: boolean;
  familyHistory: boolean;
  bmiCategory: Category;
  sleepCategory: Category;
  stressCategory: Category;
}): Category {
  const {
    bpCategory,
    medicalHistory,
    familyHistory,
    bmiCategory,
    sleepCategory,
    stressCategory,
  } = params;

  // 🔴 RED: BP = Red OR Medical History = Yes OR 2 or more Red results among BMI, Sleep, Stress
  const redCount = [bmiCategory, sleepCategory, stressCategory].filter(
    (c) => c === 'RED'
  ).length;

  if (bpCategory === 'RED' || medicalHistory || redCount >= 2) {
    return 'RED';
  }

  // 🟡 YELLOW: Does not meet Red criteria, but Family History = Yes, OR BP = Yellow,
  // OR any BMI/Sleep/Stress result is Yellow, OR exactly 1 of BMI/Sleep/Stress is Red
  const yellowCount = [bmiCategory, sleepCategory, stressCategory].filter(
    (c) => c === 'YELLOW'
  ).length;

  if (
    familyHistory ||
    bpCategory === 'YELLOW' ||
    yellowCount > 0 ||
    redCount === 1
  ) {
    return 'YELLOW';
  }

  // 🟢 GREEN: BP Green + Medical History No + Family History No + BMI Green + Sleep Green + Stress Green
  return 'GREEN';
}

// ─── Category Display Helpers ────────────────────────────────────────────────
export const categoryColors: Record<Category, { bg: string; text: string; border: string; emoji: string }> = {
  GREEN: { bg: '#dcfce7', text: '#16a34a', border: '#22c55e', emoji: '🟢' },
  YELLOW: { bg: '#fef9c3', text: '#ca8a04', border: '#eab308', emoji: '🟡' },
  RED: { bg: '#fee2e2', text: '#dc2626', border: '#ef4444', emoji: '🔴' },
};

export const categoryLabels: Record<Category, { en: string; hi: string }> = {
  GREEN: { en: 'Low Risk', hi: 'कम जोखिम' },
  YELLOW: { en: 'Moderate Risk', hi: 'मध्यम जोखिम' },
  RED: { en: 'High Risk', hi: 'उच्च जोखिम' },
};
