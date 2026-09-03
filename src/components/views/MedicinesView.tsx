import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Clock,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { formatDatePretty } from '../../utils/dateUtils';

export const MedicinesView: React.FC = () => {
  const { medicines, updateMedicine, deleteMedicine, openModal } = useApp();
  const [filter, setFilter] = useState<'active' | 'all' | 'inactive'>('active');

  const filteredMedicines = medicines.filter((m) => {
    if (filter === 'active') return m.active;
    if (filter === 'inactive') return !m.active;
    return true;
  });

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateMedicine(id, { active: !currentStatus });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Medicines &amp; Prescriptions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Keep track of active prescriptions, dose timings, and meals guidelines
          </p>
        </div>
        <button
          id="add-medicine-btn"
          onClick={() => openModal('medicine')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
        {(['active', 'all', 'inactive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} (
            {
              medicines.filter((m) =>
                tab === 'active' ? m.active : tab === 'inactive' ? !m.active : true
              ).length
            }
            )
          </button>
        ))}
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title={
              medicines.length === 0
                ? 'No medicines scheduled yet'
                : 'No matching medicines found'
            }
            description={
              medicines.length === 0
                ? 'Add your daily vitamins, blood pressure medicines, or ongoing course treatments.'
                : 'Try toggling between active and inactive medicine lists.'
            }
            buttonText={medicines.length === 0 ? 'Add First Medicine' : undefined}
            onAction={medicines.length === 0 ? () => openModal('medicine') : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className={`p-6 rounded-[2rem] border transition-all ${
                med.active
                  ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {med.dosage}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {med.frequency ? med.frequency.replace('_', ' ') : 'Daily'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(med.id, med.active)}
                    className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                    title={med.active ? 'Mark as Inactive' : 'Mark as Active'}
                  >
                    {med.active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openModal('medicine', med)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMedicine(med.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timing slots */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Dose Times:</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {med.times && med.times.length > 0 ? med.times.join(', ') : 'Daily'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Food Instruction:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                    {med.beforeAfterFood} Food
                  </span>
                </div>
              </div>

              {med.instructions && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-3">
                  "{med.instructions}"
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Started: {formatDatePretty(med.startDate)}</span>
                {med.endDate && <span>Until: {formatDatePretty(med.endDate)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
