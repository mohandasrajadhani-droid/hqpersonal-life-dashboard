import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Medicine } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Medicine | null;
}

export const MedicineFormModal: React.FC<MedicineFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addMedicine, updateMedicine } = useApp();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Medicine['frequency']>('daily');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [beforeAfterFood, setBeforeAfterFood] = useState<Medicine['beforeAfterFood']>('after');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDosage(initialData.dosage);
      setFrequency(initialData.frequency);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate || '');
      setTimes(initialData.times && initialData.times.length > 0 ? initialData.times : ['08:00']);
      setBeforeAfterFood(initialData.beforeAfterFood);
      setInstructions(initialData.instructions || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setDosage('');
      setFrequency('daily');
      setStartDate(getTodayString());
      setEndDate('');
      setTimes(['08:00']);
      setBeforeAfterFood('after');
      setInstructions('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const addTimeSlot = () => {
    setTimes([...times, '12:00']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length <= 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, val: string) => {
    const updated = [...times];
    updated[index] = val;
    setTimes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Medicine name is required');
      return;
    }
    if (!dosage.trim()) {
      setError('Dosage is required (e.g. 500mg, 1 tablet)');
      return;
    }
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    if (times.length === 0) {
      setError('At least one dose time is required');
      return;
    }

    if (initialData) {
      updateMedicine(initialData.id, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        startDate,
        endDate: endDate || undefined,
        times,
        beforeAfterFood,
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addMedicine({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        startDate,
        endDate: endDate || undefined,
        times,
        beforeAfterFood,
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
        active: true,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Medicine' : 'Add Medicine Schedule'}
      subtitle="Keep track of prescriptions, dosages, and daily reminder times"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Medicine Name *
            </label>
            <input
              id="medicine-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Metformin, Vitamin D3"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Dosage *
            </label>
            <input
              type="text"
              required
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 500mg, 1 tablet, 5ml"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Schedule Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Medicine['frequency'])}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="thrice_daily">3 Times Daily</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As Needed (SOS)</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Food Relation
            </label>
            <select
              value={beforeAfterFood}
              onChange={(e) => setBeforeAfterFood(e.target.value as Medicine['beforeAfterFood'])}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="after">After Food</option>
              <option value="before">Before Food (Empty Stomach)</option>
              <option value="with">With Food</option>
              <option value="any">Any Time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Multiple Daily Times */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Dose Time(s)
            </label>
            <button
              type="button"
              onClick={addTimeSlot}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Time
            </button>
          </div>
          <div className="space-y-2">
            {times.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="time"
                  required
                  value={t}
                  onChange={(e) => updateTimeSlot(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(idx)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Remove time"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Doctor Instructions &amp; Notes
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Take with a full glass of water. Do not skip."
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            id="medicine-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Add Medicine'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
