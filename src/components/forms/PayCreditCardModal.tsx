import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { CreditCard, PaymentMethod } from '../../types';
import { CheckCircle2, DollarSign, Building, AlertCircle } from 'lucide-react';

interface PayCreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
}

export const PayCreditCardModal: React.FC<PayCreditCardModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const { payCreditCardBill, bankAccounts, settings } = useApp();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (card) {
      setAmount(card.currentDue > 0 ? card.currentDue.toString() : '');
      setPaymentMethod(bankAccounts.length > 0 ? 'bank' : 'upi');
      setBankAccountId(bankAccounts.length > 0 ? bankAccounts[0].id : '');
      setNotes(`Settlement payment for ${card.cardName}`);
    }
    setError('');
  }, [card, isOpen, bankAccounts]);

  if (!card) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    payCreditCardBill(
      card.id,
      parsedAmount,
      paymentMethod,
      paymentMethod === 'bank' ? bankAccountId || undefined : undefined,
      notes.trim() || undefined
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pay Bill: ${card.cardName}`}
      subtitle={`Issuing Bank: ${card.bankName} • Last 4 digits: •••• ${card.cardNumberLast4}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Due amount summary card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block uppercase">
              Current Outstanding Due
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {settings.currency} {Number(card.currentDue || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAmount(card.currentDue.toString())}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Pay Total Due
            </button>
            {card.currentDue > 100 && (
              <button
                type="button"
                onClick={() => setAmount((Math.round(card.currentDue * 0.1 * 100) / 100).toString())}
                className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Min Due (10%)
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Payment Amount ({settings.currency}) *
          </label>
          <input
            id="pay-amount-input"
            type="number"
            step="0.01"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3.5 py-2 rounded-xl text-base font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Source
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="bank">Bank Account</option>
              <option value="upi">UPI / Instant Transfer</option>
              <option value="cash">Cash / ATM Deposit</option>
              <option value="other">Other</option>
            </select>
          </div>

          {paymentMethod === 'bank' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Bank Account
              </label>
              {bankAccounts.length > 0 ? (
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.accountName} (••{acc.accountNumberLast4})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                  No bank accounts saved yet
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Transaction Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reference number or memo"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Recording this payment will subtract {settings.currency}{amount || '0.00'} from this card&apos;s current due balance, record an expense entry in your bills log, and resolve outstanding due reminders.
        </p>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            id="confirm-pay-card-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Bill Payment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
