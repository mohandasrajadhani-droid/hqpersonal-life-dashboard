import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { EmiLoan } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface EmiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EmiLoan | null;
}

export const EmiFormModal: React.FC<EmiFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addEmi, updateEmi, settings } = useApp();

  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [remainingInstallments, setRemainingInstallments] = useState('');
  const [dueDayOfMonth, setDueDayOfMonth] = useState('5');
  const [reminder, setReminder] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLender(initialData.lender);
      setPrincipalAmount(initialData.principalAmount.toString());
      setEmiAmount(initialData.emiAmount.toString());
      setInterestRate(initialData.interestRate.toString());
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setTotalInstallments(initialData.totalInstallments.toString());
      setRemainingInstallments(initialData.remainingInstallments.toString());
      setDueDayOfMonth(initialData.dueDayOfMonth.toString());
      setReminder(initialData.reminder);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setLender('');
      setPrincipalAmount('');
      setEmiAmount('');
      setInterestRate('');
      setStartDate(getTodayString());
      setEndDate('');
      setTotalInstallments('');
      setRemainingInstallments('');
      setDueDayOfMonth('5');
      setReminder(true);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Loan / EMI Name is required');
      return;
    }
    if (!lender.trim()) {
      setError('Lender name is required');
      return;
    }
    const pAmt = parseFloat(principalAmount);
    const eAmt = parseFloat(emiAmount);
    const iRate = parseFloat(interestRate) || 0;
    const tInst = parseInt(totalInstallments, 10);
    const rInst = remainingInstallments !== '' ? parseInt(remainingInstallments, 10) : tInst;
    const dueDay = parseInt(dueDayOfMonth, 10) || 5;

    if (isNaN(pAmt) || pAmt <= 0) {
      setError('Please enter a valid principal amount');
      return;
    }
    if (isNaN(eAmt) || eAmt <= 0) {
      setError('Please enter a valid monthly EMI amount');
      return;
    }
    if (isNaN(tInst) || tInst <= 0) {
      setError('Please enter valid total installments');
      return;
    }
    if (!startDate) {
      setError('Start date is required');
      return;
    }

    // Auto calculate end date if not provided
    let calculatedEndDate = endDate;
    if (!calculatedEndDate) {
      const [y, m, d] = startDate.split('-').map(Number);
      const end = new Date(y, m - 1 + tInst, d);
      calculatedEndDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    }

    if (initialData) {
      updateEmi(initialData.id, {
        name: name.trim(),
        lender: lender.trim(),
        principalAmount: pAmt,
        emiAmount: eAmt,
        interestRate: iRate,
        startDate,
        endDate: calculatedEndDate,
        totalInstallments: tInst,
        remainingInstallments: isNaN(rInst) ? tInst : rInst,
        dueDayOfMonth: Math.min(31, Math.max(1, dueDay)),
        reminder,
        notes: notes.trim() || undefined,
      });
    } else {
      addEmi({
        name: name.trim(),
        lender: lender.trim(),
        principalAmount: pAmt,
        emiAmount: eAmt,
        interestRate: iRate,
        startDate,
        endDate: calculatedEndDate,
        totalInstallments: tInst,
        remainingInstallments: isNaN(rInst) ? tInst : rInst,
        dueDayOfMonth: Math.min(31, Math.max(1, dueDay)),
        paymentStatus: 'pending',
        reminder,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit EMI / Loan' : 'Add New EMI / Loan'}
      subtitle="Track repayments, monthly commitments, and remaining balance"
      maxWidth="lg"
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
              Loan / Item Name *
            </label>
            <input
              id="emi-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Home Mortgage or Car Loan"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Lender / Bank *
            </label>
            <input
              type="text"
              required
              value={lender}
              onChange={(e) => setLender(e.target.value)}
              placeholder="e.g. HDFC Bank, Chase, Wells Fargo"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Principal ({settings.currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              EMI Amount ({settings.currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={emiAmount}
              onChange={(e) => setEmiAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="e.g. 7.5"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Total Installments *
            </label>
            <input
              type="number"
              required
              value={totalInstallments}
              onChange={(e) => setTotalInstallments(e.target.value)}
              placeholder="e.g. 36"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Remaining Installments
            </label>
            <input
              type="number"
              value={remainingInstallments}
              onChange={(e) => setRemainingInstallments(e.target.value)}
              placeholder="e.g. 24"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Day of Month (1-31)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={dueDayOfMonth}
              onChange={(e) => setDueDayOfMonth(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              End Date (Estimated)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes (Loan Account #, Auto-Debit Details)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Auto-debits from checking account on 5th of each month"
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
            id="emi-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Add Loan / EMI'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
