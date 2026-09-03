import React, { useState } from 'react';
import {
  Upload,
  AlertTriangle,
  Layers,
  RefreshCw,
  CheckCircle2,
  Calendar,
  CheckSquare,
  Receipt,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Pill,
  HeartPulse,
  Plane,
  X,
  ShieldAlert,
} from 'lucide-react';
import { ParsedImportInfo } from '../../services/db';
import { formatDatePretty } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';

interface ImportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedInfo: ParsedImportInfo | null;
  fileName: string;
  onConfirm: (mode: 'overwrite' | 'merge') => Promise<void>;
}

export const ImportConfirmModal: React.FC<ImportConfirmModalProps> = ({
  isOpen,
  onClose,
  parsedInfo,
  fileName,
  onConfirm,
}) => {
  const { tasks, bills, expenses, settings } = useApp();
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [confirmedRisk, setConfirmedRisk] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !parsedInfo) return null;

  const existingCount = tasks.length + bills.length + expenses.length;
  const counts = parsedInfo.counts;
  const totalImportItems = Object.values(counts).reduce<number>(
    (acc, val) => acc + (typeof val === 'number' ? val : 0),
    0
  );

  const statItems = [
    { label: 'Tasks', count: counts.tasks || 0, icon: CheckSquare, color: 'text-emerald-500' },
    { label: 'Bills', count: counts.bills || 0, icon: Receipt, color: 'text-amber-500' },
    { label: 'Expenses', count: counts.expenses || 0, icon: TrendingDown, color: 'text-rose-500' },
    { label: 'Income', count: counts.incomes || 0, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'EMI / Loans', count: counts.emis || 0, icon: CreditCard, color: 'text-indigo-500' },
    { label: 'Medicines', count: counts.medicines || 0, icon: Pill, color: 'text-teal-500' },
    { label: 'Appointments', count: counts.healthAppointments || 0, icon: HeartPulse, color: 'text-rose-500' },
    { label: 'Calendar', count: counts.calendarEvents || 0, icon: Calendar, color: 'text-blue-500' },
    { label: 'Trips', count: counts.trips || 0, icon: Plane, color: 'text-cyan-500' },
    { label: 'Renewals', count: counts.renewals || 0, icon: RefreshCw, color: 'text-purple-500' },
  ];

  const handleExecute = async () => {
    if (importMode === 'overwrite' && existingCount > 0 && !confirmedRisk) {
      return;
    }
    try {
      setIsProcessing(true);
      await onConfirm(importMode);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirm Data Import
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review backup contents before applying changes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          {/* File Meta Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>File: <strong className="text-slate-800 dark:text-slate-200">{fileName}</strong></span>
              {parsedInfo.version && <span>Version: {parsedInfo.version}</span>}
            </div>
            {parsedInfo.exportedAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Created: <span className="font-medium text-slate-700 dark:text-slate-300">{formatDatePretty(parsedInfo.exportedAt.slice(0, 10))}</span>
              </p>
            )}
            <div className="pt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Total Records Detected: {totalImportItems} items
            </div>
          </div>

          {/* Records Breakdown Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Items to Import
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {statItems.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.label}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${st.color}`} />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {st.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {st.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Import Strategy Selection */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Choose Import Mode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Overwrite Option */}
              <div
                onClick={() => setImportMode('overwrite')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  importMode === 'overwrite'
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Replace / Overwrite</span>
                  </div>
                  {importMode === 'overwrite' && (
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Completely replace current entries with this backup. Existing items will be deleted.
                </p>
              </div>

              {/* Merge Option */}
              <div
                onClick={() => setImportMode('merge')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  importMode === 'merge'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>Merge Safely</span>
                  </div>
                  {importMode === 'merge' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Combine with current data. Existing items are preserved, skipping duplicate IDs.
                </p>
              </div>
            </div>
          </div>

          {/* Overwrite Confirmation Checkbox */}
          {importMode === 'overwrite' && existingCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <label className="text-xs text-amber-900 dark:text-amber-200 cursor-pointer select-none space-y-1 block">
                <span className="font-bold block">Confirmation Required to Prevent Accidental Data Loss:</span>
                <span className="block">
                  You currently have active tasks or financial records. Checking this box confirms you want to replace them.
                </span>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirm-overwrite-checkbox"
                    checked={confirmedRisk}
                    onChange={(e) => setConfirmedRisk(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="font-bold text-rose-700 dark:text-rose-300">
                    Yes, overwrite my existing data with this backup
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="modal-confirm-import-btn"
            onClick={handleExecute}
            disabled={
              isProcessing ||
              (importMode === 'overwrite' && existingCount > 0 && !confirmedRisk)
            }
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-2 ${
              importMode === 'overwrite'
                ? 'bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-rose-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-emerald-500/20'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Importing...'
                : importMode === 'overwrite'
                ? 'Overwrite & Import'
                : 'Merge & Import'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
