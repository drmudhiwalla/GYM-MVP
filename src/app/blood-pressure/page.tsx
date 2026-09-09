'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { useScreening } from '@/lib/context';
import { classifyBP } from '@/lib/classification';
import { Category } from '@/lib/types';

export default function BloodPressurePage() {
  const router = useRouter();
  const { state, updateState } = useScreening();
  const [systolic, setSystolic] = useState(state.bpSystolic > 0 ? String(state.bpSystolic) : '');
  const [diastolic, setDiastolic] = useState(state.bpDiastolic > 0 ? String(state.bpDiastolic) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const getPreview = (): { category: Category; label: string } | null => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) return null;
    const cat = classifyBP(sys, dia);
    const labels: Record<Category, string> = {
      GREEN: 'Normal',
      YELLOW: 'Elevated / Stage 1 HTN',
      RED: 'Stage 2+ HTN',
    };
    return { category: cat, label: labels[cat] };
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (!systolic.trim()) { errs.systolic = 'Required'; missing.push('Systolic (Upper number)'); }
    else if (isNaN(sys) || sys < 60 || sys > 250) { errs.systolic = 'Systolic: 60–250 mmHg'; missing.push('Systolic (60–250 mmHg)'); }

    if (!diastolic.trim()) { errs.diastolic = 'Required'; missing.push('Diastolic (Lower number)'); }
    else if (isNaN(dia) || dia < 30 || dia > 160) { errs.diastolic = 'Diastolic: 30–160 mmHg'; missing.push('Diastolic (30–160 mmHg)'); }

    if (!errs.systolic && !errs.diastolic && sys <= dia) {
      errs.systolic = 'Systolic must be higher than diastolic';
      missing.push('Systolic must be higher than Diastolic');
    }

    setErrors(errs);
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
    }
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const category = classifyBP(sys, dia);
    updateState({ bpSystolic: sys, bpDiastolic: dia, bpCategory: category });
    router.push('/bmi-bri');
  };

  const preview = getPreview();

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <ProgressBar currentStep={1} totalSteps={4} />

        <div className="intro-section" style={{ marginBottom: 28 }}>
          <div className="intro-icon">❤️</div>
          <h2>Blood Pressure</h2>
          <div className="hindi-title">रक्तचाप</div>
          <p>Enter your blood pressure readings. If you don&apos;t know, you can measure at the gym.</p>
          <p className="hindi-desc">अपना रक्तचाप दर्ज करें। यदि आपको पता नहीं है, तो जिम में माप सकते हैं।</p>
        </div>

        <div className="field-group">
          <div className="field-label">
            Systolic (Upper number) <span className="hindi">सिस्टोलिक (ऊपरी संख्या)</span> <span className="required">*</span>
          </div>
          <div className="field-hint">e.g., 120 mmHg</div>
          <input
            type="number"
            className={`text-input ${errors.systolic ? 'field-error' : ''}`}
            placeholder="e.g., 120"
            value={systolic}
            onChange={(e) => { setSystolic(e.target.value); setErrors((p) => ({ ...p, systolic: '' })); }}
            min={60}
            max={250}
          />
          {errors.systolic && <div className="error-msg show">{errors.systolic}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">
            Diastolic (Lower number) <span className="hindi">डायस्टोलिक (निचली संख्या)</span> <span className="required">*</span>
          </div>
          <div className="field-hint">e.g., 80 mmHg</div>
          <input
            type="number"
            className={`text-input ${errors.diastolic ? 'field-error' : ''}`}
            placeholder="e.g., 80"
            value={diastolic}
            onChange={(e) => { setDiastolic(e.target.value); setErrors((p) => ({ ...p, diastolic: '' })); }}
            min={30}
            max={160}
          />
          {errors.diastolic && <div className="error-msg show">{errors.diastolic}</div>}
        </div>

        {preview && (
          <div className="param-card" style={{ marginTop: 16 }}>
            <div className="param-left">
              <span className="param-icon">❤️</span>
              <div className="param-info">
                <span className="param-name">Blood Pressure</span>
                <span className="param-value">{systolic} / {diastolic} mmHg</span>
              </div>
            </div>
            <span className={`param-badge ${preview.category}`}>
              {preview.label}
            </span>
          </div>
        )}

        <div className="btn-row">
          <button className="btn btn-back" onClick={() => router.push('/consent')}>&larr; Back</button>
          <button className="btn btn-next" onClick={handleNext}>Next &rarr;</button>
        </div>
      </div>
      <Footer />
      <ValidationModal isOpen={showModal} onClose={() => setShowModal(false)} missingFields={missingFields} />
    </div>
  );
}
