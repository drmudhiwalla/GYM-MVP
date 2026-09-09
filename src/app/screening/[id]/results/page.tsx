'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { loadScreeningById } from '@/lib/screening-store';
import { categoryColors } from '@/lib/classification';
import { Category } from '@/lib/types';
import PDFReport from '@/components/PDFReport';

const categoryBg: Record<Category, string> = {
  GREEN: '#dcfce7',
  YELLOW: '#fef9c3',
  RED: '#fee2e2',
};

const categoryText: Record<Category, string> = {
  GREEN: '#16a34a',
  YELLOW: '#ca8a04',
  RED: '#dc2626',
};

const categoryLabel: Record<Category, string> = {
  GREEN: 'NORMAL',
  YELLOW: 'MODERATE',
  RED: 'HIGH',
};

export default function ScreeningResults({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const screening = loadScreeningById(id);

  if (!screening) {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', marginBottom: 20 }}>Screening not found. Please check the link.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!screening.finalCategory) {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Screening Incomplete</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>
            Please complete all assessments to view your results.
          </p>
          <button className="btn btn-next" onClick={() => router.push(`/screening/${id}/sleep`)}>Continue Assessment</button>
        </div>
        <Footer />
      </div>
    );
  }

  const cat = screening.finalCategory;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const params_list = [
    { icon: 'BP', name: 'Blood Pressure', value: `${screening.bpSystolic} / ${screening.bpDiastolic} mmHg`, category: screening.bpCategory!, iconBg: '#fee2e2', iconColor: '#dc2626' },
    { icon: 'BMI', name: 'BMI', value: `${screening.bmiValue} kg/m²`, category: screening.bmiCategory!, iconBg: '#dbeafe', iconColor: '#2563eb' },
    { icon: 'ZZZ', name: 'Sleep Quality', value: `${screening.sleepScore} / 15`, category: screening.sleepCategory!, iconBg: '#e0e7ff', iconColor: '#6366f1' },
    { icon: 'ST', name: 'Stress Level', value: `${screening.stressScore} / 16`, category: screening.stressCategory!, iconBg: '#ffedd5', iconColor: '#ea580c' },
    { icon: 'FH', name: 'Family History', value: screening.familyHistory ? 'Yes' : 'No', category: (screening.familyHistory ? 'YELLOW' : 'GREEN') as Category, iconBg: '#fef9c3', iconColor: '#ca8a04' },
    { icon: 'MH', name: 'Medical History', value: screening.medicalHistory ? 'Yes' : 'No', category: (screening.medicalHistory ? 'RED' : 'GREEN') as Category, iconBg: '#fee2e2', iconColor: '#dc2626' },
  ];

  const riskScore = cat === 'GREEN' ? 1 : cat === 'YELLOW' ? 3 : 5;

  const recommendations: string[] = [];
  if (screening.bpCategory === 'RED' || screening.bpCategory === 'YELLOW') recommendations.push('Monitor blood pressure regularly');
  if (screening.bmiCategory === 'RED' || screening.bmiCategory === 'YELLOW') recommendations.push('Maintain a balanced diet rich in fruits & vegetables');
  if (screening.sleepCategory === 'RED' || screening.sleepCategory === 'YELLOW') recommendations.push('Aim for 7-9 hours of quality sleep each night');
  if (screening.stressCategory === 'RED' || screening.stressCategory === 'YELLOW') recommendations.push('Practice stress-management techniques daily');
  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining your healthy lifestyle');
    recommendations.push('Regular health check-ups are recommended');
  }

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ maxWidth: 800, padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div className="report-header">
          <div>
            <div className="report-header-brand">DrMudhiwalla</div>
            <div className="report-header-sub">HealthCare</div>
          </div>
          <div className="report-header-date">
            <div>Test Date: {formatDate(screening.createdAt)}</div>
            <div>Test Time: {formatTime(screening.createdAt)}</div>
          </div>
        </div>

        <div className="report-body">

          {/* Greeting */}
          <div style={{ marginBottom: 16 }}>
            <div className="report-greeting">
              Hello, {screening.name.split(' ')[0]} <span style={{ fontWeight: 400, fontSize: 16 }}>👋</span>
            </div>
            <div className="report-greeting-sub">Here&apos;s your health screening summary</div>
          </div>

          {/* Info Pills */}
          <div className="report-info-row">
            {[
              { label: 'Name', value: screening.name },
              { label: 'Age', value: `${screening.age} yrs` },
              { label: 'WhatsApp', value: screening.whatsappNumber },
            ].map((item, i) => (
              <div key={i} className="report-info-pill">
                <div className="report-info-pill-label">{item.label}</div>
                <div className="report-info-pill-value">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Physical + Gauge */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div className="report-physical-row">
                <div style={{ textAlign: 'center' }}>
                  <div className="report-physical-icon" style={{ background: '#ffedd5' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4" />
                    </svg>
                  </div>
                  <div className="report-physical-val">{screening.heightCm || '—'}cm</div>
                  <div className="report-physical-label">Height</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="report-physical-icon" style={{ background: '#dbeafe' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="3" /><path d="M6.5 8a2 2 0 0 0-1.9 1.3L2 17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2l-2.6-7.7A2 2 0 0 0 17.5 8z" />
                    </svg>
                  </div>
                  <div className="report-physical-val">{screening.weightKg || '—'}kg</div>
                  <div className="report-physical-label">Weight</div>
                </div>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="report-gauge">
              <div className="report-gauge-title">Potential Risk</div>
              <div style={{ position: 'relative', width: 110, height: 60, margin: '0 auto' }}>
                <svg width="110" height="60" viewBox="0 0 120 65">
                  <path d="M 10 60 A 50 50 0 0 1 35 12" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 35 12 A 50 50 0 0 1 85 12" fill="none" stroke="#eab308" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 85 12 A 50 50 0 0 1 110 60" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                  {(() => {
                    const angle = Math.PI - (riskScore / 5) * Math.PI;
                    const nx = 60 + 40 * Math.cos(angle);
                    const ny = 60 + 40 * Math.sin(angle);
                    return <line x1="60" y1="60" x2={nx} y2={ny} stroke="#0f172a" strokeWidth="2" />;
                  })()}
                  <circle cx="60" cy="60" r="4" fill="#0f172a" />
                </svg>
              </div>
              <div className="report-gauge-score">{riskScore} / 5</div>
            </div>
          </div>

          {/* Section Header */}
          <div className="report-section-header">Lifestyle Risk Profile & Summary</div>

          {/* Parameter Cards */}
          <div className="report-param-grid">
            {params_list.map((p, i) => (
              <div key={i} className="report-param-card">
                <div className="report-param-icon" style={{ background: p.iconBg, color: p.iconColor }}>
                  {p.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="report-param-label">{p.name}</div>
                  <div className="report-param-value">{p.value}</div>
                  <span className="report-param-badge" style={{ background: categoryBg[p.category], color: categoryText[p.category] }}>
                    {categoryLabel[p.category]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="report-reco-card">
            <div className="report-reco-title">Key Recommendations</div>
            <div className="report-reco-grid">
              {recommendations.map((rec, i) => (
                <div key={i} className="report-reco-item">
                  <div className="report-reco-check">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="report-reco-text">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <PDFReport state={screening} />
          </div>

          {/* Disclaimer */}
          <div className="disclaimer" style={{ marginBottom: 0 }}>
            <strong>Important:</strong> This screening is for health awareness only and does not replace medical diagnosis or consultation. Please consult a healthcare professional for detailed evaluation.
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <span>DrMudhiwalla HealthTech Pvt Ltd | CIN: U86201DL2025PTC451980 | GST: 07AALCD8789M1ZL</span>
          <span>www.drmudhiwalla.com | +91 98765 43210</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}
