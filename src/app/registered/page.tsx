'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Footer from '@/components/Footer';

function RegisteredContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const screeningId = searchParams.get('id');

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 28,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Your Screening ID</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>{screeningId}</div>
        </div>

        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Registered Successfully!</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 1.7 }}>
          Your registration is complete. The gym staff will collect your physical measurements and send you a link to complete the remaining assessments.
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, lineHeight: 1.7 }}>
          आपका पंजीकरण पूरा हो गया है। जिम स्टाफ आपके शारीरिक माप लेगा और आपको बाकी आकलन पूरे करने के लिए एक लिंक भेजेगा।
        </p>

        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12,
          padding: '16px 20px', marginBottom: 24, textAlign: 'left',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            What happens next? / आगे क्या होगा?
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: '#35AEF4', fontWeight: 700 }}>1.</span>
              <span>Gym staff will measure your Blood Pressure, BMI, and Waist Circumference.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: '#35AEF4', fontWeight: 700 }}>2.</span>
              <span>You will receive a WhatsApp link for Sleep, Stress &amp; Medical History assessments.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#35AEF4', fontWeight: 700 }}>3.</span>
              <span>Complete the assessments and view your results.</span>
            </div>
          </div>
        </div>

        <div className="disclaimer" style={{ textAlign: 'left' }}>
          <strong>Important:</strong> Save your Screening ID: <strong>{screeningId}</strong>. You will need it to view your results.
          <br />
          अपनी Screening ID सहेजें: <strong>{screeningId}</strong>। आपको अपने परिणाम देखने के लिए इसकी आवश्यकता होगी।
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="btn btn-back" onClick={() => router.push('/')}>
            Back to Home
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function RegisteredPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 60 }}><p>Loading...</p></div>}>
      <RegisteredContent />
    </Suspense>
  );
}
