export type Category = 'GREEN' | 'YELLOW' | 'RED';

export interface ScreeningData {
  // Basic Info
  whatsappNumber: string;
  name: string;
  age: number;
  gender: string;
  workingStatus: string;
  consent1: boolean;
  consent2: boolean;
  consent3: boolean;

  // Blood Pressure
  bpSystolic: number;
  bpDiastolic: number;
  bpCategory: Category;

  // BMI
  heightCm: number;
  weightKg: number;
  bmiValue: number;
  bmiCategory: Category;

  // Sleep (B-PSQI)
  sleepScore: number;
  sleepCategory: Category;

  // Stress (PSS-4)
  stressScore: number;
  stressCategory: Category;

  // Family & Medical History
  familyHistory: boolean;
  medicalHistory: boolean;

  // Final
  finalCategory: Category;
  status: 'PARTIAL' | 'LINK_SENT' | 'COMPLETED';
}
