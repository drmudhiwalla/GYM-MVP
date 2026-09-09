'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { loadScreeningById } from '@/lib/screening-store';

export default function SleepCompleted({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const screening = loadScreeningById(id);

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
            <div className="progress-step" />
            <div className="progress-step" />
          </div>
          <div className="page-indicator">Step <span>1</span> of 3</div>
        </div>

        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Sleep Assessment Completed!</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 1.7 }}>
          Your sleep quality score: <strong>{screening.sleepScore} / 15</strong> — <strong>{screening.sleepCategory}</strong>
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 32, lineHeight: 1.7 }}>
          आपकी नींद गुणवत्ता स्कोर: <strong>{screening.sleepScore} / 15</strong> — <strong>{screening.sleepCategory}</strong>
        </p>

        <button
          className="btn btn-next"
          style={{ width: '100%', padding: '14px 32px', fontSize: 16 }}
          onClick={() => router.push(`/screening/${id}/stress`)}
        >
          Continue to Stress Assessment &rarr;
        </button>
      </div>
      <Footer />
    </div>
  );
}
