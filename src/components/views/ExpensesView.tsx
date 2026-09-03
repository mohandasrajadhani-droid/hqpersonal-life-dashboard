import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { formatDatePretty } from '../../utils/dateUtils';

export const ExpensesView: React.FC = () => {
  const { expenses, deleteExpense, openModal, settings } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter((e) => {
    if (searchQuery.trim()) {
      const match =
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (categoryFilter !== 'all' && e.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const totalFiltered = filteredExpenses.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            <span>Daily Expenses</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Log daily purchases, groceries, transport, and leisure spending
          </p>
        </div>
        <button
          id="add-expense-btn"
          onClick={() => openModal('expense')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#387652] hover:bg-[#2E6143] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A83832] dark:text-rose-400">
            Total Logged Expenses
          </span>
          <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {settings.currency} {totalFiltered.toFixed(2)}
          </div>
        </div>
        <div className="text-right text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {filteredExpenses.length} records
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses by description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FAFBF9] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]/20 focus:border-[#387652]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFBF9] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="food">Food &amp; Dining</option>
          <option value="transport">Transport / Fuel</option>
          <option value="shopping">Shopping</option>
          <option value="medical">Medical</option>
          <option value="household">Household</option>
          <option value="bills">Bills</option>
          <option value="entertainment">Entertainment</option>
          <option value="travel">Travel</option>
          <option value="education">Education</option>
          <option value="personal">Personal Care</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <EmptyState
            title={expenses.length === 0 ? 'No expenses recorded yet' : 'No matching expenses'}
            description={
              expenses.length === 0
                ? 'Keep a clear pulse on your daily out-of-pocket spending. Enter your first expense.'
                : 'Try adjusting your search criteria or category filter.'
            }
            buttonText={expenses.length === 0 ? 'Record First Expense' : undefined}
            onAction={expenses.length === 0 ? () => openModal('expense') : undefined}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-3">
          {filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFBF9] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 shadow-xs hover:border-[#387652]/40 dark:hover:border-emerald-700 transition-all"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#A83832] dark:text-rose-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {exp.category ? exp.category.slice(0, 3) : 'Exp'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {exp.description}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                      {exp.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDatePretty(exp.date)}</span>
                    </div>
                    {exp.time && <span>{exp.time}</span>}
                    {exp.notes && <span className="italic truncate">{exp.notes}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 ml-3">
                <div className="text-right">
                  <span className="text-base font-bold text-[#A83832] dark:text-rose-400">
                    - {settings.currency} {Number(exp.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal('expense', exp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteExpense(exp.id)}
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
