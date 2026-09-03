import React, { useState, useEffect } from 'react';
import { Flame, Clock, Calendar, Sparkles, Tag, Bell } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Habit, HabitCategory, HabitFrequency, HabitTimeOfDay } from '../../types';
import { HABIT_PRESETS } from '../../utils/habitUtils';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Habit | null;
}

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'health', label: 'Health & Wellness' },
  { value: 'fitness', label: 'Fitness & Workout' },
  { value: 'learning', label: 'Learning & Reading' },
  { value: 'mindfulness', label: 'Mindfulness & Mental' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'lifestyle', label: 'Lifestyle & Routine' },
  { value: 'other', label: 'Other' },
];

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Every Day' },
  { value: 'weekdays', label: 'Weekdays Only (Mon-Fri)' },
  { value: 'weekends', label: 'Weekends Only (Sat-Sun)' },
  { value: 'custom', label: 'Custom Days' },
];

const TIMES_OF_DAY: { value: HabitTimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Any Time' },
];

const COLORS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Teal', value: '#14B8A6' },
];

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addHabit, updateHabit } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [timeOfDay, setTimeOfDay] = useState<HabitTimeOfDay>('anytime');
  const [reminderTime, setReminderTime] = useState('');
  const [color, setColor] = useState('#10B981');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'health');
      setFrequency(initialData.frequency || 'daily');
      setTargetDaysPerWeek(initialData.targetDaysPerWeek || 7);
      setTimeOfDay(initialData.timeOfDay || 'anytime');
      setReminderTime(initialData.reminderTime || '');
      setColor(initialData.color || '#10B981');
    } else {
      setName('');
      setDescription('');
      setCategory('health');
      setFrequency('daily');
      setTargetDaysPerWeek(7);
      setTimeOfDay('anytime');
      setReminderTime('');
      setColor('#10B981');
    }
  }, [initialData, isOpen]);

  const handleSelectPreset = (preset: typeof HABIT_PRESETS[0]) => {
    setName(preset.name);
    setDescription(preset.description);
    setCategory(preset.category);
    setTimeOfDay(preset.timeOfDay || 'anytime');
    setColor(preset.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      updateHabit(initialData.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        frequency,
        targetDaysPerWeek: Number(targetDaysPerWeek) || 7,
        timeOfDay,
        reminderTime: reminderTime.trim() || undefined,
        color,
      });
    } else {
      addHabit({
        name: name.trim(),
        description: description.trim(),
        category,
        frequency,
        targetDaysPerWeek: Number(targetDaysPerWeek) || 7,
        timeOfDay,
        reminderTime: reminderTime.trim() || undefined,
        color,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Habit' : 'Create Daily Habit'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preset quick templates if creating new */}
        {!initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {HABIT_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Habit Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Habit Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Exercise, Read 20 Pages"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
            <Flame className="w-4 h-4 text-orange-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Description / Motivation */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description or Motivation (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why do you want to keep this habit?"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        {/* Category & Time of Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Time of Day
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as HabitTimeOfDay)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {TIMES_OF_DAY.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Frequency & Reminder Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => {
                const val = e.target.value as HabitFrequency;
                setFrequency(val);
                if (val === 'daily') setTargetDaysPerWeek(7);
                else if (val === 'weekdays') setTargetDaysPerWeek(5);
                else if (val === 'weekends') setTargetDaysPerWeek(2);
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              Daily Reminder (Optional)
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Card Accent Color
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                  color === c.value
                    ? 'border-slate-800 dark:border-white scale-110 shadow-sm'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
          >
            {initialData ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
