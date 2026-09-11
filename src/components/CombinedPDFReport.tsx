'use client';

import jsPDF from 'jspdf';
import { Category } from '@/lib/types';

interface Participant {
  screeningId: string;
  name: string;
  age: number;
  gender: string;
  finalCategory: Category | null;
  bpCategory: Category | null;
  bmiCategory: Category | null;
  briCategory: Category | null;
  sleepCategory: Category | null;
  stressCategory: Category | null;
  status: string;
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

export function generateCombinedPDF(participants: Participant[]) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

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
  pdf.text('HealthTech Pvt Ltd', 14, 20);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  const now = new Date();
  pdf.text(`Generated: ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, w - 14, 12, { align: 'right' });
  pdf.text(`Time: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, w - 14, 18, { align: 'right' });

  let y = 42;

  // ── Title ──
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(15, 23, 42);
  pdf.text('COMBINED SCREENING REPORT', w / 2, y, { align: 'center' });
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${participants.length} participant(s)`, w / 2, y, { align: 'center' });
  y += 10;

  // ── Category Summary ──
  const completed = participants.filter((p) => p.finalCategory);
  const greenCount = completed.filter((p) => p.finalCategory === 'GREEN').length;
  const yellowCount = completed.filter((p) => p.finalCategory === 'YELLOW').length;
  const redCount = completed.filter((p) => p.finalCategory === 'RED').length;
  const pendingCount = participants.length - completed.length;

  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(14, y, w - 28, 10, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('CATEGORY OVERVIEW', 20, y + 7);
  y += 16;

  // Summary cards
  const cardW = (w - 36) / 4;
  const cards = [
    { label: 'NORMAL', count: greenCount, color: categoryBg.GREEN },
    { label: 'MODERATE', count: yellowCount, color: categoryBg.YELLOW },
    { label: 'HIGH', count: redCount, color: categoryBg.RED },
    { label: 'PENDING', count: pendingCount, color: [148, 163, 184] as [number, number, number] },
  ];

  cards.forEach((card, i) => {
    const cx = 14 + i * (cardW + 2);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(cx, y, cardW, 24, 3, 3, 'F');

    // Color dot
    pdf.setFillColor(card.color[0], card.color[1], card.color[2]);
    pdf.circle(cx + cardW / 2, y + 8, 4, 'F');

    // Count
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(card.color[0], card.color[1], card.color[2]);
    pdf.text(String(card.count), cx + cardW / 2, y + 8, { align: 'center' });

    // Label
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    pdf.text(card.label, cx + cardW / 2, y + 18, { align: 'center' });
  });

  y += 32;

  // ── Participant List Header ──
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(14, y, w - 28, 10, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('PARTICIPANT DETAILS', 20, y + 7);
  y += 14;

  // Table header
  const cols = [
    { x: 16, label: '#', w: 8 },
    { x: 24, label: 'ID', w: 28 },
    { x: 56, label: 'NAME', w: 50 },
    { x: 110, label: 'AGE', w: 14 },
    { x: 128, label: 'GENDER', w: 18 },
    { x: 148, label: 'BP', w: 14 },
    { x: 164, label: 'BMI', w: 14 },
    { x: 178, label: 'BRI', w: 14 },
  ];

  pdf.setFillColor(248, 250, 252);
  pdf.rect(14, y, w - 28, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  cols.forEach((col) => {
    pdf.text(col.label, col.x, y + 5);
  });
  y += 7;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);

  participants.forEach((p, i) => {
    if (y > h - 30) {
      // New page
      pdf.addPage();
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, w, h, 'F');
      y = 20;
    }

    const rowH = 8;
    const bgColor = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(14, y - 4, w - 28, rowH, 'F');

    pdf.setTextColor(71, 85, 105);
    pdf.text(String(i + 1), cols[0].x, y + 2);
    pdf.text(p.screeningId, cols[1].x, y + 2);
    pdf.setTextColor(15, 23, 42);
    pdf.text(p.name.substring(0, 20), cols[2].x, y + 2);
    pdf.setTextColor(71, 85, 105);
    pdf.text(String(p.age), cols[3].x, y + 2);
    pdf.text(p.gender, cols[4].x, y + 2);

    // Category badges for BP, BMI, BRI
    const catFields = [
      { cat: p.bpCategory, col: cols[5] },
      { cat: p.bmiCategory, col: cols[6] },
      { cat: p.briCategory, col: cols[7] },
    ];

    catFields.forEach(({ cat, col }) => {
      if (cat) {
        const bg = categoryBg[cat];
        const lbl = cat === 'GREEN' ? 'G' : cat === 'YELLOW' ? 'Y' : 'R';
        pdf.setFillColor(bg[0], bg[1], bg[2]);
        pdf.roundedRect(col.x - 1, y - 1, 8, 5, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6);
        pdf.setTextColor(255, 255, 255);
        pdf.text(lbl, col.x + 3, y + 2.5, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
      } else {
        pdf.setTextColor(180, 180, 180);
        pdf.text('—', col.x + 3, y + 2);
      }
    });

    // Final category on far right
    if (p.finalCategory) {
      const bg = categoryBg[p.finalCategory];
      const lbl = categoryLabel[p.finalCategory];
      pdf.setFillColor(bg[0], bg[1], bg[2]);
      pdf.roundedRect(w - 42, y - 1, 24, 5, 1, 1, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5);
      pdf.setTextColor(255, 255, 255);
      pdf.text(lbl, w - 30, y + 2.5, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
    } else {
      pdf.setTextColor(180, 180, 180);
      pdf.text('—', w - 35, y + 2);
    }

    y += rowH;
  });

  y += 6;

  // ── Parameter Breakdown ──
  if (y > h - 60) {
    pdf.addPage();
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, w, h, 'F');
    y = 20;
  }

  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(14, y, w - 28, 10, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('PARAMETER BREAKDOWN', 20, y + 7);
  y += 16;

  const paramNames = ['Blood Pressure', 'BMI', 'BRI', 'Sleep', 'Stress'];
  const paramKeys: (keyof Participant)[] = ['bpCategory', 'bmiCategory', 'briCategory', 'sleepCategory', 'stressCategory'];

  const barW = w - 50;
  paramNames.forEach((name, i) => {
    if (y > h - 20) {
      pdf.addPage();
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, w, h, 'F');
      y = 20;
    }

    const key = paramKeys[i];
    const g = completed.filter((p) => p[key] === 'GREEN').length;
    const yl = completed.filter((p) => p[key] === 'YELLOW').length;
    const r = completed.filter((p) => p[key] === 'RED').length;
    const total = Math.max(g + yl + r, 1);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text(name, 16, y + 4);

    const bx = 60;
    const bh = 5;

    // Background
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(bx, y, barW, bh, 1, 1, 'F');

    // Green
    const gW = (g / total) * barW;
    if (gW > 0) {
      pdf.setFillColor(34, 197, 94);
      pdf.roundedRect(bx, y, gW, bh, 1, 1, 'F');
    }

    // Yellow
    const ylW = (yl / total) * barW;
    if (ylW > 0) {
      pdf.setFillColor(234, 179, 8);
      pdf.rect(bx + gW, y, ylW, bh, 'F');
    }

    // Red
    const rW = (r / total) * barW;
    if (rW > 0) {
      pdf.setFillColor(239, 68, 68);
      pdf.roundedRect(bx + gW + ylW, y, rW, bh, 1, 1, 'F');
    }

    // Legend
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    const lx = bx + barW + 4;
    pdf.text(`${g}G`, lx, y + 3);
    pdf.text(`${yl}Y`, lx + 10, y + 3);
    pdf.text(`${r}R`, lx + 20, y + 3);

    y += 10;
  });

  y += 6;

  // ── Disclaimer ──
  if (y > h - 20) {
    pdf.addPage();
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, w, h, 'F');
    y = 20;
  }

  pdf.setFillColor(255, 251, 235);
  pdf.roundedRect(14, y, w - 28, 12, 2, 2, 'F');
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(6);
  pdf.setTextColor(146, 64, 14);
  pdf.text('Disclaimer: This combined report is for health awareness only and does not replace medical diagnosis.', 20, y + 5);
  pdf.text('Please consult a healthcare professional for detailed evaluation of each participant.', 20, y + 9);
  y += 18;

  // ── Footer ──
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(14, y, w - 14, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text('DrMudhiwalla HealthTech Pvt Ltd | www.drmudhiwalla.com', w / 2, y, { align: 'center' });

  pdf.save(`Combined-Report-${now.toISOString().slice(0, 10)}.pdf`);
}

interface CombinedPDFReportProps {
  participants: Participant[];
}

export default function CombinedPDFReport({ participants }: CombinedPDFReportProps) {
  return (
    <button
      className="btn btn-next"
      onClick={() => generateCombinedPDF(participants)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#8b5cf6', fontSize: 12, padding: '8px 16px',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      Combined Report ({participants.length})
    </button>
  );
}
