import React, { useState } from 'react';
import { X, Activity, Heart, Calendar, Clock, AlertCircle } from 'lucide-react';
import { BloodPressureReading } from '../../types';
import { getBPCategory } from '../../utils/bpCalculations';

interface BloodPressureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reading: BloodPressureReading) => void;
  initialReading?: BloodPressureReading | null;
}

export const BloodPressureFormModal: React.FC<BloodPressureFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReading,
}) => {
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [date, setDate] = useState(initialReading?.date || defaultDate);
  const [time, setTime] = useState(initialReading?.time || defaultTime);
  const [systolic, setSystolic] = useState<number | string>(initialReading?.systolic || 120);
  const [diastolic, setDiastolic] = useState<number | string>(initialReading?.diastolic || 80);
  const [pulse, setPulse] = useState<number | string>(initialReading?.pulse || 72);
  const [arm, setArm] = useState<'left' | 'right'>(initialReading?.arm || 'left');
  const [position, setPosition] = useState<'sitting' | 'standing' | 'lying'>(initialReading?.position || 'sitting');
  const [weight, setWeight] = useState<number | string>(initialReading?.weight || '');
  const [medicationTaken, setMedicationTaken] = useState(initialReading?.medicationTaken || '');
  const [beforeAfterMedication, setBeforeAfterMedication] = useState<'none' | 'before' | 'after'>(
    initialReading?.beforeAfterMedication || 'none'
  );
  const [beforeAfterExercise, setBeforeAfterExercise] = useState<'none' | 'before' | 'after' | 'resting'>(
    initialReading?.beforeAfterExercise || 'resting'
  );
  const [symptoms, setSymptoms] = useState(initialReading?.symptoms || '');
  const [notes, setNotes] = useState(initialReading?.notes || '');
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initialReading?.weight || initialReading?.symptoms || initialReading?.medicationTaken)
  );

  if (!isOpen) return null;

  const numSys = Number(systolic) || 0;
  const numDia = Number(diastolic) || 0;
  const categoryInfo = getBPCategory(numSys, numDia);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numSys || !numDia) return;

    const newRecord: BloodPressureReading = {
      id: initialReading?.id || `bp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date,
      time,
      systolic: numSys,
      diastolic: numDia,
      pulse: Number(pulse) || 0,
      arm,
      position,
      weight: weight ? Number(weight) : undefined,
      medicationTaken: medicationTaken.trim() || undefined,
      beforeAfterMedication,
      beforeAfterExercise,
      symptoms: symptoms.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: initialReading?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 id="bp-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                {initialReading ? 'Edit BP Reading' : 'Record Blood Pressure'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record your systolic, diastolic, and pulse measurements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main 3 High-Contrast BP Inputs */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Systolic */}
            <div className="text-center">
              <label
                htmlFor="bp-sys-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
              >
                Systolic
              </label>
              <div className="relative">
                <input
                  id="bp-sys-input"
                  type="number"
                  min="50"
                  max="260"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full text-center text-3xl font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 focus:border-rose-500 py-2.5 shadow-sm"
                  placeholder="120"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">mmHg (Upper)</span>
            </div>

            {/* Diastolic */}
            <div className="text-center">
              <label
                htmlFor="bp-dia-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
              >
                Diastolic
              </label>
              <div className="relative">
                <input
                  id="bp-dia-input"
                  type="number"
                  min="30"
                  max="160"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full text-center text-3xl font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 focus:border-rose-500 py-2.5 shadow-sm"
                  placeholder="80"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">mmHg (Lower)</span>
            </div>

            {/* Pulse */}
            <div className="text-center">
              <label
                htmlFor="bp-pulse-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
              >
                Pulse / HR
              </label>
              <div className="relative">
                <input
                  id="bp-pulse-input"
                  type="number"
                  min="30"
                  max="220"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full text-center text-3xl font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 focus:border-rose-500 py-2.5 shadow-sm"
                  placeholder="72"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">bpm</span>
            </div>
          </div>

          {/* Real-time Informational Reference Indicator */}
          {numSys > 0 && numDia > 0 && (
            <div className={`p-3 rounded-xl border text-sm flex items-start gap-2.5 ${categoryInfo.bgClass} ${categoryInfo.borderClass}`}>
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${categoryInfo.textClass}`} />
              <div>
                <span className={`inline-block font-bold text-xs uppercase px-2 py-0.5 rounded-full mr-2 ${categoryInfo.badgeClass}`}>
                  {categoryInfo.label}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {categoryInfo.description} (Standard clinical guideline reference only. Not a medical diagnosis.)
                </p>
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bp-date-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="bp-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div>
              <label htmlFor="bp-time-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="bp-time-input"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Arm and Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Arm Used
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setArm('left')}
                  className={`py-2 text-sm font-medium rounded-xl border transition-all ${
                    arm === 'left'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Left Arm
                </button>
                <button
                  type="button"
                  onClick={() => setArm('right')}
                  className={`py-2 text-sm font-medium rounded-xl border transition-all ${
                    arm === 'right'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Right Arm
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Body Position
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['sitting', 'standing', 'lying'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`py-2 capitalize text-xs font-medium rounded-xl border transition-all ${
                      position === pos
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle for Optional Context (Weight, Medications, Symptoms) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              {showAdvanced ? '− Hide additional context' : '+ Add weight, medications, or symptoms'}
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bp-weight-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Weight (optional)
                  </label>
                  <input
                    id="bp-weight-input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70 kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="bp-meds-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Medication Taken
                  </label>
                  <input
                    id="bp-meds-input"
                    type="text"
                    placeholder="e.g. Amlodipine 5mg"
                    value={medicationTaken}
                    onChange={(e) => setMedicationTaken(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bp-med-timing" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Medication Timing
                  </label>
                  <select
                    id="bp-med-timing"
                    value={beforeAfterMedication}
                    onChange={(e) => setBeforeAfterMedication(e.target.value as 'none' | 'before' | 'after')}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="none">Not applicable</option>
                    <option value="before">Before medication</option>
                    <option value="after">After medication</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bp-exercise-timing" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Activity State
                  </label>
                  <select
                    id="bp-exercise-timing"
                    value={beforeAfterExercise}
                    onChange={(e) => setBeforeAfterExercise(e.target.value as 'resting' | 'before' | 'after' | 'none')}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="resting">At rest (Recommended)</option>
                    <option value="before">Before exercise</option>
                    <option value="after">After exercise</option>
                    <option value="none">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bp-symptoms-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Symptoms (if any)
                </label>
                <input
                  id="bp-symptoms-input"
                  type="text"
                  placeholder="e.g. Dizziness, headache, mild fatigue"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label htmlFor="bp-notes-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  id="bp-notes-input"
                  rows={2}
                  placeholder="Any additional notes or doctor recommendations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-md transition-all"
            >
              Save BP Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
