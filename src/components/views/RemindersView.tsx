import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Search,
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Mic,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { getTodayString, formatDatePretty } from '../../utils/dateUtils';

export const RemindersView: React.FC = () => {
  const {
    reminders,
    toggleReminderComplete,
    deleteReminder,
    openModal,
    setVoiceModalOpen,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const today = getTodayString();

  const filteredReminders = reminders.filter((r) => {
    if (searchQuery.trim()) {
      const match =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (categoryFilter !== 'all' && r.category !== categoryFilter) {
      return false;
    }
    if (filter === 'active') {
      return !r.completed;
    }
    if (filter === 'completed') {
      return r.completed;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#2E6844] dark:text-emerald-400" />
            <span>Reminders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Timely prompts for habits, calls, medication, and family
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-[#FAFBF9] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer active:scale-95"
          >
            <Mic className="w-4 h-4 text-[#2E6844] dark:text-emerald-400" />
            <span>Voice</span>
          </button>
          <button
            id="add-reminder-btn"
            onClick={() => openModal('reminder')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#387652] hover:bg-[#2E6143] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FAFBF9] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]/20 focus:border-[#387652]"
          />
        </div>

        <div className="flex items-center gap-1">
          {(['active', 'all', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#387652] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-[#EDF5F0]/60 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="personal">Personal</option>
          <option value="family">Family</option>
          <option value="financial">Financial</option>
          <option value="health">Health</option>
          <option value="home">Home</option>
          <option value="vehicle">Vehicle</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Reminder Items */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title={reminders.length === 0 ? 'No reminders yet' : 'No matching reminders'}
            description={
              reminders.length === 0
                ? 'Create automated audio and browser reminders for important routines and tasks.'
                : 'Try adjusting your search query or filter.'
            }
            buttonText={reminders.length === 0 ? 'Create Reminder' : undefined}
            onAction={reminders.length === 0 ? () => openModal('reminder') : undefined}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredReminders.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-xl border transition-all ${
                  r.completed
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                    : 'bg-[#FAFBF9] dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/80 shadow-xs hover:border-[#387652]/40 dark:hover:border-emerald-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleReminderComplete(r.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 border-[#387652] flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        r.completed
                          ? 'bg-[#387652] text-white'
                          : 'hover:bg-[#EDF5F0] dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {r.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            r.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {r.title}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize shrink-0">
                          {r.category}
                        </span>
                        {r.sourceType === 'credit_card' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 shrink-0">
                            💳 Card Due
                          </span>
                        )}
                        {r.sourceType === 'emi' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/50 shrink-0">
                            🏦 EMI Due
                          </span>
                        )}
                        {r.sourceType === 'bill' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 shrink-0">
                            🧾 Bill Due
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDatePretty(r.date)}</span>
                        </div>
                        {r.time && (
                          <div className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{r.time}</span>
                          </div>
                        )}
                      </div>
                      {r.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          {r.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openModal('reminder', r)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
