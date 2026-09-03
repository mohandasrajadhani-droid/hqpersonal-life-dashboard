import React, { useState } from 'react';
import { Lock, KeyRound, LogOut, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LockScreen: React.FC = () => {
  const { currentUser, unlockDashboard, logout } = useApp();
  const [unlockInput, setUnlockInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockInput) {
      setError('Please enter your password' + (currentUser?.hasQuickPin ? ' or PIN' : ''));
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const success = await unlockDashboard(unlockInput);
      if (!success) {
        setError('Incorrect password' + (currentUser?.hasQuickPin ? ' or PIN' : ''));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unlock failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F9FAF7] dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-sm">
        {/* Shield Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 text-[#387652] dark:text-emerald-400 mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Locked
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Personal, financial, and health records are hidden for privacy.
          </p>
        </div>

        {/* User Badge */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#387652]/15 dark:bg-emerald-900/30 text-[#387652] dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
              {(currentUser?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
                {currentUser?.hasQuickPin ? 'Enter Password or Quick PIN' : 'Enter Password to Unlock'}
              </label>
              <div className="relative">
                <input
                  id="lock-screen-unlock-input"
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={unlockInput}
                  onChange={(e) => setUnlockInput(e.target.value)}
                  placeholder={currentUser?.hasQuickPin ? 'Password or 4-6 digit PIN' : 'Password'}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="lock-screen-unlock-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#387652] hover:bg-[#2E6143] disabled:opacity-60 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Unlock Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800 text-center">
            <button
              id="lock-screen-signout-btn"
              type="button"
              onClick={logout}
              className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch account / Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
