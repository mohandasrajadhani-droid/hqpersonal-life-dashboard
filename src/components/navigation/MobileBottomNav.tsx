import React from 'react';
import { Sun, DollarSign, HeartPulse, Calendar, MoreHorizontal, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activeSection, setActiveSection, setQuickAddOpen } = useApp();

  const isTodayActive = ['today', 'habits', 'tasks', 'reminders'].includes(activeSection);
  const isMoneyActive = ['expenses', 'income', 'bills', 'credit_cards', 'emi', 'financial_summary'].includes(activeSection);
  const isHealthActive = ['medicines', 'blood_pressure', 'medical_records', 'health_appointments'].includes(activeSection);
  const isCalendarActive = activeSection === 'calendar';
  const isMoreActive = ['trips', 'renewals', 'reports', 'search', 'settings'].includes(activeSection);

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around"
    >
      <button
        onClick={() => setActiveSection('today')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl text-[11px] font-medium transition-colors ${
          isTodayActive
            ? 'text-[#2E6844] dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Sun className="w-5 h-5 mb-0.5" />
        <span>Today</span>
      </button>

      <button
        onClick={() => setActiveSection('expenses')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl text-[11px] font-medium transition-colors ${
          isMoneyActive
            ? 'text-[#2E6844] dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <DollarSign className="w-5 h-5 mb-0.5" />
        <span>Money</span>
      </button>

      {/* Floating Center Quick Add Button */}
      <button
        onClick={() => setQuickAddOpen(true)}
        className="w-12 h-12 -mt-4 rounded-full bg-[#387652] hover:bg-[#2E6143] text-white flex items-center justify-center shadow-md shadow-[#387652]/20 transition-transform active:scale-95"
        aria-label="Quick Add"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveSection('medicines')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl text-[11px] font-medium transition-colors ${
          isHealthActive
            ? 'text-[#2E6844] dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <HeartPulse className="w-5 h-5 mb-0.5" />
        <span>Health</span>
      </button>

      <button
        onClick={() => setActiveSection('calendar')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl text-[11px] font-medium transition-colors ${
          isCalendarActive
            ? 'text-[#2E6844] dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span>Calendar</span>
      </button>

      <button
        onClick={() => setActiveSection('reports')}
        className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl text-[11px] font-medium transition-colors ${
          isMoreActive
            ? 'text-[#2E6844] dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <MoreHorizontal className="w-5 h-5 mb-0.5" />
        <span>More</span>
      </button>
    </nav>
  );
};
