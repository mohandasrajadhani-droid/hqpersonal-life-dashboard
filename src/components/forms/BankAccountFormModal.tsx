import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { BankAccount, BankAccountType } from '../../types';
import { Building2, DollarSign } from 'lucide-react';

interface BankAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BankAccount | null;
}

export const BankAccountFormModal: React.FC<BankAccountFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addBankAccount, updateBankAccount, settings } = useApp();

  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumberLast4, setAccountNumberLast4] = useState('');
  const [accountType, setAccountType] = useState<BankAccountType>('checking');
  const [balance, setBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAccountName(initialData.accountName);
      setBankName(initialData.bankName);
      setAccountNumberLast4(initialData.accountNumberLast4);
      setAccountType(initialData.accountType);
      setBalance(initialData.balance !== undefined ? initialData.balance.toString() : '');
      setNotes(initialData.notes || '');
    } else {
      setAccountName('');
      setBankName('');
      setAccountNumberLast4('');
      setAccountType('checking');
      setBalance('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName.trim()) {
      setError('Please provide an account nickname (e.g. Salary Checking, Emergency Fund)');
      return;
    }
    if (!bankName.trim()) {
      setError('Please enter the Bank name (e.g. Chase, HDFC, Wells Fargo)');
      return;
    }
    if (!accountNumberLast4.trim() || accountNumberLast4.trim().length !== 4 || !/^\d{4}$/.test(accountNumberLast4.trim())) {
      setError('Please enter the exact last 4 digits of the account number');
      return;
    }

    const parsedBalance = balance ? parseFloat(balance) : undefined;

    if (initialData) {
      updateBankAccount(initialData.id, {
        accountName: accountName.trim(),
        bankName: bankName.trim(),
        accountNumberLast4: accountNumberLast4.trim(),
        accountType,
        balance: parsedBalance,
        notes: notes.trim() || undefined,
      });
    } else {
      addBankAccount({
        accountName: accountName.trim(),
        bankName: bankName.trim(),
        accountNumberLast4: accountNumberLast4.trim(),
        accountType,
        balance: parsedBalance,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Bank Account' : 'Add Bank Account'}
      subtitle="Connect payment modes for tracking expenses, salary credits, and bill debits"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Security Assurance Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300">
          <p className="leading-relaxed">
            <strong className="font-semibold">Zero-Credentials Policy:</strong> We never store banking passwords, UPI PINs, or full account numbers. Only the nickname and last 4 digits are kept for expense tagging.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Account Label / Nickname *
            </label>
            <input
              id="bank-account-name-input"
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Primary Salary, Rainy Day"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Bank Name *
            </label>
            <input
              id="bank-institution-input"
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Chase, HDFC, Bank of America"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Last 4 Digits of Account # *
            </label>
            <input
              id="bank-last4-input"
              type="text"
              maxLength={4}
              required
              value={accountNumberLast4}
              onChange={(e) => setAccountNumberLast4(e.target.value.replace(/\D/g, ''))}
              placeholder="9876"
              className="w-full px-3.5 py-2 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as BankAccountType)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="checking">Checking Account</option>
              <option value="savings">Savings Account</option>
              <option value="salary">Salary Account</option>
              <option value="current">Current / Business Account</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Current Balance (Optional, {settings.currency})
          </label>
          <input
            id="bank-balance-input"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            className="w-full px-3.5 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Branch location, IFSC/SWIFT code, or minimum balance details..."
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
            id="save-bank-account-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Save Bank Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
