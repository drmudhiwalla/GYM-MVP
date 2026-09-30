'use client';

import jsPDF from 'jspdf';
import { ScreeningState } from '@/lib/context';
import { Category } from '@/lib/types';

interface PDFReportProps {
  state: ScreeningState;
}

const INK: [number, number, number] = [15, 23, 42];
const BLUE: [number, number, number] = [37, 99, 235];
const AMBER: [number, number, number] = [245, 158, 11];
const GREEN: [number, number, number] = [22, 163, 74];
const RED: [number, number, number] = [239, 68, 68];
const PANEL: [number, number, number] = [244, 247, 251];
const HAIR: [number, number, number] = [226, 232, 240];
const MUTED: [number, number, number] = [100, 116, 139];
const TRACK: [number, number, number] = [231, 236, 242];

const categoryColors: Record<Category, [number, number, number]> = {
  GREEN,
  YELLOW: AMBER,
  RED,
};

const categoryLabel: Record<Category, string> = {
  GREEN: 'NORMAL',
  YELLOW: 'MODERATE',
  RED: 'HIGH',
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

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

function badge(pdf: jsPDF, x: number, y: number, cat: Category) {
  const c = categoryColors[cat];
  const label = categoryLabel[cat];
  const bw = pdf.getTextWidth(label) + 7;
  pdf.setFillColor(c[0], c[1], c[2]);
  pdf.roundedRect(x, y, bw, 5, 2.4, 2.4, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(4.6);
  pdf.setTextColor(255, 255, 255);
  pdf.text(label, x + bw / 2, y + 3.4, { align: 'center' });
}

function rangeBar(pdf: jsPDF, x: number, y: number, width: number, pct: number) {
  const h = 2.6;
  pdf.setFillColor(TRACK[0], TRACK[1], TRACK[2]);
  pdf.roundedRect(x, y, width, h, 1.3, 1.3, 'F');
  const mx = x + clamp(pct) * width;
  pdf.setFillColor(INK[0], INK[1], INK[2]);
  pdf.roundedRect(mx - 1.4, y - 1.6, 2, h + 3.2, 1, 1, 'F');
}

function factorCard(
  pdf: jsPDF,
  x: number,
  y: number,
  cw: number,
  ch: number,
  name: string,
  value: string,
  cat: Category,
  pct: number,
  minL: string,
  maxL: string,
  desc: string,
) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, cw, ch, 2, 2, 'F');
  pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, cw, ch, 2, 2, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(4.8);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  pdf.text(name.toUpperCase(), x + 3.5, y + 4.5);

  badge(pdf, x + cw - pdf.getTextWidth(categoryLabel[cat]) - 10, y + 1.8, cat);

  pdf.setFont('times', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(INK[0], INK[1], INK[2]);
  pdf.text(value, x + 3.5, y + 9);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(4.2);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text(`${minL}`, x + 3.5, y + 13.2);
  pdf.text(`${maxL}`, x + cw - 3.5, y + 13.2, { align: 'right' });

  rangeBar(pdf, x + 3.5, y + 15, cw - 7, pct);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(4.8);
  pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  pdf.text(desc, x + 3.5, y + 20, { maxWidth: cw - 7, lineHeightFactor: 1.2 });
}

export default function PDFReport({ state }: PDFReportProps) {
  const handleDownload = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();

    const cat = state.finalCategory || 'GREEN';
    const riskScore = cat === 'GREEN' ? 1 : cat === 'YELLOW' ? 3 : 5;
    const riskColor = categoryColors[cat];
    const riskTitle = cat === 'GREEN' ? 'Low Risk' : cat === 'YELLOW' ? 'Potential Risk' : 'High Risk';

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatTime = (iso: string) =>
      new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const bpSys = state.bpSystolic || 0;
    const bmi = state.bmiValue || 0;
    const sleep = state.sleepScore || 0;
    const stress = state.stressScore || 0;

    const descFor = (k: 'bp' | 'bmi' | 'sleep' | 'stress') => {
      const c = (k === 'bp' ? state.bpCategory : k === 'bmi' ? state.bmiCategory : k === 'sleep' ? state.sleepCategory : state.stressCategory)!;
      const map: Record<string, Record<string, string>> = {
        GREEN: {
          bp: 'Within the optimal range — keep it up.',
          bmi: 'In the healthy range. Good balance.',
          sleep: 'Good sleep quality — no significant disturbance.',
          stress: 'Low perceived stress. Well managed.',
        },
        YELLOW: {
          bp: 'A little above optimal. Monitor regularly.',
          bmi: 'A mild deviation from the healthy range.',
          sleep: 'Mild disturbance. Aim for consistent 7–9 hours.',
          stress: 'Moderate stress. Practise daily relaxation.',
        },
        RED: {
          bp: 'In the high band. Clinician follow-up advised.',
          bmi: 'Above the healthy range. Diet follow-up advised.',
          sleep: 'Significant disturbance. Sleep consult recommended.',
          stress: 'High stress. Counselling is recommended.',
        },
      };
      return map[c][k];
    };

    // ═══ SINGLE PAGE ═══
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, w, h, 'F');

    // Header
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, w, 26, 'F');
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.4);
    pdf.line(0, 26, w, 26);
    pdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    pdf.rect(0, 26, w * 0.55, 1, 'F');

    pdf.setFont('times', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text('DrMudhiwalla', 14, 11);
    pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    pdf.text('HealthTech', pdf.getTextWidth('DrMudhiwalla') + 16, 11);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text('PVT LTD · DIAGNOSTIC & LIFESTYLE SCREENING', 14, 15);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text('Screening Report', w - 14, 10, { align: 'right' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.4);
    pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    pdf.text('WELLNESS & RISK PROFILE', w - 14, 14, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.6);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text(`${formatDate(state.createdAt)}  ·  ${formatTime(state.createdAt)}  ·  Ref: ${state.screeningId}`, w - 14, 19, { align: 'right' });

    // ── Patient strip ──
    let y = 27;
    const stripH = 15;
    y += 3;
    const genderLabel = state.gender.toLowerCase() === 'male' ? 'Male' : state.gender.toLowerCase() === 'female' ? 'Female' : 'Other';
    const strip = [
      { l: 'PATIENT', v: state.name },
      { l: 'AGE / GENDER', v: `${state.age} · ${genderLabel}` },
      { l: 'HEIGHT', v: `${state.heightCm || '—'} cm` },
      { l: 'WEIGHT', v: `${state.weightKg || '—'} kg` },
      { l: 'BMI', v: `${bmi || '—'} kg/m²` },
    ];
    const cellW = (w - 28) / strip.length;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(14, y, w - 28, stripH, 2, 2, 'F');
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(14, y, w - 28, stripH, 2, 2, 'S');
    strip.forEach((cell, i) => {
      const cx = 14 + i * cellW;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(4.4);
      pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      pdf.text(cell.l, cx + 4, y + 4.5);
      pdf.setFont('times', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(INK[0], INK[1], INK[2]);
      pdf.text(cell.v, cx + 4, y + 10, { maxWidth: cellW - 6 });
      if (i < strip.length - 1) {
        pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
        pdf.setLineWidth(0.3);
        pdf.line(cx + cellW, y + 2, cx + cellW, y + stripH - 2);
      }
    });
    y += stripH + 8;

    // ── Overall risk card ──
    sectionTitle(pdf, y, w, 'Overall Lifestyle Risk Profile', 'COMPOSITE · 5 FACTORS');
    y += 5;

    const cardH = 44;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(14, y, w - 28, cardH, 2, 2, 'F');
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(14, y, w - 28, cardH, 2, 2, 'S');

    const gaugeW = 62;
    pdf.setFillColor(PANEL[0], PANEL[1], PANEL[2]);
    pdf.rect(15, y + 1, gaugeW, cardH - 2, 'F');
    const gx = 15 + gaugeW / 2;
    const gy = y + cardH / 2 - 8;
    const gR = 12;
    pdf.setDrawColor(TRACK[0], TRACK[1], TRACK[2]);
    pdf.setLineWidth(4);
    for (let i = 0; i < 24; i++) {
      const a1 = Math.PI - (i / 24) * Math.PI;
      const a2 = Math.PI - ((i + 1) / 24) * Math.PI;
      pdf.line(gx + gR * Math.cos(a1), gy - gR * Math.sin(a1), gx + gR * Math.cos(a2), gy - gR * Math.sin(a2));
    }
    pdf.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
    const filledSteps = Math.round((riskScore / 5) * 24);
    for (let i = 0; i < filledSteps; i++) {
      const a1 = Math.PI - (i / 24) * Math.PI;
      const a2 = Math.PI - ((i + 1) / 24) * Math.PI;
      pdf.line(gx + gR * Math.cos(a1), gy - gR * Math.sin(a1), gx + gR * Math.cos(a2), gy - gR * Math.sin(a2));
    }
    const na = Math.PI - (riskScore / 5) * Math.PI;
    pdf.setDrawColor(INK[0], INK[1], INK[2]);
    pdf.setLineWidth(0.8);
    pdf.line(gx, gy, gx + (gR - 2) * Math.cos(na), gy - (gR - 2) * Math.sin(na));
    pdf.setFillColor(INK[0], INK[1], INK[2]);
    pdf.circle(gx, gy, 1.2, 'F');
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text(`${riskScore} / 5`, gx, gy + gR + 7, { align: 'center' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(4.4);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text('OVERALL SCORE', gx, gy + gR + 10.5, { align: 'center' });

    const mx = 15 + gaugeW + 6;
    const mw = w - 14 - mx - 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(4.8);
    pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    pdf.text('OVERALL LIFESTYLE RISK PROFILE', mx, y + 5.5);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    pdf.text(riskTitle, mx, y + 11);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.6);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text(
      cat === 'GREEN'
        ? 'Your overall composite score sits in the low band. Keep up what is working — consistency is all that is needed.'
        : cat === 'YELLOW'
        ? 'Your overall composite score sits in the moderate band. A few lifestyle factors deserve your attention before they progress.'
        : 'Your overall composite score sits in the high band. We strongly recommend booking a clinician consultation at the earliest.',
      mx,
      y + 15.5,
      { maxWidth: mw, lineHeightFactor: 1.3 },
    );

    const segW = (mw - 10) / 5;
    for (let i = 0; i < 5; i++) {
      pdf.setFillColor(i < riskScore ? riskColor[0] : TRACK[0], i < riskScore ? riskColor[1] : TRACK[1], i < riskScore ? riskColor[2] : TRACK[2]);
      pdf.roundedRect(mx + i * (segW + 1.5), y + cardH - 10, segW, 3.2, 1.6, 1.6, 'F');
    }
    y += cardH + 8;

    // ── Screened factors ──
    sectionTitle(pdf, y, w, 'Screened Factors', 'SEVEN PARAMETERS');
    y += 5;

    const smokingValue =
      state.smokingCurrent ? 'Current smoker'
      : state.smokingPast ? 'Former smoker'
      : 'Never smoked';
    const smokingCat = (state.smokingCategory ?? 'GREEN') as Category;
    const smokingDesc =
      smokingCat === 'RED' ? 'Currently smoking — cessation support advised.'
      : smokingCat === 'YELLOW' ? 'Former smoker — relapse risk, stay supported.'
      : 'Never smoked. Excellent.';

    const cols = 4;
    const gap = 3;
    const fw = (w - 28 - (cols - 1) * gap) / cols;
    const fh = 22;
    const factors = [
      { name: 'Blood Pressure', value: `${state.bpSystolic} / ${state.bpDiastolic} mmHg`, cat: state.bpCategory!, pct: clamp((bpSys - 80) / 100), min: '80 mmHg', max: '180 mmHg', desc: descFor('bp') },
      { name: 'Body Mass Index', value: `${bmi} kg/m²`, cat: state.bmiCategory!, pct: clamp((bmi - 15) / 20), min: '15', max: '35 kg/m²', desc: descFor('bmi') },
      { name: 'Sleep Quality', value: `${sleep} / 15`, cat: state.sleepCategory!, pct: clamp(sleep / 15), min: '0', max: '15', desc: descFor('sleep') },
      { name: 'Stress Level', value: `${stress} / 16`, cat: state.stressCategory!, pct: clamp(stress / 16), min: '0', max: '16', desc: descFor('stress') },
      {
        name: 'Family History',
        value: state.familyHistory ? 'Yes' : 'No',
        cat: (state.familyHistory ? 'YELLOW' : 'GREEN') as Category,
        pct: 0,
        min: '',
        max: '',
        desc: state.familyHistory ? 'Relevant family factors noted — stay vigilant.' : 'No notable family factors reported.',
      },
      {
        name: 'Medical History',
        value: state.medicalHistory ? 'Yes' : 'No',
        cat: (state.medicalHistory ? 'RED' : 'GREEN') as Category,
        pct: 0,
        min: '',
        max: '',
        desc: state.medicalHistory ? 'Existing condition noted — follow guidance.' : 'No current medical conditions reported.',
      },
      {
        name: 'Smoking',
        value: smokingValue,
        cat: smokingCat,
        pct: 0,
        min: '',
        max: '',
        desc: smokingDesc,
      },
    ];

    factors.forEach((f, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      factorCard(pdf, 14 + col * (fw + gap), y + row * (fh + gap), fw, fh, f.name, f.value, f.cat, f.pct, f.min, f.max, f.desc);
    });
    y += Math.ceil(factors.length / cols) * (fh + gap) + 8;

    // ── Reading in context ──
    sectionTitle(pdf, y, w, 'Reading in Context', 'BENCHMARKS & SCALES');
    y += 5;

    const ctxW = (w - 28 - gap) / 2;
    const ctxH = 40;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(14, y, ctxW, ctxH, 2, 2, 'F');
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(14, y, ctxW, ctxH, 2, 2, 'S');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text('BLOOD PRESSURE · CLASSIFICATION BAND', 17.5, y + 5);

    const bx = 17.5;
    const bw2 = ctxW - 7;
    const zones = [
      { fr: 90, to: 120, c: GREEN },
      { fr: 120, to: 130, c: [74, 222, 128] as [number, number, number] },
      { fr: 130, to: 140, c: [250, 204, 21] as [number, number, number] },
      { fr: 140, to: 180, c: RED },
    ];
    zones.forEach((z) => {
      const zw = ((z.to - z.fr) / 90) * bw2;
      pdf.setFillColor(z.c[0], z.c[1], z.c[2]);
      pdf.rect(bx + ((z.fr - 90) / 90) * bw2, y + 8, zw, 6, 'F');
    });
    const bpMark = bx + clamp((bpSys - 90) / 90) * bw2;
    pdf.setDrawColor(INK[0], INK[1], INK[2]);
    pdf.setLineWidth(1);
    pdf.line(bpMark, y + 6, bpMark, y + 16);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(4.6);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text(`You · ${bpSys}`, bpMark, y + 20.5, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.2);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    [90, 120, 140, 160, 180].forEach((t) => {
      const tx = bx + ((t - 90) / 90) * bw2;
      pdf.text(String(t), tx, y + 25, { align: 'center' });
    });

    const x2 = 14 + ctxW + gap;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x2, y, ctxW, ctxH, 2, 2, 'F');
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x2, y, ctxW, ctxH, 2, 2, 'S');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5);
    pdf.setTextColor(INK[0], INK[1], INK[2]);
    pdf.text('FACTOR SCORES · RELATIVE TO SCALE', x2 + 3.5, y + 5);

    const lrows = [
      { n: 'Stress level', v: `${stress}/16`, pct: clamp(stress / 16) },
      { n: 'Sleep disturbance', v: `${sleep}/15`, pct: clamp(sleep / 15) },
      { n: 'BMI vs upper normal', v: `${bmi}`, pct: clamp(bmi / 35) },
      { n: 'Overall risk composite', v: `${riskScore}/5`, pct: clamp(riskScore / 5) },
    ];
    lrows.forEach((r, i) => {
      const ry = y + 9 + i * 6.8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(4.2);
      pdf.setTextColor(INK[0], INK[1], INK[2]);
      pdf.text(r.n.toUpperCase(), x2 + 3.5, ry);
      pdf.setFillColor(TRACK[0], TRACK[1], TRACK[2]);
      pdf.roundedRect(x2 + 3.5, ry + 1.6, ctxW - 26, 2.4, 1.2, 1.2, 'F');
      pdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      if (r.pct > 0) pdf.roundedRect(x2 + 3.5, ry + 1.6, Math.max(1.4, r.pct * (ctxW - 26)), 2.4, 1.2, 1.2, 'F');
      pdf.setFont('times', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(INK[0], INK[1], INK[2]);
      pdf.text(r.v, x2 + ctxW - 3.5, ry + 3.2, { align: 'right' });
    });
    y += ctxH + 8;

    // ── Key recommendations ──
    sectionTitle(pdf, y, w, 'Key Recommendations', 'PERSONALISED PLAN');
    y += 5;

    const recommendations: string[] = [];
    if (state.bpCategory === 'RED' || state.bpCategory === 'YELLOW') recommendations.push('Monitor blood pressure regularly and watch salt intake');
    if (state.bmiCategory === 'RED' || state.bmiCategory === 'YELLOW') recommendations.push('Maintain a balanced diet rich in fruits & vegetables, and move daily');
    if (state.sleepCategory === 'RED' || state.sleepCategory === 'YELLOW') recommendations.push('Aim for 7–9 hours of quality, consistent sleep each night');
    if (state.stressCategory === 'RED' || state.stressCategory === 'YELLOW') recommendations.push('Practise daily stress-management: breathing, walks or journaling');
    if (recommendations.length === 0) {
      recommendations.push('Continue maintaining your healthy lifestyle');
      recommendations.push('Keep regular annual health check-ups');
    }

    const recoH = 30;
    pdf.setFillColor(PANEL[0], PANEL[1], PANEL[2]);
    pdf.roundedRect(14, y, w - 28, recoH, 2.5, 2.5, 'F');
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(14, y, w - 28, recoH, 2.5, 2.5, 'S');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.6);
    pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    pdf.text('KEY RECOMMENDATIONS', 19, y + 7);

    recommendations.slice(0, 4).forEach((rec, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 19 + col * ((w - 60) / 2);
      const cy = y + 13 + row * 8.5;
      pdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      pdf.circle(cx, cy, 3.2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(4.6);
      pdf.setTextColor(255, 255, 255);
      pdf.text('✓', cx, cy + 1.1, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.4);
      pdf.setTextColor(INK[0], INK[1], INK[2]);
      pdf.text(rec, cx + 6, cy + 1.2, { maxWidth: (w - 60) / 2 - 8, lineHeightFactor: 1.2 });
    });

    y += recoH + 8;

    // ── Disclaimer ──
    pdf.setFillColor(PANEL[0], PANEL[1], PANEL[2]);
    pdf.roundedRect(14, y, w - 28, 11, 2, 2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.2);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text('Disclaimer: This screening is for health awareness only and does not replace a medical diagnosis or consultation.', 18, y + 4.5);
    pdf.text('Please consult a healthcare professional for a detailed evaluation.', 18, y + 8.2);

    // ── Footer ──
    y += 14;
    pdf.setDrawColor(HAIR[0], HAIR[1], HAIR[2]);
    pdf.setLineWidth(0.3);
    pdf.line(14, y, w - 14, y);
    y += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.6);
    pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    pdf.text('DrMudhiwalla HealthTech Pvt Ltd · Diagnostic & Lifestyle Screening Centre', w / 2, y, { align: 'center' });
    y += 3.6;
    pdf.text('www.drmudhiwalla.com | +91 98765 43210', w / 2, y, { align: 'center' });

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