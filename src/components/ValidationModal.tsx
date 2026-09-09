'use client';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[];
}

export default function ValidationModal({ isOpen, onClose, missingFields }: ValidationModalProps) {
  if (!isOpen || missingFields.length === 0) return null;

  return (
    <div className="validation-modal-overlay" onClick={onClose}>
      <div className="validation-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="validation-modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          Missing Required Fields
        </h3>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
          Please fill in the following before continuing:
        </p>
        <div className="validation-modal-list">
          {missingFields.map((field, i) => (
            <div key={i} className="validation-modal-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{field}</span>
            </div>
          ))}
        </div>
        <button className="validation-modal-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
