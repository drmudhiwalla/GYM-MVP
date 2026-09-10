'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { ScreeningState } from '@/lib/context';
import { calculateSleepScore, SleepAnswers } from '@/lib/sleep';
import { classifySleep, categoryColors } from '@/lib/classification';
import { Category } from '@/lib/types';

export default function ScreeningSleep({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [screening, setScreening] = useState<ScreeningState | null>(null);
  const [loading, setLoading] = useState(true);

  const [bedHH, setBedHH] = useState('');
  const [bedMM, setBedMM] = useState('');
  const [bedAmPm, setBedAmPm] = useState<'AM' | 'PM'>('PM');
  const [wakeHH, setWakeHH] = useState('');
  const [wakeMM, setWakeMM] = useState('');
  const [wakeAmPm, setWakeAmPm] = useState<'AM' | 'PM'>('AM');
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const [latency, setLatency] = useState('');
  const [duration, setDuration] = useState('');
  const [waking, setWaking] = useState<number | null>(null);
  const [quality, setQuality] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateSleepScore> | null>(null);
  const [resultCategory, setResultCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

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
          <p style={{ color: '#64748b' }}>Screening not found. Please check the link.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    if (!bedHH.trim() || !bedMM.trim()) { errs.bedTime = 'Required'; missing.push('Bed time'); }
    if (!wakeHH.trim() || !wakeMM.trim()) { errs.wakeTime = 'Required'; missing.push('Wake up time'); }
    if (!latency.trim()) { errs.latency = 'Required'; missing.push('Minutes to fall asleep'); }
    if (!duration.trim()) { errs.duration = 'Required'; missing.push('Hours of sleep'); }
    if (waking === null) { errs.waking = 'Please select'; missing.push('Night waking frequency'); }
    if (quality === null) { errs.quality = 'Please select'; missing.push('Sleep quality rating'); }
    setErrors(errs);
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const answers: SleepAnswers = {
      bedHour: parseInt(bedHH) || 0,
      bedMinute: parseInt(bedMM) || 0,
      bedAmPm,
      wakeHour: parseInt(wakeHH) || 0,
      wakeMinute: parseInt(wakeMM) || 0,
      wakeAmPm,
      latency: parseInt(latency) || 0,
      duration: parseFloat(duration) || 0,
      waking: waking!,
      quality: quality!,
    };
    const res = calculateSleepScore(answers);
    const cat = classifySleep(res.globalScore);
    setResult(res);
    setResultCategory(cat);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (result && resultCategory) {
      fetch(`/api/screening/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sleepScore: result.globalScore, sleepCategory: resultCategory }),
      }).catch(() => {});
    }
    router.push(`/screening/${id}/sleep/completed`);
  };

  const wakingOptions = [
    { value: 0, en: 'Not during the past month', hi: 'पिछले 1 महीने में नहीं' },
    { value: 1, en: 'Less than once a week', hi: 'सप्ताह में 1 बार से कम' },
    { value: 2, en: 'Once or twice a week', hi: 'सप्ताह में 1–2 बार' },
    { value: 3, en: 'Three or more times a week', hi: 'सप्ताह में 3 या अधिक बार' },
  ];

  const qualityOptions = [
    { value: 0, en: 'Very Good', hi: 'बहुत अच्छी' },
    { value: 1, en: 'Fairly Good', hi: 'अच्छी' },
    { value: 2, en: 'Fairly Bad', hi: 'खराब' },
    { value: 3, en: 'Very Bad', hi: 'बहुत खराब' },
  ];

  if (showResult && result && resultCategory) {
    const colors = categoryColors[resultCategory];
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Your Sleep Quality Score</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>आपका नींद गुणवत्ता स्कोर</p>

          <div
            className="global-score-circle"
            style={{ background: colors.bg, border: `3px solid ${colors.border}`, margin: '0 auto 24px' }}
          >
            <div style={{ fontSize: 42, fontWeight: 800, color: colors.text, lineHeight: 1 }}>
              {result.globalScore}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>/ 15</div>
          </div>

          <div
            style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 10,
              background: colors.bg, color: colors.text, fontWeight: 600, fontSize: 15,
              marginBottom: 28,
            }}
          >
            {resultCategory === 'GREEN' && 'Healthy Sleep — स्वस्थ नींद'}
            {resultCategory === 'YELLOW' && 'Needs Attention — ध्यान देने की आवश्यकता'}
            {resultCategory === 'RED' && 'Poor Sleep Quality — खराब नींद की गुणवत्ता'}
          </div>

          <div className="components-list" style={{ textAlign: 'left' }}>
            {result.components.map((c, i) => (
              <div key={i} className="component-row">
                <span className="component-name">{c.name}</span>
                <span className="component-score">{c.score} / {c.max}</span>
              </div>
            ))}
          </div>

          <button className="score-btn" onClick={handleContinue}>Continue &rarr;</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Screening ID: {id}</div>
          <div className="progress-bar">
            <div className="progress-step active" />
            <div className="progress-step" />
            <div className="progress-step" />
          </div>
          <div className="page-indicator">Step <span>1</span> of 3</div>
        </div>

        <div className="intro-section" style={{ marginBottom: 28 }}>
          <div className="intro-icon">🌙</div>
          <h2>Sleep Quality Assessment</h2>
          <div className="hindi-title">पिछले 1 महीने की नींद का आकलन</div>
          <p>The following questions relate to your usual sleep habits during the past one month.</p>
          <p className="hindi-desc">निम्नलिखित प्रश्न पिछले 1 महीने के दौरान आपकी सामान्य नींद की आदतों से संबंधित हैं।</p>
        </div>

        <div className="field-group">
          <div className="field-label">
            What time do you usually go to bed at night? <span className="required">*</span>
          </div>
          <div className="field-hint">पिछले 1 महीने में आप सामान्यतः रात को किस समय सोने जाते हैं?</div>
          <div className="time-input-group">
            <select className={`ampm-select ${errors.bedTime ? 'field-error' : ''}`} value={bedHH}
              onChange={(e) => { setBedHH(e.target.value); setErrors((p) => ({ ...p, bedTime: '' })); }}>
              <option value="">HH</option>
              {hours.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="time-separator">:</span>
            <select className={`ampm-select ${errors.bedTime ? 'field-error' : ''}`} value={bedMM}
              onChange={(e) => { setBedMM(e.target.value); setErrors((p) => ({ ...p, bedTime: '' })); }}>
              <option value="">MM</option>
              {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="ampm-select" value={bedAmPm} onChange={(e) => setBedAmPm(e.target.value as 'AM' | 'PM')}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors.bedTime && <div className="error-msg show">{errors.bedTime}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">
            What time do you usually wake up in the morning? <span className="required">*</span>
          </div>
          <div className="field-hint">पिछले 1 महीने में आप सामान्यतः सुबह किस समय उठते हैं?</div>
          <div className="time-input-group">
            <select className={`ampm-select ${errors.wakeTime ? 'field-error' : ''}`} value={wakeHH}
              onChange={(e) => { setWakeHH(e.target.value); setErrors((p) => ({ ...p, wakeTime: '' })); }}>
              <option value="">HH</option>
              {hours.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="time-separator">:</span>
            <select className={`ampm-select ${errors.wakeTime ? 'field-error' : ''}`} value={wakeMM}
              onChange={(e) => { setWakeMM(e.target.value); setErrors((p) => ({ ...p, wakeTime: '' })); }}>
              <option value="">MM</option>
              {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="ampm-select" value={wakeAmPm} onChange={(e) => setWakeAmPm(e.target.value as 'AM' | 'PM')}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors.wakeTime && <div className="error-msg show">{errors.wakeTime}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">
            How many minutes does it usually take you to fall asleep? <span className="required">*</span>
          </div>
          <div className="field-hint">e.g., 20 or 30 minutes &nbsp;|&nbsp; आपको सामान्यतः सोने में कितने मिनट लगते हैं?</div>
          <input type="number" className={`text-input ${errors.latency ? 'field-error' : ''}`} placeholder="Minutes" value={latency}
            onChange={(e) => { setLatency(e.target.value); setErrors((p) => ({ ...p, latency: '' })); }} />
          {errors.latency && <div className="error-msg show">{errors.latency}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">
            On average, how many hours of actual sleep do you get each night? <span className="required">*</span>
          </div>
          <div className="field-hint">e.g., 6.5 hours &nbsp;|&nbsp; औसतन आपको प्रतिदिन रात में कितने घंटे की वास्तविक नींद मिलती है?</div>
          <input type="number" step="0.5" className={`text-input ${errors.duration ? 'field-error' : ''}`} placeholder="Hours" value={duration}
            onChange={(e) => { setDuration(e.target.value); setErrors((p) => ({ ...p, duration: '' })); }} />
          {errors.duration && <div className="error-msg show">{errors.duration}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">
            During the past month, how often did you wake up in the middle of the night or very early? <span className="required">*</span>
          </div>
          <div className="field-hint" style={{ marginBottom: 12 }}>पिछले 1 महीने में आप कितनी बार रात में बीच में या बहुत सुबह जाग गए?</div>
          <div className="radio-group">
            {wakingOptions.map((opt) => (
              <label key={opt.value} className="radio-option">
                <input type="radio" name="waking" value={opt.value} checked={waking === opt.value}
                  onChange={() => { setWaking(opt.value); setErrors((p) => ({ ...p, waking: '' })); }} />
                <span className="radio-circle" />
                <span className="radio-label">{opt.en} <span className="hindi-option">{opt.hi}</span></span>
              </label>
            ))}
          </div>
          {errors.waking && <div className="error-msg show">{errors.waking}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">
            How would you rate your overall sleep quality? <span className="required">*</span>
          </div>
          <div className="field-hint" style={{ marginBottom: 12 }}>आप अपनी कुल नींद की गुणवत्ता को कैसे आंकेंगे?</div>
          <div className="radio-group">
            {qualityOptions.map((opt) => (
              <label key={opt.value} className="radio-option">
                <input type="radio" name="quality" value={opt.value} checked={quality === opt.value}
                  onChange={() => { setQuality(opt.value); setErrors((p) => ({ ...p, quality: '' })); }} />
                <span className="radio-circle" />
                <span className="radio-label">{opt.en} <span className="hindi-option">{opt.hi}</span></span>
              </label>
            ))}
          </div>
          {errors.quality && <div className="error-msg show">{errors.quality}</div>}
        </div>

        <div className="btn-row">
          <button className="btn btn-back" onClick={() => router.push(`/screening/${id}`)}>&larr; Back</button>
          <button className="btn btn-submit" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
      <Footer />
      <ValidationModal isOpen={showModal} onClose={() => setShowModal(false)} missingFields={missingFields} />
    </div>
  );
}
