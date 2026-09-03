import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { CalendarEvent, RecurrenceType } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface CalendarEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CalendarEvent | null;
}

export const CalendarEventFormModal: React.FC<CalendarEventFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addCalendarEvent, updateCalendarEvent } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState('General');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [repeat, setRepeat] = useState<RecurrenceType>('none');
  const [reminder, setReminder] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      setStartTime(initialData.startTime || '09:00');
      setEndTime(initialData.endTime || '10:00');
      setCategory(initialData.category || 'General');
      setLocation(initialData.location || '');
      setDescription(initialData.description || '');
      setRepeat(initialData.repeat);
      setReminder(initialData.reminder);
    } else {
      setTitle('');
      setDate(getTodayString());
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('General');
      setLocation('');
      setDescription('');
      setRepeat('none');
      setReminder(true);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    if (initialData) {
      updateCalendarEvent(initialData.id, {
        title: title.trim(),
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        category,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        repeat,
        reminder,
      });
    } else {
      addCalendarEvent({
        title: title.trim(),
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        category,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        repeat,
        reminder,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Event' : 'Add Calendar Event'}
      subtitle="Schedule meetings, celebrations, family gatherings, and appointments"
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
            Event Title *
          </label>
          <input
            id="event-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Family Dinner, Parent Teacher Meeting"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
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
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="General">General</option>
              <option value="Personal">Personal</option>
              <option value="Family">Family</option>
              <option value="Work">Work</option>
              <option value="Celebration">Celebration / Birthday</option>
              <option value="Social">Social / Gathering</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Community Center or Zoom"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agenda or additional details"
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
            id="event-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
