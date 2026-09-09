'use client';

import { useState, useEffect, useMemo } from 'react';
import Footer from '@/components/Footer';
import { categoryColors } from '@/lib/classification';
import { Category } from '@/lib/types';
import { loadAllScreenings } from '@/lib/screening-store';
import { ScreeningState } from '@/lib/context';

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [allScreenings, setAllScreenings] = useState<ScreeningState[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllScreenings(loadAllScreenings());
  }, []);

  const filtered = useMemo(() =>
    allScreenings.filter((s: ScreeningState) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.whatsappNumber.includes(search);
      const matchFilter = filter === 'ALL' || s.finalCategory === filter;
      return matchSearch && matchFilter;
    }),
    [allScreenings, search, filter]
  );

  const counts = useMemo(() => ({
    ALL: allScreenings.length,
    GREEN: allScreenings.filter((s: ScreeningState) => s.finalCategory === 'GREEN').length,
    YELLOW: allScreenings.filter((s: ScreeningState) => s.finalCategory === 'YELLOW').length,
    RED: allScreenings.filter((s: ScreeningState) => s.finalCategory === 'RED').length,
  }), [allScreenings]);

  return (
    <div className="form-wrapper">
      <div className="form-container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Gym Health Screening — Manage and view screenings
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map((key) => (
            <div
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '12px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: filter === key ? '2px solid #35AEF4' : '1px solid #e2e8f0',
                background: filter === key ? '#f0f9ff' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: key === 'ALL' ? '#0f172a' : categoryColors[key].text }}>
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
          placeholder="Search by name or WhatsApp number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>WhatsApp</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Age</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>BP</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>BMI</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Sleep</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Stress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: ScreeningState) => (
                <tr key={s.screeningId} style={{ borderBottom: '1px solid #f1f5f9' }}>
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
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {s.finalCategory ? (
                      <span className={`param-badge ${s.finalCategory}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                        {s.finalCategory}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {s.bpCategory ? (
                      <span className={`param-badge ${s.bpCategory}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                        {s.bpCategory}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {s.bmiCategory ? (
                      <span className={`param-badge ${s.bmiCategory}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                        {s.bmiCategory}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {s.sleepCategory ? (
                      <span className={`param-badge ${s.sleepCategory}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                        {s.sleepCategory}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {s.stressCategory ? (
                      <span className={`param-badge ${s.stressCategory}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                        {s.stressCategory}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    No screenings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {allScreenings.length === 0 && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
            <strong>Note:</strong> No screenings yet. Data will appear here after users complete screenings.
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
