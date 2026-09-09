'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { useScreening } from '@/lib/context';

const consents = [
  {
    en: 'I consent to participate in this preventive health screening.',
    hi: 'मैं इस health screening में भाग लेने के लिए सहमति देता/देती हूँ।',
  },
  {
    en: 'I agree that only my final Green/Yellow/Red category may be shared with the gym management; detailed health information will remain confidential.',
    hi: 'मैं सहमत हूँ कि केवल मेरी अंतिम Green/Yellow/Red श्रेणी Gym Management के साथ share किया जा सकता है; मेरी detailed health screening गोपनीय रहेगी।',
  },
  {
    en: 'I understand that this screening is for health awareness only and does not replace medical diagnosis or consultation.',
    hi: 'मैं समझता/समझती हूँ कि यह Screening केवल Health awareness के लिए है और यह diagnosis or medical consultation का विकल्प नहीं है।',
  },
];

const workOptions = [
  { value: 'salaried', en: 'Salaried Job', hi: 'नौकरी' },
  { value: 'business', en: 'Own Work or Business', hi: 'अपना काम या व्यवसाय' },
  { value: 'studying', en: 'Studying', hi: 'पढ़ाई कर रहे हैं' },
  { value: 'homemaker', en: 'Homemaker', hi: 'गृहिणी' },
  { value: 'retired', en: 'Retired', hi: 'सेवानिवृत्त' },
  { value: 'dont-wish', en: "Don't wish to mention", hi: 'बताना नहीं चाहते' },
];

const genderOptions = [
  { value: 'male', en: 'Male', hi: 'पुरुष' },
  { value: 'female', en: 'Female', hi: 'महिला' },
  { value: 'other', en: 'Other', hi: 'अन्य' },
];

