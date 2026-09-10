'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import { ScreeningState } from '@/lib/context';

export default function ScreeningLanding({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [screening, setScreening] = useState<ScreeningState | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/screening/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const d = data.data;
          setScreening({
            screeningId: d.screeningId,
            createdAt: d.createdAt,
            status: d.status,
            whatsappNumber: d.whatsappNumber,
            name: d.name,
            age: d.age,
            gender: d.gender,
            workingStatus: d.workingStatus || '',
            consent1: d.consent1,
            consent2: d.consent2,
            consent3: d.consent3,
            bpSystolic: d.bpSystolic || 0,
            bpDiastolic: d.bpDiastolic || 0,
            bpCategory: d.bpCategory,
            heightCm: d.heightCm || 0,
            weightKg: d.weightKg || 0,
            bmiValue: d.bmiValue || 0,
            bmiCategory: d.bmiCategory,
            sleepScore: d.sleepScore || 0,
            sleepCategory: d.sleepCategory,
            stressScore: d.stressScore || 0,
            stressCategory: d.stressCategory,
            familyHistory: d.familyHistory,
            medicalHistory: d.medicalHistory,
            finalCategory: d.finalCategory,
          });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <p style={{ color: '#64748b' }}>Loading screening...</p>
        </div>
      </div>
    );
  }

  if (notFound || !screening) {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Screening Not Found</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            This screening link is invalid or has expired. Please request a new link from the gym staff.
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
            यह स्क्रीनिंग लिंक अमान्य है या समाप्त हो गया है। कृपया जिम स्टाफ से नया लिंक प्राप्त करें।
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (screening.status === 'COMPLETED') {
    router.replace(`/screening/${id}/results`);
    return null;
  }

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, #35AEF4 0%, #0ea5e9 100%)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Screening ID</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>{id}</div>
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Complete Your Health Screening</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 1.7 }}>
          Welcome, <strong>{screening.name}</strong>! You have 3 quick assessments to complete.
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, lineHeight: 1.7 }}>
          स्वागत है, <strong>{screening.name}</strong>! आपके पास 3 त्वरित आकलन पूरे करने हैं।
        </p>

        <div style={{ textAlign: 'left', marginBottom: 28 }}>
          {[
            { icon: '🌙', title: 'Sleep Quality Assessment', titleHi: 'नींद गुणवत्ता आकलन', time: '~3 min' },
            { icon: '🧠', title: 'Stress Level Assessment', titleHi: 'तनाव स्तर आकलन', time: '~2 min' },
            { icon: '📋', title: 'Medical History', titleHi: 'चिकित्सा इतिहास', time: '~1 min' },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', background: '#f8fafc', borderRadius: 10,
              marginBottom: 8, border: '1px solid #e2e8f0',
            }}>
              <span style={{ fontSize: 24 }}>{step.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{step.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{step.titleHi}</div>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', background: '#e2e8f0', padding: '2px 8px', borderRadius: 12 }}>
                {step.time}
              </span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-next"
          style={{ width: '100%', padding: '14px 32px', fontSize: 16 }}
          onClick={() => router.push(`/screening/${id}/sleep`)}
        >
          Start Assessments &rarr;
        </button>
      </div>
      <Footer />
    </div>
  );
}
