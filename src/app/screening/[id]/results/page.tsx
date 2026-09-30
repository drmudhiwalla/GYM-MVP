'use client';

import { use, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { useScreening } from '@/lib/screening-api';
import { Category } from '@/lib/types';
import PDFReport from '@/components/PDFReport';
import {
  IconHeartPulse,
  IconScale,
  IconMoon,
  IconBrain,
  IconUsers,
  IconMedical,
  IconSmoke,
  IconRuler,
  IconDumbbell,
} from '@/components/ReportIcons';

const catMeta: Record<Category, { title: string; color: string; desc: string }> = {
  GREEN: {
    title: 'Low Risk',
    color: '#16A34A',
    desc: 'You are in a healthy zone. Keep up what is working.',
  },
  YELLOW: {
    title: 'Potential Risk',
    color: '#F59E0B',
    desc: 'A few factors need attention before they progress.',
  },
  RED: {
    title: 'High Risk',
    color: '#EF4444',
    desc: 'We strongly recommend booking a clinician consultation.',
  },
};

const segColor: Record<Category, string> = {
  GREEN: '#16A34A',
  YELLOW: '#F59E0B',
  RED: '#EF4444',
};

const categoryLabel: Record<Category, string> = {
  GREEN: 'NORMAL',
  YELLOW: 'MODERATE',
  RED: 'HIGH',
};

function RiskGauge({ score }: { score: number }) {
  const cx = 120;
  const cy = 120;
  const r = 92;
  const frac = Math.max(0, Math.min(1, score / 5));
  const ang = Math.PI * (1 - frac);
  const nx = cx + (r - 34) * Math.cos(ang);
  const ny = cy - (r - 34) * Math.sin(ang);
  const px = cx + r * Math.cos(ang);
  const py = cy - r * Math.sin(ang);
  return (
    <svg width="240" height="140" viewBox="0 0 240 140" aria-hidden="true">
      <defs>
        <linearGradient id="srRiskGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="url(#srRiskGrad)"
        strokeWidth="17"
        strokeLinecap="round"
      />
      <circle cx={px} cy={py} r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="9" fill="#0F172A" />
      <circle cx={cx} cy={cy} r="3.5" fill="#FFFFFF" />
      <text x={cx - r} y="138" fontSize="11" fontWeight="600" fill="#64748B" letterSpacing="1" textAnchor="middle">LOW</text>
      <text x={cx + r} y="138" fontSize="11" fontWeight="600" fill="#64748B" letterSpacing="1" textAnchor="middle">HIGH</text>
    </svg>
  );
}

export default function ScreeningResults({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { screening, loading } = useScreening(id);

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
  const meta = catMeta[cat];
  const riskScore = cat === 'GREEN' ? 1 : cat === 'YELLOW' ? 3 : 5;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const bpSys = screening.bpSystolic ?? 0;
  const bpDia = screening.bpDiastolic ?? 0;
  const sleep = screening.sleepScore ?? 0;
  const stress = screening.stressScore ?? 0;

  const smokingValue =
    screening.smokingCurrent ? 'Current smoker'
    : screening.smokingPast ? 'Former smoker'
    : 'Never smoked';

  const factorCards = [
    {
      icon: <IconHeartPulse />,
      bg: '#FEE2E2',
      fg: '#EF4444',
      name: 'Blood Pressure',
      value: `${bpSys} / ${bpDia}`,
      unit: 'mmHg',
      cat: screening.bpCategory!,
    },
    {
      icon: <IconScale />,
      bg: '#EDE9FE',
      fg: '#7C3AED',
      name: 'Body Roundness',
      value: `${screening.briValue ?? '—'}`,
      unit: 'BRI',
      cat: (screening.briCategory ?? 'GREEN') as Category,
    },
    {
      icon: <IconMoon />,
      bg: '#E0E7FF',
      fg: '#4F46E5',
      name: 'Sleep Quality',
      value: `${sleep}`,
      unit: '/ 15',
      cat: screening.sleepCategory!,
    },
    {
      icon: <IconBrain />,
      bg: '#FEF3C7',
      fg: '#D97706',
      name: 'Stress Level',
      value: `${stress}`,
      unit: '/ 16',
      cat: screening.stressCategory!,
    },
    {
      icon: <IconUsers />,
      bg: '#DCFCE7',
      fg: '#16A34A',
      name: 'Family History',
      value: screening.familyHistory ? 'Present' : 'None',
      unit: '',
      cat: (screening.familyHistory ? 'YELLOW' : 'GREEN') as Category,
    },
    {
      icon: <IconMedical />,
      bg: '#CCFBF1',
      fg: '#0D9488',
      name: 'Medical History',
      value: screening.medicalHistory ? 'Present' : 'None',
      unit: '',
      cat: (screening.medicalHistory ? 'RED' : 'GREEN') as Category,
    },
    {
      icon: <IconSmoke />,
      bg: '#FCE7F3',
      fg: '#DB2777',
      name: 'Smoking',
      value: smokingValue,
      unit: '',
      cat: (screening.smokingCategory ?? 'GREEN') as Category,
    },
  ];

  const recommendations: string[] = [];
  if (screening.bpCategory === 'RED' || screening.bpCategory === 'YELLOW') recommendations.push('Monitor blood pressure & watch salt intake');
  if (screening.briCategory === 'RED' || screening.briCategory === 'YELLOW') recommendations.push('Eat balanced, move daily');
  if (screening.sleepCategory === 'RED' || screening.sleepCategory === 'YELLOW') recommendations.push('Aim for 7–9 hours of consistent sleep');
  if (screening.stressCategory === 'RED' || screening.stressCategory === 'YELLOW') recommendations.push('Practise daily stress-management');
  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining your healthy lifestyle');
    recommendations.push('Keep regular annual health check-ups');
  }

  return (
    <div className="form-wrapper">
      <div
        className="form-container"
        style={{
          maxWidth: 880,
          padding: 0,
          overflow: 'visible',
          background: 'transparent',
          backdropFilter: 'none',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <div className="sr-page">
          <div className="sr-head">
            <div>
              <div className="sr-brand-name">
                  DrMudhiwalla <span className="sr-brand-ital">HealthTech</span>
                </div>
                <div className="sr-brand-tag">Pvt Ltd · Diagnostic &amp; Lifestyle Screening</div>
            </div>
            <div className="sr-head-right">
              <div className="sr-head-title">Screening Report</div>
              <div className="sr-head-under">Wellness &amp; Risk Profile</div>
              <div className="sr-head-date">
                {formatDate(screening.createdAt)} · {formatTime(screening.createdAt)} · Ref: {screening.screeningId}
              </div>
            </div>
          </div>
          <div className="sr-accent" />

          <div className="sr-body">
            {/* Patient hero */}
            <div className="sr-hero">
              <div className="sr-hero-id">
                <div className="sr-hero-kicker">Health Screening Report</div>
                <div className="sr-hero-name">{screening.name}</div>
                <div className="sr-hero-sub">
                  {screening.age} yrs · {screening.gender.charAt(0).toUpperCase() + screening.gender.slice(1)}
                </div>
              </div>
              <div className="sr-vitals">
                <div className="sr-vital">
                  <span className="sr-vital-ic" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                    <IconRuler />
                  </span>
                  <span className="sr-vital-val">
                    {screening.heightCm || '—'} <i>cm</i>
                  </span>
                  <span className="sr-vital-label">Height</span>
                </div>
                <div className="sr-vital">
                  <span className="sr-vital-ic" style={{ background: '#FEF3C7', color: '#D97706' }}>
                    <IconDumbbell />
                  </span>
                  <span className="sr-vital-val">
                    {screening.weightKg || '—'} <i>kg</i>
                  </span>
                  <span className="sr-vital-label">Weight</span>
                </div>
              </div>
            </div>

            {/* Overall lifestyle risk profile */}
            <div className="sr-overall">
              <div className="sr-gauge">
                <RiskGauge score={riskScore} />
                <div className="sr-gauge-score">
                  {riskScore} <span>/ 5</span>
                </div>
                <div className="sr-gauge-cap">Overall Score</div>
              </div>
              <div className="sr-overall-info">
                <div className="sr-overall-kicker">Overall Lifestyle Risk</div>
                <div className={`sr-overall-title ${cat}`}>{meta.title}</div>
                <p className="sr-overall-desc">{meta.desc}</p>
                <div className="sr-risk-bar">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`sr-risk-seg ${i <= riskScore ? 'filled' : ''}`} style={{ '--seg': segColor[cat] } as CSSProperties} />
                  ))}
                </div>
              </div>
            </div>

            {/* Screened factors */}
            <div className="sr-sec">
              <div className="sr-sec-title">Screened Factors</div>
              <div className="sr-sec-sub">Six parameters</div>
            </div>

            <div className="sr-cards">
              {factorCards.map((f, i) => (
                <div key={i} className="sr-card">
                  <span className="sr-card-ic" style={{ background: f.bg, color: f.fg }}>{f.icon}</span>
                  <div className="sr-card-info">
                    <div className="sr-card-top">
                      <div className="sr-card-name">{f.name}</div>
                      <span className={`sr-badge ${f.cat}`}>{categoryLabel[f.cat]}</span>
                    </div>
                    <div className="sr-card-val">
                      {f.value} {f.unit && <span>{f.unit}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key recommendations */}
            <div className="sr-sec">
              <div className="sr-sec-title">Key Recommendations</div>
              <div className="sr-sec-sub">Quick plan</div>
            </div>

            <div className="sr-reco">
              <div className="sr-reco-title">Key Recommendations</div>
              <div className="sr-reco-grid">
                {recommendations.map((rec, i) => (
                  <div key={i} className="sr-reco-item">
                    <div className="sr-reco-ic">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="sr-reco-text">{rec}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '22px 0 6px' }}>
              <PDFReport state={screening} />
            </div>
          </div>

          <div className="sr-foot">
            <div className="sr-disc">
              <strong>Disclaimer:</strong> This screening is for health awareness only and does not replace a medical
              diagnosis or consultation. Please consult a healthcare professional for a detailed evaluation.
            </div>
            <div className="sr-company">
              <b>DrMudhiwalla HealthTech Pvt Ltd</b><br />
              Diagnostic &amp; Lifestyle Screening Centre<br />
              www.drmudhiwalla.com · +91 98765 43210
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}