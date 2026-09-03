import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  Receipt,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayString, formatDatePretty } from '../../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { calendarEvents, tasks, bills, deleteCalendarEvent, openModal, settings } = useApp();

  const today = getTodayString();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    setSelectedDate(today);
  };

  // Build matrix
  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    daysArray.push(dStr);
  }

  // Selected date items
  const dayEvents = calendarEvents.filter((e) => e.date === selectedDate);
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const dayBills = bills.filter((b) => b.dueDate === selectedDate);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Calendar &amp; Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unified view of your events, tasks, and bill due dates
          </p>
        </div>
        <button
          id="add-event-btn"
          onClick={() => openModal('event')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Month View */}
        <div className="lg:col-span-2 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTodayClick}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day header labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100 dark:border-slate-800">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysArray.map((dStr, idx) => {
              if (!dStr) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-20" />;
              }

              const dayNum = parseInt(dStr.split('-')[2], 10);
              const isToday = dStr === today;
              const isSelected = dStr === selectedDate;

              const eventsForDay = calendarEvents.filter((e) => e.date === dStr);
              const tasksForDay = tasks.filter((t) => t.date === dStr);
              const billsForDay = bills.filter(
                (b) => b.dueDate === dStr && b.paymentStatus === 'unpaid'
              );

              const hasItems =
                eventsForDay.length > 0 || tasksForDay.length > 0 || billsForDay.length > 0;

              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`h-14 sm:h-20 p-1.5 rounded-xl flex flex-col justify-between items-start text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                      : isToday
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                  }`}
                >
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isToday
                        ? 'bg-emerald-600 text-white'
                        : isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {hasItems && (
                    <div className="flex items-center gap-1 mt-auto">
                      {eventsForDay.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Event" />
                      )}
                      {tasksForDay.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Task" />
                      )}
                      {billsForDay.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Bill Due" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Day Agenda */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selected Day
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {formatDatePretty(selectedDate)}
              </h3>
            </div>
            <button
              onClick={() => openModal('event')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Items for selected date */}
          {dayEvents.length === 0 && dayTasks.length === 0 && dayBills.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
              <p className="text-xs font-medium">Nothing scheduled for this day.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {/* Events */}
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {evt.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openModal('event', evt)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCalendarEvent(evt.id)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {evt.startTime && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {evt.startTime} {evt.endTime && `- ${evt.endTime}`}
                      </span>
                    </div>
                  )}
                  {evt.location && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Tasks */}
              {dayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span
                      className={`text-xs font-semibold ${
                        t.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  {t.time && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {t.time}
                    </span>
                  )}
                </div>
              ))}

              {/* Bills */}
              {dayBills.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      Bill: {b.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    {settings.currency} {Number(b.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
