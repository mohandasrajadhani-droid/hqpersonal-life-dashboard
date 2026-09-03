import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Check,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { formatDatePretty, getTodayString } from '../../utils/dateUtils';

export const BillsView: React.FC = () => {
  const { bills, markBillPaid, deleteBill, openModal, settings } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const today = getTodayString();

  const filteredBills = bills.filter((b) => {
    if (searchQuery.trim()) {
      const match =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (statusFilter === 'unpaid') return b.paymentStatus === 'unpaid';
    if (statusFilter === 'paid') return b.paymentStatus === 'paid';
    return true;
  });

  const unpaidTotal = bills
    .filter((b) => b.paymentStatus === 'unpaid')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const paidTotal = bills
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Bills &amp; Utilities</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Never miss a payment for electricity, water, internet, rent, or subscriptions
          </p>
        </div>
        <button
          id="add-bill-btn"
          onClick={() => openModal('bill')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bill</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Unpaid Bills
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {settings.currency} {unpaidTotal.toFixed(2)}
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50">
            {bills.filter((b) => b.paymentStatus === 'unpaid').length} Pending
          </span>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Paid Bills
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {settings.currency} {paidTotal.toFixed(2)}
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
            {bills.filter((b) => b.paymentStatus === 'paid').length} Cleared
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bills by name or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'unpaid', 'paid'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bill List */}
      {filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title={bills.length === 0 ? 'No bills added yet' : 'No matching bills found'}
            description={
              bills.length === 0
                ? 'Keep track of due dates, utility accounts, and recurring subscriptions in one place.'
                : 'Try adjusting your search query or status filter.'
            }
            buttonText={bills.length === 0 ? 'Add First Bill' : undefined}
            onAction={bills.length === 0 ? () => openModal('bill') : undefined}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          {filteredBills.map((b) => {
            const isPaid = b.paymentStatus === 'paid';
            const isOverdue = !isPaid && b.dueDate < today;

            return (
              <div
                key={b.id}
                className={`flex items-center justify-between p-3.5 border-l-4 rounded-r-xl transition-all ${
                  isPaid
                    ? 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 opacity-60'
                    : isOverdue
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => markBillPaid(b.id)}
                    className={`w-5 h-5 rounded border-2 border-emerald-500 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      isPaid
                        ? 'bg-emerald-500 text-white'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    {isPaid && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold truncate ${
                          isPaid
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {b.name}
                      </span>
                      {b.provider && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          ({b.provider})
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                        {b.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                        {b.frequency.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span
                          className={
                            isOverdue
                              ? 'text-red-600 dark:text-red-400 font-bold'
                              : ''
                          }
                        >
                          Due {formatDatePretty(b.dueDate)}{' '}
                          {isOverdue && '(Overdue)'}
                        </span>
                      </div>
                      {isPaid && b.paymentDate && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Paid {formatDatePretty(b.paymentDate)}
                        </span>
                      )}
                      {b.notes && <span className="italic truncate">{b.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <div className="text-right">
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {settings.currency} {Number(b.amount).toFixed(2)}
                    </div>
                    <button
                      onClick={() => markBillPaid(b.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        isPaid
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60'
                          : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200'
                      }`}
                    >
                      {isPaid ? 'Paid' : 'Mark Paid'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal('bill', b)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBill(b.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
