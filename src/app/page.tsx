'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import ValidationModal from '@/components/ValidationModal';
import { generateScreeningId } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [consent3, setConsent3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    if (!name.trim()) { errs.name = 'Required'; missing.push('Full Name'); }
    if (!age.trim()) { errs.age = 'Required'; missing.push('Age'); }
    if (!gender) { errs.gender = 'Required'; missing.push('Gender'); }
    if (!whatsapp.trim()) { errs.whatsapp = 'Required'; missing.push('WhatsApp Number'); }
    if (!consent1) { errs.consent1 = 'Required'; missing.push('Consent 1'); }
    setErrors(errs);
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowModal(true);
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const screeningId = generateScreeningId();

    try {
      await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screeningId,
          name: name.trim(),
          age: parseInt(age),
          gender,
          whatsappNumber: whatsapp.trim(),
          workingStatus: '',
          consent1,
          consent2,
          consent3,
          status: 'REGISTERED',
        }),
      });

      router.push(`/registered?id=${screeningId}`);
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', position: 'relative' }}>
      <button
        onClick={() => router.push('/staff/login')}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 20,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 50,
          padding: '8px 20px', fontSize: 13, fontWeight: 600,
          color: '#35AEF4', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          boxShadow: '0 2px 8px rgba(53,174,244,0.15)',
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#35AEF4'; e.currentTarget.style.color = '#fff'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#35AEF4'; }}
      >
        🔐 Staff Login
      </button>

      <div className="form-wrapper">
        <div className="form-container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏥</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.2 }}>
              Gym Health Screening
            </h1>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 12 }}>
              जिम स्वास्थ्य जांच
            </p>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
              Register to start your preventive health screening.
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>
              अपनी निवारक स्वास्थ्य जांच शुरू करने के लिए रजिस्टर करें।
            </p>
          </div>

          <div className="field-group">
            <div className="field-label">
              Full Name <span className="hindi">पूरा नाम</span> <span className="required">*</span>
            </div>
            <input
              type="text"
              className={`text-input ${errors.name ? 'field-error' : ''}`}
              placeholder="Enter full name"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
            />
            {errors.name && <div className="error-msg show">{errors.name}</div>}
          </div>

          <div className="field-group">
            <div className="field-label">
              Age <span className="hindi">आयु</span> <span className="required">*</span>
            </div>
            <input
              type="number"
              className={`text-input ${errors.age ? 'field-error' : ''}`}
              placeholder="Enter age"
              value={age}
              onChange={(e) => { setAge(e.target.value); setErrors((p) => ({ ...p, age: '' })); }}
            />
            {errors.age && <div className="error-msg show">{errors.age}</div>}
          </div>

          <div className="field-group">
            <div className="field-label">
              Gender <span className="hindi">लिंग</span> <span className="required">*</span>
            </div>
            <div className="radio-group">
              {[
                { value: 'Male', en: 'Male', hi: 'पुरुष' },
                { value: 'Female', en: 'Female', hi: 'महिला' },
                { value: 'Other', en: 'Other', hi: 'अन्य' },
              ].map((opt) => (
                <label key={opt.value} className="radio-option">
                  <input type="radio" name="gender" value={opt.value} checked={gender === opt.value}
                    onChange={() => { setGender(opt.value); setErrors((p) => ({ ...p, gender: '' })); }} />
                  <span className="radio-circle" />
                  <span className="radio-label">{opt.en} <span className="hindi-option">{opt.hi}</span></span>
                </label>
              ))}
            </div>
            {errors.gender && <div className="error-msg show">{errors.gender}</div>}
          </div>

          <div className="field-group">
            <div className="field-label">
              WhatsApp Number <span className="hindi">व्हाट्सएप नंबर</span> <span className="required">*</span>
            </div>
            <input
              type="tel"
              className={`text-input ${errors.whatsapp ? 'field-error' : ''}`}
              placeholder="10-digit WhatsApp number"
              value={whatsapp}
              onChange={(e) => { setWhatsapp(e.target.value); setErrors((p) => ({ ...p, whatsapp: '' })); }}
            />
            {errors.whatsapp && <div className="error-msg show">{errors.whatsapp}</div>}
          </div>

          <div className="field-group" style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={consent1} onChange={(e) => { setConsent1(e.target.checked); setErrors((p) => ({ ...p, consent1: '' })); }}
                style={{ marginTop: 3, width: 18, height: 18, accentColor: '#35AEF4' }} />
              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                I consent to the collection of my health data for screening purposes. <span className="required">*</span>
                <br /><span className="hindi" style={{ fontSize: 12 }}>मैं स्क्रीनिंग उद्देश्यों के लिए अपने स्वास्थ्य डेटा के संग्रह की सहमति देता हूं।</span>
              </span>
            </label>
            {errors.consent1 && <div className="error-msg show">{errors.consent1}</div>}
          </div>

          <div className="field-group" style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={consent2} onChange={(e) => setConsent2(e.target.checked)}
                style={{ marginTop: 3, width: 18, height: 18, accentColor: '#35AEF4' }} />
              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                I agree to receive my results via WhatsApp.
                <br /><span className="hindi" style={{ fontSize: 12 }}>मैं व्हाट्सएप के माध्यम से अपने परिणाम प्राप्त करने के लिए सहमत हूं।</span>
              </span>
            </label>
          </div>

          <div className="field-group" style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={consent3} onChange={(e) => setConsent3(e.target.checked)}
                style={{ marginTop: 3, width: 18, height: 18, accentColor: '#35AEF4' }} />
              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                I understand this screening is for awareness only and not a medical diagnosis.
                <br /><span className="hindi" style={{ fontSize: 12 }}>मैं समझता हूं कि यह स्क्रीनिंग केवल जागरूकता के लिए है और यह चिकित्सा निदान नहीं है।</span>
              </span>
            </label>
          </div>

          <button
            className="btn btn-next"
            style={{ width: '100%', padding: '14px 32px', fontSize: 16, marginTop: 8 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register &rarr;'}
          </button>
        </div>
      </div>
      <Footer />
      <ValidationModal isOpen={showModal} onClose={() => setShowModal(false)} missingFields={missingFields} />
    </div>
  );
}
