import React from 'react';
import { Bell, Check, Trash2, X, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/dateUtils';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    clearNotifications,
    requestNotificationPermission,
    settings,
  } = useApp();

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
  };

  const hasBrowserPermission =
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform animate-in slide-in-from-right duration-200"
        id="notification-drawer"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Notifications
            </h3>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser notification permission banner if not granted */}
        {!hasBrowserPermission && settings.notificationsEnabled && (
          <div className="m-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs">
            <p className="text-emerald-900 dark:text-emerald-200 font-medium mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              Enable device alerts
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mb-2">
              Receive alerts for upcoming bills, tasks, EMIs, and medicine schedules.
            </p>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
            >
              Allow Notifications
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
              <Bell className="w-8 h-8 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No notifications yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
                You will be alerted here when tasks, bills, EMIs, or medicines are due.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  n.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    : 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/50 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {n.entityType}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1">
                  {n.title}
                </h4>
                {n.message && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
