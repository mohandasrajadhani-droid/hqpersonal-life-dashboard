import React, { useState } from 'react';
import {
  Plus,
  Mic,
  Search,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  Contrast,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode } from '../../types';
import { AppIcon } from '../common/AppIcon';

export const Header: React.FC = () => {
  const {
    setQuickAddOpen,
    setVoiceModalOpen,
    setActiveSection,
    notifications,
    settings,
    updateSettings,
    openNotificationDrawer,
    isPrivacyMasked,
    togglePrivacyMask,
    lockDashboard,
    currentUser,
  } = useApp();

  const handleCycleTheme = () => {
    const currentTheme = settings.theme || 'light';
    let nextTheme: ThemeMode = 'dark';
    if (currentTheme === 'light') nextTheme = 'dark';
    else if (currentTheme === 'dark') nextTheme = 'high-contrast';
    else nextTheme = 'light';
    updateSettings({ theme: nextTheme });
  };

  const ThemeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'high-contrast' ? Contrast : Sun;
  const themeLabel = settings.theme === 'dark' ? 'Dark Mode' : settings.theme === 'high-contrast' ? 'High-Contrast Mode' : 'Light Mode';

  const [searchInput, setSearchInput] = useState('');
  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const displayName = settings.userName || 'Alex';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSection('search');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Date & Greeting */}
        <div className="flex items-center justify-between sm:block">
          <div className="flex items-center gap-3 md:hidden">
            <div
              onClick={() => setActiveSection('today')}
              className="cursor-pointer active:scale-95 transition-transform"
            >
              <AppIcon className="w-9 h-9" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-none">{todayDisplay}</p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight mt-0.5">
                {timeGreeting}, {displayName}
              </h2>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-none">{todayDisplay}</p>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {timeGreeting}, {displayName}
            </h2>
          </div>
        </div>

        {/* Right: Search, Voice, Notifications, Avatar & Quick Add */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3">
          {/* Search Input Box matching Design HTML */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => {
                if (searchInput) setActiveSection('search');
              }}
              placeholder="Search records..."
              className="pl-9 pr-3 py-2 bg-[#F6F7F5] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl w-40 sm:w-56 md:w-64 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]/25 focus:border-[#387652] focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </form>

          {/* Quick Voice Assistant Button */}
          <button
            id="header-voice-btn"
            onClick={() => setVoiceModalOpen(true)}
            title="Voice Assistant"
            className="p-2 rounded-xl text-slate-600 hover:text-[#2E6844] hover:bg-[#EDF5F0] dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#387652]/25 cursor-pointer shrink-0"
            aria-label="Open voice command input"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Quick Theme Mode Toggle Button */}
          <button
            id="header-theme-toggle-btn"
            onClick={handleCycleTheme}
            title={`Current: ${themeLabel}. Click to cycle Light, Dark, High-Contrast.`}
            className="p-2 rounded-xl text-slate-600 hover:text-[#2E6844] hover:bg-[#EDF5F0] dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#387652]/25 cursor-pointer shrink-0"
            aria-label="Toggle theme mode"
          >
            <ThemeIcon className="w-4 h-4" />
          </button>

          {/* Privacy Mask Toggle Button */}
          <button
            id="header-privacy-mask-btn"
            onClick={togglePrivacyMask}
            title={isPrivacyMasked ? 'Privacy Mask ON: Financial amounts are hidden. Click to reveal.' : 'Privacy Mask OFF: Click to mask sensitive amounts from onlookers.'}
            className={`p-2 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[#387652]/25 cursor-pointer shrink-0 ${
              isPrivacyMasked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                : 'text-slate-600 hover:text-[#2E6844] hover:bg-[#EDF5F0] dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/40 border-slate-200 dark:border-slate-800'
            }`}
            aria-label="Toggle financial privacy masking"
          >
            {isPrivacyMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Quick Lock Dashboard Button */}
          <button
            id="header-lock-btn"
            onClick={lockDashboard}
            title="Lock Dashboard (Hides all personal & financial records)"
            className="p-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 dark:text-slate-300 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/25 cursor-pointer shrink-0"
            aria-label="Lock dashboard immediately"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <button
            id="header-notifications-btn"
            onClick={openNotificationDrawer}
            title="Notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-[#2E6844] hover:bg-[#F4F6F3] dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#387652]/25 cursor-pointer shrink-0"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C24137] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar Pill matching Design HTML */}
          <button
            id="header-avatar-btn"
            onClick={() => setActiveSection('settings')}
            title="Profile & Settings"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:ring-2 hover:ring-[#387652]/30 transition-all cursor-pointer shrink-0"
          >
            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Header Quick Add Button (visible on mobile / tablet) */}
          <button
            id="header-quick-add-btn"
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex md:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-[#387652] hover:bg-[#2E6143] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
