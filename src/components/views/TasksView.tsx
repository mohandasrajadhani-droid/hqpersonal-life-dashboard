import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Check,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  Star,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { getTodayString, formatDatePretty } from '../../utils/dateUtils';

export const TasksView: React.FC = () => {
  const { tasks, toggleTaskComplete, deleteTask, openModal } = useApp();

  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'urgent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const today = getTodayString();

  const categories = Array.from(new Set(tasks.map((t) => t.category))).filter(Boolean);

  const filteredTasks = tasks.filter((t) => {
    // Search query
    if (searchQuery.trim()) {
      const match =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) {
      return false;
    }

    // Status / date filters
    if (filter === 'today') {
      return t.date === today && !t.completed;
    }
    if (filter === 'upcoming') {
      return t.date > today && !t.completed;
    }
    if (filter === 'completed') {
      return t.completed;
    }
    if (filter === 'urgent') {
      return (t.priority === 'urgent' || t.priority === 'high') && !t.completed;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#2E6844] dark:text-emerald-400" />
            <span>Tasks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Keep track of daily to-dos, priorities, and deadlines
          </p>
        </div>
        <button
          id="add-task-btn"
          onClick={() => openModal('task')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#387652] hover:bg-[#2E6143] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FAFBF9] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]/20 focus:border-[#387652]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'today', 'upcoming', 'urgent', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#387652] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-[#EDF5F0]/60 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Category Dropdown Filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            description={
              tasks.length === 0
                ? 'Stay organized with your personal daily to-dos, shopping lists, and reminders.'
                : 'Try adjusting your search query or selecting a different status filter.'
            }
            buttonText={tasks.length === 0 ? 'Create Your First Task' : undefined}
            onAction={tasks.length === 0 ? () => openModal('task') : undefined}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`group flex items-start sm:items-center justify-between p-3.5 rounded-xl transition-all ${
                t.completed
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 opacity-60'
                  : 'bg-[#FAFBF9] dark:bg-slate-800/60 hover:bg-[#F2F5F2] dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => toggleTaskComplete(t.id)}
                  className={`mt-0.5 sm:mt-0 w-5 h-5 rounded border-2 border-[#387652] flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                    t.completed
                      ? 'bg-[#387652] text-white'
                      : 'hover:bg-[#EDF5F0] dark:hover:bg-emerald-950/40'
                  }`}
                >
                  {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold truncate ${
                        t.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {t.title}
                    </span>

                    {t.important && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    )}

                    {t.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {t.category}
                      </span>
                    )}

                    {t.priority === 'urgent' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300">
                        Urgent
                      </span>
                    )}
                    {t.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
                        High
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {t.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDatePretty(t.date)}</span>
                    </div>
                    {t.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{t.time}</span>
                      </div>
                    )}
                    {t.repeat && t.repeat !== 'none' && (
                      <span className="capitalize font-medium text-[#2E6844] dark:text-emerald-400">
                        Repeats {t.repeat}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button
                  onClick={() => openModal('task', t)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
