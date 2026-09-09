'use client';

import jsPDF from 'jspdf';
import { ScreeningState } from '@/lib/context';
import { categoryColors } from '@/lib/classification';
import { Category } from '@/lib/types';

interface PDFReportProps {
  state: ScreeningState;
}

const categoryBg: Record<Category, [number, number, number]> = {
  GREEN: [34, 197, 94],
  YELLOW: [234, 179, 8],
  RED: [239, 68, 68],
};

const categoryLabel: Record<Category, string> = {
  GREEN: 'NORMAL',
  YELLOW: 'MODERATE',
  RED: 'HIGH',
};

export default function PDFReport({ state }: PDFReportProps) {
  const handleDownload = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();

    const cat = state.finalCategory || 'GREEN';
    const catBg = categoryBg[cat];

    const formatDate = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const formatTime = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    // ── Background ──
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, w, h, 'F');

    // ── Header ──
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, w, 32, 'F');
    pdf.setDrawColor(53, 174, 244);
    pdf.setLineWidth(0.8);
    pdf.line(0, 32, w, 32);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(53, 174, 244);
    pdf.text('DrMudhiwalla', 14, 14);
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text('HealthCare', 14, 20);

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Test Date: ${formatDate(state.createdAt)}`, w - 14, 12, { align: 'right' });
    pdf.text(`Test Time: ${formatTime(state.createdAt)}`, w - 14, 18, { align: 'right' });

    let y = 42;

    // ── Participant Info ──
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(14, y, w - 28, 36, 3, 3, 'F');

    const genderLabel = state.gender === 'male' ? 'Male' : state.gender === 'female' ? 'Female' : 'Other';
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.text(state.name.toUpperCase(), 20, y + 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${genderLabel}, ${state.age} yrs`, 20, y + 17);

    // Height icon area
    const iconY = y + 22;
    pdf.setFillColor(255, 237, 213);
    pdf.circle(30, iconY + 4, 5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(234, 88, 12);
    pdf.text(`${state.heightCm || '—'}`, 30, iconY + 5, { align: 'center' });
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    pdf.text('cm', 30, iconY + 9, { align: 'center' });

    // Weight icon area
    pdf.setFillColor(219, 234, 254);
    pdf.circle(55, iconY + 4, 5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(37, 99, 235);
    pdf.text(`${state.weightKg || '—'}`, 55, iconY + 5, { align: 'center' });
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    pdf.text('kg', 55, iconY + 9, { align: 'center' });

    // Risk gauge on the right
    const gaugeX = w - 55;
    const gaugeY = y + 6;
    const gaugeR = 14;

    // Draw semi-circle gauge background
    const segments = [
      { start: Math.PI, end: Math.PI * 0.75, r: 220, g: 252, b: 231 },   // green
      { start: Math.PI * 0.75, end: Math.PI * 0.5, r: 254, g: 249, b: 195 }, // yellow
      { start: Math.PI * 0.5, end: 0, r: 254, g: 226, b: 226 },          // red
    ];

    for (const seg of segments) {
      pdf.setFillColor(seg.r, seg.g, seg.b);
      // Approximate with filled arc segments
      const steps = 20;
      for (let i = 0; i < steps; i++) {
        const a1 = seg.start - (seg.start - seg.end) * (i / steps);
        const a2 = seg.start - (seg.start - seg.end) * ((i + 1) / steps);
        const x1 = gaugeX + gaugeR * Math.cos(a1);
        const y1 = gaugeY + gaugeR * Math.sin(a1);
        const x2 = gaugeX + gaugeR * Math.cos(a2);
        const y2 = gaugeY + gaugeR * Math.sin(a2);
        pdf.line(x1, y1, x2, y2);
      }
    }

    // Gauge needle
    const riskScore = cat === 'GREEN' ? 1 : cat === 'YELLOW' ? 3 : 5;
    const needleAngle = Math.PI - (riskScore / 5) * Math.PI;
    const needleLen = gaugeR - 3;
    pdf.setDrawColor(30, 41, 59);
    pdf.setLineWidth(1);
    pdf.line(gaugeX, gaugeY, gaugeX + needleLen * Math.cos(needleAngle), gaugeY + needleLen * Math.sin(needleAngle));
    pdf.setFillColor(30, 41, 59);
    pdf.circle(gaugeX, gaugeY, 2, 'F');

    // Gauge labels
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text('0', gaugeX - gaugeR - 2, gaugeY + 4);
    pdf.text('5', gaugeX + gaugeR + 2, gaugeY + 4);
    pdf.text(`${riskScore} / 5`, gaugeX, gaugeY + 10, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text('POTENTIAL RISK', gaugeX, gaugeY - 4, { align: 'center' });

    y += 42;

    // ── Section Header ──
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(14, y, w - 28, 10, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text('LIFESTYLE RISK PROFILE & SUMMARY', 20, y + 7);
    y += 16;

    // ── Parameter Cards (2-column grid) ──
    const params = [
      {
        icon: 'BP', label: 'BLOOD PRESSURE',
        value: `${state.bpSystolic} / ${state.bpDiastolic} mmHg`,
        cat: state.bpCategory!,
        iconBg: [254, 226, 226] as [number, number, number],
        iconColor: [220, 38, 38] as [number, number, number],
      },
      {
        icon: 'BMI', label: 'BMI',
        value: `${state.bmiValue} kg/m²`,
        cat: state.bmiCategory!,
        iconBg: [219, 234, 254] as [number, number, number],
        iconColor: [37, 99, 235] as [number, number, number],
      },
      {
        icon: 'ZZZ', label: 'SLEEP QUALITY',
        value: `${state.sleepScore} / 15`,
        cat: state.sleepCategory!,
        iconBg: [224, 231, 255] as [number, number, number],
        iconColor: [99, 102, 241] as [number, number, number],
      },
      {
        icon: 'ST', label: 'STRESS LEVEL',
        value: `${state.stressScore} / 16`,
        cat: state.stressCategory!,
        iconBg: [255, 237, 213] as [number, number, number],
        iconColor: [234, 88, 12] as [number, number, number],
      },
      {
        icon: 'FH', label: 'FAMILY HISTORY',
        value: state.familyHistory ? 'Yes' : 'No',
        cat: state.familyHistory ? 'YELLOW' as Category : 'GREEN' as Category,
        iconBg: [254, 249, 195] as [number, number, number],
        iconColor: [202, 138, 4] as [number, number, number],
      },
      {
        icon: 'MH', label: 'MEDICAL HISTORY',
        value: state.medicalHistory ? 'Yes' : 'No',
        cat: state.medicalHistory ? 'RED' as Category : 'GREEN' as Category,
        iconBg: [254, 226, 226] as [number, number, number],
        iconColor: [220, 38, 38] as [number, number, number],
      },
    ];

    const cardW = (w - 36) / 2;
    const cardH = 28;
    const gapX = 4;
    const gapY = 4;

    params.forEach((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 14 + col * (cardW + gapX);
      const cy = y + row * (cardH + gapY);

      // Card background
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(cx, cy, cardW, cardH, 3, 3, 'F');

      // Icon circle
      pdf.setFillColor(p.iconBg[0], p.iconBg[1], p.iconBg[2]);
      pdf.circle(cx + 11, cy + 11, 7, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(p.iconColor[0], p.iconColor[1], p.iconColor[2]);
      pdf.text(p.icon, cx + 11, cy + 12, { align: 'center' });

      // Label
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(p.label, cx + 21, cy + 8);

      // Value
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text(p.value, cx + 21, cy + 14);

      // Status badge
      const badgeBg = categoryBg[p.cat];
      const badgeLabel = categoryLabel[p.cat];
      const badgeW = pdf.getTextWidth(badgeLabel) + 8;
      pdf.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
      pdf.roundedRect(cx + 21, cy + 17, badgeW, 7, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(255, 255, 255);
      pdf.text(badgeLabel, cx + 21 + badgeW / 2, cy  + 21.5, { align: 'center' });
    });

    y += params.length / 2 * (cardH + gapY) + 8;

    // ── Key Recommendations ──
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(14, y, w - 28, 32, 3, 3, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text('KEY RECOMMENDATIONS', 20, y + 8);

    const recommendations: string[] = [];
    if (state.bpCategory === 'RED' || state.bpCategory === 'YELLOW') {
      recommendations.push('Monitor blood pressure regularly');
    }
    if (state.bmiCategory === 'RED' || state.bmiCategory === 'YELLOW') {
      recommendations.push('Maintain a balanced diet rich in fruits & vegetables');
    }
    if (state.sleepCategory === 'RED' || state.sleepCategory === 'YELLOW') {
      recommendations.push('Aim for 7-9 hours of quality sleep each night');
    }
    if (state.stressCategory === 'RED' || state.stressCategory === 'YELLOW') {
      recommendations.push('Practice stress-management techniques daily');
    }
    if (recommendations.length === 0) {
      recommendations.push('Continue maintaining your healthy lifestyle');
      recommendations.push('Regular health check-ups are recommended');
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    const recY = y + 14;
    recommendations.slice(0, 4).forEach((rec, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rx = 20 + col * ((w - 48) / 2);
      const ry = recY + row * 8;

      // Checkmark
      pdf.setFillColor(34, 197, 94);
      pdf.circle(rx, ry + 1, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(5);
      pdf.text('✓', rx, ry + 1.5, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105);
      pdf.text(rec, rx + 5, ry + 1.5);
    });

    y += 38;

    // ── Disclaimer ──
    pdf.setFillColor(255, 251, 235);
    pdf.roundedRect(14, y, w - 28, 12, 2, 2, 'F');
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(6);
    pdf.setTextColor(146, 64, 14);
    pdf.text('Disclaimer: This screening is for health awareness only and does not replace medical diagnosis or consultation.', 20, y + 5);
    pdf.text('Please consult a healthcare professional for detailed evaluation.', 20, y + 9);

    y += 18;

    // ── Footer ──
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(14, y, w - 14, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('DrMudhiwalla HealthTech Pvt Ltd | CIN: U86201DL2025PTC451980 | GST: 07AALCD8789M1ZL', w / 2, y, { align: 'center' });
    y += 4;
    pdf.text('www.drmudhiwalla.com | +91 98765 43210 | info@drmudhiwallahc.com', w / 2, y, { align: 'center' });

    pdf.save(`Screening-${state.screeningId}.pdf`);
  };

  return (
    <button className="btn btn-next" onClick={handleDownload} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download PDF Report
    </button>
  );
}
