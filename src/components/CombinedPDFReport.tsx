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

const INK: [number, number, number] = [15, 23, 42];
const BLUE: [number, number, number] = [37, 99, 235];
const AMBER: [number, number, number] = [245, 158, 11];
const GREEN: [number, number, number] = [22, 163, 74];
const TERRA: [number, number, number] = [239, 68, 68];
const IVORY: [number, number, number] = [255, 255, 255];
const BEIGE: [number, number, number] = [244, 247, 251];
const HAIR: [number, number, number] = [226, 232, 240];
const MUTED: [number, number, number] = [100, 116, 139];
const PAPER: [number, number, number] = [255, 255, 255];
const PENDING: [number, number, number] = [148, 163, 184];

const categoryColors: Record<Category, { main: [number, number, number]; tint: [number, number, number] }> = {
  GREEN: { main: GREEN, tint: [220, 252, 231] },
  YELLOW: { main: AMBER, tint: [254, 249, 195] },
  RED: { main: TERRA, tint: [254, 226, 226] },
};

const categoryLabel: Record<Category, string> = {
  GREEN: 'NORMAL',
  YELLOW: 'MODERATE',
  RED: 'HIGH',
};

function sectionTitle(pdf: jsPDF, y: number, w: number, title: string, sub: string) {
  pdf.setFont('times', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  pdf.text(title, 14, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text(sub, w - 14, y, { align: 'right' });
  pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
  pdf.setLineWidth(0.4);
  pdf.line(14, y + 2.5, w - 14, y + 2.5);
}

export function generateCombinedPDF(participants: Participant[]) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  const fillPage = (topWhite: boolean) => {
    pdf.setFillColor(IVORY[0], IVORY[1], IVORY[2]);
    pdf.rect(0, 0, w, h, 'F');
    if (topWhite) {
      pdf.setFillColor(PAPER[0], PAPER[1], PAPER[2]);
      pdf.rect(0, 0, w, 26, 'F');
      pdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      pdf.rect(0, 26, w * 0.55, 1, 'F');
    }
  };

  const now = new Date();
  fillPage(true);

  // ── Header ──
  pdf.setFont('times', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  pdf.text('DrMudhiwalla', 14, 11);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text('HealthTech', pdf.getTextWidth('DrMudhiwalla') + 16, 11);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text('PVT LTD · DIAGNOSTIC & LIFESTYLE SCREENING · STAFF SUMMARY', 14, 15);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  pdf.text('Combined Screening Report', w - 14, 10, { align: 'right' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.4);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text('CAMP OVERVIEW', w - 14, 14, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.6);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text(`${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}  ·  ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, w - 14, 19, { align: 'right' });

  let y = 34;

  // ── Category overview ──
  sectionTitle(pdf, y, w, 'Category Overview', 'OVERALL RISK DISTRIBUTION');
  y += 5;

  const completed = participants.filter((p) => p.finalCategory);
  const greenCount = completed.filter((p) => p.finalCategory === 'GREEN').length;
  const yellowCount = completed.filter((p) => p.finalCategory === 'YELLOW').length;
  const redCount = completed.filter((p) => p.finalCategory === 'RED').length;
  const pendingCount = participants.length - completed.length;

  const cards = [
    { label: 'NORMAL', sub: 'Low risk', count: greenCount, cat: GREEN },
    { label: 'MODERATE', sub: 'Watch-list', count: yellowCount, cat: AMBER },
    { label: 'HIGH', sub: 'Needs follow-up', count: redCount, cat: TERRA },
    { label: 'PENDING', sub: 'Not completed', count: pendingCount, cat: PENDING },
  ];
  const cardGap = 3;
  const cardW = (w - 28 - cardGap * 3) / 4;
  cards.forEach((card, i) => {
    const cx = 14 + i * (cardW + cardGap);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(cx, y, cardW, 24, 2, 2, 'F');
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(cx, y, cardW, 24, 2, 2, 'S');
    pdf.setFillColor(card.cat[0], card.cat[1], card.cat[2]);
    pdf.circle(cx + 5, y + 5.5, 1.8, 'F');
    pdf.setFont('times', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text(String(card.count), cx + cardW - 5, y + 9.5, { align: 'right' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(4.6);
    pdf.setTextColor(card.cat[0], card.cat[1], card.cat[2]);
    pdf.text(card.label, cx + 5, y + 13);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.2);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text(card.sub, cx + 5, y + 19);
  });
  y += 24 + 8;

  // ── Participant table ──
  sectionTitle(pdf, y, w, 'Participant Details', `${participants.length} SCREENED`);
  y += 5;

  const cols = [
    { x: 16, label: '#', w: 8 },
    { x: 24, label: 'ID', w: 28 },
    { x: 56, label: 'NAME', w: 51 },
    { x: 111, label: 'AGE', w: 13 },
    { x: 126, label: 'GENDER', w: 18 },
    { x: 146, label: 'BP', w: 14 },
    { x: 162, label: 'BMI', w: 14 },
    { x: 178, label: 'BRI', w: 14 },
  ];

  pdf.setFillColor(BEIGE[0], BEIGE[1], BEIGE[2]);
  pdf.rect(14, y - 5, w - 28, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(4.8);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  cols.forEach((col) => {
    pdf.text(col.label, col.x, y + 0.5);
  });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(4.8);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text('OVERALL', w - 44, y + 0.5);
  y += 7;

  const rowH = 8;

  participants.forEach((p, i) => {
    if (y > h - 28) {
      pdf.addPage();
      pdf.setFillColor(IVORY[0], IVORY[1], IVORY[2]);
      pdf.rect(0, 0, w, h, 'F');
      y = 14;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(4.8);
      pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      cols.forEach((col) => {
        pdf.text(col.label, col.x, y + 0.5);
      });
      pdf.text('OVERALL', w - 44, y + 0.5);
      y += 7;
    }

    pdf.setFillColor(i % 2 === 0 ? 255 : 252, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 243);
    pdf.rect(14, y - 4, w - 28, rowH, 'F');
    pdf.setDrawColor(238, 232, 219);
    pdf.setLineWidth(0.2);
    pdf.line(14, y + 3.8, w - 14, y + 3.8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.4);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text(String(i + 1), cols[0].x, y + 1);
    pdf.text(p.screeningId, cols[1].x, y + 1);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(6.2);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text(p.name.substring(0, 20), cols[2].x, y + 1);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.4);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text(String(p.age), cols[3].x, y + 1);
    pdf.text(p.gender, cols[4].x, y + 1);

    const catFields = [
      { cat: p.bpCategory, col: cols[5] },
      { cat: p.bmiCategory, col: cols[6] },
      { cat: p.briCategory, col: cols[7] },
    ];
    catFields.forEach(({ cat, col }) => {
      if (cat) {
        const c = categoryColors[cat];
        const lbl = cat === 'GREEN' ? 'G' : cat === 'YELLOW' ? 'Y' : 'R';
        pdf.setFillColor(c.tint[0], c.tint[1], c.tint[2]);
        pdf.roundedRect(col.x - 1, y - 2.6, 7, 4.6, 1, 1, 'F');
        pdf.setDrawColor(c.main[0], c.main[1], c.main[2]);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(col.x - 1, y - 2.6, 7, 4.6, 1, 1, 'S');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(4.4);
        pdf.setTextColor(c.main[0], c.main[1], c.main[2]);
        pdf.text(lbl, col.x + 2.5, y + 0.4, { align: 'center' });
      } else {
        pdf.setTextColor(190, 182, 168);
        pdf.text('—', col.x + 2, y + 1);
      }
    });

    if (p.finalCategory) {
      const c = categoryColors[p.finalCategory];
      const lbl = categoryLabel[p.finalCategory];
      const bw = pdf.getTextWidth(lbl) + 6;
      pdf.setFillColor(c.tint[0], c.tint[1], c.tint[2]);
      pdf.roundedRect(w - 46, y - 2.6, bw, 4.6, 1, 1, 'F');
      pdf.setDrawColor(c.main[0], c.main[1], c.main[2]);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(w - 46, y - 2.6, bw, 4.6, 1, 1, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(4);
      pdf.setTextColor(c.main[0], c.main[1], c.main[2]);
      pdf.text(lbl, w - 46 + bw / 2, y + 0.5, { align: 'center' });
    } else {
      pdf.setTextColor(190, 182, 168);
      pdf.text('—', w - 40, y + 1);
    }

    y += rowH;
  });

  y += 6;

  // ── Parameter breakdown ──
  if (y > h - 62) {
    pdf.addPage();
    pdf.setFillColor(IVORY[0], IVORY[1], IVORY[2]);
    pdf.rect(0, 0, w, h, 'F');
    y = 24;
  }

  sectionTitle(pdf, y, w, 'Parameter Breakdown', 'RISK SHARE ACROSS PARAMETERS');
  y += 5;

  const paramNames = ['Blood Pressure', 'BMI', 'BRI', 'Sleep', 'Stress'];
  const paramKeys: (keyof Participant)[] = ['bpCategory', 'bmiCategory', 'briCategory', 'sleepCategory', 'stressCategory'];
  const barW = w - 56;

  paramNames.forEach((name, i) => {
    if (y > h - 24) {
      pdf.addPage();
      pdf.setFillColor(IVORY[0], IVORY[1], IVORY[2]);
      pdf.rect(0, 0, w, h, 'F');
      y = 24;
    }
    const key = paramKeys[i];
    const g = completed.filter((p) => p[key] === 'GREEN').length;
    const yl = completed.filter((p) => p[key] === 'YELLOW').length;
    const r = completed.filter((p) => p[key] === 'RED').length;
    const total = Math.max(g + yl + r, 1);

    pdf.setFont('times', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text(name, 16, y + 3.5);

    const bx = 62;
    const bh = 6;
    pdf.setFillColor(239, 233, 218);
    pdf.roundedRect(bx, y, barW, bh, 1.4, 1.4, 'F');

    const gW = (g / total) * barW;
    const ylW = (yl / total) * barW;
    const rW = (r / total) * barW;
    if (gW > 0) {
      pdf.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
      pdf.roundedRect(bx, y, gW, bh, 1.4, 1.4, 'F');
    }
    if (ylW > 0) {
      pdf.setFillColor(AMBER[0], AMBER[1], AMBER[2]);
      pdf.rect(bx + gW, y, ylW, bh, 'F');
    }
    if (rW > 0) {
      pdf.setFillColor(TERRA[0], TERRA[1], TERRA[2]);
      pdf.roundedRect(bx + gW + ylW, y, rW, bh, 1.4, 1.4, 'F');
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    const lx = bx + barW + 3;
    pdf.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    pdf.text(`${g}`, lx, y + 3.5);
    pdf.setTextColor(AMBER[0], AMBER[1], AMBER[2]);
    pdf.text(`${yl}`, lx + 8, y + 3.5);
    pdf.setTextColor(TERRA[0], TERRA[1], TERRA[2]);
    pdf.text(`${r}`, lx + 16, y + 3.5);

    y += 9.5;
  });

  y += 3;

  // ── Legend ──
  const legend = [
    { label: 'NORMAL', c: GREEN },
    { label: 'MODERATE', c: AMBER },
    { label: 'HIGH', c: TERRA },
  ] as { label: string; c: [number, number, number] }[];
  let lx2 = 14;
  legend.forEach((item) => {
    pdf.setFillColor(item.c[0], item.c[1], item.c[2]);
    pdf.circle(lx2 + 1.4, y + 0.6, 1.6, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(4.8);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text(item.label, lx2 + 5, y + 1.2);
    lx2 += pdf.getTextWidth(item.label) + 22;
  });

  y += 10;

  // ── Disclaimer + footer ──
  if (y > h - 20) {
    pdf.addPage();
    pdf.setFillColor(IVORY[0], IVORY[1], IVORY[2]);
    pdf.rect(0, 0, w, h, 'F');
    y = 24;
  }
  pdf.setFillColor(BEIGE[0], BEIGE[1], BEIGE[2]);
  pdf.roundedRect(14, y, w - 28, 11, 2, 2, 'F');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.2);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text('Disclaimer: This combined report is for health awareness only and does not replace a medical diagnosis.', 18, y + 4.5);
  pdf.text('Please consult a healthcare professional for a detailed evaluation of each participant.', 18, y + 8.2);

  y += 15;
  pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
  pdf.setLineWidth(0.3);
  pdf.line(14, y, w - 14, y);
  y += 4;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.6);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text('DrMudhiwalla HealthTech Pvt Ltd · Diagnostic & Lifestyle Screening Centre | www.drmudhiwalla.com', w / 2, y, { align: 'center' });

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
        background: '#1E2B29', fontSize: 12, padding: '8px 16px',
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