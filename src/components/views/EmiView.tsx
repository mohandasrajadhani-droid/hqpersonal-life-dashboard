import React from 'react';
import {
  CreditCard,
  Plus,
  Building,
  CheckCircle2,
  Trash2,
  Edit2,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';

export const EmiView: React.FC = () => {
  const {
    emiLoans,
    updateEmi,
    deleteEmi,
    openModal,
    settings,
    reminders,
    syncFinancialDueToReminders,
    setActiveSection,
  } = useApp();

  const totalMonthlyEmi = emiLoans.reduce(
    (acc, curr) => acc + (Number(curr.emiAmount) || 0),
    0
  );
  const totalPrincipal = emiLoans.reduce(
    (acc, curr) => acc + (Number(curr.principalAmount) || 0),
    0
  );

  const handleRecordPayment = (id: string, currentRemaining: number) => {
    if (currentRemaining <= 0) return;
    updateEmi(id, {
      remainingInstallments: currentRemaining - 1,
      paymentStatus: currentRemaining - 1 === 0 ? 'completed' : 'pending',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>EMI &amp; Loans</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track mortgage, car loans, personal loans, and installment plans
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSection('credit_cards')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Credit Cards &amp; Banks</span>
          </button>
          <button
            id="add-emi-btn"
            onClick={() => openModal('emi')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loan / EMI</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Monthly EMI Commitment
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {settings.currency} {totalMonthlyEmi.toFixed(2)}
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
            {emiLoans.length} Loans
          </span>
        </div>

        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Principal Borrowed
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {settings.currency} {totalPrincipal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* EMI Cards */}
      {emiLoans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title="No EMI or Loans recorded yet"
            description="Add home loans, car loans, education debt, or gadget EMIs to track payoff progress."
            buttonText="Add Your First Loan"
            onAction={() => openModal('emi')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emiLoans.map((emi) => {
            const completedInstallments =
              emi.totalInstallments - emi.remainingInstallments;
            const progressPercent = Math.min(
              100,
              Math.round((completedInstallments / (emi.totalInstallments || 1)) * 100)
            );

            return (
              <div
                key={emi.id}
                className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {emi.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>{emi.lender}</span>
                        {Number(emi.interestRate) > 0 && (
                          <>
                            <span>•</span>
                            <span>{emi.interestRate}% Interest</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal('emi', emi)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEmi(emi.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-4">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Monthly EMI
                      </span>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {settings.currency} {Number(emi.emiAmount).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Total Principal
                      </span>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {settings.currency} {Number(emi.principalAmount).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Paid {completedInstallments} of {emi.totalInstallments} months
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {progressPercent}% Repaid
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Row with Due Day and Quick Payment Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Due on <strong className="text-slate-800 dark:text-slate-200">{emi.dueDayOfMonth}th</strong> of month
                    </span>
                    <button
                      onClick={() => syncFinancialDueToReminders('emi', emi.id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                        reminders.some((r) => r.sourceType === 'emi' && r.sourceId === emi.id && !r.completed)
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                      title="Sync due date to Reminders"
                    >
                      <Bell className="w-3 h-3" />
                      <span>
                        {reminders.some((r) => r.sourceType === 'emi' && r.sourceId === emi.id && !r.completed)
                          ? 'Reminder Active'
                          : 'Add to Reminders'}
                      </span>
                    </button>
                  </div>

                  {emi.remainingInstallments > 0 ? (
                    <button
                      onClick={() => handleRecordPayment(emi.id, emi.remainingInstallments)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Installment Paid</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Loan Fully Paid Off!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
