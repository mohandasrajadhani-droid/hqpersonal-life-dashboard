import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { login, register, authError, isAuthenticating } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [autoLockMinutes, setAutoLockMinutes] = useState(15);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters long.');
        return;
      }
      try {
        await register(email.trim(), password, name.trim() || 'User', autoLockMinutes);
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : 'Registration failed');
      }
    } else {
      try {
        await login(email.trim(), password);
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : 'Sign in failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAF7] dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand & Security Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 text-[#387652] dark:text-emerald-400 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Personal Life Dashboard
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Privacy-first personal, financial, and health management with AES-256-GCM encryption at rest.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 md:p-7">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-6">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                setMode('signin');
                setLocalError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setLocalError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {(localError || authError) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <span className="text-[11px] text-slate-500">
                    Min 8 characters
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar for signup */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-full transition-colors ${
                          lvl <= strength
                            ? strength <= 2
                              ? 'bg-rose-500'
                              : strength <= 3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {strength <= 2
                      ? 'Weak password — add numbers and capital letters'
                      : strength <= 3
                      ? 'Moderate strength'
                      : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Auto-Lock Idle Inactivity Timeout
                </label>
                <select
                  id="signup-autolock-select"
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#387652]"
                >
                  <option value={5}>5 Minutes (Maximum Security)</option>
                  <option value={15}>15 Minutes (Recommended)</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={0}>Disabled (Manual lock only)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Protects your health & financial data by locking the view when you step away.
                </p>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isAuthenticating}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#387652] hover:bg-[#2E6143] disabled:opacity-60 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In Securely</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Create Encrypted Vault</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Assurances */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>AES-256-GCM encrypted database at rest</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>Zero card CVV/PIN or full secrets stored</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>Zero sensitive records in browser storage</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>Strict per-user data partition</span>
          </div>
        </div>
      </div>
    </div>
  );
};
