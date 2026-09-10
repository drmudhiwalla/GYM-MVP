'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { ScreeningState } from '@/lib/context';

export default function StressCompleted({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [screening, setScreening] = useState<ScreeningState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/screening/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const d = data.data;
          setScreening({
            screeningId: d.screeningId, createdAt: d.createdAt, status: d.status,
            whatsappNumber: d.whatsappNumber, name: d.name, age: d.age, gender: d.gender,
            workingStatus: d.workingStatus || '', consent1: d.consent1, consent2: d.consent2, consent3: d.consent3,
            bpSystolic: d.bpSystolic || 0, bpDiastolic: d.bpDiastolic || 0, bpCategory: d.bpCategory,
            heightCm: d.heightCm || 0, weightKg: d.weightKg || 0, bmiValue: d.bmiValue || 0, bmiCategory: d.bmiCategory,
            sleepScore: d.sleepScore || 0, sleepCategory: d.sleepCategory,
            stressScore: d.stressScore || 0, stressCategory: d.stressCategory,
            familyHistory: d.familyHistory, medicalHistory: d.medicalHistory, finalCategory: d.finalCategory,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!screening) {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>Screening not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Screening ID: {id}</div>
          <div className="progress-bar">
            <div className="progress-step done" />
            <div className="progress-step done" />
            <div className="progress-step" />
          </div>
          <div className="page-indicator">Step <span>2</span> of 3</div>
        </div>

        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Stress Assessment Completed!</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 1.7 }}>
          Your stress level score: <strong>{screening.stressScore} / 16</strong> — <strong>{screening.stressCategory}</strong>
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 32, lineHeight: 1.7 }}>
          आपका तनाव स्कोर: <strong>{screening.stressScore} / 16</strong> — <strong>{screening.stressCategory}</strong>
        </p>

        <button
          className="btn btn-next"
          style={{ width: '100%', padding: '14px 32px', fontSize: 16 }}
          onClick={() => router.push(`/screening/${id}/history`)}
        >
          Continue to Medical History &rarr;
        </button>
      </div>
      <Footer />
    </div>
  );
}
