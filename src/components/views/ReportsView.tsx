import React from 'react';
import {
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';

export const ReportsView: React.FC = () => {
  const { tasks, expenses, incomes, bills, emiLoans, settings } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total expenses by category
  const expenseCatMap: { [key: string]: number } = {};
  expenses.forEach((e) => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + (Number(e.amount) || 0);
  });
  const expenseCatData = Object.keys(expenseCatMap).map((k) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    amount: expenseCatMap[k],
  }));

  // Overview comparison
  const totalIncome = incomes.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const totalExpense = expenses.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const totalBills = bills.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const totalEmi = emiLoans.reduce((acc, c) => acc + (Number(c.emiAmount) || 0), 0);

  const overviewBarData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpense },
    { name: 'Bills', amount: totalBills },
    { name: 'EMI', amount: totalEmi },
  ];

  const hasAnyData =
    tasks.length > 0 ||
    expenses.length > 0 ||
    incomes.length > 0 ||
    bills.length > 0 ||
    emiLoans.length > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Reports &amp; Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personal productivity metrics, task completion rate, and spending distribution
        </p>
      </div>

      {!hasAnyData ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title="No data to analyze yet"
            description="As you add tasks, daily expenses, and income, detailed analytical reports will populate here."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Task Completion
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {taskCompletionRate}%
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {completedTasks} of {totalTasks} finished
              </span>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Expenses
              </span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {settings.currency} {totalExpense.toFixed(2)}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">{expenses.length} logged</span>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Income
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {settings.currency} {totalIncome.toFixed(2)}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">{incomes.length} records</span>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Commitments
              </span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {settings.currency} {(totalBills + totalEmi).toFixed(2)}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Bills + EMI</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Overview Bar Chart */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                Total Financial Overview
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewBarData}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      formatter={(val: any) => [`${settings.currency} ${Number(val).toFixed(2)}`, 'Total']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '16px',
                        color: '#fff',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="amount" fill="#059669" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses By Category Bar */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                Spending by Category
              </h3>
              {expenseCatData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                  No expenses to display
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseCatData} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} />
                      <Tooltip
                        formatter={(val: any) => [`${settings.currency} ${Number(val).toFixed(2)}`, 'Spent']}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '16px',
                          color: '#fff',
                          border: 'none',
                        }}
                      />
                      <Bar dataKey="amount" fill="#e11d48" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
