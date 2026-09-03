/**
 * Privacy-First Storage Layer.
 * Strictly adheres to ZERO CLIENT-SIDE STORAGE of sensitive personal, financial, or health data.
 * All sensitive records are persisted exclusively in the encrypted server-side database.
 * Browser storage (localStorage) is used ONLY for harmless UI preferences (theme, font size, sidebar state, privacy mask).
 */

import {
  Task,
  Reminder,
  Bill,
  EmiLoan,
  Expense,
  Income,
  Medicine,
  HealthAppointment,
  MedicalRecord,
  BloodPressureReading,
  BloodPressureReminderConfig,
  Renewal,
  CalendarEvent,
  Trip,
  Habit,
  CreditCard,
  BankAccount,
  AppSettings,
  InAppNotification,
} from '../types';
import { api, getAuthToken } from './api';

export const DEFAULT_SETTINGS: AppSettings = {
  name: '',
  userName: 'User',
  preferredLanguage: 'English',
  currency: '₹',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '12h',
  notificationsEnabled: true,
  defaultReminderMinutes: 15,
  fontSize: 'normal',
  theme: 'light',
  palette: 'emerald',
  voiceEnabled: true,
  elderlyMode: false,
  voiceRemindersEnabled: true,
  alarmSoundEnabled: true,
  voiceAnnouncementEnabled: true,
  defaultSnoozeMinutes: 5,
  voiceLanguage: 'en-US',
  alarmVolume: 0.8,
};

export interface DatabaseState {
  tasks: Task[];
  reminders: Reminder[];
  bills: Bill[];
  emis: EmiLoan[];
  expenses: Expense[];
  incomes: Income[];
  medicines: Medicine[];
  healthAppointments: HealthAppointment[];
  medicalRecords: MedicalRecord[];
  bloodPressureReadings: BloodPressureReading[];
  bpReminders: BloodPressureReminderConfig[];
  renewals: Renewal[];
  calendarEvents: CalendarEvent[];
  trips: Trip[];
  habits: Habit[];
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  settings: AppSettings;
  notifications: InAppNotification[];
}

export const INITIAL_EMPTY_STATE: DatabaseState = {
  tasks: [],
  reminders: [],
  bills: [],
  emis: [],
  expenses: [],
  incomes: [],
  medicines: [],
  healthAppointments: [],
  medicalRecords: [],
  bloodPressureReadings: [],
  bpReminders: [],
  renewals: [],
  calendarEvents: [],
  trips: [],
  habits: [],
  creditCards: [],
  bankAccounts: [],
  settings: DEFAULT_SETTINGS,
  notifications: [],
};

// Harmless UI preferences key
const UI_PREFS_KEY = 'pld_ui_preferences_v1';

export interface UIPreferences {
  theme: 'light' | 'dark' | 'high-contrast' | 'system';
  palette: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'slate';
  fontSize: 'compact' | 'normal' | 'large' | 'xlarge';
  sidebarCollapsed: boolean;
  privacyMasked: boolean; // Hide balances by default from shoulder-surfers
}

export const DEFAULT_UI_PREFS: UIPreferences = {
  theme: 'light',
  palette: 'emerald',
  fontSize: 'normal',
  sidebarCollapsed: false,
  privacyMasked: false,
};

export function loadUIPreferences(): UIPreferences {
  if (typeof window === 'undefined') return DEFAULT_UI_PREFS;
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return DEFAULT_UI_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_UI_PREFS, ...parsed };
  } catch {
    return DEFAULT_UI_PREFS;
  }
}

export function saveUIPreferences(prefs: Partial<UIPreferences>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadUIPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(updated));
  } catch {
    // Safe ignore
  }
}

/**
 * Purge legacy unencrypted browser storage (IndexedDB, old localStorage keys)
 * to ensure zero unencrypted health or financial remnants reside on the client disk.
 */
export async function cleanupLegacyUnencryptedStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Clear legacy localStorage cache keys
  const legacyKeys = [
    'lifehq_dashboard_data_v3',
    'personal_life_dashboard_state',
    'lifehq_dashboard_data_v2',
    'lifehq_dashboard_data',
    'personal_life_dashboard_db',
  ];

  for (const k of legacyKeys) {
    try {
      localStorage.removeItem(k);
    } catch {
      // Ignore
    }
  }

  // Delete legacy IndexedDB if it exists
  if (window.indexedDB && window.indexedDB.deleteDatabase) {
    try {
      window.indexedDB.deleteDatabase('personal_life_dashboard_db');
    } catch {
      // Ignore
    }
  }
}

