'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Footer from '@/components/Footer';
import { categoryColors, categoryLabels } from '@/lib/classification';
import { Category } from '@/lib/types';
import { loadAllScreenings } from '@/lib/screening-store';
import { ScreeningState } from '@/lib/context';
import jsPDF from 'jspdf';

interface ScreeningRecord {
  id: string;
  screeningId: string;
  name: string;
  whatsappNumber: string;
  age: number;
  gender: string;
  status: string;
  finalCategory: Category | null;
  bpCategory: Category | null;
  bmiCategory: Category | null;
  sleepCategory: Category | null;
  stressCategory: Category | null;
  createdAt: string;
}

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [allScreenings, setAllScreenings] = useState<ScreeningState[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/staff/login');
    }
  }, [status, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllScreenings(loadAllScreenings());
  }, []);

  const records: ScreeningRecord[] = useMemo(() =>
    allScreenings.map((s) => ({
      id: s.screeningId,
      screeningId: s.screeningId,
      name: s.name,
      whatsappNumber: s.whatsappNumber,
      age: s.age,
      gender: s.gender,
      status: s.status,
      finalCategory: s.finalCategory,
      bpCategory: s.bpCategory,
      bmiCategory: s.bmiCategory,
      sleepCategory: s.sleepCategory,
      stressCategory: s.stressCategory,
      createdAt: s.createdAt,
    })),
    [allScreenings]
  );

  const handleDownloadPDF = async (screening: ScreeningState) => {
    setDownloading(screening.screeningId);
    try {
      const cat = screening.finalCategory || 'GREEN';
      const labels = categoryLabels[cat];

      const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
      };

      const params = [
        { name: 'Blood Pressure', value: `${screening.bpSystolic} / ${screening.bpDiastolic} mmHg`, cat: screening.bpCategory },
        { name: 'BMI', value: `${screening.bmiValue} kg/m²`, cat: screening.bmiCategory },
        { name: 'Sleep Quality', value: `${screening.sleepScore} / 15`, cat: screening.sleepCategory },
        { name: 'Stress Level', value: `${screening.stressScore} / 16`, cat: screening.stressCategory },
        { name: 'Family History', value: screening.familyHistory ? 'Yes' : 'No', cat: screening.familyHistory ? 'YELLOW' : 'GREEN' },
        { name: 'Medical History', value: screening.medicalHistory ? 'Yes' : 'No', cat: screening.medicalHistory ? 'RED' : 'GREEN' },
      ];

      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      let y = 20;

      // Header
      pdf.setFillColor(53, 174, 244);
      pdf.rect(0, 0, w, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DrMudhiwalla HealthTech Pvt Ltd', w / 2, 18, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Preventive Health Screening Report', w / 2, 26, { align: 'center' });
      pdf.text(`Screening ID: ${screening.screeningId}  |  Date: ${formatDate(screening.createdAt)}`, w / 2, 34, { align: 'center' });

      y = 50;
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Participant Details', 14, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${screening.name}  |  Age: ${screening.age}  |  Gender: ${screening.gender}`, 14, y);
      y += 6;
      pdf.text(`WhatsApp: ${screening.whatsappNumber}  |  Working: ${screening.workingStatus}`, 14, y);
      y += 12;

      // Final category
      pdf.setFillColor(
        cat === 'GREEN' ? 220 : cat === 'YELLOW' ? 254 : 254,
        cat === 'GREEN' ? 252 : cat === 'YELLOW' ? 249 : 226,
        cat === 'GREEN' ? 245 : cat === 'YELLOW' ? 194 : 226
      );
      pdf.roundedRect(w / 2 - 40, y - 4, 80, 16, 3, 3, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${labels.en} (${cat})`, w / 2, y + 6, { align: 'center' });
      y += 20;

      // Parameters table
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Health Parameters', 14, y);
      y += 8;

      // Table header
      pdf.setFillColor(241, 245, 249);
      pdf.rect(14, y - 4, w - 28, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Parameter', 16, y + 1);
      pdf.text('Value', 80, y + 1);
      pdf.text('Category', 140, y + 1);
      y += 10;

      pdf.setFont('helvetica', 'normal');
      for (const p of params) {
        pdf.text(p.name, 16, y);
        pdf.text(p.value, 80, y);
        pdf.setFont('helvetica', 'bold');
        pdf.text(p.cat || '—', 140, y);
        pdf.setFont('helvetica', 'normal');
        y += 7;
      }

      y += 8;
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Disclaimer: This screening is for health awareness only and does not replace medical diagnosis.', 14, y);
      y += 4;
      pdf.text('DrMudhiwalla HealthTech Pvt Ltd | CIN: U86201DL2025PTC451980 | GST: 07AALCD8789M1ZL', 14, y);

      pdf.save(`Screening-${screening.screeningId}.pdf`);
    } catch {
      alert('Error generating PDF');
    }
    setDownloading(null);
  };

  const handleSendWhatsApp = async (screening: ScreeningState) => {
    if (!screening.finalCategory) {
      alert('Screening not yet completed. Results cannot be sent.');
      return;
    }
    const fallbackMessage = `Hi ${screening.name}! Your health screening (ID: ${screening.screeningId}) is complete.\n\nFinal Category: ${screening.finalCategory}\n\nDetailed results will be shared with you by the gym staff.`;

    const whatsappTab = window.open('', '_blank');

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: screening.whatsappNumber,
          templateName: 'gymmvpr',
          variables: [screening.name, screening.screeningId, screening.finalCategory],
          fallbackMessage,
        }),
      });

      const data = await res.json();

      if (data.method === 'link' && whatsappTab) {
        whatsappTab.location.href = data.link;
      } else if (whatsappTab) {
        whatsappTab.close();
      }
    } catch {
      const phone = screening.whatsappNumber.replace(/[^0-9]/g, '');
      if (whatsappTab) {
        whatsappTab.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(fallbackMessage)}`;
      } else {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fallbackMessage)}`, '_blank');
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="form-wrapper">
        <div className="form-container" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const filtered = records.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.whatsappNumber.includes(search) ||
      s.screeningId.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || s.finalCategory === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL: records.length,
    GREEN: records.filter((s) => s.finalCategory === 'GREEN').length,
    YELLOW: records.filter((s) => s.finalCategory === 'YELLOW').length,
    RED: records.filter((s) => s.finalCategory === 'RED').length,
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
              Staff Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Welcome, {session.user?.name} | Gym Health Screening Admin
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: '#dcfce7', color: '#16a34a', textTransform: 'uppercase',
            }}>
              Admin
            </span>
            <button
              className="btn btn-back"
              style={{ padding: '8px 16px', fontSize: 12 }}
              onClick={() => signOut({ callbackUrl: '/staff/login' })}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
          {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map((key) => (
            <div
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '14px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: filter === key ? '2px solid #35AEF4' : '1px solid #e2e8f0',
                background: filter === key ? '#f0f9ff' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: 28, fontWeight: 700,
                color: key === 'ALL' ? '#0f172a' : categoryColors[key].text,
              }}>
                {counts[key]}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {key === 'ALL' ? 'Total' : key}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          className="text-input"
          placeholder="Search by name, WhatsApp, or Screening ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Screening ID', 'Name', 'WhatsApp', 'Age', 'Status', 'Date', 'BP', 'BMI', 'Sleep', 'Stress', 'Final', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 8px', textAlign: h === 'Final' || h === 'Actions' ? 'center' : 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 11, color: '#35AEF4', fontWeight: 600 }}>
                    {s.screeningId}
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 500, color: '#0f172a' }}>{s.name}</td>
                  <td style={{ padding: '10px 8px', color: '#64748b' }}>{s.whatsappNumber}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>{s.age}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                      background: s.status === 'COMPLETED' ? '#dcfce7' : s.status === 'LINK_SENT' ? '#fef9c3' : '#f1f5f9',
                      color: s.status === 'COMPLETED' ? '#16a34a' : s.status === 'LINK_SENT' ? '#ca8a04' : '#64748b',
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', color: '#64748b', fontSize: 11 }}>{formatDate(s.createdAt)}</td>
                  {[s.bpCategory, s.bmiCategory, s.sleepCategory, s.stressCategory].map((cat, i) => (
                    <td key={i} style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {cat ? (
                        <span className={`param-badge ${cat}`} style={{ fontSize: 10, padding: '2px 6px' }}>{cat}</span>
                      ) : (
                        <span style={{ fontSize: 10, color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {s.finalCategory ? (
                      <span className={`param-badge ${s.finalCategory}`} style={{ fontSize: 10, padding: '2px 8px', fontWeight: 700 }}>
                        {s.finalCategory}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      {s.finalCategory && (
                        <>
                          <button
                            onClick={() => {
                              const full = allScreenings.find((x) => x.screeningId === s.screeningId);
                              if (full) handleDownloadPDF(full);
                            }}
                            disabled={downloading === s.screeningId}
                            style={{
                              padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                              background: '#35AEF4', color: '#fff', border: 'none', cursor: 'pointer',
                              opacity: downloading === s.screeningId ? 0.6 : 1,
                            }}
                            title="Download PDF"
                          >
                            {downloading === s.screeningId ? '...' : 'PDF'}
                          </button>
                          <button
                            onClick={() => {
                              const full = allScreenings.find((x) => x.screeningId === s.screeningId);
                              if (full) handleSendWhatsApp(full);
                            }}
                            style={{
                              padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                              background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer',
                            }}
                            title="Send via WhatsApp"
                          >
                            WA
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    No screenings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {records.length === 0 && (
          <div style={{ marginTop: 16, padding: '10px 16px', background: '#fffbeb', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
            <strong>Note:</strong> No screenings yet. Data will appear here after users complete Part 1 of the screening flow.
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
