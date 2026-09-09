'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/staff/dashboard');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Staff Login
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>स्टाफ लॉगिन</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <div className="field-label">
              Email <span className="required">*</span>
            </div>
            <input
              type="email"
              className="text-input"
              placeholder="admin@drmudhiwalla.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>

          <div className="field-group">
            <div className="field-label">
              Password <span className="hindi">पासवर्ड</span> <span className="required">*</span>
            </div>
            <input
              type="password"
              className="text-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '10px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-next"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div style={{
          marginTop: 24, padding: '12px 16px', background: '#f8fafc',
          borderRadius: 10, fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
        }}>
          <strong>Demo Credentials:</strong><br />
          admin@drmudiwalla.com / admin987
        </div>
      </div>
      <Footer />
    </div>
  );
}
