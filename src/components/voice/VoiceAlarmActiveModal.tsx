import React, { useState } from 'react';
import { Bell, Volume2, Square, Clock, CheckCircle2, ChevronDown } from 'lucide-react';
import { ActiveAlarmInfo, voiceAlarmService } from '../../services/voiceAlarmService';

interface VoiceAlarmActiveModalProps {
  alarm: ActiveAlarmInfo | null;
  onStop: () => void;
  onSnooze: (minutes: number) => void;
  onDone: () => void;
  defaultSnoozeMinutes?: number;
}

export const VoiceAlarmActiveModal: React.FC<VoiceAlarmActiveModalProps> = ({
  alarm,
  onStop,
  onSnooze,
  onDone,
  defaultSnoozeMinutes = 10,
}) => {
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);
  const [customSnoozeMinutes, setCustomSnoozeMinutes] = useState(defaultSnoozeMinutes);

  if (!alarm) return null;

  const snoozeOptions = [5, 10, 15, 30];

  const handleSnooze = (minutes: number) => {
    setSnoozeMenuOpen(false);
    onSnooze(minutes);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-emerald-500/40 dark:border-emerald-400/40 p-6 md:p-8 text-center overflow-hidden">
        {/* Subtle pulsing background glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl animate-pulse" />

        {/* Animated Alarm Icon */}
        <div className="relative mx-auto mb-5 w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
          <Bell className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
          Voice Reminder Alert
        </div>

        {/* Alarm Title & Message */}
        <h2 id="alarm-modal-title" className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
          {alarm.title}
        </h2>
        {alarm.body && (
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 font-medium">
            {alarm.body}
          </p>
        )}

        {/* Large Elderly-Friendly Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* STOP BUTTON */}
          <button
            id="voice-alarm-stop-btn"
            type="button"
            onClick={onStop}
            className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95"
            aria-label="Stop Alarm"
          >
            <Square className="w-6 h-6 fill-current" />
            <span>STOP</span>
            <span className="text-xs font-normal text-rose-100">Dismiss Sound</span>
          </button>

          {/* SNOOZE BUTTON WITH OPTIONS */}
          <div className="relative">
            <button
              id="voice-alarm-snooze-btn"
              type="button"
              onClick={() => handleSnooze(customSnoozeMinutes)}
              className="w-full h-full flex flex-col items-center justify-center gap-1.5 py-4 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95"
              aria-label={`Snooze for ${customSnoozeMinutes} minutes`}
            >
              <Clock className="w-6 h-6" />
              <span>SNOOZE</span>
              <span className="text-xs font-normal text-amber-100">{customSnoozeMinutes} mins</span>
            </button>

            {/* Quick dropdown toggle for snooze duration */}
            <button
              type="button"
              onClick={() => setSnoozeMenuOpen(!snoozeMenuOpen)}
              className="absolute top-2 right-2 p-1 rounded-lg bg-amber-600/60 hover:bg-amber-600 text-white"
              title="Change snooze time"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {snoozeMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-10 text-left">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1">Snooze duration:</p>
                <div className="grid grid-cols-2 gap-1">
                  {snoozeOptions.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setCustomSnoozeMinutes(mins);
                        handleSnooze(mins);
                      }}
                      className="px-2 py-1.5 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 text-center"
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DONE BUTTON */}
          <button
            id="voice-alarm-done-btn"
            type="button"
            onClick={onDone}
            className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95"
            aria-label="Mark Complete"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>DONE</span>
            <span className="text-xs font-normal text-emerald-100">Mark Finished</span>
          </button>
        </div>

        {/* Informational audio note */}
        <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">
          Audio alarm and voice announcements are active. Press STOP or Spacebar to silence.
        </p>
      </div>
    </div>
  );
};
