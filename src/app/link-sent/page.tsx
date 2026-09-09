'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { useScreening } from '@/lib/context';
import { Category } from '@/lib/types';

export default function LinkSentPage() {
  const router = useRouter();
  const { state } = useScreening();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const screeningLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/screening/${state.screeningId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(screeningLink);
    alert('Link copied to clipboard!');
  };

  const handleShare = async () => {
    const fallbackMessage = `Hi ${state.name}! Your gym health screening (ID: ${state.screeningId}) is ready for Part 2. Please complete the remaining assessments here: ${screeningLink}`;

    setSending(true);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: state.whatsappNumber,
          templateName: 'screening_part2_link',
          variables: [state.name, state.screeningId, screeningLink],
          fallbackMessage,
        }),
      });

      const data = await res.json();

      if (data.method === 'link') {
        window.open(data.link, '_blank');
      } else {
        setSent(true);
      }
    } catch {
      const phone = state.whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fallbackMessage)}`, '_blank');
    }
    setSending(false);
  };

  const part1Params = [
    { icon: '❤️', name: 'Blood Pressure', value: `${state.bpSystolic} / ${state.bpDiastolic} mmHg`, category: state.bpCategory! as Category },
    { icon: '📏', name: 'BMI', value: `${state.bmiValue} kg/m²`, category: state.bmiCategory! as Category },
  ];

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ textAlign: 'center' }}>
        {/* Screening ID Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #35AEF4 0%, #0ea5e9 100%)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 28,
          color: '#fff',
        }}>
          <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Your Screening ID</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>{state.screeningId}</div>
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Part 1 Complete!</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8, lineHeight: 1.7 }}>
          Your physical measurements have been recorded. Now complete the remaining assessments (Sleep, Stress & Medical History) using the link below.
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, lineHeight: 1.7 }}>
          आपके शारीरिक माप दर्ज हो गए हैं। अब नीचे दिए गए लिंक से बाकी आकलन (नींद, तनाव और चिकित्सा इतिहास) पूरे करें।
        </p>

        {/* Part 1 Summary */}
        <div style={{ textAlign: 'left', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Part 1 Summary / पहला भाग सारांश</h3>
          {part1Params.map((p, i) => (
            <div key={i} className="param-card" style={{ marginBottom: 8 }}>
              <div className="param-left">
                <span className="param-icon">{p.icon}</span>
                <div className="param-info">
                  <span className="param-name">{p.name}</span>
                  <span className="param-value">{p.value}</span>
                </div>
              </div>
              <span className={`param-badge ${p.category}`}>{p.category}</span>
            </div>
          ))}
        </div>

        {/* Screening Link */}
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12,
          padding: '16px 20px', marginBottom: 24, textAlign: 'left',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            Part 2 Screening Link / दूसरा भाग लिंक
          </div>
          <div style={{
            fontSize: 12, color: '#35AEF4', fontFamily: 'monospace', wordBreak: 'break-all',
            background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0f2fe',
            marginBottom: 12,
          }}>
            {screeningLink}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-next"
              style={{ padding: '10px 20px', fontSize: 13, flex: 1 }}
              onClick={handleCopy}
            >
              Copy Link
            </button>
            <button
              className="btn btn-submit"
              style={{ padding: '10px 20px', fontSize: 13, flex: 1, background: '#25D366' }}
              onClick={handleShare}
              disabled={sending}
            >
              {sending ? 'Sending...' : sent ? '✓ Sent!' : 'Send via WhatsApp'}
            </button>
          </div>
        </div>

        <div className="disclaimer" style={{ textAlign: 'left' }}>
          <strong>Important:</strong> Save your Screening ID: <strong>{state.screeningId}</strong>. You will need it to view your results.
          <br />
          अपनी Screening ID सहेजें: <strong>{state.screeningId}</strong>। आपको अपने परिणाम देखने के लिए इसकी आवश्यकता होगी।
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="btn btn-back" onClick={() => router.push('/')}>
            Back to Home
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
