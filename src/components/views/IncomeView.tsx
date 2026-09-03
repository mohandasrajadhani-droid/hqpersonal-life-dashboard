import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { formatDatePretty } from '../../utils/dateUtils';

export const IncomeView: React.FC = () => {
  const { incomes, deleteIncome, openModal, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncomes = incomes.filter((inc) => {
    if (searchQuery.trim()) {
      return (
        inc.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const totalFiltered = filteredIncomes.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Income &amp; Earnings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track salaries, dividends, rental income, pensions, and freelance earnings
          </p>
        </div>
        <button
          id="add-income-btn"
          onClick={() => openModal('income')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Recorded Income
          </span>
          <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {settings.currency} {totalFiltered.toFixed(2)}
          </div>
        </div>
        <div className="text-right text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {filteredIncomes.length} records
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search income sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Income List */}
      {filteredIncomes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title={
              incomes.length === 0
                ? 'No income sources recorded yet'
                : 'No matching income found'
            }
            description={
              incomes.length === 0
                ? 'Record your salary, monthly pension, or investment payouts to calculate net savings.'
                : 'Try adjusting your search query.'
            }
            buttonText={incomes.length === 0 ? 'Record Income' : undefined}
            onAction={incomes.length === 0 ? () => openModal('income') : undefined}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          {filteredIncomes.map((inc) => (
            <div
              key={inc.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {inc.category ? inc.category.slice(0, 3) : 'Inc'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {inc.source}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                      {inc.frequency ? inc.frequency.replace('_', ' ') : 'Once'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDatePretty(inc.date)}</span>
                    </div>
                    {inc.notes && <span className="italic truncate">{inc.notes}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 ml-3">
                <div className="text-right">
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    + {settings.currency} {Number(inc.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal('income', inc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteIncome(inc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
