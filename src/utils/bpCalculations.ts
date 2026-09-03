import { BloodPressureReading } from '../types';

export interface BPCategoryInfo {
  category: 'low' | 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  label: string;
  badgeClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
  isUrgent?: boolean;
}

/**
 * Returns AHA standard clinical reference benchmark for informational purposes.
 * Always explicitly labeled as informational reference, NOT medical diagnosis.
 */
export function getBPCategory(systolic: number, diastolic: number): BPCategoryInfo {
  if (systolic <= 0 || diastolic <= 0) {
    return {
      category: 'normal',
      label: 'Unspecified',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      bgClass: 'bg-slate-50 dark:bg-slate-900',
      textClass: 'text-slate-700 dark:text-slate-300',
      borderClass: 'border-slate-200 dark:border-slate-800',
      description: 'Standard reading',
    };
  }

  // Crisis check
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'crisis',
      label: 'Crisis Range (Informational)',
      badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      bgClass: 'bg-red-50 dark:bg-red-950/40',
      textClass: 'text-red-700 dark:text-red-400',
      borderClass: 'border-red-300 dark:border-red-800',
      description: 'Significantly elevated reading. If accompanied by symptoms, seek prompt medical care.',
      isUrgent: true,
    };
  }

  // Stage 2
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'stage2',
      label: 'Stage 2 Range',
      badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
      bgClass: 'bg-orange-50 dark:bg-orange-950/40',
      textClass: 'text-orange-700 dark:text-orange-400',
      borderClass: 'border-orange-300 dark:border-orange-800',
      description: 'Stage 2 benchmark. Please discuss persistent readings with your physician.',
    };
  }

  // Stage 1
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'stage1',
      label: 'Stage 1 Range',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
      textClass: 'text-amber-700 dark:text-amber-400',
      borderClass: 'border-amber-300 dark:border-amber-800',
      description: 'Stage 1 benchmark. Monitor over time with your healthcare provider.',
    };
  }

  // Elevated
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'elevated',
      label: 'Elevated Range',
      badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      bgClass: 'bg-yellow-50 dark:bg-yellow-950/40',
      textClass: 'text-yellow-700 dark:text-yellow-400',
      borderClass: 'border-yellow-300 dark:border-yellow-800',
      description: 'Slightly above normal reference baseline.',
    };
  }

  // Low
  if (systolic < 90 || diastolic < 60) {
    return {
      category: 'low',
      label: 'Low Range',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      bgClass: 'bg-blue-50 dark:bg-blue-950/40',
      textClass: 'text-blue-700 dark:text-blue-400',
      borderClass: 'border-blue-300 dark:border-blue-800',
      description: 'Lower than standard baseline. Ensure you are well hydrated.',
    };
  }

  // Normal
  return {
    category: 'normal',
    label: 'Normal Reference',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
    description: 'Within standard recommended guidelines (<120 / <80 mmHg).',
  };
}

export interface BPAverages {
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
  count: number;
}

export function calculateBPAverages(readings: BloodPressureReading[]): BPAverages {
  if (!readings || readings.length === 0) {
    return {
      avgSystolic: 0,
      avgDiastolic: 0,
      avgPulse: 0,
      minSystolic: 0,
      maxSystolic: 0,
      minDiastolic: 0,
      maxDiastolic: 0,
      count: 0,
    };
  }

  let totalSys = 0;
  let totalDia = 0;
  let totalPulse = 0;
  let minSys = Infinity;
  let maxSys = -Infinity;
  let minDia = Infinity;
  let maxDia = -Infinity;

  for (const r of readings) {
    totalSys += r.systolic;
    totalDia += r.diastolic;
    totalPulse += r.pulse || 0;
    if (r.systolic < minSys) minSys = r.systolic;
    if (r.systolic > maxSys) maxSys = r.systolic;
    if (r.diastolic < minDia) minDia = r.diastolic;
    if (r.diastolic > maxDia) maxDia = r.diastolic;
  }

  const count = readings.length;

  return {
    avgSystolic: Math.round(totalSys / count),
    avgDiastolic: Math.round(totalDia / count),
    avgPulse: Math.round(totalPulse / count),
    minSystolic: minSys === Infinity ? 0 : minSys,
    maxSystolic: maxSys === -Infinity ? 0 : maxSys,
    minDiastolic: minDia === Infinity ? 0 : minDia,
    maxDiastolic: maxDia === -Infinity ? 0 : maxDia,
    count,
  };
}

/**
 * Generates an exportable CSV of blood pressure records.
 */
export function exportBPReadingsToCSV(readings: BloodPressureReading[]): string {
  const headers = [
    'Date',
    'Time',
    'Systolic (mmHg)',
    'Diastolic (mmHg)',
    'Pulse (bpm)',
    'Arm',
    'Position',
    'Weight',
    'Medication Taken',
    'Context (Meds)',
    'Context (Exercise)',
    'Symptoms',
    'Notes',
  ];

  const rows = readings.map((r) => [
    `"${r.date}"`,
    `"${r.time || ''}"`,
    r.systolic,
    r.diastolic,
    r.pulse || '',
    `"${r.arm || 'left'}"`,
    `"${r.position || 'sitting'}"`,
    r.weight ? `"${r.weight}"` : '""',
    `"${(r.medicationTaken || '').replace(/"/g, '""')}"`,
    `"${r.beforeAfterMedication || 'none'}"`,
    `"${r.beforeAfterExercise || 'none'}"`,
    `"${(r.symptoms || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
