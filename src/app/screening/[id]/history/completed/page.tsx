'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { loadScreeningById } from '@/lib/screening-store';
import { categoryColors } from '@/lib/classification';

export default function HistoryCompleted({ params }: { params: Promise<{ id: string }> }) {
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

  if (!screening.finalCategory) {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>Screening not yet complete.</p>
          <button className="btn btn-next" onClick={() => router.push(`/screening/${id}`)} style={{ marginTop: 16 }}>Go to Screening</button>
        </div>
        <Footer />
      </div>
    );
  }

  const cat = screening.finalCategory;
  const colors = categoryColors[cat];

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Screening ID: {id}</div>
          <div className="progress-bar">
            <div className="progress-step done" />
            <div className="progress-step done" />
            <div className="progress-step done" />
          </div>
          <div className="page-indicator">Step <span>3</span> of 3</div>
        </div>

        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>All Assessments Completed!</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.7 }}>
          Your screening results are now available on the gym dashboard.
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28, lineHeight: 1.7 }}>
          आपके स्क्रीनिंग परिणाम अब जिम डैशबोर्ड पर उपलब्ध हैं।
        </p>

        {/* Final Category Preview */}
        <div style={{
          display: 'inline-block', padding: '16px 32px', borderRadius: 16,
          background: colors.bg, border: `2px solid ${colors.border}`, marginBottom: 28,
        }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>{colors.emoji}</div>
        </div>

        <div className="disclaimer" style={{ textAlign: 'left', marginBottom: 24 }}>
          <strong>Important:</strong> Your results have been saved. The gym staff will share your detailed report with you shortly.
          <br />
          आपके परिणाम सहेज लिए गए हैं। जिम स्टाफ जल्द ही आपके साथ विस्तृत रिपोर्ट साझा करेगा।
        </div>

        <button
          className="btn btn-back"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
      <Footer />
    </div>
  );
}
