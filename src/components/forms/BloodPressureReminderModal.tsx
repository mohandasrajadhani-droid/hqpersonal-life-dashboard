import React, { useState } from 'react';
import { X, Bell, Volume2, Plus, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { BloodPressureReminderConfig, VoiceAlarmMode } from '../../types';

interface BloodPressureReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BloodPressureReminderConfig | null;
  onSave: (config: BloodPressureReminderConfig) => void;
}

export const BloodPressureReminderModal: React.FC<BloodPressureReminderModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(config?.enabled ?? false);
  const [frequency, setFrequency] = useState<'once_daily' | 'twice_daily' | 'custom'>(
    config?.frequency || 'twice_daily'
  );
  const [times, setTimes] = useState<string[]>(
    config?.times && config.times.length > 0 ? config.times : ['08:00', '20:00']
  );
  const [voiceAlarmEnabled, setVoiceAlarmEnabled] = useState(config?.voiceAlarmEnabled ?? true);
  const [voiceAlarmMode, setVoiceAlarmMode] = useState<VoiceAlarmMode>(
    config?.voiceAlarmMode || 'alarm_voice'
  );
  const [notes, setNotes] = useState(config?.notes || 'Sit quietly for 5 minutes before checking blood pressure');

  if (!isOpen) return null;

  const handleFrequencyChange = (newFreq: 'once_daily' | 'twice_daily' | 'custom') => {
    setFrequency(newFreq);
    if (newFreq === 'once_daily') {
      setTimes([times[0] || '08:00']);
    } else if (newFreq === 'twice_daily') {
      setTimes(['08:00', '20:00']);
    }
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const updated = [...times];
    updated[index] = newTime;
    setTimes(updated);
  };

  const addTimeSlot = () => {
    setTimes([...times, '14:00']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length <= 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedConfig: BloodPressureReminderConfig = {
      id: config?.id || 'bp_reminder_schedule',
      enabled,
      frequency,
      times: times.filter(Boolean),
      voiceAlarmEnabled,
      voiceAlarmMode,
      notes: notes.trim() || undefined,
      createdAt: config?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedConfig);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bp-reminder-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 id="bp-reminder-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                BP Check Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled daily alerts and spoken reminders for blood pressure monitoring
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="bp-remind-toggle" className="font-semibold text-slate-900 dark:text-white text-base block cursor-pointer">
                Enable BP Reminders
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive notifications when it is time to measure your BP
              </p>
            </div>
            <input
              id="bp-remind-toggle"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-6 h-6 rounded-lg text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          {enabled && (
            <div className="space-y-4 animate-fadeIn">
              {/* Frequency selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFrequencyChange('once_daily')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      frequency === 'once_daily'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Once Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFrequencyChange('twice_daily')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      frequency === 'twice_daily'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Twice Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFrequencyChange('custom')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      frequency === 'custom'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Custom Times
                  </button>
                </div>
              </div>

              {/* Times list */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Reminder Times
                </label>
                <div className="space-y-2">
                  {times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="time"
                          value={t}
                          onChange={(e) => handleTimeChange(idx, e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      {frequency === 'custom' && times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl"
                          title="Remove time"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {frequency === 'custom' && (
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline pt-1"
                    >
                      <Plus className="w-4 h-4" /> Add another time
                    </button>
                  )}
                </div>
              </div>

              {/* Voice Alarm & Announcement Option */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <label htmlFor="bp-voice-alarm-toggle" className="font-semibold text-slate-900 dark:text-white text-sm block cursor-pointer">
                        Voice Alarm & Sound
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Plays pleasant alarm chime and speaks "Time to check your blood pressure"
                      </p>
                    </div>
                  </div>
                  <input
                    id="bp-voice-alarm-toggle"
                    type="checkbox"
                    checked={voiceAlarmEnabled}
                    onChange={(e) => setVoiceAlarmEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {voiceAlarmEnabled && (
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                    <label htmlFor="bp-alarm-mode-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Alarm Audio Mode
                    </label>
                    <select
                      id="bp-alarm-mode-select"
                      value={voiceAlarmMode}
                      onChange={(e) => setVoiceAlarmMode(e.target.value as VoiceAlarmMode)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    >
                      <option value="alarm_voice">Alarm Chime + Spoken Voice Announcement</option>
                      <option value="alarm_only">Alarm Chime Only</option>
                      <option value="voice_only">Spoken Voice Only</option>
                      <option value="silent">Silent Visual Notification Only</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Instructions / Notes */}
              <div>
                <label htmlFor="bp-reminder-notes" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preparation Advice / Note
                </label>
                <input
                  id="bp-reminder-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Rest for 5 mins, avoid coffee before check"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-md transition-all"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
