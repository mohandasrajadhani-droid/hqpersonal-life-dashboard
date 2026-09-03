import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Check,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon,
  Contrast,
  Palette,
  Type,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  KeyRound,
  LogOut,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Volume2,
  VolumeX,
  BellRing,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ColorPalette, ThemeMode, FontSize } from '../../types';
import { THEME_MODES, PALETTES, FONT_SIZES, getPalette } from '../../utils/themeUtils';
import { inspectImportData, clearDatabase, ParsedImportInfo } from '../../services/db';
import { ImportConfirmModal } from '../common/ImportConfirmModal';
import { AppIcon } from '../common/AppIcon';
import { voiceAlarmService } from '../../services/voiceAlarmService';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJson,
    importDataJson,
    tasks,
    bills,
    expenses,
    incomes,
    medicines,
    healthAppointments,
    renewals,
    calendarEvents,
    trips,
    emis,
    currentUser,
    lockDashboard,
    logout,
    changePassword,
    setupPin,
    deleteAccount,
    purgeAllData,
  } = useApp();

  // Profile & Currency local state
  const [userName, setUserName] = useState(settings.userName || currentUser?.name || 'Alex');
  const [currency, setCurrency] = useState(settings.currency || '₹');
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled ?? true);
  const [elderlyMode, setElderlyMode] = useState(settings.elderlyMode ?? false);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState(settings.timeFormat || '12h');

  // Voice Alarm configuration
  const [alarmVolume, setAlarmVolume] = useState(settings.alarmVolume ?? 0.8);
  const [voiceLanguage, setVoiceLanguage] = useState(settings.voiceLanguage || 'en-US');
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useState(settings.alarmSoundEnabled ?? true);
  const [voiceAnnouncementEnabled, setVoiceAnnouncementEnabled] = useState(settings.voiceAnnouncementEnabled ?? true);
  const [defaultSnoozeMinutes, setDefaultSnoozeMinutes] = useState(settings.defaultSnoozeMinutes ?? 5);
  const [testPlaying, setTestPlaying] = useState<string | null>(null);

  // Security & Auto-Lock local state
  const [autoLockMinutes, setAutoLockMinutes] = useState(currentUser?.autoLockMinutes ?? 15);
  const [quickPin, setQuickPin] = useState('');
  const [quickPinPassword, setQuickPinPassword] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [pinError, setPinError] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Danger zone state
  const [dangerAction, setDangerAction] = useState<'purge' | 'delete' | null>(null);
  const [dangerPassword, setDangerPassword] = useState('');
  const [dangerError, setDangerError] = useState('');
  const [isProcessingDanger, setIsProcessingDanger] = useState(false);

  // Theme & Appearance local state
  const [activeTheme, setActiveTheme] = useState<ThemeMode>(
    settings.theme === 'dark' || settings.theme === 'high-contrast' ? settings.theme : 'light'
  );
  const [activePalette, setActivePalette] = useState<ColorPalette>(settings.palette || 'emerald');
  const [activeFontSize, setActiveFontSize] = useState<FontSize>(settings.fontSize || 'normal');

  // UI feedback states
  const [saveMessage, setSaveMessage] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Import Modal states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedImportInfo, setParsedImportInfo] = useState<ParsedImportInfo | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [rawImportString, setRawImportString] = useState('');
  const [importError, setImportError] = useState('');

  // Total existing entities count
  const totalExistingRecords =
    tasks.length +
    bills.length +
    expenses.length +
    incomes.length +
    medicines.length +
    healthAppointments.length +
    renewals.length +
    calendarEvents.length +
    trips.length +
    emis.length;

  const currentPaletteInfo = getPalette(activePalette);

  // Save general settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim(),
      currency: currency.trim() || '₹',
      dateFormat,
      timeFormat,
      voiceEnabled,
      elderlyMode,
      theme: activeTheme,
      palette: activePalette,
      fontSize: activeFontSize,
      alarmVolume,
      voiceLanguage,
      alarmSoundEnabled,
      voiceAnnouncementEnabled,
      defaultSnoozeMinutes,
    });
    setSaveMessage('All preferences and theme options saved successfully!');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  // Instant Theme Mode Switch
  const handleThemeModeChange = (mode: ThemeMode) => {
    setActiveTheme(mode);
    updateSettings({ theme: mode });
  };

  // Instant Palette Switch
  const handlePaletteChange = (palette: ColorPalette) => {
    setActivePalette(palette);
    updateSettings({ palette });
  };

  // Instant Font Size Switch
  const handleFontSizeChange = (size: FontSize) => {
    setActiveFontSize(size);
    updateSettings({ fontSize: size });
  };

  // Handle Export to JSON File
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const jsonString = await exportDataJson();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `personal-life-dashboard-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveMessage('Data backup successfully exported to JSON file!');
      setTimeout(() => setSaveMessage(''), 3500);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Input Selection for Import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    try {
      const text = await file.text();
      const inspection = inspectImportData(text);
      if (!inspection.isValid) {
        setImportError(inspection.error || 'The selected file is not a valid dashboard backup JSON.');
        e.target.value = '';
        return;
      }
      setRawImportString(text);
      setImportFileName(file.name);
      setParsedImportInfo(inspection);
      setImportModalOpen(true);
      e.target.value = '';
    } catch (err: any) {
      setImportError(`Failed to read file: ${err?.message || 'Unknown error'}`);
      e.target.value = '';
    }
  };

  // Confirm Import Execution from Modal
  const handleConfirmImport = async (mode: 'overwrite' | 'merge') => {
    if (!rawImportString) return;
    const success = await importDataJson(rawImportString, mode);
    if (success) {
      setSaveMessage(
        `Data imported successfully (${mode === 'overwrite' ? 'Overwritten' : 'Merged'})!`
      );
      setTimeout(() => setSaveMessage(''), 4000);
      setImportModalOpen(false);
      setRawImportString('');
      setParsedImportInfo(null);
    } else {
      setImportError('Failed to apply imported data.');
    }
  };

  const handleUpdateAutoLock = async (minutes: number) => {
    setAutoLockMinutes(minutes);
    try {
      await updateSettings({ defaultReminderMinutes: minutes });
      setSaveMessage(`Auto-lock timeout updated to ${minutes === 0 ? 'Disabled' : `${minutes} minutes`}`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      // Safe fallback
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinMessage('');
    if (!/^\d{4,6}$/.test(quickPin)) {
      setPinError('Quick PIN must be 4 to 6 numeric digits');
      return;
    }
    if (!quickPinPassword) {
      setPinError('Please enter your account password to authorize setting a PIN');
      return;
    }
    try {
      await setupPin(quickPin, quickPinPassword);
      setPinMessage('Quick PIN configured successfully! You can use it to unlock the dashboard.');
      setQuickPin('');
      setQuickPinPassword('');
      setTimeout(() => setPinMessage(''), 4000);
    } catch (err: unknown) {
      setPinError(err instanceof Error ? err.message : 'Failed to set Quick PIN');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (!oldPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 4000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const handleExecuteDangerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setDangerError('');
    if (!dangerPassword) {
      setDangerError('Please enter your password to authorize this action');
      return;
    }
    setIsProcessingDanger(true);
    try {
      if (dangerAction === 'purge') {
        await purgeAllData(dangerPassword);
        setDangerAction(null);
        setDangerPassword('');
        setSaveMessage('All dashboard records have been permanently purged.');
        setTimeout(() => setSaveMessage(''), 4000);
      } else if (dangerAction === 'delete') {
        await deleteAccount(dangerPassword);
      }
    } catch (err: unknown) {
      setDangerError(err instanceof Error ? err.message : 'Action authorization failed');
    } finally {
      setIsProcessingDanger(false);
    }
  };

  // Clear Database
  const handleClearAll = async () => {
    await clearDatabase();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 text-left">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Settings &amp; Dashboard Customization</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personalize visual themes, color palettes, font scaling, currency, and secure JSON data backups
        </p>
      </div>

      {/* Save / Feedback Banner */}
      {saveMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 border border-emerald-200/50 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {importError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 border border-rose-200/50 shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{importError}</span>
        </div>
      )}

      {/* SECTION 1: Customizable Theme Options */}
      <section className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Appearance &amp; Theme Customization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize modes (light, dark, high-contrast), color schemes, and font sizes
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Instant Live Preview
          </span>
        </div>

        {/* 1A. Theme Modes: Light, Dark, High-Contrast */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Theme Mode (Light / Dark / High-Contrast)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {THEME_MODES.map((mode) => {
              const isActive = activeTheme === mode.id;
              const Icon = mode.id === 'light' ? Sun : mode.id === 'dark' ? Moon : Contrast;

              return (
                <button
                  type="button"
                  key={mode.id}
                  id={`theme-mode-btn-${mode.id}`}
                  onClick={() => handleThemeModeChange(mode.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {mode.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {mode.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1B. Color Palettes */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Pre-Defined Color Palettes
            </label>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Selected: <strong className="capitalize">{currentPaletteInfo.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {(Object.keys(PALETTES) as ColorPalette[]).map((palKey) => {
              const pal = PALETTES[palKey];
              const isPalActive = activePalette === palKey;

              return (
                <button
                  type="button"
                  key={palKey}
                  id={`palette-btn-${palKey}`}
                  onClick={() => handlePaletteChange(palKey)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    isPalActive
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-md ring-2 ring-slate-400/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform hover:scale-105"
                    style={{ backgroundColor: pal.primaryHex }}
                  >
                    {isPalActive && <Check className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate w-24">
                      {pal.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {pal.primaryHex}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1C. Font Size Adjustment */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Type className="w-4 h-4" />
              <span>Font Size Adjustment</span>
            </label>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Current: <strong>{FONT_SIZES.find((f) => f.id === activeFontSize)?.label}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FONT_SIZES.map((f) => {
              const isFontActive = activeFontSize === f.id;
              return (
                <button
                  type="button"
                  key={f.id}
                  id={`font-size-btn-${f.id}`}
                  onClick={() => handleFontSizeChange(f.id)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    isFontActive
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">
                    {f.id === 'compact' ? 'A' : f.id === 'normal' ? 'A+' : f.id === 'large' ? 'A++' : 'A+++'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.label}</div>
                  <div className="text-[10px] text-slate-400">{f.sizePx}</div>
                </button>
              );
            })}
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Live Typography Sample:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Personal Life Dashboard helps organize your day with clarity.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Profile & Currency Preferences Form */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5"
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
          User Profile &amp; Currency Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Your Name / Nickname
            </label>
            <input
              type="text"
              id="settings-username-input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Currency Selector with Indian Rupee (₹) Prominently Supported */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Currency Symbol</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Active: {currency}
              </span>
            </label>
            <select
              id="settings-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
            >
              <option value="₹">₹ (INR - Indian Rupee)</option>
              <option value="$">$ (USD - US Dollar)</option>
              <option value="€">€ (EUR - Euro)</option>
              <option value="£">£ (GBP - British Pound)</option>
              <option value="¥">¥ (JPY - Japanese Yen / CNY)</option>
              <option value="AED">AED (Emirati Dirham)</option>
              <option value="C$">C$ (CAD - Canadian Dollar)</option>
              <option value="A$">A$ (AUD - Australian Dollar)</option>
              <option value="CHF">CHF (Swiss Franc)</option>
              <option value="SGD">S$ (SGD - Singapore Dollar)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Used across all expenses, income, monthly bills, and EMI loan summaries.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-02)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (02/09/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (09/02/2026)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Time Format
            </label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="12h">12-hour (e.g. 02:30 PM)</option>
              <option value="24h">24-hour (e.g. 14:30)</option>
            </select>
          </div>
        </div>

        {/* Accessibility & Voice Toggles */}
        <div className="space-y-2.5 pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Hands-Free Voice Recognition
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Enables natural speech-to-text for adding tasks, logging expenses, and checking schedule
              </div>
            </div>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-5 h-5 rounded accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Large Touch Target Accessibility
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Optimizes buttons and cards with spacious padding for senior or touch-screen users
              </div>
            </div>
            <input
              type="checkbox"
              checked={elderlyMode}
              onChange={(e) => setElderlyMode(e.target.checked)}
              className="w-5 h-5 rounded accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="settings-save-preferences-btn"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* SECTION 2.5: Voice Alarm & Audio Notification Settings */}
      <section
        id="settings-voice-alarm-section"
        className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Voice Alarm &amp; Audio Notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure synthesized gentle chimes and spoken voice announcements for scheduled reminders and blood pressure checks
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Alarm Chime Sound</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Plays gentle melodic synthesizer chime when due
                </div>
              </div>
              <input
                type="checkbox"
                checked={alarmSoundEnabled}
                onChange={(e) => {
                  setAlarmSoundEnabled(e.target.checked);
                  updateSettings({ alarmSoundEnabled: e.target.checked });
                }}
                className="w-5 h-5 rounded accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Spoken Voice Speech</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Speaks reminder title &amp; instructions aloud (Web Speech API)
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceAnnouncementEnabled}
                onChange={(e) => {
                  setVoiceAnnouncementEnabled(e.target.checked);
                  updateSettings({ voiceAnnouncementEnabled: e.target.checked });
                }}
                className="w-5 h-5 rounded accent-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Volume & Language */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Alarm &amp; Voice Volume
                </label>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {Math.round(alarmVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={alarmVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setAlarmVolume(vol);
                  updateSettings({ alarmVolume: vol });
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Voice Accent / Language
              </label>
              <select
                value={voiceLanguage}
                onChange={(e) => {
                  setVoiceLanguage(e.target.value);
                  updateSettings({ voiceLanguage: e.target.value });
                }}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
              >
                <option value="en-US">English (US)</option>
                <option value="en-IN">English (India)</option>
                <option value="en-GB">English (UK)</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="es-ES">Spanish (Español)</option>
                <option value="fr-FR">French (Français)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Snooze Duration
              </label>
              <select
                value={defaultSnoozeMinutes}
                onChange={(e) => {
                  const mins = parseInt(e.target.value, 10);
                  setDefaultSnoozeMinutes(mins);
                  updateSettings({ defaultSnoozeMinutes: mins });
                }}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
              >
                <option value={3}>3 minutes</option>
                <option value={5}>5 minutes (Recommended)</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Test Triggers */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Audio Test:
          </span>

          <button
            type="button"
            id="test-alarm-sound-btn"
            onClick={() => {
              setTestPlaying('sound');
              voiceAlarmService.testAlarmSound(alarmVolume);
              setTimeout(() => setTestPlaying(null), 2500);
            }}
            disabled={testPlaying !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${testPlaying === 'sound' ? 'text-emerald-600 animate-spin' : 'text-slate-500'}`} />
            <span>Test Chime Sound</span>
          </button>

          <button
            type="button"
            id="test-voice-speech-btn"
            onClick={() => {
              setTestPlaying('voice');
              voiceAlarmService.testVoiceSpeech(
                'This is a voice alert from LifeHQ dashboard. Blood pressure reading is scheduled.',
                alarmVolume,
                voiceLanguage
              );
              setTimeout(() => setTestPlaying(null), 3500);
            }}
            disabled={testPlaying !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${testPlaying === 'voice' ? 'text-emerald-600 animate-spin' : 'text-slate-500'}`} />
            <span>Test Voice Announcement</span>
          </button>

          <div className="ml-auto text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Uses Web Audio API &amp; SpeechSynthesis. No external cloud voice servers.</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Data Export & Import (JSON) */}
      <section className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Data Backup, Export &amp; Restoration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export all your life records to JSON or restore from a previous backup with safe verification
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {totalExistingRecords} Total Records Stored
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-950 dark:text-indigo-300 leading-relaxed">
            Your export file contains your complete data archive: daily tasks, reminders, bills, EMI loans, expenses,
            income history, prescriptions, appointments, trips, renewals, and display preferences.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Export Button */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Export Data (JSON)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Download a clean, structured JSON file that you can store on your computer or cloud drive.
              </p>
            </div>

            <button
              type="button"
              id="settings-export-json-btn"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating JSON...' : 'Export All Data (JSON)'}</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>Import &amp; Restore (JSON)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload a backup file. A confirmation screen will inspect records before any changes occur.
              </p>
            </div>

            <label
              id="settings-import-json-label"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Select JSON File to Restore</span>
              <input
                type="file"
                id="settings-import-file-input"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 4: Application Identity & About */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <AppIcon className="w-16 h-16 shrink-0" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Personal Life Dashboard
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            An all-in-one personal management hub unifying daily tasks, bills, EMIs, expenses, health, calendar events, and trips.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            PWA-ready with offline IndexedDB local storage and custom high-contrast accessibility.
          </p>
        </div>
      </div>

      {/* SECTION 4: Security Architecture & Privacy Vault */}
      <section className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#387652] dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Security Architecture &amp; Auto-Lock
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AES-256-GCM encrypted database at rest, zero client-side unencrypted persistence, and auto-lock protection
              </p>
            </div>
          </div>

          <button
            type="button"
            id="settings-lock-now-btn"
            onClick={lockDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Dashboard Now</span>
          </button>
        </div>

        {/* Security Assurances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F6F8F5] dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">AES-256-GCM Server Encryption</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Every record is encrypted with individual authenticated initialization vectors before touching disk.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F6F8F5] dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Zero Full Credit Card Storage</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                CVV/CVC, PINs, OTPs, and banking passwords are never requested or stored. Only last 4 digits for due date reminders.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F6F8F5] dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Zero Sensitive Client Disk Storage</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Financial, health, and task data is purged from unencrypted browser storage and held in memory only.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F6F8F5] dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#387652] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">User Cryptographic Isolation</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Data belongs exclusively to your authenticated user account. Accounts start with 0 demo records.
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Lock Configuration */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Auto-Lock Idle Inactivity Timeout
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { val: 5, label: '5 Minutes' },
              { val: 15, label: '15 Minutes' },
              { val: 30, label: '30 Minutes' },
              { val: 60, label: '60 Minutes' },
              { val: 0, label: 'Disabled' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                id={`autolock-opt-${opt.val}`}
                onClick={() => handleUpdateAutoLock(opt.val)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  autoLockMinutes === opt.val
                    ? 'border-[#387652] bg-emerald-50/60 dark:bg-emerald-950/40 text-[#387652] dark:text-emerald-300 ring-2 ring-[#387652]/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            When active, the dashboard view will lock automatically when no keyboard, mouse, or touch events occur for the specified time.
          </p>
        </div>

        {/* Quick PIN Setup */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Quick Unlock PIN (4-6 Digits)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unlock the locked dashboard quickly without typing your full account password every time.
              </p>
            </div>
            {currentUser?.hasQuickPin && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                PIN Configured
              </span>
            )}
          </div>

          {pinMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/60">
              {pinMessage}
            </div>
          )}

          {pinError && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200/60">
              {pinError}
            </div>
          )}

          <form onSubmit={handleSavePin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              id="settings-quick-pin-input"
              type="password"
              maxLength={6}
              value={quickPin}
              onChange={(e) => setQuickPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New 4-6 Digit PIN"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
            />
            <input
              id="settings-pin-auth-password"
              type="password"
              value={quickPinPassword}
              onChange={(e) => setQuickPinPassword(e.target.value)}
              placeholder="Confirm Account Password"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
            />
            <button
              type="submit"
              id="settings-save-pin-btn"
              className="py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#387652] hover:bg-[#2E6143] transition-colors cursor-pointer shadow-xs"
            >
              {currentUser?.hasQuickPin ? 'Update Quick PIN' : 'Enable Quick PIN'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Change Account Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update the master credential that protects your personal encrypted vault.
            </p>
          </div>

          {passwordMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/60">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200/60">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                id="settings-current-pwd-input"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current Password"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
              />
              <input
                id="settings-new-pwd-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min 8 chars)"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
              />
              <input
                id="settings-confirm-pwd-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#387652]"
              />
            </div>
            <button
              type="submit"
              id="settings-change-pwd-btn"
              className="py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors cursor-pointer shadow-xs"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* User Account & Sign Out */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Signed in as <span className="font-mono">{currentUser?.email}</span>
            </p>
            <p className="text-[11px] text-slate-500">Session authenticated via secure bearer token.</p>
          </div>
          <button
            type="button"
            id="settings-signout-btn"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* SECTION 5: Danger Zone: Purge or Delete Account */}
      <div className="p-6 rounded-[2rem] bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">
            Protected Danger Zone
          </h2>
        </div>

        <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
          Irreversible actions require account password authorization. All data purges and account deletions permanently erase encrypted server vault records.
        </p>

        {dangerError && (
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-300">
            {dangerError}
          </div>
        )}

        {dangerAction ? (
          <form onSubmit={handleExecuteDangerAction} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 space-y-3">
            <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
              {dangerAction === 'purge'
                ? 'Confirm: Purge all tasks, expenses, bills, health, and personal data'
                : 'Confirm: Permanently delete account and all encrypted records'}
            </p>
            <input
              id="settings-danger-password-input"
              type="password"
              required
              autoFocus
              value={dangerPassword}
              onChange={(e) => setDangerPassword(e.target.value)}
              placeholder="Enter your account password to authorize"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                disabled={isProcessingDanger}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {isProcessingDanger
                  ? 'Processing...'
                  : dangerAction === 'purge'
                  ? 'Yes, Purge All Records Now'
                  : 'Yes, Delete My Account Permanently'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDangerAction(null);
                  setDangerPassword('');
                  setDangerError('');
                }}
                className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="settings-purge-records-btn"
              onClick={() => {
                setDangerAction('purge');
                setDangerPassword('');
                setDangerError('');
              }}
              className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-800 dark:text-rose-200 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
            >
              Purge All Records
            </button>
            <button
              type="button"
              id="settings-delete-account-btn"
              onClick={() => {
                setDangerAction('delete');
                setDangerPassword('');
                setDangerError('');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Delete Account Permanently
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Step Modal for Data Import */}
      <ImportConfirmModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        parsedInfo={parsedImportInfo}
        fileName={importFileName}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
};
