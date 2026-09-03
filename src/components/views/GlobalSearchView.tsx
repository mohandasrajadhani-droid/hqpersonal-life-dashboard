import React, { useState } from 'react';
import {
  Search,
  CheckSquare,
  Receipt,
  TrendingDown,
  Pill,
  HeartPulse,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDatePretty } from '../../utils/dateUtils';

export const GlobalSearchView: React.FC = () => {
  const {
    tasks,
    reminders,
    bills,
    emiLoans,
    expenses,
    incomes,
    medicines,
    healthAppointments,
    trips,
    renewals,
    openModal,
    settings,
  } = useApp();

  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const matchedTasks = q
    ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
    : [];
  const matchedReminders = q
    ? reminders.filter((r) => r.title.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q))
    : [];
  const matchedBills = q
    ? bills.filter((b) => b.name.toLowerCase().includes(q) || b.provider?.toLowerCase().includes(q))
    : [];
  const matchedEmis = q
    ? emiLoans.filter((e) => e.name.toLowerCase().includes(q) || e.lender.toLowerCase().includes(q))
    : [];
  const matchedExpenses = q
    ? expenses.filter((e) => e.description.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q))
    : [];
  const matchedIncomes = q
    ? incomes.filter((i) => i.source.toLowerCase().includes(q) || i.notes?.toLowerCase().includes(q))
    : [];
  const matchedMedicines = q
    ? medicines.filter((m) => m.name.toLowerCase().includes(q) || m.instructions?.toLowerCase().includes(q))
    : [];
  const matchedHealth = q
    ? healthAppointments.filter((h) => h.reason.toLowerCase().includes(q) || h.doctorName?.toLowerCase().includes(q))
    : [];
  const matchedTrips = q
    ? trips.filter((t) => t.name.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q))
    : [];
  const matchedRenewals = q
    ? renewals.filter((r) => r.itemName.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q))
    : [];

  const totalMatches =
    matchedTasks.length +
    matchedReminders.length +
    matchedBills.length +
    matchedEmis.length +
    matchedExpenses.length +
    matchedIncomes.length +
    matchedMedicines.length +
    matchedHealth.length +
    matchedTrips.length +
    matchedRenewals.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Global Search</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Instantly search across your tasks, bills, expenses, medicines, and travel plans
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-2 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything (e.g. rent, electricity, aspirin, doctor, dentist)..."
            className="w-full pl-12 pr-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Results */}
      {!q ? (
        <div className="text-center py-12 text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
          <p className="text-xs sm:text-sm font-medium">Type any keyword above to search your entire dashboard.</p>
        </div>
      ) : totalMatches === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8">
          <p className="text-sm font-bold">No results found for "{query}".</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Found {totalMatches} result(s)
          </div>

          {/* Tasks Results */}
          {matchedTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Tasks ({matchedTasks.length})
              </h3>
              {matchedTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openModal('task', t)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-emerald-500 cursor-pointer transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    {t.title}
                  </span>
                  <span className="text-xs text-slate-400">{formatDatePretty(t.date)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bills Results */}
          {matchedBills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-500" /> Bills ({matchedBills.length})
              </h3>
              {matchedBills.map((b) => (
                <div
                  key={b.id}
                  onClick={() => openModal('bill', b)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-emerald-500 cursor-pointer transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    {b.name}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {settings.currency} {Number(b.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Expenses Results */}
          {matchedExpenses.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Expenses ({matchedExpenses.length})
              </h3>
              {matchedExpenses.map((e) => (
                <div
                  key={e.id}
                  onClick={() => openModal('expense', e)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-rose-500 cursor-pointer transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    {e.description}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                    {settings.currency} {Number(e.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Medicines Results */}
          {matchedMedicines.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" /> Medicines ({matchedMedicines.length})
              </h3>
              {matchedMedicines.map((m) => (
                <div
                  key={m.id}
                  onClick={() => openModal('medicine', m)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-emerald-500 cursor-pointer transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    {m.name} ({m.dosage})
                  </span>
                  <span className="text-xs text-emerald-600 capitalize font-bold">{m.frequency}</span>
                </div>
              ))}
            </div>
          )}

          {/* Health Appointments Results */}
          {matchedHealth.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Health Records ({matchedHealth.length})
              </h3>
              {matchedHealth.map((h) => (
                <div
                  key={h.id}
                  onClick={() => openModal('health', h)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-rose-500 cursor-pointer transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    {h.reason} {h.doctorName && `(${h.doctorName})`}
                  </span>
                  <span className="text-xs text-slate-400">{formatDatePretty(h.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
