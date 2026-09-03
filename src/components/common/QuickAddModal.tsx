import React from 'react';
import {
  Flame,
  CheckSquare,
  Bell,
  Receipt,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Pill,
  HeartPulse,
  Activity,
  FileText,
  RefreshCw,
  Calendar,
  Plane,
} from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';

export const QuickAddModal: React.FC = () => {
  const { quickAddOpen, setQuickAddOpen, openModal } = useApp();

  const handleSelect = (modalType: string) => {
    setQuickAddOpen(false);
    openModal(modalType);
  };

  const options = [
    {
      type: 'habit',
      label: 'Add Habit',
      desc: 'Daily recurring routine & streak tracker',
      icon: Flame,
      color: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40',
    },
    {
      type: 'task',
      label: 'Add Task',
      desc: 'To-dos with priorities and deadlines',
      icon: CheckSquare,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
    },
    {
      type: 'reminder',
      label: 'Add Reminder',
      desc: 'One-time or recurring alert',
      icon: Bell,
      color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
    },
    {
      type: 'expense',
      label: 'Add Expense',
      desc: 'Log daily spending & payments',
      icon: TrendingDown,
      color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40',
    },
    {
      type: 'income',
      label: 'Add Income',
      desc: 'Salary, investment, or other earnings',
      icon: TrendingUp,
      color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/40',
    },
    {
      type: 'bill',
      label: 'Add Bill',
      desc: 'Utilities, subscriptions & rent',
      icon: Receipt,
      color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
    },
    {
      type: 'credit_card',
      label: 'Add Credit Card',
      desc: 'Track limit, due balance & payment due date',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40',
    },
    {
      type: 'emi',
      label: 'Add EMI / Loan',
      desc: 'Monthly installment & payment tracker',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40',
    },
    {
      type: 'medicine',
      label: 'Add Medicine',
      desc: 'Dosage schedules & food instructions',
      icon: Pill,
      color: 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40',
    },
    {
      type: 'blood_pressure',
      label: 'Log Blood Pressure',
      desc: 'Record systolic, diastolic, pulse & context',
      icon: Activity,
      color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40',
    },
    {
      type: 'medical_record',
      label: 'Add Medical Record',
      desc: 'Prescription, lab report, consultation or scan',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
    },
    {
      type: 'health',
      label: 'Add Health Appointment',
      desc: 'Doctor visit or medical checkup',
      icon: HeartPulse,
      color: 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800/40',
    },
    {
      type: 'renewal',
      label: 'Add Renewal',
      desc: 'Passport, insurance, licenses, domain',
      icon: RefreshCw,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40',
    },
    {
      type: 'calendar',
      label: 'Add Calendar Event',
      desc: 'Meetings, occasions & gatherings',
      icon: Calendar,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800/40',
    },
    {
      type: 'trip',
      label: 'Add Trip / Vacation',
      desc: 'Plan travel, budget, packing & itinerary',
      icon: Plane,
      color: 'bg-lime-50 text-lime-700 border-lime-100 dark:bg-lime-950/40 dark:text-lime-400 dark:border-lime-800/40',
    },
  ];

  return (
    <Modal
      id="quick-add-modal"
      isOpen={quickAddOpen}
      onClose={() => setQuickAddOpen(false)}
      title="Quick Add"
      subtitle="Select an item to add to your personal dashboard"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.type}
              id={`quick-add-${opt.type}-btn`}
              onClick={() => handleSelect(opt.type)}
              className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#387652]/40 hover:bg-[#FAFBF9] dark:hover:bg-slate-800/50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-[#387652]/25 focus:ring-offset-1 cursor-pointer"
            >
              <div
                className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105 ${opt.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-[#2E6844] dark:group-hover:text-emerald-400 transition-colors">
                  {opt.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {opt.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
