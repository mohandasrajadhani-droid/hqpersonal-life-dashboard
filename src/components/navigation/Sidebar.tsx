import React from 'react';
import {
  Sun,
  Flame,
  CheckSquare,
  Bell,
  TrendingDown,
  TrendingUp,
  Receipt,
  CreditCard,
  PieChart,
  Pill,
  HeartPulse,
  Activity,
  FileText,
  Calendar,
  Plane,
  RefreshCw,
  BarChart3,
  Search,
  Settings,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationSection } from '../../types';
import { getTodayString } from '../../utils/dateUtils';
import { AppIcon } from '../common/AppIcon';

export const Sidebar: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    setQuickAddOpen,
    tasks,
    habits,
    bills,
    creditCards,
    medicines,
    renewals,
    settings,
  } = useApp();

  const today = getTodayString();
  const todayTasksCount = tasks.filter((t) => !t.completed && t.date === today).length;
  const pendingHabitsCount = habits.filter((h) => !h.completedDates.includes(today)).length;
  const unpaidBillsCount = bills.filter((b) => b.paymentStatus === 'unpaid').length;
  const dueCardsCount = creditCards.filter((c) => Number(c.currentDue) > 0).length;
  const activeMedsCount = medicines.filter((m) => m.active).length;
  const expiringRenewalsCount = renewals.filter((r) => r.status === 'active').length;

  interface NavItem {
    id: NavigationSection;
    label: string;
    icon: any;
    badge?: number;
  }

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Today',
      items: [
        { id: 'today', label: 'Today Overview', icon: Sun },
        { id: 'habits', label: 'Habit Tracker', icon: Flame, badge: pendingHabitsCount },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: todayTasksCount },
        { id: 'reminders', label: 'Reminders', icon: Bell },
      ],
    },
    {
      title: 'Money',
      items: [
        { id: 'expenses', label: 'Expenses', icon: TrendingDown },
        { id: 'income', label: 'Income', icon: TrendingUp },
        { id: 'bills', label: 'Bills', icon: Receipt, badge: unpaidBillsCount },
        { id: 'credit_cards', label: 'Credit Cards', icon: CreditCard, badge: dueCardsCount },
        { id: 'emi', label: 'EMI & Loans', icon: RefreshCw },
        { id: 'financial_summary', label: 'Financial Summary', icon: PieChart },
      ],
    },
    {
      title: 'Health',
      items: [
        { id: 'medicines', label: 'Medicines', icon: Pill, badge: activeMedsCount },
        { id: 'blood_pressure', label: 'Blood Pressure', icon: Activity },
        { id: 'medical_records', label: 'Medical Records', icon: FileText },
        { id: 'health_appointments', label: 'Appointments & Checkups', icon: HeartPulse },
      ],
    },
    {
      title: 'Calendar',
      items: [
        { id: 'calendar', label: 'Calendar', icon: Calendar },
      ],
    },
    {
      title: 'Travel',
      items: [
        { id: 'trips', label: 'Trips & Travel', icon: Plane },
      ],
    },
    {
      title: 'More',
      items: [
        { id: 'renewals', label: 'Renewals', icon: RefreshCw, badge: expiringRenewalsCount },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'search', label: 'Search', icon: Search },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen select-none"
    >
      {/* Brand Header */}
      <div
        onClick={() => setActiveSection('today')}
        className="p-6 flex items-center gap-3 cursor-pointer group border-b border-slate-100 dark:border-slate-800/80"
      >
        <AppIcon className="w-10 h-10 group-hover:scale-105 transition-transform" />
        <div className="overflow-hidden">
          <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {settings.name ? settings.name : 'LifeHQ'}
          </h1>
          <span className="text-[11px] font-semibold text-[#387652] dark:text-emerald-400 block -mt-0.5">
            Personal Life OS
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left group ${
                      isActive
                        ? 'bg-[#EDF5F0] text-[#28573A] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-[#F4F6F3] dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#2E6844] dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-[#DCEBE0] text-[#245236] dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Add Action Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          id="sidebar-quick-add-btn"
          onClick={() => setQuickAddOpen(true)}
          className="w-full bg-[#387652] hover:bg-[#2E6143] text-white rounded-xl py-2.5 font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Add</span>
        </button>
      </div>
    </aside>
  );
};
