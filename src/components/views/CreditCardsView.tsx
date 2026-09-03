import React, { useState } from 'react';
import {
  CreditCard as CardIcon,
  Plus,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  DollarSign,
  Bell,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Wallet,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreditCard, BankAccount } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { CreditCardFormModal } from '../forms/CreditCardFormModal';
import { BankAccountFormModal } from '../forms/BankAccountFormModal';
import { PayCreditCardModal } from '../forms/PayCreditCardModal';

export const CreditCardsView: React.FC = () => {
  const {
    creditCards,
    bankAccounts,
    deleteCreditCard,
    deleteBankAccount,
    reminders,
    syncFinancialDueToReminders,
    setActiveSection,
    settings,
  } = useApp();

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingCard, setPayingCard] = useState<CreditCard | null>(null);

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);

  const [activeTab, setActiveTab] = useState<'cards' | 'banks'>('cards');

  const totalCreditLimit = creditCards.reduce(
    (acc, curr) => acc + (Number(curr.creditLimit) || 0),
    0
  );
  const totalCurrentDues = creditCards.reduce(
    (acc, curr) => acc + (Number(curr.currentDue) || 0),
    0
  );
  const totalAvailableCredit = Math.max(0, totalCreditLimit - totalCurrentDues);
  const utilizationRatio =
    totalCreditLimit > 0
      ? Math.round((totalCurrentDues / totalCreditLimit) * 100)
      : 0;

  const totalBankBalance = bankAccounts.reduce(
    (acc, curr) => acc + (Number(curr.balance) || 0),
    0
  );

  const handleOpenAddCard = () => {
    setEditingCard(null);
    setCardModalOpen(true);
  };

  const handleOpenEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setCardModalOpen(true);
  };

  const handleOpenPayCard = (card: CreditCard) => {
    setPayingCard(card);
    setPayModalOpen(true);
  };

  const handleOpenAddBank = () => {
    setEditingBank(null);
    setBankModalOpen(true);
  };

  const handleOpenEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setBankModalOpen(true);
  };

  const getDaysUntilDue = (dueDate: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    if (dueDate >= currentDay) {
      return dueDate - currentDay;
    }
    const daysInCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    return daysInCurrentMonth - currentDay + dueDate;
  };

  const isCardReminderActive = (cardId: string) => {
    return reminders.some(
      (r) => r.sourceType === 'credit_card' && r.sourceId === cardId && !r.completed
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CardIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Credit Cards &amp; Payment Accounts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your credit cards, track due amounts from logged expenses, and link due date reminders
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="add-credit-card-btn"
            onClick={handleOpenAddCard}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credit Card</span>
          </button>
          <button
            id="add-bank-account-btn"
            onClick={handleOpenAddBank}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add Bank</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Outstanding Dues
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {settings.currency} {totalCurrentDues.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Across {creditCards.length} active cards</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Credit Limit
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {settings.currency} {totalCreditLimit.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            <span>{settings.currency}{totalAvailableCredit.toFixed(2)} available</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Credit Utilization
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                utilizationRatio > 50
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  : utilizationRatio > 30
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {utilizationRatio <= 30 ? 'Healthy (<30%)' : utilizationRatio <= 50 ? 'Moderate' : 'High'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {utilizationRatio}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                utilizationRatio > 50
                  ? 'bg-rose-500'
                  : utilizationRatio > 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, utilizationRatio)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Bank Accounts Total
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {settings.currency} {totalBankBalance.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{bankAccounts.length} linked accounts</span>
            <button
              onClick={() => setActiveSection('emi')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Loans &amp; EMI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'cards'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CardIcon className="w-4 h-4" />
          <span>Credit Cards ({creditCards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('banks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'banks'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank Accounts ({bankAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('emi')}
          className="ml-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <span>Manage Loans &amp; EMIs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards View */}
      {activeTab === 'cards' && (
        <>
          {creditCards.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xs">
              <EmptyState
                title="No Credit Cards added yet"
                description="Add your credit cards here. Any time you record an expense using a credit card, the amount will automatically be added to that card's current due balance."
                buttonText="Add Your First Credit Card"
                onAction={handleOpenAddCard}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {creditCards.map((card) => {
                const cardDue = Number(card.currentDue || 0);
                const cardLimit = Number(card.creditLimit || 1);
                const cardUtilization = Math.round((cardDue / cardLimit) * 100);
                const daysUntilDue = getDaysUntilDue(card.dueDate);
                const reminderActive = isCardReminderActive(card.id);

                return (
                  <div
                    key={card.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                  >
                    {/* Visual Card Banner */}
                    <div
                      className={`p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between h-36 relative overflow-hidden ${
                        card.color === 'indigo'
                          ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900'
                          : card.color === 'slate'
                          ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-black'
                          : card.color === 'emerald'
                          ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950'
                          : card.color === 'rose'
                          ? 'bg-gradient-to-br from-rose-600 via-pink-700 to-red-900'
                          : card.color === 'amber'
                          ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-800'
                          : 'bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-950'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider opacity-85 block">
                            {card.bankName}
                          </span>
                          <span className="text-sm font-bold tracking-tight">
                            {card.cardName}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 uppercase tracking-wider backdrop-blur-xs">
                          {card.cardNetwork}
                        </span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="font-mono text-base tracking-widest text-slate-100">
                            •••• •••• •••• {card.cardNumberLast4}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider opacity-75 font-semibold block">
                            Due Day
                          </span>
                          <span className="text-xs font-bold">
                            {card.dueDate}th of month
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Balance and Limits Breakdown */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Current Due
                        </span>
                        <div
                          className={`text-lg font-bold ${
                            cardDue > 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {settings.currency} {cardDue.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Total Limit
                        </span>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                          {settings.currency} {cardLimit.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Available:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {settings.currency}{' '}
                            {Math.max(0, cardLimit - cardDue).toFixed(2)}
                          </strong>
                        </span>
                        <span className="font-semibold">{cardUtilization}% limit used</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            cardUtilization > 50
                              ? 'bg-rose-500'
                              : cardUtilization > 30
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, cardUtilization)}%` }}
                        />
                      </div>
                    </div>

                    {/* Due Date and Reminders row */}
                    <div className="flex items-center justify-between py-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          Due on <strong className="font-semibold">{card.dueDate}th</strong>
                          {daysUntilDue === 0 ? (
                            <span className="ml-1.5 font-bold text-rose-600 dark:text-rose-400">
                              (Due Today!)
                            </span>
                          ) : daysUntilDue <= 5 ? (
                            <span className="ml-1.5 font-bold text-amber-600 dark:text-amber-400">
                              (In {daysUntilDue} days)
                            </span>
                          ) : (
                            <span className="ml-1.5 text-slate-400">
                              (In {daysUntilDue} days)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Reminder Action / Status */}
                      <button
                        onClick={() => syncFinancialDueToReminders('credit_card', card.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          reminderActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                        }`}
                        title="Sync due date to Reminders"
                      >
                        <Bell className="w-3 h-3" />
                        <span>{reminderActive ? 'Reminder Active' : 'Add to Reminders'}</span>
                      </button>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCard(card)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Card Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCreditCard(card.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenPayCard(card)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer ${
                          cardDue > 0
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{cardDue > 0 ? 'Pay Card Bill' : 'Record Payment'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Bank Accounts View */}
      {activeTab === 'banks' && (
        <>
          {bankAccounts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xs">
              <EmptyState
                title="No Bank Accounts connected"
                description="Save your checking, savings, or salary accounts so you can select them when paying bills, settling credit cards, or logging debit expenses."
                buttonText="Add Your First Bank Account"
                onAction={handleOpenAddBank}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {acc.accountName}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {acc.bankName} •••• {acc.accountNumberLast4}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditBank(acc)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBankAccount(acc.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                      {acc.accountType}
                    </span>
                    {acc.balance !== undefined && (
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {settings.currency} {Number(acc.balance).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Credit Card Modal */}
      <CreditCardFormModal
        isOpen={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setEditingCard(null);
        }}
        initialData={editingCard}
      />

      {/* Bank Account Modal */}
      <BankAccountFormModal
        isOpen={bankModalOpen}
        onClose={() => {
          setBankModalOpen(false);
          setEditingBank(null);
        }}
        initialData={editingBank}
      />

      {/* Pay Credit Card Bill Modal */}
      <PayCreditCardModal
        isOpen={payModalOpen}
        onClose={() => {
          setPayModalOpen(false);
          setPayingCard(null);
        }}
        card={payingCard}
      />
    </div>
  );
};
