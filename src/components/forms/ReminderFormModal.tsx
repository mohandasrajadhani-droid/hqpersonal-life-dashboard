import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Reminder, ReminderCategory, RecurrenceType } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Reminder | null;
}

export const ReminderFormModal: React.FC<ReminderFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addReminder, updateReminder } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState<RecurrenceType>('none');
  const [category, setCategory] = useState<ReminderCategory>('personal');
  const [notes, setNotes] = useState('');
  const [notificationMethod, setNotificationMethod] = useState<'browser' | 'in_app'>('browser');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      setTime(initialData.time || '09:00');
      setRepeat(initialData.repeat);
      setCategory(initialData.category);
      setNotes(initialData.notes || '');
      setNotificationMethod(initialData.notificationMethod || 'browser');
    } else {
      setTitle('');
      setDate(getTodayString());
      setTime('09:00');
      setRepeat('none');
      setCategory('personal');
      setNotes('');
      setNotificationMethod('browser');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Reminder title is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    if (initialData) {
      updateReminder(initialData.id, {
        title: title.trim(),
        date,
        time: time || undefined,
        repeat,
        category,
        notes: notes.trim() || undefined,
        notificationMethod,
      });
    } else {
      addReminder({
        title: title.trim(),
        date,
        time: time || undefined,
        repeat,
        category,
        notes: notes.trim() || undefined,
        notificationMethod,
        completed: false,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Reminder' : 'Add Reminder'}
      subtitle="Set customized alerts for anything important"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reminder Title *
          </label>
          <input
            id="reminder-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Call dentist to confirm appointment"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReminderCategory)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="personal">Personal</option>
              <option value="family">Family</option>
              <option value="financial">Financial</option>
              <option value="health">Health</option>
              <option value="home">Home</option>
              <option value="vehicle">Vehicle</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Repeat
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RecurrenceType)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional additional notes or instructions"
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
            id="reminder-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Create Reminder'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
