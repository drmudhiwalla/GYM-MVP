'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { useScreening } from '@/lib/context';
import { classifyBMI } from '@/lib/classification';
import { Category } from '@/lib/types';

export default function BMIPage() {
  const router = useRouter();
  const { state, updateState } = useScreening();
  const [height, setHeight] = useState(state.heightCm > 0 ? String(state.heightCm) : '');
  const [weight, setWeight] = useState(state.weightKg > 0 ? String(state.weightKg) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const getBMIPreview = (): { value: number; category: Category } | null => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return null;
    return classifyBMI(h, w);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!height.trim()) { errs.height = 'Required'; missing.push('Height (cm)'); }
    else if (isNaN(h) || h < 100 || h > 250) { errs.height = 'Height: 100–250 cm'; missing.push('Height (100–250 cm)'); }

    if (!weight.trim()) { errs.weight = 'Required'; missing.push('Weight (kg)'); }
    else if (isNaN(w) || w < 20 || w > 300) { errs.weight = 'Weight: 20–300 kg'; missing.push('Weight (20–300 kg)'); }

    setErrors(errs);
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
    }
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const bmi = classifyBMI(h, w);
    updateState({
      heightCm: h, weightKg: w,
      bmiValue: bmi.value, bmiCategory: bmi.category,
    });
    router.push('/link-sent');
  };

  const bmiPreview = getBMIPreview();

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <ProgressBar currentStep={2} totalSteps={4} />

        <div className="intro-section" style={{ marginBottom: 28 }}>
          <div className="intro-icon">📐</div>
          <h2>BMI Calculator</h2>
          <div className="hindi-title">बीएमआई कैलकुलेटर</div>
          <p>Enter your height and weight to calculate BMI (Body Mass Index).</p>
          <p className="hindi-desc">बीएमआई की गणना के लिए अपनी ऊंचाई और वजन दर्ज करें।</p>
        </div>

        <div className="field-group">
          <div className="field-label">
            Height (cm) <span className="hindi">ऊंचाई (सेमी)</span> <span className="required">*</span>
          </div>
          <input
            type="number"
            className={`text-input ${errors.height ? 'field-error' : ''}`}
            placeholder="e.g., 170"
            value={height}
            onChange={(e) => { setHeight(e.target.value); setErrors((p) => ({ ...p, height: '' })); }}
          />
          {errors.height && <div className="error-msg show">{errors.height}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">
            Weight (kg) <span className="hindi">वजन (किलो)</span> <span className="required">*</span>
          </div>
          <input
            type="number"
            className={`text-input ${errors.weight ? 'field-error' : ''}`}
            placeholder="e.g., 65"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setErrors((p) => ({ ...p, weight: '' })); }}
          />
          {errors.weight && <div className="error-msg show">{errors.weight}</div>}
        </div>

        {bmiPreview && (
          <div className="param-card" style={{ marginTop: 16 }}>
            <div className="param-left">
              <span className="param-icon">📏</span>
              <div className="param-info">
                <span className="param-name">BMI</span>
                <span className="param-value">{bmiPreview.value} kg/m²</span>
              </div>
            </div>
            <span className={`param-badge ${bmiPreview.category}`}>{bmiPreview.category}</span>
          </div>
        )}

        <div className="btn-row">
          <button className="btn btn-back" onClick={() => router.push('/blood-pressure')}>&larr; Back</button>
          <button className="btn btn-next" onClick={handleNext}>Next &rarr;</button>
        </div>
      </div>
      <Footer />
      <ValidationModal isOpen={showModal} onClose={() => setShowModal(false)} missingFields={missingFields} />
    </div>
  );
}
