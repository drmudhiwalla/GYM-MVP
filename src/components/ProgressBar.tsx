'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`progress-step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
          />
        ))}
      </div>
      <div className="page-indicator">
        Page <span>{currentStep + 1}</span> of {totalSteps}
      </div>
    </>
  );
}
