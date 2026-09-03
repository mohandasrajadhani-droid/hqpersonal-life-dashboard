import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { CreditCard, CardNetwork } from '../../types';
import { CreditCard as CardIcon, Bell, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

interface CreditCardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CreditCard | null;
}

const CARD_COLORS = [
  { id: 'indigo', name: 'Indigo Blue', bg: 'bg-indigo-600', text: 'text-indigo-600' },
  { id: 'slate', name: 'Charcoal Black', bg: 'bg-slate-800', text: 'text-slate-800' },
  { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { id: 'rose', name: 'Ruby Rose', bg: 'bg-rose-600', text: 'text-rose-600' },
  { id: 'amber', name: 'Gold Amber', bg: 'bg-amber-600', text: 'text-amber-600' },
  { id: 'purple', name: 'Royal Purple', bg: 'bg-purple-600', text: 'text-purple-600' },
];

export const CreditCardFormModal: React.FC<CreditCardFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addCreditCard, updateCreditCard, settings } = useApp();

  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardNumberLast4, setCardNumberLast4] = useState('');
  const [cardNetwork, setCardNetwork] = useState<CardNetwork>('visa');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentDue, setCurrentDue] = useState('0');
  const [dueDate, setDueDate] = useState('15');
  const [statementDate, setStatementDate] = useState('1');
  const [color, setColor] = useState('indigo');
  const [reminder, setReminder] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCardName(initialData.cardName);
      setBankName(initialData.bankName);
      setCardNumberLast4(initialData.cardNumberLast4);
      setCardNetwork(initialData.cardNetwork);
      setCreditLimit(initialData.creditLimit.toString());
      setCurrentDue(initialData.currentDue.toString());
      setDueDate(initialData.dueDate.toString());
      setStatementDate(initialData.statementDate ? initialData.statementDate.toString() : '1');
      setColor(initialData.color || 'indigo');
      setReminder(initialData.reminder !== false);
      setNotes(initialData.notes || '');
    } else {
      setCardName('');
      setBankName('');
      setCardNumberLast4('');
      setCardNetwork('visa');
      setCreditLimit('');
      setCurrentDue('0');
      setDueDate('15');
      setStatementDate('1');
      setColor('indigo');
      setReminder(true);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardName.trim()) {
      setError('Please enter a card name (e.g. Platinum Rewards)');
      return;
    }
    if (!bankName.trim()) {
      setError('Please enter the issuing bank name (e.g. Chase, HDFC)');
      return;
    }
    if (!cardNumberLast4.trim() || cardNumberLast4.trim().length !== 4 || !/^\d{4}$/.test(cardNumberLast4.trim())) {
      setError('Please enter the exact last 4 digits of the card number (e.g. 4582)');
      return;
    }

    const parsedLimit = parseFloat(creditLimit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Please enter a valid positive credit limit');
      return;
    }

    const parsedDue = parseFloat(currentDue);
    if (isNaN(parsedDue) || parsedDue < 0) {
      setError('Current due amount cannot be negative');
      return;
    }

    const parsedDueDate = parseInt(dueDate, 10);
    if (isNaN(parsedDueDate) || parsedDueDate < 1 || parsedDueDate > 31) {
      setError('Payment due date must be a valid day of the month (1-31)');
      return;
    }

    const parsedStatementDate = statementDate ? parseInt(statementDate, 10) : undefined;
    if (parsedStatementDate && (parsedStatementDate < 1 || parsedStatementDate > 31)) {
      setError('Statement billing date must be a valid day of the month (1-31)');
      return;
    }

    if (initialData) {
      updateCreditCard(initialData.id, {
        cardName: cardName.trim(),
        bankName: bankName.trim(),
        cardNumberLast4: cardNumberLast4.trim(),
        cardNetwork,
        creditLimit: parsedLimit,
        currentDue: parsedDue,
        dueDate: parsedDueDate,
        statementDate: parsedStatementDate,
        color,
        reminder,
        notes: notes.trim() || undefined,
      });
    } else {
      addCreditCard({
        cardName: cardName.trim(),
        bankName: bankName.trim(),
        cardNumberLast4: cardNumberLast4.trim(),
        cardNetwork,
        creditLimit: parsedLimit,
        currentDue: parsedDue,
        dueDate: parsedDueDate,
        statementDate: parsedStatementDate,
        color,
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
      title={initialData ? 'Edit Credit Card' : 'Add Credit Card'}
      subtitle="Track card limits, current dues, and get payment due date reminders"
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
          <ShieldCheck className="w-4 h-4 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Privacy-First Architecture:</strong> We never request or store full card numbers, CVV/CVC, or PINs. Only card nickname and last 4 digits are stored to track dues and reminders.
          </p>
        </div>

        {/* Card Preview Chip */}
        <div
          className={`p-4 rounded-2xl text-white shadow-sm flex flex-col justify-between h-28 relative overflow-hidden transition-colors ${
            color === 'indigo'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-800'
              : color === 'slate'
              ? 'bg-gradient-to-r from-slate-800 to-slate-950'
              : color === 'emerald'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-800'
              : color === 'rose'
              ? 'bg-gradient-to-r from-rose-600 to-red-800'
              : color === 'amber'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-700'
              : 'bg-gradient-to-r from-purple-600 to-indigo-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardIcon className="w-5 h-5 opacity-90" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                {bankName.trim() || 'Bank Name'}
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/20 uppercase tracking-wider backdrop-blur-xs">
              {cardNetwork}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium opacity-80 truncate max-w-[200px]">
                {cardName.trim() || 'Card Name'}
              </p>
              <p className="font-mono text-sm tracking-widest mt-0.5">
                •••• •••• •••• {cardNumberLast4 || '0000'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] opacity-75 block uppercase font-medium">Due Date</span>
              <span className="text-xs font-bold">Day {dueDate || '15'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Card Nickname / Name *
            </label>
            <input
              id="card-name-input"
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g. Regalia Gold, Sapphire"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Issuing Bank / Provider *
            </label>
            <input
              id="card-bank-input"
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC, Chase, Amex, Citi"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Last 4 Digits *
            </label>
            <input
              id="card-last4-input"
              type="text"
              maxLength={4}
              required
              value={cardNumberLast4}
              onChange={(e) => setCardNumberLast4(e.target.value.replace(/\D/g, ''))}
              placeholder="4582"
              className="w-full px-3.5 py-2 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Card Network
            </label>
            <select
              value={cardNetwork}
              onChange={(e) => setCardNetwork(e.target.value as CardNetwork)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="rupay">RuPay</option>
              <option value="discover">Discover</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Credit Limit ({settings.currency}) *
            </label>
            <input
              id="card-limit-input"
              type="number"
              step="0.01"
              required
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="5000.00"
              className="w-full px-3.5 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current Due Balance ({settings.currency})
            </label>
            <input
              id="card-due-input"
              type="number"
              step="0.01"
              value={currentDue}
              onChange={(e) => setCurrentDue(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Due Date (Day of Month) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={31}
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="15"
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                th of month
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Statement / Billing Date (Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={31}
                value={statementDate}
                onChange={(e) => setStatementDate(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                th of month
              </span>
            </div>
          </div>
        </div>

        {/* Card Theme Color Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Card Style Color
          </label>
          <div className="flex items-center gap-2">
            {CARD_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-transform cursor-pointer ${
                  color === c.id ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Sync to Reminders Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Add Due Date to Reminders
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically generate a monthly reminder before due date
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
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
            placeholder="Reward points perk, annual fee date, customer care number..."
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
            id="save-credit-card-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Save Credit Card'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
