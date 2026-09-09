'use client';

import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{ width: '100vw', minHeight: '100vh', position: 'relative' }}>
      {/* Staff Login - Top Right */}
      <button
        onClick={() => router.push('/staff/login')}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 20,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 50,
          padding: '8px 20px', fontSize: 13, fontWeight: 600,
          color: '#35AEF4', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          boxShadow: '0 2px 8px rgba(53,174,244,0.15)',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#35AEF4';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.color = '#35AEF4';
        }}
      >
        🔐 Staff Login
      </button>

      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏥</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.2 }}>
            Gym Health Screening
          </h1>
          <p style={{ fontSize: 20, fontWeight: 600, color: '#334155', marginBottom: 20 }}>
            जिम स्वास्थ्य जांच
          </p>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 8 }}>
            A preventive health screening to assess your overall health category.
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 32 }}>
            आपके समग्र स्वास्थ्य श्रेणी का आकलन करने के लिए एक निवारक स्वास्थ्य जांच।
          </p>

          <button
            className="btn btn-next"
            style={{ fontSize: 16, padding: '14px 40px' }}
            onClick={() => router.push('/consent')}
          >
            Start Screening &rarr;
          </button>

          <div style={{ marginTop: 40, padding: '16px 20px', background: '#f8fafc', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              <strong>What we measure:</strong> Blood Pressure, BMI, Sleep Quality, Stress Level
              <br />
              <strong>6 Parameters:</strong> Green/Yellow/Red classification with final risk assessment
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
