'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { loadScreeningById, saveScreeningData } from '@/lib/screening-store';
import { stressQuestions, stressOptions, calculateStressScore } from '@/lib/stress';
import { classifyStress, categoryColors } from '@/lib/classification';
import { Category } from '@/lib/types';

export default function ScreeningStress({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const screening = loadScreeningById(id);

  const [answers, setAnswers] = useState<Record<string, number | null>>({
    q1: null, q2: null, q3: null, q4: null,
  });
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

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

  const handleSelect = (qId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    setErrors((prev) => ({ ...prev, [qId]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    stressQuestions.forEach((q, idx) => {
      if (answers[q.id] === null) {
        errs[q.id] = 'Please select an answer';
        missing.push(`Question ${idx + 1}`);
      }
    });
    setErrors(errs);
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const stressScore = calculateStressScore({
      q1: answers.q1!,
      q2: answers.q2!,
      q3: answers.q3!,
      q4: answers.q4!,
    });
    const cat = classifyStress(stressScore);
    setScore(stressScore);
    setCategory(cat);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (category) {
      const updated = { ...screening, stressScore: score, stressCategory: category };
      saveScreeningData(updated);
    }
    router.push(`/screening/${id}/stress/completed`);
  };

  if (showResult && category) {
    const colors = categoryColors[category];
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Decode Your Stress Level</h2>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 4 }}>अपने तनाव स्तर को जानिए</p>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Perceived Stress Scale (PSS-4)</p>

          <div
            className="global-score-circle"
            style={{ background: colors.bg, border: `3px solid ${colors.border}`, margin: '0 auto 24px' }}
          >
            <div style={{ fontSize: 42, fontWeight: 800, color: colors.text, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>/ 16</div>
          </div>

          <div
            style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 10,
              background: colors.bg, color: colors.text, fontWeight: 600, fontSize: 15,
              marginBottom: 28,
            }}
          >
            {category === 'GREEN' && 'Low Stress — कम तनाव'}
            {category === 'YELLOW' && 'Moderate Stress — मध्यम तनाव'}
            {category === 'RED' && 'High Stress — उच्च तनाव'}
          </div>

          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20, lineHeight: 1.6 }}>
            <strong>Scoring:</strong> 0–4 Low &nbsp;|&nbsp; 5–7 Moderate &nbsp;|&nbsp; 8–16 High
            <br />
            Questions 2 &amp; 3 are reverse scored (higher confidence = lower stress).
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
            <div className="progress-step done" />
            <div className="progress-step active" />
            <div className="progress-step" />
          </div>
          <div className="page-indicator">Step <span>2</span> of 3</div>
        </div>

        <div className="intro-section" style={{ marginBottom: 28 }}>
          <div className="intro-icon">🧠</div>
          <h2>Decode Your Stress Level</h2>
          <div className="hindi-title">अपने तनाव स्तर को जानिए</div>
          <p style={{ marginBottom: 8 }}>Simple &amp; Quick 4-Question Assessment.</p>
          <p style={{ marginBottom: 8 }}>Each level contains one simple challenge — answer honestly, the answer that comes to your mind instantly.</p>
          <p className="hindi-desc" style={{ marginBottom: 4 }}>केवल 4 प्रश्नों का सरल उपाय, अपने तनाव स्तर जानिए।</p>
          <p className="hindi-desc" style={{ marginBottom: 4 }}>हर स्तर पर एक सरल प्रश्न होगा। उत्तर सबसे पहले आपके मन में आए, वही चुनें।</p>
          <p className="hindi-desc">यहाँ कोई सही या गलत उत्तर नहीं है।</p>
        </div>

        {stressQuestions.map((q, idx) => (
          <div key={q.id} className="field-group">
            <div className="field-label">
              Question {idx + 1}:
            </div>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }}>
              {q.en}
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
              {q.hi}
            </p>
            <div className="radio-group">
              {stressOptions.map((opt) => (
                <label key={opt.value} className="radio-option">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => handleSelect(q.id, opt.value)}
                  />
                  <span className="radio-circle" />
                  <span className="radio-label">
                    {opt.en} <span className="hindi-option">{opt.hi}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors[q.id] && <div className="error-msg show">{errors[q.id]}</div>}
          </div>
        ))}

        <div className="btn-row">
          <button className="btn btn-back" onClick={() => router.push(`/screening/${id}/sleep`)}>&larr; Back</button>
          <button className="btn btn-submit" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
      <Footer />
      <ValidationModal isOpen={showModal} onClose={() => setShowModal(false)} missingFields={missingFields} />
    </div>
  );
}
