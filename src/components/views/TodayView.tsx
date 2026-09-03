import React from 'react';
import {
  Check,
  CheckCircle2,
  Circle,
  Plus,
  Pill,
  Clock,
  Receipt,
  Calendar as CalendarIcon,
  Mic,
  Plane,
  HeartPulse,
  Bell,
  Flame,
  Sparkles,
  Activity,
  FileText,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { getTodayString, formatDatePretty } from '../../utils/dateUtils';
import { calculateHabitStreak, HABIT_PRESETS } from '../../utils/habitUtils';

export const TodayView: React.FC = () => {
  const {
    tasks,
    reminders,
    habits,
    medicines,
    bills,
    healthAppointments,
    bloodPressureReadings,
    medicalRecords,
    trips,
    calendarEvents,
    financialSummary,
    settings,
    toggleTaskComplete,
    toggleReminderComplete,
    addHabit,
    toggleHabitCompletion,
    openModal,
    setVoiceModalOpen,
    setActiveSection,
  } = useApp();

  const today = getTodayString();

  // Tasks for today or overdue
  const todayTasks = tasks.filter((t) => t.date <= today || t.date === today);
  const pendingTasks = todayTasks.filter((t) => !t.completed);

  // Reminders for today
  const todayReminders = reminders.filter((r) => r.date === today && !r.completed);

  // Active medicines
  const activeMedicines = medicines.filter((m) => m.active);

  // Unpaid bills due within next 7 days or overdue
  const upcomingBills = bills
    .filter((b) => b.paymentStatus === 'unpaid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Today's calendar events
  const todayEvents = calendarEvents.filter((e) => e.date === today);

  // Upcoming trip
  const upcomingTrip = trips.find((t) => t.startDate >= today) || trips[0];
  const tripBudgetUsed =
    upcomingTrip?.expenses?.reduce((acc, e) => acc + (Number(e.amount) || 0), 0) || 0;

  const daysUntilTrip = upcomingTrip?.startDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(upcomingTrip.startDate).getTime() - new Date(today).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const completedHabitsToday = habits.filter((h) => h.completedDates.includes(today));

  const handleHabitToggle = (id: string, currentlyCompleted: boolean) => {
    toggleHabitCompletion(id, today);
    if (!currentlyCompleted) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleTaskToggle = (id: string, currentlyCompleted: boolean) => {
    toggleTaskComplete(id);
    if (!currentlyCompleted && pendingTasks.length === 1) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* High Density Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols on desktop) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Hero Financial Card */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-6 relative">
            <div className="relative z-10">
              <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs mb-1">
                Remaining Monthly Balance
              </p>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {settings.currency}{' '}
                {financialSummary.availableBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-4">
                <div className="bg-[#EDF5F0] dark:bg-emerald-950/40 text-[#245236] dark:text-emerald-300 border border-[#DCEBE0] dark:border-emerald-900/40 px-3 py-1 rounded-xl text-xs font-medium">
                  Income: {settings.currency}
                  {financialSummary.totalIncome >= 1000
                    ? (financialSummary.totalIncome / 1000).toFixed(1) + 'k'
                    : financialSummary.totalIncome.toFixed(0)}
                </div>
                <div className="bg-[#FEF2F2] dark:bg-rose-950/40 text-[#991B1B] dark:text-rose-300 border border-[#FEE2E2] dark:border-rose-900/40 px-3 py-1 rounded-xl text-xs font-medium">
                  Expenses: {settings.currency}
                  {financialSummary.totalExpenses >= 1000
                    ? (financialSummary.totalExpenses / 1000).toFixed(1) + 'k'
                    : financialSummary.totalExpenses.toFixed(0)}
                </div>
                {financialSummary.totalBills > 0 && (
                  <div className="bg-[#FEF8EE] dark:bg-amber-950/40 text-[#92400E] dark:text-amber-300 border border-[#FDE68A]/60 dark:border-amber-900/40 px-3 py-1 rounded-xl text-xs font-medium">
                    Bills: {settings.currency}
                    {financialSummary.totalBills.toFixed(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 gap-4">
              <div className="md:text-right">
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 uppercase tracking-wider font-medium">
                  Savings Rate
                </p>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {financialSummary.savingsRate}%
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceModalOpen(true)}
                  className="p-2 rounded-xl bg-[#F4F6F3] hover:bg-[#EAEFEA] text-slate-600 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                  title="Voice command"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openModal('task')}
                  className="px-3.5 py-2 rounded-xl bg-[#387652] hover:bg-[#2E6143] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Grid: Today's Tasks & Bills Due Soon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Tasks Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    Today's Tasks
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal('task')}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2E6844] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                    <button
                      onClick={() => setActiveSection('tasks')}
                      className="text-[#2E6844] dark:text-emerald-400 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                </div>

                {todayTasks.length === 0 ? (
                  <EmptyState
                    title="No tasks for today"
                    description="All clear for today or add your next action item."
                    buttonText="Add Task"
                    onAction={() => openModal('task')}
                  />
                ) : (
                  <div className="space-y-2.5">
                    {todayTasks.slice(0, 5).map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          t.completed
                            ? 'bg-[#F8F9F7] dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                            : 'bg-[#FBFBF9] dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 hover:bg-[#F4F6F3] dark:hover:bg-slate-800'
                        }`}
                      >
                        <button
                          onClick={() => handleTaskToggle(t.id, t.completed)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                            t.completed
                              ? 'bg-[#387652] border-[#387652] text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-[#387652]'
                          }`}
                        >
                          {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              t.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {t.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {t.time ? `${t.time} • ` : ''}
                            {t.category || 'General'}
                          </p>
                        </div>
                        {t.priority === 'urgent' && (
                          <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 px-2 py-0.5 rounded-full font-semibold shrink-0">
                            Urgent
                          </span>
                        )}
                        {t.priority === 'high' && (
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 px-2 py-0.5 rounded-full font-semibold shrink-0">
                            High
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bills Due Soon Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    Bills Due Soon
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal('bill')}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2E6844] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                    <button
                      onClick={() => setActiveSection('bills')}
                      className="text-[#2E6844] dark:text-emerald-400 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      History
                    </button>
                  </div>
                </div>

                {upcomingBills.length === 0 ? (
                  <EmptyState
                    title="No pending bills"
                    description="All your utilities and regular commitments are settled."
                    buttonText="Add Bill"
                    onAction={() => openModal('bill')}
                  />
                ) : (
                  <div className="space-y-2.5">
                    {upcomingBills.slice(0, 4).map((b, idx) => (
                      <div
                        key={b.id}
                        className={`flex items-center justify-between p-3 border-l-4 rounded-r-xl transition-all ${
                          idx === 0
                            ? 'border-amber-400/80 bg-[#FEF8EE] dark:bg-amber-950/20'
                            : 'border-slate-200 dark:border-slate-700 bg-[#FAFBF9] dark:bg-slate-800/50'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {b.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Due {formatDatePretty(b.dueDate)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 shrink-0">
                          {settings.currency} {b.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Daily Habits & Streaks Tracker Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                    Daily Habits &amp; Streaks
                  </h4>
                  {habits.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {completedHabitsToday.length} of {habits.length} routines completed today
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => openModal('habit')}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2E6844] flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
                <button
                  onClick={() => setActiveSection('habits')}
                  className="text-[#2E6844] dark:text-emerald-400 text-xs font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>

            {habits.length === 0 ? (
              <div className="bg-[#FAFBF9] dark:bg-slate-800/40 rounded-xl p-5 text-center border border-slate-200/60 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Start tracking daily positive behaviors!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Log exercise, reading, water intake, or mindfulness and watch your streaks grow.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {HABIT_PRESETS.slice(0, 3).map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() =>
                        addHabit({
                          name: preset.name,
                          description: preset.description,
                          category: preset.category,
                          frequency: 'daily',
                          targetDaysPerWeek: 7,
                          timeOfDay: preset.timeOfDay,
                          color: preset.color,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#387652] hover:text-[#2E6844] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" /> {preset.name}
                    </button>
                  ))}
                  <button
                    onClick={() => openModal('habit')}
                    className="px-3 py-1.5 rounded-xl bg-[#387652] text-white text-xs font-semibold hover:bg-[#2E6143] transition-colors cursor-pointer shadow-2xs"
                  >
                    Custom Habit
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-[#387652] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        habits.length > 0
                          ? Math.round((completedHabitsToday.length / habits.length) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {habits.slice(0, 6).map((habit) => {
                    const isCompleted = habit.completedDates.includes(today);
                    const { currentStreak } = calculateHabitStreak(habit.completedDates, today);

                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isCompleted
                            ? 'bg-[#EDF5F0]/70 dark:bg-emerald-950/20 border-[#DCEBE0] dark:border-emerald-900/40'
                            : 'bg-[#FAFBF9] dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-[#F4F6F3] dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <button
                            onClick={() => handleHabitToggle(habit.id, isCompleted)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                              isCompleted
                                ? 'bg-[#387652] border-[#387652] text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-[#387652]'
                            }`}
                            title={
                              isCompleted
                                ? 'Completed today! Click to undo'
                                : 'Click to complete for today'
                            }
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isCompleted
                                  ? 'text-[#245236] dark:text-emerald-200 line-through opacity-80'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {habit.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                              {habit.timeOfDay.replace('_', ' ')} • {habit.category}
                            </p>
                          </div>
                        </div>

                        {/* Streak Badge */}
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 ${
                            currentStreak > 0
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Flame
                            className={`w-3.5 h-3.5 ${
                              currentStreak > 0
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-slate-400'
                            }`}
                          />
                          <span>{currentStreak}d</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Today's Reminders Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Today's Reminders
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('reminder')}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2E6844] flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
                <button
                  onClick={() => setActiveSection('reminders')}
                  className="text-[#2E6844] dark:text-emerald-400 text-xs font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>

            {todayReminders.length === 0 ? (
              <EmptyState
                title="No reminders for today"
                description="Keep track of phone calls, errands, or important notifications."
                buttonText="Set Reminder"
                onAction={() => openModal('reminder')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todayReminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleReminderComplete(r.id)}
                        className="text-sky-600 dark:text-sky-400 shrink-0 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Circle className="w-4 h-4 text-sky-600" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                          <span>{r.title}</span>
                          {r.voiceAlarm && (
                            <span title="Voice alarm enabled">
                              <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                            </span>
                          )}
                        </p>
                        {r.time && (
                          <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                            At {r.time}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 capitalize shrink-0 ml-2 border border-sky-200/50">
                      {r.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols on desktop) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Health & Wellness Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Health &amp; Wellness
              </h4>
              <button
                onClick={() => setActiveSection('medicines')}
                className="text-[#2E6844] dark:text-emerald-400 text-xs font-semibold hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {!activeMedicines.length &&
            (!healthAppointments || healthAppointments.length === 0) &&
            !bloodPressureReadings.length ? (
              <EmptyState
                title="No health logs yet"
                description="Track vitamins, daily tablets, blood pressure, or doctor appointments."
                buttonText="Log Blood Pressure"
                onAction={() => openModal('blood_pressure')}
              />
            ) : (
              <div className="space-y-4">
                {bloodPressureReadings.length > 0 && (
                  <div className="flex items-start justify-between gap-3.5">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0 border border-red-200/50 dark:border-red-900/40">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                            Blood Pressure
                          </p>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                            {bloodPressureReadings[0].category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {bloodPressureReadings[0].systolic}/{bloodPressureReadings[0].diastolic}{' '}
                          <span className="text-xs font-normal text-slate-500">mmHg</span>
                          {bloodPressureReadings[0].pulse && (
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                              • {bloodPressureReadings[0].pulse} bpm
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatDatePretty(bloodPressureReadings[0].date)} ({bloodPressureReadings[0].context.replace('_', ' ')})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal('blood_pressure')}
                      className="px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-lg border border-red-200/60 dark:border-red-900/40 shrink-0 cursor-pointer"
                    >
                      Log BP
                    </button>
                  </div>
                )}

                {activeMedicines.slice(0, 2).map((m, idx) => (
                  <React.Fragment key={m.id}>
                    {(idx > 0 || bloodPressureReadings.length > 0) && (
                      <div className="h-px bg-slate-100 dark:bg-slate-800" />
                    )}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 rounded-xl flex items-center justify-center shrink-0 border border-teal-200/50 dark:border-teal-900/40">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                          Medicine
                        </p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {m.name} {m.dosage ? `- ${m.dosage}` : ''}
                        </p>
                        <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5 font-medium">
                          Next: {m.times?.join(', ') || 'Daily'} ({m.beforeAfterFood} food)
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                ))}

                {healthAppointments &&
                  healthAppointments
                    .filter((a) => !a.completed)
                    .slice(0, 2)
                    .map((app) => (
                      <React.Fragment key={app.id}>
                        <div className="h-px bg-slate-100 dark:bg-slate-800" />
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-900/40">
                            <HeartPulse className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                              Appointment
                            </p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {app.doctorName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {formatDatePretty(app.date)}{' '}
                              {app.time ? `• ${app.time}` : ''}{' '}
                              {app.specialty ? `• ${app.specialty}` : ''}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveSection('blood_pressure')}
                    className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-red-500" />
                    <span>BP Tracker</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('medical_records')}
                    className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{medicalRecords.length} Records</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('medicines')}
                    className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>Meds</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Trip Card - Clean Soft White with Purple Accent */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              {upcomingTrip ? (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {upcomingTrip.destination || upcomingTrip.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upcoming Trip {daysUntilTrip !== null ? `• ${daysUntilTrip} Days Left` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('travel')}
                      className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Budget Used</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {settings.currency} {tripBudgetUsed.toFixed(0)}{' '}
                        {upcomingTrip.budget
                          ? `/ ${settings.currency} ${upcomingTrip.budget.toFixed(0)}`
                          : ''}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
                      <Plane className="w-6 h-6" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                    Travel &amp; Getaways
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Plan and budget your next vacation
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Trips Planned</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">0 Planned</p>
                    </div>
                    <button
                      onClick={() => openModal('trip')}
                      className="w-12 h-12 rounded-xl border border-purple-200/80 bg-purple-50/60 dark:bg-purple-950/40 flex items-center justify-center text-purple-700 dark:text-purple-300 hover:bg-purple-100/80 transition-colors cursor-pointer shrink-0"
                      title="Plan a Trip"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Today's Calendar Schedule Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Calendar Schedule
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('calendarEvent')}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2E6844] flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
                <button
                  onClick={() => setActiveSection('calendar')}
                  className="text-[#2E6844] dark:text-emerald-400 text-xs font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>

            {todayEvents.length === 0 ? (
              <EmptyState
                title="No events today"
                description="Appointments, family visits, or meetings will appear here."
                buttonText="Schedule Event"
                onAction={() => openModal('calendarEvent')}
              />
            ) : (
              <div className="space-y-2">
                {todayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40"
                  >
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {e.title}
                    </p>
                    <p className="text-xs text-sky-700 dark:text-sky-300 font-medium mt-0.5">
                      {e.startTime || 'All day'} {e.location && `• ${e.location}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
