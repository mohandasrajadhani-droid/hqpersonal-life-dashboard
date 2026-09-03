import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Bill, BillCategory, BillFrequency } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Bill | null;
}

export const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addBill, updateBill, settings } = useApp();

  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState<BillCategory>('electricity');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setProvider(initialData.provider || '');
      setCategory(initialData.category);
      setAmount(initialData.amount.toString());
      setDueDate(initialData.dueDate);
      setFrequency(initialData.frequency);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setProvider('');
      setCategory('electricity');
      setAmount('');
      setDueDate(getTodayString());
      setFrequency('monthly');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Bill name is required');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid bill amount greater than 0');
      return;
    }
    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    if (initialData) {
      updateBill(initialData.id, {
        name: name.trim(),
        provider: provider.trim() || undefined,
        category,
        amount: parsedAmount,
        dueDate,
        frequency,
        notes: notes.trim() || undefined,
      });
    } else {
      addBill({
        name: name.trim(),
        provider: provider.trim() || undefined,
        category,
        amount: parsedAmount,
        dueDate,
        frequency,
        paymentStatus: 'unpaid',
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Bill' : 'Add New Bill'}
      subtitle="Track recurring utilities, services, subscriptions, and rent"
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
            Bill Name *
          </label>
          <input
            id="bill-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Home High-Speed Internet"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BillCategory)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
              <option value="internet">Internet</option>
              <option value="telephone">Telephone / Mobile</option>
              <option value="insurance">Insurance</option>
              <option value="subscription">Subscription / Streaming</option>
              <option value="rent">Rent / Housing</option>
              <option value="education">School / Education</option>
              <option value="credit_card">Credit Card</option>
              <option value="other">Other Bill</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Provider (Optional)
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. Electric Power Co."
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount ({settings.currency}) *
            </label>
            <input
              id="bill-amount-input"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Billing Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as BillFrequency)}
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="one_time">One-Time</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half-Yearly (Every 6 Months)</option>
            <option value="yearly">Yearly (Annual)</option>
            <option value="custom">Custom Recurring</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes (Account Number, Portal Link, etc.)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Account #893240, paid via online banking"
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
            id="bill-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Add Bill'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
