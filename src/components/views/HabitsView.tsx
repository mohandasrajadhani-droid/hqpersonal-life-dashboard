import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Filter,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Habit, HabitCategory } from '../../types';
import { calculateHabitStreak, getRecentDaysStatus, HABIT_PRESETS } from '../../utils/habitUtils';
import { getTodayString } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';

const CATEGORY_TABS: { id: 'all' | HabitCategory; label: string }[] = [
  { id: 'all', label: 'All Habits' },
  { id: 'health', label: 'Health' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'learning', label: 'Learning' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'lifestyle', label: 'Lifestyle' },
];

export const HabitsView: React.FC = () => {
  const { habits, addHabit, deleteHabit, toggleHabitCompletion, openModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const today = getTodayString();

  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  // Calculate overall metrics
  const totalHabits = habits.length;
  const completedTodayCount = habits.filter((h) => h.completedDates.includes(today)).length;
  const todayPercentage = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  const maxStreak = habits.reduce((max, h) => {
    const { currentStreak } = calculateHabitStreak(h.completedDates, today);
    return Math.max(max, currentStreak);
  }, 0);

  const avgCompletionRate =
    habits.length > 0
      ? Math.round(
          habits.reduce((sum, h) => {
            const { completionRate30Days } = calculateHabitStreak(h.completedDates, today);
            return sum + completionRate30Days;
          }, 0) / habits.length
        )
      : 0;

  const handleToggleDay = (habit: Habit, dateStr: string) => {
    const isCompleted = habit.completedDates.includes(dateStr);
    toggleHabitCompletion(habit.id, dateStr);

    if (!isCompleted && dateStr === today) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleAddPreset = (preset: typeof HABIT_PRESETS[0]) => {
    addHabit({
      name: preset.name,
      description: preset.description,
      category: preset.category,
      frequency: 'daily',
      targetDaysPerWeek: 7,
      timeOfDay: preset.timeOfDay || 'anytime',
      color: preset.color,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header with Title and Add Habit button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Daily Habit Tracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Build positive routines, track consistency, and maintain daily streaks
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => openModal('habit')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Completed Today */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Completed Today
            </p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {completedTodayCount} <span className="text-sm font-normal text-slate-400">/ {totalHabits}</span>
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${todayPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Top Active Streak
            </p>
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {maxStreak} <span className="text-sm font-normal text-slate-400">{maxStreak === 1 ? 'day' : 'days'}</span>
            </h3>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
              {maxStreak > 0 ? 'Consistent progress!' : 'Start your streak today'}
            </p>
          </div>
        </div>

        {/* 30-Day Completion Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              30-Day Consistency
            </p>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {avgCompletionRate}%
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Average adherence rate
            </p>
          </div>
        </div>

        {/* Total Habits Active */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Routines
            </p>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalHabits}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tracked positive behaviors
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Habits List or Empty State */}
      {filteredHabits.length === 0 ? (
        habits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-6">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 fill-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                No Habits Created Yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Start tracking daily positive behaviors like working out, reading books, or drinking enough water. Build streaks and watch your consistency grow!
              </p>
              <button
                onClick={() => openModal('habit')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Habit</span>
              </button>
            </div>

            {/* Quick Starter Suggestions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Or pick a popular starter routine
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-left">
                {HABIT_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleAddPreset(preset)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 transition-colors text-left group cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                      + {preset.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No habits in this category"
            description="Try selecting another category or add a new habit."
            buttonText="Add Habit"
            onAction={() => openModal('habit')}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHabits.map((habit) => {
            const isCompletedToday = habit.completedDates.includes(today);
            const { currentStreak, longestStreak, completionRate30Days } = calculateHabitStreak(
              habit.completedDates,
              today
            );
            const recentDays = getRecentDaysStatus(habit.completedDates, today, 7);

            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between"
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: habit.color || '#10B981' }}
                />

                <div>
                  {/* Card Header: Title, Category, Menu */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {habit.category}
                        </span>
                        {habit.reminderTime && (
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {habit.reminderTime}
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 capitalize">
                          {habit.timeOfDay.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {habit.description}
                        </p>
                      )}
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 font-bold text-xs">
                        <Flame className="w-4 h-4 fill-orange-500" />
                        <span>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
                      </div>

                      {/* Options dropdown */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === habit.id ? null : habit.id)
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === habit.id && (
                          <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                openModal('habit', habit);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit Habit
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
                                  deleteHabit(habit.id);
                                }
                              }}
                              className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Visual Mini-Calendar with interactive day pills */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Recent 7 Days Activity
                    </p>
                    <div className="flex items-center justify-between gap-1.5">
                      {recentDays.map((dayItem) => {
                        const isToday = dayItem.date === today;
                        return (
                          <button
                            type="button"
                            key={dayItem.date}
                            onClick={() => handleToggleDay(habit, dayItem.date)}
                            title={`${dayItem.date}: ${dayItem.isCompleted ? 'Completed' : 'Not completed'}`}
                            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                              dayItem.isCompleted
                                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                                : isToday
                                ? 'border-2 border-dashed border-emerald-500/80 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold">
                              {dayItem.dayName}
                            </span>
                            <span className="text-xs font-semibold mt-0.5">
                              {dayItem.dayNumber}
                            </span>
                            <span className="mt-1">
                              {dayItem.isCompleted ? (
                                <Check className="w-3 h-3 stroke-[3]" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 block" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Controls: Log Today & Consistency Stats */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Best Streak: <strong>{longestStreak} days</strong></span>
                    </div>
                    <div>
                      30-Day Rate: <strong>{completionRate30Days}%</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDay(habit, today)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isCompletedToday
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/80'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                    }`}
                  >
                    {isCompletedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Completed Today!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Log for Today</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
