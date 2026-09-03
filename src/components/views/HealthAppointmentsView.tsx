import React, { useState } from 'react';
import {
  HeartPulse,
  Plus,
  Calendar,
  MapPin,
  Check,
  Trash2,
  Edit2,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { formatDatePretty } from '../../utils/dateUtils';

export const HealthAppointmentsView: React.FC = () => {
  const {
    healthAppointments,
    toggleHealthAppointmentCompleted,
    deleteHealthAppointment,
    openModal,
  } = useApp();

  const [filter, setFilter] = useState<'upcoming' | 'all' | 'completed'>('upcoming');

  const filteredAppointments = healthAppointments.filter((a) => {
    if (filter === 'upcoming') return !a.completed;
    if (filter === 'completed') return a.completed;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <HeartPulse className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Doctor Consultations &amp; Checkups</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Schedule visits, annual health tests, dental cleanings, and follow-ups
          </p>
        </div>
        <button
          id="add-health-appt-btn"
          onClick={() => openModal('health')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Health Visit</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
        {(['upcoming', 'all', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Visits
          </button>
        ))}
      </div>

      {/* List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title={
              healthAppointments.length === 0
                ? 'No health appointments scheduled'
                : 'No appointments match your filter'
            }
            description={
              healthAppointments.length === 0
                ? 'Record doctor appointments, blood pressure tests, or dentist visits to receive timely reminders.'
                : 'Try toggling between upcoming and completed visits.'
            }
            buttonText={healthAppointments.length === 0 ? 'Schedule Health Visit' : undefined}
            onAction={healthAppointments.length === 0 ? () => openModal('health') : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className={`p-6 rounded-[2rem] border transition-all ${
                appt.completed
                  ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleHealthAppointmentCompleted(appt.id)}
                    className="mt-1 transition-transform cursor-pointer shrink-0"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        appt.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                    >
                      {appt.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>

                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                      {appt.type}
                    </span>
                    <h3
                      className={`text-base font-bold mt-1 ${
                        appt.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {appt.reason}
                    </h3>
                    {appt.doctorName && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                        <User className="w-3.5 h-3.5 text-rose-500" />
                        <span>{appt.doctorName}</span>
                        {appt.specialty && <span>({appt.specialty})</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal('health', appt)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHealthAppointment(appt.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatDatePretty(appt.date)}
                  </span>
                  {appt.time && <span>at {appt.time}</span>}
                </div>

                {appt.hospitalClinic && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.hospitalClinic}</span>
                  </div>
                )}
              </div>

              {appt.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-2">
                  "{appt.notes}"
                </p>
              )}

              {appt.followUpDate && (
                <div className="text-xs text-rose-700 dark:text-rose-300 font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                  Follow-up: {formatDatePretty(appt.followUpDate)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
