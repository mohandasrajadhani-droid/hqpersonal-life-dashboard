import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { getTodayString, getCurrentTimeString } from '../../utils/dateUtils';
import { CreditCard as CardIcon, Building2, Plus, Info } from 'lucide-react';
import { CreditCardFormModal } from './CreditCardFormModal';
import { BankAccountFormModal } from './BankAccountFormModal';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Expense | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addExpense, updateExpense, creditCards, bankAccounts, settings } = useApp();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [creditCardId, setCreditCardId] = useState<string>('');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const [quickAddCardOpen, setQuickAddCardOpen] = useState(false);
  const [quickAddBankOpen, setQuickAddBankOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategory(initialData.category);
      setPaymentMethod(initialData.paymentMethod);
      setCreditCardId(initialData.creditCardId || (creditCards.length > 0 ? creditCards[0].id : ''));
      setBankAccountId(initialData.bankAccountId || (bankAccounts.length > 0 ? bankAccounts[0].id : ''));
      setDate(initialData.date);
      setTime(initialData.time || getCurrentTimeString());
      setNotes(initialData.notes || '');
    } else {
      setAmount('');
      setDescription('');
      setCategory('food');
      setPaymentMethod(creditCards.length > 0 ? 'credit_card' : 'card');
      setCreditCardId(creditCards.length > 0 ? creditCards[0].id : '');
      setBankAccountId(bankAccounts.length > 0 ? bankAccounts[0].id : '');
      setDate(getTodayString());
      setTime(getCurrentTimeString());
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, creditCards, bankAccounts]);

  const selectedCard = creditCards.find((c) => c.id === creditCardId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    if (paymentMethod === 'credit_card' && creditCards.length > 0 && !creditCardId) {
      setError('Please select which credit card this expense was charged to');
      return;
    }

    const payload = {
      amount: parsedAmount,
      description: description.trim(),
      category,
      paymentMethod,
      creditCardId: paymentMethod === 'credit_card' ? creditCardId || undefined : undefined,
      bankAccountId: paymentMethod === 'bank' ? bankAccountId || undefined : undefined,
      date,
      time: time || undefined,
      notes: notes.trim() || undefined,
    };

    if (initialData) {
      updateExpense(initialData.id, payload);
    } else {
      addExpense(payload);
    }

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? 'Edit Expense' : 'Log Daily Expense'}
        subtitle="Quickly record your spending to keep budgets and card dues accurate"
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
                Amount ({settings.currency}) *
              </label>
              <input
                id="expense-amount-input"
                type="number"
                step="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl text-base font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 capitalize focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="food">Food &amp; Dining</option>
                <option value="transport">Transport / Gas</option>
                <option value="shopping">Shopping</option>
                <option value="medical">Medical / Health</option>
                <option value="household">Household / Groceries</option>
                <option value="bills">Bills &amp; Utilities</option>
                <option value="entertainment">Entertainment</option>
                <option value="travel">Travel</option>
                <option value="education">Education</option>
                <option value="personal">Personal Care</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description *
            </label>
            <input
              id="expense-desc-input"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery store run, Lunch with team, Flight ticket"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment Method & Date/Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                id="expense-payment-method-select"
                value={paymentMethod}
                onChange={(e) => {
                  const method = e.target.value as PaymentMethod;
                  setPaymentMethod(method);
                  if (method === 'credit_card' && !creditCardId && creditCards.length > 0) {
                    setCreditCardId(creditCards[0].id);
                  }
                  if (method === 'bank' && !bankAccountId && bankAccounts.length > 0) {
                    setBankAccountId(bankAccounts[0].id);
                  }
                }}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="credit_card">💳 Credit Card</option>
                <option value="bank">🏦 Bank Account</option>
                <option value="debit_card">Debit Card</option>
                <option value="card">General Card</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI / Instant</option>
                <option value="other">Other</option>
              </select>
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

          {/* Conditional Credit Card Selector & Due Info */}
          {paymentMethod === 'credit_card' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <CardIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Select Credit Card to Charge</span>
                </label>
                <button
                  type="button"
                  onClick={() => setQuickAddCardOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add New Card</span>
                </button>
              </div>

              {creditCards.length > 0 ? (
                <>
                  <select
                    id="expense-credit-card-select"
                    value={creditCardId}
                    onChange={(e) => setCreditCardId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {creditCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.bankName} - {card.cardName} (•••• {card.cardNumberLast4}) — Current Due: {settings.currency}{Number(card.currentDue || 0).toFixed(2)} / Limit: {settings.currency}{Number(card.creditLimit || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>

                  {selectedCard && (
                    <div className="flex items-start gap-2 text-xs text-indigo-900 dark:text-indigo-300">
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span>
                          <strong>Automatic Due Addition:</strong> This {settings.currency}{parseFloat(amount) || 0} charge will be automatically added to <strong>{selectedCard.cardName}</strong>&apos;s current due balance.
                        </span>
                        <div className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                          Card Due Date: <strong>{selectedCard.dueDate}th</strong> of the month
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <p>You haven&apos;t added any credit cards yet.</p>
                  <button
                    type="button"
                    onClick={() => setQuickAddCardOpen(true)}
                    className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Credit Card Option</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Conditional Bank Account Selector */}
          {paymentMethod === 'bank' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Select Bank Account Debited</span>
                </label>
                <button
                  type="button"
                  onClick={() => setQuickAddBankOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Bank</span>
                </button>
              </div>

              {bankAccounts.length > 0 ? (
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {bankAccounts.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bankName} - {bank.accountName} (•••• {bank.accountNumberLast4}) {bank.balance !== undefined ? `— Balance: ${settings.currency}${bank.balance.toFixed(2)}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <p>No bank accounts saved yet.</p>
                  <button
                    type="button"
                    onClick={() => setQuickAddBankOpen(true)}
                    className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bank Account Option</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Receipt reference, store location, or extra details"
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
              id="expense-submit-btn"
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
            >
              {initialData ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Modals */}
      <CreditCardFormModal
        isOpen={quickAddCardOpen}
        onClose={() => setQuickAddCardOpen(false)}
      />

      <BankAccountFormModal
        isOpen={quickAddBankOpen}
        onClose={() => setQuickAddBankOpen(false)}
      />
    </>
  );
};
