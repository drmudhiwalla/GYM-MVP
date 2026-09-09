'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { loadScreeningById, saveScreeningData } from '@/lib/screening-store';
import { calculateFinalCategory } from '@/lib/classification';

export default function ScreeningHistory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const screening = loadScreeningById(id);

  const [familyHistory, setFamilyHistory] = useState<string | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<string | null>(null);
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

  const familyQ = {
    en: 'Has your parent, brother, or sister had diabetes, high blood pressure, heart disease, or stroke?',
    hi: 'क्या आपके माता-पिता, भाई या बहन को कभी diabetes, High BP, Heart disease हुआ है?',
  };

  const familyOptions = [
    { value: 'no', en: 'No parents/ none in family', hi: 'माता-पिता/परिवार में कोई नहीं' },
    { value: 'one', en: 'One parent or sibling', hi: 'एक माता-पिता या भाई-बहन' },
    { value: 'both', en: 'Both parents', hi: 'दोनों माता-पिता' },
  ];

  const medicalQ = {
    en: 'Have you ever been diagnosed with or are you currently taking medicines for diabetes, high blood pressure, heart disease, or high cholesterol?',
    hi: 'क्या आपको कभी diabetes, high blood pressure, heart disease या High cholesterol का पता चला है, या क्या आप वर्तमान में इनमें से किसी के लिए दवा ले रहे हैं?',
  };

  const handleFinish = () => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    if (!familyHistory) { errs.family = 'Please select an option'; missing.push('Family History'); }
    if (!medicalHistory) { errs.medical = 'Please select Yes or No'; missing.push('Medical History'); }
    setErrors(errs);
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
      return;
    }

    const familyBool = familyHistory === 'yes' || familyHistory === 'one' || familyHistory === 'both';
    const medicalBool = medicalHistory === 'yes';

    const finalCat = calculateFinalCategory({
      bpCategory: screening.bpCategory!,
      medicalHistory: medicalBool,
      familyHistory: familyBool,
      bmiCategory: screening.bmiCategory!,
      sleepCategory: screening.sleepCategory!,
      stressCategory: screening.stressCategory!,
    });

    const updated = {
      ...screening,
      familyHistory: familyBool,
      medicalHistory: medicalBool,
      finalCategory: finalCat,
      status: 'COMPLETED' as const,
    };
    saveScreeningData(updated);
    router.push(`/screening/${id}/history/completed`);
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Screening ID: {id}</div>
          <div className="progress-bar">
            <div className="progress-step done" />
            <div className="progress-step done" />
            <div className="progress-step active" />
          </div>
          <div className="page-indicator">Step <span>3</span> of 3</div>
        </div>

        <div className="intro-section" style={{ marginBottom: 28 }}>
          <div className="intro-icon">📋</div>
          <h2>Family & Medical History</h2>
          <div className="hindi-title">पारिवारिक और चिकित्सा इतिहास</div>
          <p>Please answer the following questions about your family and medical history.</p>
          <p className="hindi-desc">कृपया अपने परिवार और चिकित्सा इतिहास के बारे में निम्नलिखित प्रश्नों के उत्तर दें।</p>
        </div>

        {/* Family History */}
        <div className="field-group">
          <div className="field-label" style={{ marginBottom: 8 }}>
            Q1. Family History <span className="hindi">पारिवारिक इतिहास</span> <span className="required">*</span>
          </div>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }}>
            {familyQ.en}
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
            {familyQ.hi}
          </p>
          <div className="radio-group">
            {familyOptions.map((opt) => (
              <label key={opt.value} className="radio-option">
                <input
                  type="radio"
                  name="family"
                  checked={familyHistory === opt.value}
                  onChange={() => { setFamilyHistory(opt.value); setErrors((p) => ({ ...p, family: '' })); }}
                />
                <span className="radio-circle" />
                <span className="radio-label">
                  {opt.en} <span className="hindi-option">{opt.hi}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.family && <div className="error-msg show">{errors.family}</div>}
        </div>

        {/* Medical History */}
        <div className="field-group">
          <div className="field-label" style={{ marginBottom: 8 }}>
            Q2. Medical History <span className="hindi">चिकित्सा इतिहास</span> <span className="required">*</span>
          </div>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }}>
            {medicalQ.en}
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
            {medicalQ.hi}
          </p>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="medical"
                checked={medicalHistory === 'yes'}
                onChange={() => { setMedicalHistory('yes'); setErrors((p) => ({ ...p, medical: '' })); }}
              />
              <span className="radio-circle" />
              <span className="radio-label">Yes <span className="hindi-option">हाँ</span></span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="medical"
                checked={medicalHistory === 'no'}
                onChange={() => { setMedicalHistory('no'); setErrors((p) => ({ ...p, medical: '' })); }}
              />
              <span className="radio-circle" />
              <span className="radio-label">No <span className="hindi-option">नहीं</span></span>
            </label>
          </div>
          {errors.medical && <div className="error-msg show">{errors.medical}</div>}
        </div>

        <div className="btn-row">
          <button className="btn btn-back" onClick={() => router.push(`/screening/${id}/stress`)}>&larr; Back</button>
          <button className="btn btn-next" onClick={handleFinish}>See Results &rarr;</button>
        </div>
      </div>
      <Footer />
      <ValidationModal isOpen={showModal} onClose={() => setShowModal(false)} missingFields={missingFields} />
    </div>
  );
}
