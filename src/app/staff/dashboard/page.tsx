'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Footer from '@/components/Footer';
import CombinedPDFReport from '@/components/CombinedPDFReport';
import { categoryColors, categoryLabels, classifyBP, classifyBMI, calculateBRI } from '@/lib/classification';
import { Category } from '@/lib/types';

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
  briCategory: Category | null;
  sleepCategory: Category | null;
  stressCategory: Category | null;
  bpSystolic: number | null;
  bpDiastolic: number | null;
  heightCm: number | null;
  weightKg: number | null;
  waistCm: number | null;
  createdAt: string;
}

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'REGISTERED' | 'LINK_SENT' | 'COMPLETED' | 'ALL'>('REGISTERED');
  const [allScreenings, setAllScreenings] = useState<ScreeningRecord[]>([]);
  const [measureScreening, setMeasureScreening] = useState<ScreeningRecord | null>(null);
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/staff/login');
  }, [status, router]);

  const fetchScreenings = () => {
    fetch('/api/screening')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAllScreenings(data.data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            screeningId: d.screeningId as string,
            name: d.name as string,
            whatsappNumber: d.whatsappNumber as string,
            age: d.age as number,
            gender: d.gender as string,
            status: d.status as string,
            finalCategory: d.finalCategory as Category | null,
            bpCategory: d.bpCategory as Category | null,
            bmiCategory: d.bmiCategory as Category | null,
            briCategory: d.briCategory as Category | null,
            sleepCategory: d.sleepCategory as Category | null,
            stressCategory: d.stressCategory as Category | null,
            bpSystolic: d.bpSystolic as number | null,
            bpDiastolic: d.bpDiastolic as number | null,
            heightCm: d.heightCm as number | null,
            weightKg: d.weightKg as number | null,
            waistCm: d.waistCm as number | null,
            createdAt: d.createdAt as string,
          })));
        }
      })
      .catch(() => {});
  };

  useEffect(() => { fetchScreenings(); }, []);

  // Selection helpers
  const filtered = useMemo(() => {
    return allScreenings.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.whatsappNumber.includes(search) ||
        s.screeningId.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || s.status === filter;
      return matchSearch && matchFilter;
    });
  }, [allScreenings, search, filter]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.screeningId));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.screeningId)));
    }
  };

  const toggleSelect = (screeningId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(screeningId)) {
        next.delete(screeningId);
      } else {
        next.add(screeningId);
      }
      return next;
    });
  };

  // Delete single participant
  const handleDelete = async (s: ScreeningRecord) => {
    if (!confirm(`Delete screening for ${s.name} (${s.screeningId})? This cannot be undone.`)) return;
    setDeleting(s.screeningId);
    try {
      const res = await fetch(`/api/screening/${s.screeningId}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(s.screeningId); return n; });
        fetchScreenings();
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Error deleting');
    }
    setDeleting(null);
  };

  // Delete selected participants
  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected participant(s)? This cannot be undone.`)) return;
    setDeleting('bulk');
    try {
      const res = await fetch('/api/screening', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        fetchScreenings();
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Error deleting');
    }
    setDeleting(null);
  };

  const openMeasure = (s: ScreeningRecord) => {
    setMeasureScreening(s);
    setBpSys(s.bpSystolic?.toString() || '');
    setBpDia(s.bpDiastolic?.toString() || '');
    setHeight(s.heightCm?.toString() || '');
    setWeight(s.weightKg?.toString() || '');
    setWaist(s.waistCm?.toString() || '');
  };

  const handleSaveMeasurements = async () => {
    if (!measureScreening) return;
    const sys = parseInt(bpSys);
    const dia = parseInt(bpDia);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const wc = parseFloat(waist);

    if (!sys || !dia || !h || !w || !wc) {
      alert('Please fill all fields');
      return;
    }

    setSaving(true);
    const bpCat = classifyBP(sys, dia);
    const bmi = classifyBMI(h, w);
    const bri = calculateBRI(wc, h);

    try {
      await fetch(`/api/screening/${measureScreening.screeningId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bpSystolic: sys,
          bpDiastolic: dia,
          bpCategory: bpCat,
          heightCm: h,
          weightKg: w,
          bmiValue: bmi.value,
          bmiCategory: bmi.category,
          waistCm: wc,
          briValue: bri.value,
          briCategory: bri.category,
          status: 'LINK_SENT',
        }),
      });

      const part2Link = `${window.location.origin}/screening/${measureScreening.screeningId}`;
      const fallbackMessage = `Hi ${measureScreening.name}! Your gym health screening (ID: ${measureScreening.screeningId}) is ready for Part 2. Please complete the remaining assessments here: ${part2Link}`;

      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: measureScreening.whatsappNumber,
          templateName: 'gymmvp',
          variables: [measureScreening.name, measureScreening.screeningId, part2Link],
          fallbackMessage,
        }),
      });

      const data = await res.json();
      if (data.method === 'link') {
        window.open(data.link, '_blank');
      }

      setMeasureScreening(null);
      fetchScreenings();
    } catch {
      alert('Error saving measurements');
    }
    setSaving(false);
  };

  const handleSendResults = async (s: ScreeningRecord) => {
    if (!s.finalCategory) return;
    setSending(s.screeningId);
    const fallbackMessage = `Hi ${s.name}! Your health screening (ID: ${s.screeningId}) is complete.\n\nFinal Category: ${s.finalCategory}\n\nDetailed results will be shared with you by the gym staff.`;
    const whatsappTab = window.open('', '_blank');

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: s.whatsappNumber,
          templateName: 'gymmvpr',
          variables: [s.name, s.screeningId, s.finalCategory],
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
      const phone = s.whatsappNumber.replace(/[^0-9]/g, '');
      if (whatsappTab) {
        whatsappTab.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(fallbackMessage)}`;
      }
    }
    setSending(null);
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

  const statusCounts = {
    REGISTERED: allScreenings.filter((s) => s.status === 'REGISTERED').length,
    LINK_SENT: allScreenings.filter((s) => s.status === 'LINK_SENT').length,
    COMPLETED: allScreenings.filter((s) => s.status === 'COMPLETED').length,
    ALL: allScreenings.length,
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const selectedParticipants = allScreenings.filter((s) => selectedIds.has(s.screeningId));

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Staff Dashboard</h1>
            <p style={{ fontSize: 13, color: '#64748b' }}>Welcome, {session.user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>Admin</span>
            <button className="btn btn-back" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => signOut({ callbackUrl: '/staff/login' })}>Logout</button>
          </div>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {([
            { key: 'REGISTERED', label: 'Registered', color: '#35AEF4' },
            { key: 'LINK_SENT', label: 'Part 2 Sent', color: '#ca8a04' },
            { key: 'COMPLETED', label: 'Completed', color: '#16a34a' },
            { key: 'ALL', label: 'Total', color: '#0f172a' },
          ] as const).map(({ key, label, color }) => (
            <div key={key} onClick={() => setFilter(key)} style={{
              padding: '14px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
              border: filter === key ? `2px solid ${color}` : '1px solid #e2e8f0',
              background: filter === key ? `${color}11` : '#fff',
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{statusCounts[key]}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input type="text" className="text-input" placeholder="Search by name, WhatsApp, or Screening ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 16 }} />

        {/* Selection toolbar */}
        {selectedIds.size > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10,
            padding: '10px 16px', marginBottom: 16, flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0369a1' }}>
              {selectedIds.size} selected
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CombinedPDFReport participants={selectedParticipants} />
              <button
                onClick={handleDeleteSelected}
                disabled={deleting === 'bulk'}
                style={{
                  padding: '8px 16px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                  background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer',
                  opacity: deleting === 'bulk' ? 0.5 : 1,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete ({selectedIds.size})
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{
                  padding: '8px 16px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                  background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['', 'ID', 'Name', 'Age', 'Status', 'Date', 'BP', 'BMI', 'BRI', 'Sleep', 'Stress', 'Final', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 6px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>
                    {h === '' ? (
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        style={{ width: 16, height: 16, accentColor: '#35AEF4', cursor: 'pointer' }}
                      />
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: selectedIds.has(s.screeningId) ? '#f0f9ff' : undefined }}>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.screeningId)}
                      onChange={() => toggleSelect(s.screeningId)}
                      style={{ width: 16, height: 16, accentColor: '#35AEF4', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 10, color: '#35AEF4', fontWeight: 600, textAlign: 'center' }}>{s.screeningId}</td>
                  <td style={{ padding: '8px 6px', fontWeight: 500, color: '#0f172a' }}>{s.name}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b' }}>{s.age}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                      background: s.status === 'COMPLETED' ? '#dcfce7' : s.status === 'LINK_SENT' ? '#fef9c3' : '#dbeafe',
                      color: s.status === 'COMPLETED' ? '#16a34a' : s.status === 'LINK_SENT' ? '#ca8a04' : '#35AEF4',
                    }}>{s.status}</span>
                  </td>
                  <td style={{ padding: '8px 6px', color: '#64748b', fontSize: 10 }}>{formatDate(s.createdAt)}</td>
                  {[s.bpCategory, s.bmiCategory, s.briCategory, s.sleepCategory, s.stressCategory].map((cat, i) => (
                    <td key={i} style={{ padding: '8px 6px', textAlign: 'center' }}>
                      {cat ? <span className={`param-badge ${cat}`} style={{ fontSize: 9, padding: '1px 5px' }}>{cat}</span> : <span style={{ fontSize: 9, color: '#cbd5e1' }}>—</span>}
                    </td>
                  ))}
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                    {s.finalCategory ? <span className={`param-badge ${s.finalCategory}`} style={{ fontSize: 9, padding: '2px 6px', fontWeight: 700 }}>{s.finalCategory}</span> : <span style={{ fontSize: 9, color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {s.status === 'REGISTERED' && (
                        <button onClick={() => openMeasure(s)} style={{ padding: '4px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600, background: '#35AEF4', color: '#fff', border: 'none', cursor: 'pointer' }}>Measure</button>
                      )}
                      {s.status === 'LINK_SENT' && !s.finalCategory && (
                        <span style={{ fontSize: 9, color: '#ca8a04' }}>Waiting...</span>
                      )}
                      {s.status === 'COMPLETED' && s.finalCategory && (
                        <>
                          <a href={`/screening/${s.screeningId}/results`} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600, background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>View</a>
                          <button onClick={() => handleSendResults(s)} disabled={sending === s.screeningId} style={{ padding: '4px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600, background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer', opacity: sending === s.screeningId ? 0.6 : 1 }}>WA</button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(s)}
                        disabled={deleting === s.screeningId}
                        style={{
                          padding: '4px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600,
                          background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer',
                          opacity: deleting === s.screeningId ? 0.5 : 1,
                        }}
                      >
                        {deleting === s.screeningId ? '...' : 'Del'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={13} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No screenings found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Measure Modal */}
        {measureScreening && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) setMeasureScreening(null); }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Enter Measurements</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{measureScreening.name} ({measureScreening.screeningId})</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>BP Systolic (mmHg)</label>
                  <input type="number" className="text-input" placeholder="e.g. 120" value={bpSys} onChange={(e) => setBpSys(e.target.value)} style={{ fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>BP Diastolic (mmHg)</label>
                  <input type="number" className="text-input" placeholder="e.g. 80" value={bpDia} onChange={(e) => setBpDia(e.target.value)} style={{ fontSize: 14 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Height (cm)</label>
                  <input type="number" className="text-input" placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} style={{ fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Weight (kg)</label>
                  <input type="number" className="text-input" placeholder="e.g. 70" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ fontSize: 14 }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Waist Circumference (cm)</label>
                <input type="number" className="text-input" placeholder="e.g. 85" value={waist} onChange={(e) => setWaist(e.target.value)} style={{ fontSize: 14 }} />
              </div>

              {bpSys && bpDia && height && weight && waist && (
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Preview:</div>
                  <div>BP: {classifyBP(parseInt(bpSys), parseInt(bpDia))}</div>
                  <div>BMI: {classifyBMI(parseFloat(height), parseFloat(weight)).value} → {classifyBMI(parseFloat(height), parseFloat(weight)).category}</div>
                  <div>BRI: {calculateBRI(parseFloat(waist), parseFloat(height)).value} → {calculateBRI(parseFloat(waist), parseFloat(height)).category}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-back" style={{ flex: 1 }} onClick={() => setMeasureScreening(null)}>Cancel</button>
                <button className="btn btn-next" style={{ flex: 1 }} onClick={handleSaveMeasurements} disabled={saving}>
                  {saving ? 'Saving...' : 'Save & Send Link'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