// Auto-invoke legacy storage purge on load
if (typeof window !== 'undefined') {
  cleanupLegacyUnencryptedStorage();
}

/**
 * Load all user data from authenticated encrypted backend.
 * Returns empty state if unauthenticated or on error.
 */
export async function loadAllData(): Promise<DatabaseState> {
  const token = getAuthToken();
  if (!token) {
    return { ...INITIAL_EMPTY_STATE };
  }

  try {
    const data = await api.fetchDashboardData();
    const uiPrefs = loadUIPreferences();

    return {
      tasks: data.tasks || [],
      reminders: data.reminders || [],
      bills: data.bills || [],
      emis: data.emis || [],
      expenses: data.expenses || [],
      incomes: data.incomes || [],
      medicines: data.medicines || [],
      healthAppointments: data.appointments || [],
      medicalRecords: data.medicalRecords || [],
      bloodPressureReadings: data.bloodPressureReadings || [],
      bpReminders: data.bpReminders || [],
      renewals: data.renewals || [],
      calendarEvents: data.events || [],
      trips: data.trips || [],
      habits: data.habits || [],
      creditCards: data.creditCards || [],
      bankAccounts: data.bankAccounts || [],
      notifications: data.notifications || [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...(data.settings || {}),
        theme: uiPrefs.theme,
        palette: uiPrefs.palette,
        fontSize: uiPrefs.fontSize,
      },
    };
  } catch (err) {
    console.warn('Could not fetch from encrypted backend, starting empty:', err);
    return { ...INITIAL_EMPTY_STATE };
  }
}

/**
 * Sync all user data with authenticated encrypted backend.
 * Strictly avoids writing sensitive records to browser storage.
 */
export async function persistAllData(state: DatabaseState): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await api.syncAllData({
      tasks: state.tasks,
      reminders: state.reminders,
      bills: state.bills,
      emis: state.emis,
      expenses: state.expenses,
      incomes: state.incomes,
      medicines: state.medicines,
      appointments: state.healthAppointments,
      medicalRecords: state.medicalRecords,
      bloodPressureReadings: state.bloodPressureReadings,
      bpReminders: state.bpReminders,
      renewals: state.renewals,
      events: state.calendarEvents,
      trips: state.trips,
      habits: state.habits,
      creditCards: state.creditCards,
      bankAccounts: state.bankAccounts,
      notifications: state.notifications,
      settings: {
        name: state.settings.name,
        userName: state.settings.userName,
        currency: state.settings.currency,
        dateFormat: state.settings.dateFormat,
        timeFormat: state.settings.timeFormat,
        notificationsEnabled: state.settings.notificationsEnabled,
        defaultReminderMinutes: state.settings.defaultReminderMinutes,
        voiceEnabled: state.settings.voiceEnabled,
        elderlyMode: state.settings.elderlyMode,
      },
    });
  } catch (err) {
    console.error('Failed to sync with encrypted backend:', err);
  }
}

export async function clearAllStorage(): Promise<DatabaseState> {
  return { ...INITIAL_EMPTY_STATE };
}

export const clearDatabase = clearAllStorage;

export interface ParsedImportInfo {
  isValid: boolean;
  error?: string;
  exportedAt?: string;
  version?: string;
  counts: Record<string, number>;
  data: DatabaseState;
}

export async function exportAllData(): Promise<string> {
  const backup = await api.exportSecureBackup();
  return JSON.stringify(backup, null, 2);
}

