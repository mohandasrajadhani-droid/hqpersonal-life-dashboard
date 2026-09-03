import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Renewal, RenewalType, RecurrenceType } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface RenewalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Renewal | null;
}

export const RenewalFormModal: React.FC<RenewalFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addRenewal, updateRenewal, settings } = useApp();

  const [itemName, setItemName] = useState('');
  const [renewalType, setRenewalType] = useState<RenewalType>('insurance');
  const [expiryDate, setExpiryDate] = useState(getTodayString());
  const [renewalCost, setRenewalCost] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [repeat, setRepeat] = useState<RecurrenceType>('yearly');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setItemName(initialData.itemName);
      setRenewalType(initialData.renewalType);
      setExpiryDate(initialData.expiryDate);
      setRenewalCost(initialData.renewalCost ? initialData.renewalCost.toString() : '');
      setReminderDate(initialData.reminderDate || '');
      setRepeat(initialData.repeat);
      setNotes(initialData.notes || '');
    } else {
      setItemName('');
      setRenewalType('insurance');
      setExpiryDate(getTodayString());
      setRenewalCost('');
      setReminderDate('');
      setRepeat('yearly');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (!expiryDate) {
      setError('Expiry date is required');
      return;
    }
    const cost = renewalCost ? parseFloat(renewalCost) : undefined;

    if (initialData) {
      updateRenewal(initialData.id, {
        itemName: itemName.trim(),
        renewalType,
        expiryDate,
        renewalCost: cost,
        reminderDate: reminderDate || undefined,
        repeat,
        notes: notes.trim() || undefined,
      });
    } else {
      addRenewal({
        itemName: itemName.trim(),
        renewalType,
        expiryDate,
        renewalCost: cost,
        reminderDate: reminderDate || undefined,
        repeat,
        notes: notes.trim() || undefined,
        status: 'active',
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Renewal' : 'Add Renewal Reminder'}
      subtitle="Never miss an expiration for passports, licenses, domains, or warranties"
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
            Item / Document Name *
          </label>
          <input
            id="renewal-name-input"
            type="text"
            required
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. US Passport, Car Insurance, AWS Domain"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Renewal Type
            </label>
            <select
              value={renewalType}
              onChange={(e) => setRenewalType(e.target.value as RenewalType)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="insurance">Health / General Insurance</option>
              <option value="vehicle_insurance">Vehicle Insurance</option>
              <option value="driving_license">Driving License</option>
              <option value="passport">Passport</option>
              <option value="membership">Club / Gym Membership</option>
              <option value="subscription">Software / Media Subscription</option>
              <option value="domain">Website Domain / SSL</option>
              <option value="warranty">Appliance Warranty</option>
              <option value="amc">Maintenance Contract (AMC)</option>
              <option value="documents">Official Documents</option>
              <option value="other">Other Renewal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Renewal Cost ({settings.currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={renewalCost}
              onChange={(e) => setRenewalCost(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recurrence
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RecurrenceType)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="yearly">Every Year</option>
              <option value="monthly">Every Month</option>
              <option value="custom">Custom Multi-Year</option>
              <option value="none">One-time / No Repeat</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes / Policy Number / Portal URL
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Policy #99281, login on insurer website"
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
            id="renewal-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Add Renewal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
