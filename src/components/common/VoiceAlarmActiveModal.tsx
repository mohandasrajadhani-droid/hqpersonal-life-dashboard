import React from 'react';
import { Bell, Volume2, CheckCircle2, Clock, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VoiceAlarmActiveModal: React.FC = () => {
  const {
    activeAlarmReminder,
    stopVoiceAlarm,
    snoozeVoiceAlarm,
    completeVoiceAlarm,
    settings,
  } = useApp();

  if (!activeAlarmReminder) return null;

  const isElderly = settings.elderlyMode;

  return (
    <div
      id="voice-alarm-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-500/80 dark:border-emerald-500 overflow-hidden transform transition-all animate-scale-up">
        {/* Header Ribbon */}
        <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-100">
                LifeHQ Voice Alert
              </span>
              <h3 className="font-semibold text-sm leading-tight text-white">
                Scheduled Reminder is Due
              </h3>
            </div>
          </div>
          <button
            onClick={stopVoiceAlarm}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss alarm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 text-center">
          {/* Pulsing Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
            <Bell className="w-8 h-8 fill-emerald-500/30 stroke-emerald-600 dark:stroke-emerald-400" />
          </div>

          <div>
            <h2
              id="alarm-title"
              className={`font-bold text-slate-900 dark:text-slate-100 ${
                isElderly ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
              }`}
            >
              {activeAlarmReminder.title}
            </h2>

            {activeAlarmReminder.time && (
              <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4" />
                Scheduled for {activeAlarmReminder.time}
              </p>
            )}

            {activeAlarmReminder.notes && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs md:text-sm text-slate-600 dark:text-slate-300 text-left">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider mb-0.5">
                  Instructions / Notes:
                </span>
                {activeAlarmReminder.notes}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="alarm-mark-done-btn"
              onClick={completeVoiceAlarm}
              className={`w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer ${
                isElderly ? 'text-lg min-h-[54px]' : 'text-base'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Done (Mark Completed)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="alarm-snooze-btn"
                onClick={() => snoozeVoiceAlarm(5)}
                className={`py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  isElderly ? 'text-base min-h-[48px]' : 'text-xs md:text-sm'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Snooze (5 min)</span>
              </button>

              <button
                id="alarm-stop-btn"
                onClick={stopVoiceAlarm}
                className={`py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-semibold transition-colors cursor-pointer ${
                  isElderly ? 'text-base min-h-[48px]' : 'text-xs md:text-sm'
                }`}
              >
                Stop Alarm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
