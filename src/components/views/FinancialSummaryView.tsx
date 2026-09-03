import React from 'react';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Receipt,
  Sparkles,
  Plus,
  CreditCard as CardIcon,
  Building2,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#047857', '#065f46', '#022c22'];

export const FinancialSummaryView: React.FC = () => {
  const {
    financialSummary,
    expenses,
    incomes,
    bills,
    emiLoans,
    creditCards,
    bankAccounts,
    setActiveSection,
    settings,
    openModal,
  } = useApp();

  const hasAnyFinancialData =
    expenses.length > 0 ||
    incomes.length > 0 ||
    bills.length > 0 ||
    emiLoans.length > 0 ||
    creditCards.length > 0 ||
    bankAccounts.length > 0;

  // Breakdown by expense category
  const categoryMap: { [key: string]: number } = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + (Number(e.amount) || 0);
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: categoryMap[cat],
  }));

  // Cashflow comparison data
  const totalOutflow =
    financialSummary.totalExpenses +
    financialSummary.totalUnpaidBills +
    financialSummary.totalMonthlyEmi;

  const cashflowData = [
    {
      name: 'Income',
      amount: financialSummary.totalIncome,
    },
    {
      name: 'Outflow',
      amount: totalOutflow,
    },
    {
      name: 'Net Savings',
      amount: Math.max(0, financialSummary.netSavings),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <PieChartIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Financial Summary</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Current month balance, cashflow in vs out, and categorized spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('income')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Income
          </button>
          <button
            onClick={() => openModal('expense')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/10 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Expense
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {settings.currency} {financialSummary.totalIncome.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded this month</span>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Daily Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {settings.currency} {financialSummary.totalExpenses.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Groceries, fuel, leisure</span>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bills &amp; EMI</span>
            <Receipt className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {settings.currency}{' '}
            {(financialSummary.totalUnpaidBills + financialSummary.totalMonthlyEmi).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {settings.currency} {financialSummary.totalUnpaidBills.toFixed(2)} bills + {settings.currency} {financialSummary.totalMonthlyEmi.toFixed(2)} EMI
          </span>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Balance</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div
            className={`text-xl md:text-2xl font-bold ${
              financialSummary.netSavings >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {settings.currency} {financialSummary.netSavings.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Income - Outflow
          </span>
        </div>
      </div>

      {/* Chart Visualizations */}
      {!hasAnyFinancialData ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title="No financial data available to visualize"
            description="Start recording your regular income, expenses, and utility bills to see automated charts."
            buttonText="Add Income"
            onAction={() => openModal('income')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cashflow Bar Chart */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Cashflow Comparison
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: any) => [`${settings.currency} ${Number(value).toFixed(2)}`, 'Amount']}
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

          {/* Expense Category Pie Chart */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Expenses by Category
            </h3>
            {categoryData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <PieChartIcon className="w-10 h-10 mb-2 opacity-40 text-emerald-600" />
                <p className="text-xs">No daily expenses recorded yet.</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${settings.currency} ${Number(value).toFixed(2)}`, 'Spent']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '16px',
                        color: '#fff',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credit Cards & Banking Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credit Cards Card */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <CardIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Credit Cards &amp; Dues
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {creditCards.length} {creditCards.length === 1 ? 'card' : 'cards'} configured
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSection('credit_cards')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>Manage Cards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Total Credit Dues
              </div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {settings.currency} {financialSummary.totalCreditCardDues.toFixed(2)}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Total Credit Limit
              </div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {settings.currency} {financialSummary.totalCreditLimit.toFixed(2)}
              </div>
            </div>
          </div>

          {financialSummary.totalCreditLimit > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Credit Utilization</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {((financialSummary.totalCreditCardDues / financialSummary.totalCreditLimit) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    financialSummary.totalCreditCardDues / financialSummary.totalCreditLimit > 0.5
                      ? 'bg-rose-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (financialSummary.totalCreditCardDues / financialSummary.totalCreditLimit) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bank Accounts Card */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Bank Accounts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bankAccounts.length} {bankAccounts.length === 1 ? 'account' : 'accounts'} registered
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSection('credit_cards')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <span>Manage Banks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Total Bank Balances
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {settings.currency}{' '}
              {bankAccounts
                .reduce((sum, b) => sum + (Number(b.balance) || 0), 0)
                .toFixed(2)}
            </div>
          </div>

          {bankAccounts.length > 0 && (
            <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
              {bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {b.bankName} - {b.accountName} (•••• {b.accountNumberLast4})
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {settings.currency} {Number(b.balance || 0).toFixed(2)}
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
