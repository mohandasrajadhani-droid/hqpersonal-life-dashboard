import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { formatDatePretty, getTodayString } from '../../utils/dateUtils';

export const RenewalsView: React.FC = () => {
  const { renewals, updateRenewal, deleteRenewal, openModal, settings } = useApp();

  const [filter, setFilter] = useState<'active' | 'all' | 'expired'>('active');
  const today = getTodayString();

  const filteredRenewals = renewals.filter((r) => {
    if (filter === 'active') return r.status === 'active';
    if (filter === 'expired') return r.status === 'expired' || r.expiryDate < today;
    return true;
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateRenewal(id, { status: currentStatus === 'active' ? 'renewed' : 'active' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Renewals &amp; Warranties</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Never miss an expiration for passports, licenses, AMC, warranties, or software
          </p>
        </div>
        <button
          id="add-renewal-btn"
          onClick={() => openModal('renewal')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Renewal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
        {(['active', 'all', 'expired'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Renewals
          </button>
        ))}
      </div>

      {/* Renewals Grid */}
      {filteredRenewals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title={renewals.length === 0 ? 'No renewals tracked yet' : 'No matching renewals'}
            description={
              renewals.length === 0
                ? 'Track car insurance, passports, club memberships, appliance warranties, and home AMC.'
                : 'Try toggling filters.'
            }
            buttonText={renewals.length === 0 ? 'Add First Renewal' : undefined}
            onAction={renewals.length === 0 ? () => openModal('renewal') : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRenewals.map((r) => {
            const isExpired = r.expiryDate < today;

            return (
              <div
                key={r.id}
                className={`p-6 rounded-[2rem] border transition-all ${
                  isExpired
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {r.renewalType.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {r.itemName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal('renewal', r)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRenewal(r.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Expiry Date:
                      </span>
                    </div>
                    <span
                      className={`font-bold ${
                        isExpired ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {formatDatePretty(r.expiryDate)} {isExpired && '(Expired)'}
                    </span>
                  </div>

                  {r.renewalCost !== undefined && Number(r.renewalCost) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Renewal Cost:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {settings.currency} {Number(r.renewalCost).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {r.repeat && r.repeat !== 'none' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Cycle:</span>
                      <span className="capitalize font-bold text-emerald-600 dark:text-emerald-400">
                        {r.repeat}
                      </span>
                    </div>
                  )}
                </div>

                {r.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-3">
                    "{r.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span
                    className={`text-[11px] font-bold uppercase ${
                      r.status === 'active'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : r.status === 'renewed'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    Status: {r.status}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(r.id, r.status)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    {r.status === 'renewed' ? 'Mark Active' : 'Mark as Renewed'}
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