export function inspectImportData(rawJson: string): ParsedImportInfo {
  try {
    const parsed = JSON.parse(rawJson);
    const rootData = parsed.data || parsed;

    const counts: Record<string, number> = {
      tasks: Array.isArray(rootData.tasks) ? rootData.tasks.length : 0,
      reminders: Array.isArray(rootData.reminders) ? rootData.reminders.length : 0,
      bills: Array.isArray(rootData.bills) ? rootData.bills.length : 0,
      emis: Array.isArray(rootData.emis) ? rootData.emis.length : 0,
      expenses: Array.isArray(rootData.expenses) ? rootData.expenses.length : 0,
      incomes: Array.isArray(rootData.incomes) ? rootData.incomes.length : 0,
      medicines: Array.isArray(rootData.medicines) ? rootData.medicines.length : 0,
      healthAppointments: Array.isArray(rootData.healthAppointments || rootData.appointments)
        ? (rootData.healthAppointments || rootData.appointments).length
        : 0,
      medicalRecords: Array.isArray(rootData.medicalRecords) ? rootData.medicalRecords.length : 0,
      bloodPressureReadings: Array.isArray(rootData.bloodPressureReadings) ? rootData.bloodPressureReadings.length : 0,
      bpReminders: Array.isArray(rootData.bpReminders) ? rootData.bpReminders.length : 0,
      renewals: Array.isArray(rootData.renewals) ? rootData.renewals.length : 0,
      calendarEvents: Array.isArray(rootData.calendarEvents || rootData.events)
        ? (rootData.calendarEvents || rootData.events).length
        : 0,
      trips: Array.isArray(rootData.trips) ? rootData.trips.length : 0,
      habits: Array.isArray(rootData.habits) ? rootData.habits.length : 0,
      creditCards: Array.isArray(rootData.creditCards) ? rootData.creditCards.length : 0,
      bankAccounts: Array.isArray(rootData.bankAccounts) ? rootData.bankAccounts.length : 0,
    };

    const hasAny = Object.values(counts).some((c) => c > 0);

    const fullData: DatabaseState = {
      ...INITIAL_EMPTY_STATE,
      tasks: rootData.tasks || [],
      reminders: rootData.reminders || [],
      bills: rootData.bills || [],
      emis: rootData.emis || [],
      expenses: rootData.expenses || [],
      incomes: rootData.incomes || [],
      medicines: rootData.medicines || [],
      healthAppointments: rootData.healthAppointments || rootData.appointments || [],
      medicalRecords: rootData.medicalRecords || [],
      bloodPressureReadings: rootData.bloodPressureReadings || [],
      bpReminders: rootData.bpReminders || [],
      renewals: rootData.renewals || [],
      calendarEvents: rootData.calendarEvents || rootData.events || [],
      trips: rootData.trips || [],
      habits: rootData.habits || [],
      creditCards: rootData.creditCards || [],
      bankAccounts: rootData.bankAccounts || [],
      settings: rootData.settings ? { ...DEFAULT_SETTINGS, ...rootData.settings } : DEFAULT_SETTINGS,
      notifications: rootData.notifications || [],
    };

    return {
      isValid: hasAny || Boolean(rootData.settings),
      exportedAt: parsed.exportedAt,
      version: parsed.version,
      counts,
      data: fullData,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON file';
    return {
      isValid: false,
      error: msg,
      counts: {},
      data: INITIAL_EMPTY_STATE,
    };
  }
}

export async function importData(
  rawJson: string,
  modeOrReplace: 'overwrite' | 'merge' | boolean = false
): Promise<DatabaseState> {
  const replaceExisting = typeof modeOrReplace === 'string' ? modeOrReplace === 'overwrite' : modeOrReplace;
  const parsed = JSON.parse(rawJson);
  const result = await api.importSecureBackup(parsed, replaceExisting);
  const uiPrefs = loadUIPreferences();

  return {
    tasks: result.data.tasks || [],
    reminders: result.data.reminders || [],
    bills: result.data.bills || [],
    emis: result.data.emis || [],
    expenses: result.data.expenses || [],
    incomes: result.data.incomes || [],
    medicines: result.data.medicines || [],
    healthAppointments: result.data.appointments || [],
    medicalRecords: result.data.medicalRecords || [],
    bloodPressureReadings: result.data.bloodPressureReadings || [],
    bpReminders: result.data.bpReminders || [],
    renewals: result.data.renewals || [],
    calendarEvents: result.data.events || [],
    trips: result.data.trips || [],
    habits: result.data.habits || [],
    creditCards: result.data.creditCards || [],
    bankAccounts: result.data.bankAccounts || [],
    notifications: result.data.notifications || [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(result.data.settings || {}),
      theme: uiPrefs.theme,
      palette: uiPrefs.palette,
      fontSize: uiPrefs.fontSize,
    },
  };
}
