import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Income, IncomeCategory, IncomeFrequency } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Income | null;
}

export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addIncome, updateIncome, settings } = useApp();

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [frequency, setFrequency] = useState<IncomeFrequency>('monthly');
  const [category, setCategory] = useState<IncomeCategory>('salary');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setSource(initialData.source);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setFrequency(initialData.frequency);
      setCategory(initialData.category);
      setNotes(initialData.notes || '');
    } else {
      setSource('');
      setAmount('');
      setDate(getTodayString());
      setFrequency('monthly');
      setCategory('salary');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim()) {
      setError('Income source is required');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid income amount greater than 0');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    if (initialData) {
      updateIncome(initialData.id, {
        source: source.trim(),
        amount: parsedAmount,
        date,
        frequency,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      addIncome({
        source: source.trim(),
        amount: parsedAmount,
        date,
        frequency,
        category,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Income' : 'Record Income'}
      subtitle="Track your incoming cash flow, salary, investments, and pension"
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
            Income Source / Employer *
          </label>
          <input
            id="income-source-input"
            type="text"
            required
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Acme Corp Salary, Rental Property, Freelance"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount ({settings.currency}) *
            </label>
            <input
              id="income-amount-input"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 rounded-xl text-base font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncomeCategory)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="salary">Salary / Wages</option>
              <option value="business">Business / Client</option>
              <option value="pension">Pension / Retirement</option>
              <option value="investment">Dividends / Investment</option>
              <option value="rental">Rental Income</option>
              <option value="other">Other Income</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="monthly">Monthly</option>
              <option value="bi_weekly">Bi-Weekly (Every 2 Weeks)</option>
              <option value="weekly">Weekly</option>
              <option value="annual">Annual</option>
              <option value="one_time">One-Time / Irregular</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Deposit account or additional reference details"
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
            id="income-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Record Income'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
