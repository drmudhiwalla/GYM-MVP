'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { useScreening, patchScreening } from '@/lib/screening-api';
import { calculateFinalCategory, classifySmoking } from '@/lib/classification';

export default function ScreeningHistory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { screening, loading } = useScreening(id);

  const [familyHistory, setFamilyHistory] = useState<string | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<string | null>(null);
  const [smokingCurrent, setSmokingCurrent] = useState<string | null>(null);
  const [smokingPast, setSmokingPast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

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

  const smokingQ = {
    en: 'Do you currently smoke any tobacco products, such as cigarettes, bidi or hookah?',
    hi: 'क्या आप वर्तमान में कोई तंबाकू उत्पाद, जैसे सिगरेट, बीड़ी या हुक्का, पीते हैं?',
  };

  const smokingPastQ = {
    en: 'In the past, did you ever smoke any tobacco products?',
    hi: 'क्या आपने पहले कभी कोई तंबाकू उत्पाद, जैसे सिगरेट, बीड़ी या हुक्का, पिया था?',
  };

  const yesNoOptions = [
    { value: 'yes', en: 'Yes', hi: 'हाँ' },
    { value: 'no', en: 'No', hi: 'नहीं' },
  ];

  const handleFinish = async () => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    if (!familyHistory) { errs.family = 'Please select an option'; missing.push('Family History'); }
    if (!medicalHistory) { errs.medical = 'Please select Yes or No'; missing.push('Medical History'); }
    if (!smokingCurrent) { errs.smokingCurrent = 'Please select Yes or No'; missing.push('Smoking · Current'); }
    if (!smokingPast) { errs.smokingPast = 'Please select Yes or No'; missing.push('Smoking · Past'); }
    setErrors(errs);
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
      return;
    }

    const familyBool = familyHistory === 'one' || familyHistory === 'both';
    const medicalBool = medicalHistory === 'yes';
    const currentBool = smokingCurrent === 'yes';
    const pastBool = smokingPast === 'yes';
    const smokingCat = classifySmoking(currentBool, pastBool);

    const finalCat = calculateFinalCategory({
      bpCategory: screening!.bpCategory!,
      medicalHistory: medicalBool,
      familyHistory: familyBool,
      bmiCategory: screening!.bmiCategory!,
      sleepCategory: screening!.sleepCategory!,
      stressCategory: screening!.stressCategory!,
    });

    try {
      await patchScreening(id, {
        familyHistory: familyBool,
        medicalHistory: medicalBool,
        smokingCurrent: currentBool,
        smokingPast: pastBool,
        smokingCategory: smokingCat,
        finalCategory: finalCat,
        status: 'COMPLETED',
      });
    } catch {
      alert('Could not save results. Please try again.');
      return;
    }

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
          <h2>Family, Medical &amp; Smoking History</h2>
          <div className="hindi-title">पारिवारिक, चिकित्सा और धूम्रपान इतिहास</div>
          <p>Please answer the following questions about your family, medical and smoking history.</p>
          <p className="hindi-desc">कृपया अपने परिवार, चिकित्सा और धूम्रपान इतिहास के बारे में निम्नलिखित प्रश्नों के उत्तर दें।</p>
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

        {/* Smoking — Current */}
        <div className="field-group">
          <div className="field-label" style={{ marginBottom: 8 }}>
            Q3. Smoking <span className="hindi">धूम्रपान</span> <span className="required">*</span>
          </div>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }}>
            {smokingQ.en}
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
            {smokingQ.hi}
          </p>
          <div className="radio-group">
            {yesNoOptions.map((opt) => (
              <label key={opt.value} className="radio-option">
                <input
                  type="radio"
                  name="smokingCurrent"
                  checked={smokingCurrent === opt.value}
                  onChange={() => { setSmokingCurrent(opt.value); setErrors((p) => ({ ...p, smokingCurrent: '' })); }}
                />
                <span className="radio-circle" />
                <span className="radio-label">
                  {opt.en} <span className="hindi-option">{opt.hi}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.smokingCurrent && <div className="error-msg show">{errors.smokingCurrent}</div>}
        </div>

        {/* Smoking — Past */}
        <div className="field-group">
          <div className="field-label" style={{ marginBottom: 8 }}>
            Q4. Smoking <span className="hindi">धूम्रपान</span> <span className="required">*</span>
          </div>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }}>
            {smokingPastQ.en}
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
            {smokingPastQ.hi}
          </p>
          <div className="radio-group">
            {yesNoOptions.map((opt) => (
              <label key={opt.value} className="radio-option">
                <input
                  type="radio"
                  name="smokingPast"
                  checked={smokingPast === opt.value}
                  onChange={() => { setSmokingPast(opt.value); setErrors((p) => ({ ...p, smokingPast: '' })); }}
                />
                <span className="radio-circle" />
                <span className="radio-label">
                  {opt.en} <span className="hindi-option">{opt.hi}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.smokingPast && <div className="error-msg show">{errors.smokingPast}</div>}
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