export default function ConsentPage() {
  const router = useRouter();
  const { state, updateState } = useScreening();

  const [whatsapp, setWhatsapp] = useState(state.whatsappNumber);
  const [name, setName] = useState(state.name);
  const [age, setAge] = useState(state.age > 0 ? String(state.age) : '');
  const [gender, setGender] = useState(state.gender);
  const [workStatus, setWorkStatus] = useState(state.workingStatus);
  const [checks, setChecks] = useState([false, false, false]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const toggleCheck = (index: number) => {
    const newChecks = [...checks];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);
    setErrors((prev) => { const n = { ...prev }; delete n.checks; return n; });
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    const missing: string[] = [];

    if (!name.trim()) { newErrors.name = 'Please enter your name'; missing.push('Name'); }
    if (!age.trim()) { newErrors.age = 'Please enter your age'; missing.push('Age'); }
    else if (parseInt(age) < 10 || parseInt(age) > 100) { newErrors.age = 'Age must be between 10 and 100'; missing.push('Age (10–100)'); }
    if (!gender) { newErrors.gender = 'Please select your gender'; missing.push('Gender'); }
    if (!workStatus) { newErrors.workStatus = 'Please select your working status'; missing.push('Working Status'); }
    if (!whatsapp.trim()) { newErrors.whatsapp = 'Please enter your WhatsApp number'; missing.push('WhatsApp Number'); }
    else if (!/^\d{10,15}$/.test(whatsapp.replace(/[+\s-]/g, ''))) { newErrors.whatsapp = 'Please enter a valid WhatsApp number'; missing.push('WhatsApp Number (valid)'); }
    if (!checks.every((c) => c)) { newErrors.checks = 'Please agree to all consent items to continue'; missing.push('All consent checkboxes'); }

    setErrors(newErrors);

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
      return;
    }

    updateState({
      whatsappNumber: whatsapp.replace(/[+\s-]/g, ''),
      name: name.trim(),
      age: parseInt(age),
      gender,
      workingStatus: workStatus,
      consent1: checks[0],
      consent2: checks[1],
      consent3: checks[2],
    });
    router.push('/blood-pressure');
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <ProgressBar currentStep={0} totalSteps={4} />

        <div className="intro-section">
          <div className="intro-icon">🏥</div>
          <h2>Gym Health Screening</h2>
          <div className="hindi-title">जिम स्वास्थ्य जांच</div>
          <p>Please fill in your details and read the consent carefully before proceeding.</p>
          <p className="hindi-desc">कृपया अपनी जानकारी भरें और आगे बढ़ने से पहले सहमति को ध्यानपूर्वक पढ़ें।</p>
        </div>

        {/* Name */}
        <div className="field-group" style={{ marginTop: 28 }}>
          <div className="field-label">
            Name <span className="hindi">आपका नाम</span> <span className="required">*</span>
          </div>
          <input
            type="text"
            className={`text-input ${errors.name ? 'field-error' : ''}`}
            placeholder="Your answer"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
          />
          {errors.name && <div className="error-msg show">{errors.name}</div>}
        </div>

        {/* Age */}
        <div className="field-group">
          <div className="field-label">
            Age <span className="hindi">उम्र</span> <span className="required">*</span>
          </div>
          <input
            type="number"
            className={`text-input ${errors.age ? 'field-error' : ''}`}
            placeholder="Your answer"
            value={age}
            onChange={(e) => { setAge(e.target.value); setErrors((p) => ({ ...p, age: '' })); }}
            min={10}
            max={100}
          />
          {errors.age && <div className="error-msg show">{errors.age}</div>}
        </div>

        {/* Gender */}
        <div className="field-group">
          <div className="field-label">
            Gender <span className="hindi">लिंग</span> <span className="required">*</span>
          </div>
          <div className="radio-group">
            {genderOptions.map((opt) => (
              <label key={opt.value} className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  checked={gender === opt.value}
                  onChange={() => { setGender(opt.value); setErrors((p) => ({ ...p, gender: '' })); }}
                />
                <span className="radio-circle" />
                <span className="radio-label">
                  {opt.en} <span className="hindi-option">{opt.hi}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.gender && <div className="error-msg show">{errors.gender}</div>}
        </div>

        {/* Working Status */}
        <div className="field-group">
          <div className="field-label">
            Working status <span className="hindi">क्या करते हैं आप</span> <span className="required">*</span>
          </div>
          <div className="radio-group">
            {workOptions.map((opt) => (
              <label key={opt.value} className="radio-option">
                <input
                  type="radio"
                  name="work-status"
                  value={opt.value}
                  checked={workStatus === opt.value}
                  onChange={() => { setWorkStatus(opt.value); setErrors((p) => ({ ...p, workStatus: '' })); }}
                />
                <span className="radio-circle" />
                <span className="radio-label">
                  {opt.en} <span className="hindi-option">{opt.hi}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.workStatus && <div className="error-msg show">{errors.workStatus}</div>}
        </div>

        {/* WhatsApp */}
        <div className="field-group">
          <div className="field-label">
            WhatsApp Number <span className="hindi">व्हाट्सएप नंबर</span> <span className="required">*</span>
          </div>
          <div className="field-hint">Your WhatsApp number is your identifier and will be used for sharing your detailed report.</div>
          <input
            type="tel"
            className={`text-input ${errors.whatsapp ? 'field-error' : ''}`}
            placeholder="Enter 10-digit WhatsApp number"
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              setErrors((prev) => ({ ...prev, whatsapp: '' }));
            }}
          />
          {errors.whatsapp && <div className="error-msg show">{errors.whatsapp}</div>}
        </div>

        {/* Consent */}
        <div className="field-group">
          <div className="field-label" style={{ marginBottom: 12 }}>
            Consent <span className="hindi">सहमति</span> <span className="required">*</span>
          </div>
          <div className="checkbox-group">
            {consents.map((c, i) => (
              <div
                key={i}
                className={`checkbox-option ${checks[i] ? 'checked' : ''}`}
                onClick={() => toggleCheck(i)}
              >
                <div className="checkbox-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="checkbox-text">
                  {c.en}
                  <span className="hindi">{c.hi}</span>
                </div>
              </div>
            ))}
          </div>
          {errors.checks && <div className="error-msg show">{errors.checks}</div>}
        </div>

        <div className="disclaimer">
          <strong>Disclaimer / अस्वीकरण:</strong> Your WhatsApp number is your identifier and will be used for sharing your detailed report. It will not be shared with any third party.
          <br />
          आपका WhatsApp नंबर आपका पहचानकर्ता है और आपकी विस्तृत रिपोर्ट साझा करने के लिए उपयोग किया जाएगा। इसे किसी तीसरे पक्ष के साथ साझा नहीं किया जाएगा।
        </div>

        <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-next" onClick={handleNext}>
            Next &rarr;
          </button>
        </div>
      </div>
      <Footer />
      <ValidationModal isOpen={showModal} onClose={() => setShowModal(false)} missingFields={missingFields} />
    </div>
  );
}
