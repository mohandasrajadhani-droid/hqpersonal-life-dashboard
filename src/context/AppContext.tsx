import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Task,
  Reminder,
  Bill,
  EmiLoan,
  Expense,
  Income,
  Medicine,
  HealthAppointment,
  Renewal,
  CalendarEvent,
  Trip,
  TripTask,
  TripExpense,
  Habit,
  CreditCard,
  BankAccount,
  PaymentMethod,
  AppSettings,
  InAppNotification,
  NavigationSection,
  MedicalRecord,
  BloodPressureReading,
  BloodPressureReminderConfig,
  VoiceAlarmMode,
} from '../types';
import {
  loadAllData,
  persistAllData,
  clearAllStorage,
  exportAllData,
  importData,
  DEFAULT_SETTINGS,
  DatabaseState,
  loadUIPreferences,
  saveUIPreferences,
} from '../services/db';
import { api, AuthUser, getAuthToken } from '../services/api';
import { getTodayString, getCurrentTimeString, getNextOccurrence } from '../utils/dateUtils';
import { voiceAlarmService } from '../services/voiceAlarmService';

interface AppContextType {
  tasks: Task[];
  reminders: Reminder[];
  bills: Bill[];
  emis: EmiLoan[];
  expenses: Expense[];
  incomes: Income[];
  medicines: Medicine[];
  healthAppointments: HealthAppointment[];
  renewals: Renewal[];
  calendarEvents: CalendarEvent[];
  trips: Trip[];
  habits: Habit[];
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  emiLoans: EmiLoan[];
  medicalRecords: MedicalRecord[];
  bloodPressureReadings: BloodPressureReading[];
  bpReminders: BloodPressureReminderConfig[];
  settings: AppSettings;
  notifications: InAppNotification[];
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;
  setVoiceInputOpen?: (open: boolean) => void;
  activeModal: { type: string; data?: any } | null;
  modalState: { isOpen: boolean; type: string; data?: any };
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  isVoiceModalOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  isNotificationDrawerOpen: boolean;
  openNotificationDrawer: () => void;
  closeNotificationDrawer: () => void;

  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleTaskCompleted?: (id: string) => void;
  postponeTask: (id: string, days?: number) => void;
  duplicateTask: (id: string) => void;

  // Reminder methods
  addReminder: (rem: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminderComplete: (id: string) => void;
  toggleReminderCompleted?: (id: string) => void;

  // Bill methods
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillPaid: (id: string) => void;
  toggleBillPaid?: (id: string) => void;

  // EMI methods
  addEmi: (emi: Omit<EmiLoan, 'id' | 'createdAt' | 'updatedAt' | 'payments'>) => void;
  updateEmi: (id: string, updates: Partial<EmiLoan>) => void;
  deleteEmi: (id: string) => void;
  payEmiInstallment: (id: string, amount: number, notes?: string) => void;

  // Credit Card methods
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  payCreditCardBill: (cardId: string, amount: number, paymentMethod?: PaymentMethod, bankAccountId?: string, notes?: string) => void;

  // Bank Account methods
  addBankAccount: (acc: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;

  // Financial dues to reminders
  syncFinancialDueToReminders: (type: 'emi' | 'credit_card' | 'bill', id: string) => void;

  // Expense methods
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Income methods
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // Medicine methods
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  logMedicineDose: (id: string, time: string, status: 'taken' | 'skipped') => void;

  // Health Appointment methods
  addHealthAppointment: (app: Omit<HealthAppointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHealthAppointment: (id: string, updates: Partial<HealthAppointment>) => void;
  deleteHealthAppointment: (id: string) => void;
  toggleAppointmentComplete: (id: string) => void;

  // Medical Records methods
  addMedicalRecord: (record: MedicalRecord, addToMedicineReminders?: boolean) => void;
  updateMedicalRecord: (id: string, updates: Partial<MedicalRecord>) => void;
  deleteMedicalRecord: (id: string) => void;

  // Blood Pressure methods
  addBloodPressureReading: (reading: BloodPressureReading) => void;
  updateBloodPressureReading: (id: string, updates: Partial<BloodPressureReading>) => void;
  deleteBloodPressureReading: (id: string) => void;
  saveBloodPressureReminder: (config: BloodPressureReminderConfig) => void;

  // Voice Alarm Controls
  activeAlarmReminder: Reminder | null;
  stopVoiceAlarm: () => void;
  snoozeVoiceAlarm: (minutes?: number) => void;
  completeVoiceAlarm: () => void;

  // Renewal methods
  addRenewal: (ren: Omit<Renewal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRenewal: (id: string, updates: Partial<Renewal>) => void;
  deleteRenewal: (id: string) => void;
  markRenewalDone: (id: string) => void;

  // Calendar Event methods
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Trip methods
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'expenses'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addTripTask: (tripId: string, task: Omit<TripTask, 'id' | 'tripId' | 'createdAt'>) => void;
  toggleTripTask: (tripId: string, taskId: string) => void;
  deleteTripTask: (tripId: string, taskId: string) => void;
  addTripExpense: (tripId: string, exp: Omit<TripExpense, 'id' | 'tripId' | 'createdAt'>) => void;
  deleteTripExpense: (tripId: string, expenseId: string) => void;

  // Habit methods
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date?: string) => void;

  // Settings & Notifications
  updateSettings: (settings: Partial<AppSettings>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  requestNotificationPermission: () => Promise<boolean>;

  // Data management
  exportDataJson: () => Promise<string>;
  importDataJson: (jsonStr: string, mode?: 'overwrite' | 'merge') => Promise<boolean>;
  resetAllData: () => Promise<void>;

  // Authentication & Security Architecture
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLocked: boolean;
  isPrivacyMasked: boolean;
  togglePrivacyMask: () => void;
  formatMaskableCurrency: (amount: number) => string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, autoLockMinutes?: number) => Promise<void>;
  logout: () => Promise<void>;
  lockDashboard: () => void;
  unlockDashboard: (secret: string) => Promise<boolean>;
  changePassword: (oldPwd: string, newPwd: string) => Promise<void>;
  setupPin: (pin: string, password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  purgeAllData: (password: string) => Promise<void>;
  authError: string | null;
  isAuthenticating: boolean;

  // Calculated overview stats
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    totalBills: number;
    totalEmi: number;
    availableBalance: number;
    savingsRate: number;
    totalUnpaidBills: number;
    totalMonthlyEmi: number;
    netSavings: number;
    totalCreditCardDues: number;
    totalCreditLimit: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [emis, setEmis] = useState<EmiLoan[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [healthAppointments, setHealthAppointments] = useState<HealthAppointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [bloodPressureReadings, setBloodPressureReadings] = useState<BloodPressureReading[]>([]);
  const [bpReminders, setBpReminders] = useState<BloodPressureReminderConfig[]>([]);
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<Reminder | null>(null);
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const [activeSection, setActiveSection] = useState<NavigationSection>('today');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{ type: string; data?: any } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Authentication & Security State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(() => loadUIPreferences().privacyMasked);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Check auth and load encrypted user records on initial mount
  useEffect(() => {
    let isMounted = true;
    const checkAuthAndLoad = async () => {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsLoadingAuth(false);
          setIsInitialized(true);
        }
        return;
      }

      try {
        const meRes = await api.getMe();
        if (isMounted) {
          setCurrentUser(meRes.user);
          setIsAuthenticated(true);
          const state = await loadAllData();
          setTasks(state.tasks);
          setReminders(state.reminders);
          setBills(state.bills);
          setEmis(state.emis);
          setExpenses(state.expenses);
          setIncomes(state.incomes);
          setMedicines(state.medicines);
          setHealthAppointments(state.healthAppointments);
          setMedicalRecords(state.medicalRecords || []);
          setBloodPressureReadings(state.bloodPressureReadings || []);
          setBpReminders(state.bpReminders || []);
          setRenewals(state.renewals);
          setCalendarEvents(state.calendarEvents);
          setTrips(state.trips);
          setHabits(state.habits || []);
          setCreditCards(state.creditCards || []);
          setBankAccounts(state.bankAccounts || []);
          setSettings(state.settings);
          setNotifications(state.notifications);
        }
      } catch (err) {
        console.warn('Authentication token expired or invalid:', err);
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
          setIsInitialized(true);
        }
      }
    };

    checkAuthAndLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  // Inactivity tracking for Auto-Lock
  useEffect(() => {
    const handleActivity = () => {
      setLastActivityTime(Date.now());
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Idle check timer for Auto-Lock
  useEffect(() => {
    if (!isAuthenticated || isLocked) return;
    const timeoutMinutes = currentUser?.autoLockMinutes ?? 15;
    if (timeoutMinutes <= 0) return; // 0 = disabled

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityTime;
      if (elapsedMs >= timeoutMinutes * 60 * 1000) {
        setIsLocked(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isLocked, currentUser?.autoLockMinutes, lastActivityTime]);

  // Save changes to encrypted backend storage
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const fullState: DatabaseState = {
      tasks,
      reminders,
      bills,
      emis,
      expenses,
      incomes,
      medicines,
      healthAppointments,
      medicalRecords,
      bloodPressureReadings,
      bpReminders,
      renewals,
      calendarEvents,
      trips,
      habits,
      creditCards,
      bankAccounts,
      settings,
      notifications,
    };

    persistAllData(fullState);
  }, [
    isInitialized,
    isAuthenticated,
    tasks,
    reminders,
    bills,
    emis,
    expenses,
    incomes,
    medicines,
    healthAppointments,
    medicalRecords,
    bloodPressureReadings,
    bpReminders,
    renewals,
    calendarEvents,
    trips,
    habits,
    creditCards,
    bankAccounts,
    settings,
    notifications,
  ]);

  // Apply theme mode, high-contrast, palette, and font size classes to HTML root
  useEffect(() => {
    const root = document.documentElement;

    // Theme Mode
    root.classList.remove('dark', 'theme-high-contrast');
    root.removeAttribute('data-theme');
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'high-contrast') {
      root.classList.add('dark', 'theme-high-contrast');
      root.setAttribute('data-theme', 'high-contrast');
    } else {
      root.setAttribute('data-theme', 'light');
    }

    // Palette
    const palette = settings.palette || 'emerald';
    root.setAttribute('data-palette', palette);
    root.classList.remove(
      'palette-emerald',
      'palette-blue',
      'palette-violet',
      'palette-amber',
      'palette-rose',
      'palette-slate'
    );
    root.classList.add(`palette-${palette}`);

    // Font size
    const fontSize = settings.fontSize || 'normal';
    root.setAttribute('data-font-size', fontSize);
    root.classList.remove('text-compact', 'text-normal', 'text-large', 'text-xlarge');
    root.classList.add(`text-${fontSize}`);
  }, [settings.theme, settings.palette, settings.fontSize]);

  const openModal = useCallback((type: string, data?: any) => {
    setActiveModal({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const modalState = useMemo(() => ({
    isOpen: activeModal !== null,
    type: activeModal?.type || '',
    data: activeModal?.data,
  }), [activeModal]);

  const openQuickAdd = useCallback(() => setQuickAddOpen(true), []);
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), []);
  const openVoiceModal = useCallback(() => setVoiceModalOpen(true), []);
  const closeVoiceModal = useCallback(() => setVoiceModalOpen(false), []);
  const openNotificationDrawer = useCallback(() => setIsNotificationDrawerOpen(true), []);
  const closeNotificationDrawer = useCallback(() => setIsNotificationDrawerOpen(false), []);

  // Notification helper
  const triggerNotification = useCallback((title: string, body: string, entityType: InAppNotification['entityType'], entityId?: string) => {
    if (settings.notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/app-icon.svg' });
      } catch (e) {
        console.warn('Browser notification error', e);
      }
    }

    const newNotification: InAppNotification = {
      id: generateId(),
      title,
      message: body,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]);
  }, [settings.notificationsEnabled]);

  // Task actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = !t.completed;
          if (isCompleting && t.repeat && t.repeat !== 'none') {
            // If recurring, generate next occurrence
            const nextDate = getNextOccurrence(t.date, t.repeat);
            const nextTask: Task = {
              ...t,
              id: generateId(),
              date: nextDate,
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setTimeout(() => {
              setTasks((current) => [nextTask, ...current]);
            }, 0);
          }
          return { ...t, completed: isCompleting, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  }, []);

  const postponeTask = useCallback((id: string, days = 1) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const [y, m, d] = t.date.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          dateObj.setDate(dateObj.getDate() + days);
          const newDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          return { ...t, date: newDate, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  }, []);

  const duplicateTask = useCallback((id: string) => {
    setTasks((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (!existing) return prev;
      const now = new Date().toISOString();
      const clone: Task = {
        ...existing,
        id: generateId(),
        title: `${existing.title} (Copy)`,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      return [clone, ...prev];
    });
  }, []);

  // Reminder actions
  const addReminder = useCallback((remData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRem: Reminder = {
      ...remData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setReminders((prev) => [newRem, ...prev]);
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleReminderComplete = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const isDone = !r.completed;
          if (isDone && r.repeat && r.repeat !== 'none') {
            const nextDate = getNextOccurrence(r.date, r.repeat);
            const nextRem: Reminder = {
              ...r,
              id: generateId(),
              date: nextDate,
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setTimeout(() => setReminders((curr) => [nextRem, ...curr]), 0);
          }
          return { ...r, completed: isDone, updatedAt: new Date().toISOString() };
        }
        return r;
      })
    );
  }, []);

  // Bill actions
  const addBill = useCallback((billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBill: Bill = {
      ...billData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setBills((prev) => [newBill, ...prev]);
  }, []);

  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
  }, []);

  const deleteBill = useCallback((id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const markBillPaid = useCallback((id: string) => {
    const today = getTodayString();
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const isPaid = b.paymentStatus === 'paid';
          if (!isPaid && b.frequency !== 'one_time') {
            // generate next bill occurrence
            const nextDate = getNextOccurrence(b.dueDate, b.frequency);
            const nextBill: Bill = {
              ...b,
              id: generateId(),
              dueDate: nextDate,
              paymentStatus: 'unpaid',
              paymentDate: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setTimeout(() => setBills((curr) => [nextBill, ...curr]), 0);
          }
          return {
            ...b,
            paymentStatus: isPaid ? 'unpaid' : 'paid',
            paymentDate: isPaid ? undefined : today,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );
  }, []);

  // EMI actions
  const addEmi = useCallback(
    (emiData: Omit<EmiLoan, 'id' | 'createdAt' | 'updatedAt' | 'payments'>) => {
      const now = new Date().toISOString();
      const newEmiId = generateId();
      const newEmi: EmiLoan = {
        ...emiData,
        id: newEmiId,
        payments: [],
        createdAt: now,
        updatedAt: now,
      };
      setEmis((prev) => [newEmi, ...prev]);

      // If reminder enabled, add an active reminder for this month or next month
      if (emiData.reminder !== false) {
        const currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        const day = currentDate.getDate();
        if (day > emiData.dueDayOfMonth) {
          month += 1;
          if (month > 11) {
            month = 0;
            year += 1;
          }
        }
        const dueDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(emiData.dueDayOfMonth).padStart(2, '0')}`;

        const newReminder: Reminder = {
          id: generateId(),
          title: `EMI Due: ${newEmi.name}`,
          date: dueDateStr,
          time: '09:00',
          repeat: 'monthly',
          category: 'financial',
          notes: `Lender: ${newEmi.lender} • Monthly EMI: ${settings.currency}${newEmi.emiAmount}. Remaining: ${newEmi.remainingInstallments} installments.`,
          notificationMethod: 'in_app',
          completed: false,
          sourceId: newEmiId,
          sourceType: 'emi',
          createdAt: now,
          updatedAt: now,
        };
        setReminders((prev) => [newReminder, ...prev]);
      }
    },
    [settings.currency]
  );

  const updateEmi = useCallback((id: string, updates: Partial<EmiLoan>) => {
    setEmis((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  }, []);

  const deleteEmi = useCallback((id: string) => {
    setEmis((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const payEmiInstallment = useCallback((id: string, amount: number, notes?: string) => {
    const today = getTodayString();
    setEmis((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const installmentNumber = (e.payments?.length || 0) + 1;
          const newPayment = {
            id: generateId(),
            installmentNumber,
            amount,
            paymentDate: today,
            notes,
          };
          const newRemaining = Math.max(0, e.remainingInstallments - 1);
          return {
            ...e,
            remainingInstallments: newRemaining,
            paymentStatus: 'paid_this_month',
            payments: [newPayment, ...(e.payments || [])],
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, []);

  // Credit Card actions
  const addCreditCard = useCallback(
    (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newCardId = generateId();
      const newCard: CreditCard = {
        ...cardData,
        id: newCardId,
        createdAt: now,
        updatedAt: now,
      };
      setCreditCards((prev) => [newCard, ...prev]);

      if (cardData.reminder !== false) {
        const currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();
        const day = currentDate.getDate();
        if (day > cardData.dueDate) {
          month += 1;
          if (month > 11) {
            month = 0;
            year += 1;
          }
        }
        const dueDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(cardData.dueDate).padStart(2, '0')}`;

        const newReminder: Reminder = {
          id: generateId(),
          title: `Credit Card Bill Due: ${newCard.cardName}`,
          date: dueDateStr,
          time: '09:00',
          repeat: 'monthly',
          category: 'financial',
          notes: `Bank: ${newCard.bankName} • Last 4 digits: ${newCard.cardNumberLast4} • Due amount: ${settings.currency}${newCard.currentDue}`,
          notificationMethod: 'in_app',
          completed: false,
          sourceId: newCardId,
          sourceType: 'credit_card',
          createdAt: now,
          updatedAt: now,
        };
        setReminders((prev) => [newReminder, ...prev]);
      }
    },
    [settings.currency]
  );

  const updateCreditCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const deleteCreditCard = useCallback((id: string) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const payCreditCardBill = useCallback(
    (cardId: string, amount: number, paymentMethod: PaymentMethod = 'bank', bankAccountId?: string, notes?: string) => {
      const now = new Date().toISOString();
      const today = getTodayString();
      let paidCardName = 'Credit Card';

      setCreditCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id === cardId) {
            paidCardName = card.cardName;
            const newDue = Math.max(0, Number(((card.currentDue || 0) - amount).toFixed(2)));
            return {
              ...card,
              currentDue: newDue,
              updatedAt: now,
            };
          }
          return card;
        })
      );

      // Record an expense for the bill payment
      const billPaymentExpense: Expense = {
        id: generateId(),
        amount,
        date: today,
        time: getCurrentTimeString(),
        category: 'bills',
        paymentMethod: paymentMethod === 'credit_card' ? 'bank' : paymentMethod,
        bankAccountId,
        description: `Credit Card Bill Payment - ${paidCardName}`,
        notes: notes || `Settled ${settings.currency}${amount} on ${paidCardName}`,
        createdAt: now,
        updatedAt: now,
      };
      setExpenses((prev) => [billPaymentExpense, ...prev]);

      // If there's an active reminder for this card, mark it complete if fully or mostly paid
      setReminders((prev) =>
        prev.map((r) => {
          if (r.sourceType === 'credit_card' && r.sourceId === cardId && !r.completed) {
            return { ...r, completed: true, updatedAt: now };
          }
          return r;
        })
      );
    },
    [settings.currency]
  );

  // Bank Account actions
  const addBankAccount = useCallback((accData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAcc: BankAccount = {
      ...accData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setBankAccounts((prev) => [newAcc, ...prev]);
  }, []);

  const updateBankAccount = useCallback((id: string, updates: Partial<BankAccount>) => {
    setBankAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const deleteBankAccount = useCallback((id: string) => {
    setBankAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Sync Financial Due to Reminders (one-click action)
  const syncFinancialDueToReminders = useCallback(
    (type: 'emi' | 'credit_card' | 'bill', id: string) => {
      const now = new Date();
      const nowIso = now.toISOString();

      if (type === 'emi') {
        const emi = emis.find((e) => e.id === id);
        if (!emi) return;

        let year = now.getFullYear();
        let month = now.getMonth();
        if (now.getDate() > emi.dueDayOfMonth) {
          month += 1;
          if (month > 11) {
            month = 0;
            year += 1;
          }
        }
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(emi.dueDayOfMonth).padStart(2, '0')}`;

        const existing = reminders.find((r) => r.sourceType === 'emi' && r.sourceId === emi.id);
        if (existing) {
          setReminders((prev) =>
            prev.map((r) =>
              r.id === existing.id ? { ...r, date: dateStr, completed: false, updatedAt: nowIso } : r
            )
          );
        } else {
          setReminders((prev) => [
            {
              id: generateId(),
              title: `EMI Due: ${emi.name}`,
              date: dateStr,
              time: '09:00',
              repeat: 'monthly',
              category: 'financial',
              notes: `Lender: ${emi.lender} • Amount: ${settings.currency}${emi.emiAmount}`,
              notificationMethod: 'in_app',
              completed: false,
              sourceId: emi.id,
              sourceType: 'emi',
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            ...prev,
          ]);
        }
      } else if (type === 'credit_card') {
        const card = creditCards.find((c) => c.id === id);
        if (!card) return;

        let year = now.getFullYear();
        let month = now.getMonth();
        if (now.getDate() > card.dueDate) {
          month += 1;
          if (month > 11) {
            month = 0;
            year += 1;
          }
        }
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(card.dueDate).padStart(2, '0')}`;

        const existing = reminders.find((r) => r.sourceType === 'credit_card' && r.sourceId === card.id);
        if (existing) {
          setReminders((prev) =>
            prev.map((r) =>
              r.id === existing.id ? { ...r, date: dateStr, completed: false, updatedAt: nowIso } : r
            )
          );
        } else {
          setReminders((prev) => [
            {
              id: generateId(),
              title: `Credit Card Due: ${card.cardName}`,
              date: dateStr,
              time: '09:00',
              repeat: 'monthly',
              category: 'financial',
              notes: `Bank: ${card.bankName} • Due: ${settings.currency}${card.currentDue}`,
              notificationMethod: 'in_app',
              completed: false,
              sourceId: card.id,
              sourceType: 'credit_card',
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            ...prev,
          ]);
        }
      } else if (type === 'bill') {
        const bill = bills.find((b) => b.id === id);
        if (!bill) return;

        const existing = reminders.find((r) => r.sourceType === 'bill' && r.sourceId === bill.id);
        if (existing) {
          setReminders((prev) =>
            prev.map((r) =>
              r.id === existing.id ? { ...r, date: bill.dueDate, completed: false, updatedAt: nowIso } : r
            )
          );
        } else {
          setReminders((prev) => [
            {
              id: generateId(),
              title: `Bill Due: ${bill.name}`,
              date: bill.dueDate,
              time: '09:00',
              repeat: bill.frequency === 'one_time' ? 'none' : 'monthly',
              category: 'financial',
              notes: `Amount: ${settings.currency}${bill.amount}`,
              notificationMethod: 'in_app',
              completed: false,
              sourceId: bill.id,
              sourceType: 'bill',
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            ...prev,
          ]);
        }
      }
    },
    [emis, creditCards, bills, reminders, settings.currency]
  );

  // Expense actions
  const addExpense = useCallback(
    (expData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newExp: Expense = {
        ...expData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setExpenses((prev) => [newExp, ...prev]);

      // If paid by credit card, add the amount to that card's current due!
      if (newExp.paymentMethod === 'credit_card' && newExp.creditCardId) {
        setCreditCards((prevCards) =>
          prevCards.map((card) => {
            if (card.id === newExp.creditCardId) {
              const updatedDue = Number(((card.currentDue || 0) + Number(newExp.amount)).toFixed(2));
              return {
                ...card,
                currentDue: updatedDue,
                updatedAt: now,
              };
            }
            return card;
          })
        );
      }
    },
    []
  );

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => {
      const oldExp = prev.find((e) => e.id === id);
      if (oldExp) {
        const newExp = { ...oldExp, ...updates };
        const oldIsCard = oldExp.paymentMethod === 'credit_card' && !!oldExp.creditCardId;
        const newIsCard = newExp.paymentMethod === 'credit_card' && !!newExp.creditCardId;

        if (oldIsCard && newIsCard && oldExp.creditCardId === newExp.creditCardId) {
          const diff = Number(newExp.amount) - Number(oldExp.amount);
          if (diff !== 0) {
            setCreditCards((cards) =>
              cards.map((c) =>
                c.id === newExp.creditCardId
                  ? {
                      ...c,
                      currentDue: Math.max(0, Number(((c.currentDue || 0) + diff).toFixed(2))),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              )
            );
          }
        } else {
          if (oldIsCard) {
            setCreditCards((cards) =>
              cards.map((c) =>
                c.id === oldExp.creditCardId
                  ? {
                      ...c,
                      currentDue: Math.max(0, Number(((c.currentDue || 0) - Number(oldExp.amount)).toFixed(2))),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              )
            );
          }
          if (newIsCard) {
            setCreditCards((cards) =>
              cards.map((c) =>
                c.id === newExp.creditCardId
                  ? {
                      ...c,
                      currentDue: Number(((c.currentDue || 0) + Number(newExp.amount)).toFixed(2)),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              )
            );
          }
        }
      }
      return prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target && target.paymentMethod === 'credit_card' && target.creditCardId) {
        setCreditCards((prevCards) =>
          prevCards.map((card) => {
            if (card.id === target.creditCardId) {
              const updatedDue = Math.max(
                0,
                Number(((card.currentDue || 0) - Number(target.amount)).toFixed(2))
              );
              return {
                ...card,
                currentDue: updatedDue,
                updatedAt: new Date().toISOString(),
              };
            }
            return card;
          })
        );
      }
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  // Income actions
  const addIncome = useCallback((incData: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newInc: Income = {
      ...incData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setIncomes((prev) => [newInc, ...prev]);
  }, []);

  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    setIncomes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
    );
  }, []);

  const deleteIncome = useCallback((id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Medicine actions
  const addMedicine = useCallback((medData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => {
    const now = new Date().toISOString();
    const newMed: Medicine = {
      ...medData,
      id: generateId(),
      logs: [],
      createdAt: now,
      updatedAt: now,
    };
    setMedicines((prev) => [newMed, ...prev]);
  }, []);

  const updateMedicine = useCallback((id: string, updates: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const logMedicineDose = useCallback((id: string, time: string, status: 'taken' | 'skipped') => {
    const today = getTodayString();
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const existingLogs = (m.logs || []).filter((l) => !(l.date === today && l.time === time));
          const newLog = {
            id: generateId(),
            date: today,
            time,
            status,
          };
          return {
            ...m,
            logs: [newLog, ...existingLogs],
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      })
    );
  }, []);

  // Health appointment actions
  const addHealthAppointment = useCallback((appData: Omit<HealthAppointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newApp: HealthAppointment = {
      ...appData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setHealthAppointments((prev) => [newApp, ...prev]);
  }, []);

  const updateHealthAppointment = useCallback((id: string, updates: Partial<HealthAppointment>) => {
    setHealthAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const deleteHealthAppointment = useCallback((id: string) => {
    setHealthAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAppointmentComplete = useCallback((id: string) => {
    setHealthAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  // Medical Records actions
  const addMedicalRecord = useCallback(
    (record: MedicalRecord, addToMedicineReminders = false) => {
      setMedicalRecords((prev) => [record, ...prev]);

      // If prescription medicines should be scheduled as reminders
      if (addToMedicineReminders && record.medicines && record.medicines.length > 0) {
        const now = new Date().toISOString();
        const doctorOrHosp = record.doctorName || record.hospitalClinic || 'Doctor';
        const newMeds: Medicine[] = record.medicines.map((med) => ({
          id: generateId(),
          name: med.name,
          dosage: med.dosage || '',
          frequency: 'daily',
          times: ['08:00', '20:00'],
          beforeAfterFood: 'after',
          instructions: med.instructions || `Prescribed by ${doctorOrHosp}`,
          startDate: record.date,
          active: true,
          logs: [],
          createdAt: now,
          updatedAt: now,
        }));
        setMedicines((prev) => [...newMeds, ...prev]);
        triggerNotification(
          'Prescription Medicines Added',
          `${newMeds.length} medicine reminder(s) added from ${doctorOrHosp}`,
          'medicine'
        );
      } else {
        triggerNotification(
          'Medical Record Logged',
          `${record.recordType.replace('_', ' ')} saved securely`,
          'health'
        );
      }
    },
    [triggerNotification]
  );

  const updateMedicalRecord = useCallback((id: string, updates: Partial<MedicalRecord>) => {
    setMedicalRecords((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
  }, []);

  const deleteMedicalRecord = useCallback((id: string) => {
    setMedicalRecords((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Blood Pressure actions
  const addBloodPressureReading = useCallback(
    (reading: BloodPressureReading) => {
      setBloodPressureReadings((prev) => [reading, ...prev]);
      triggerNotification(
        'Blood Pressure Logged',
        `${reading.systolic}/${reading.diastolic} mmHg (Pulse: ${reading.pulse} bpm)`,
        'health'
      );
    },
    [triggerNotification]
  );

  const updateBloodPressureReading = useCallback((id: string, updates: Partial<BloodPressureReading>) => {
    setBloodPressureReadings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
  }, []);

  const deleteBloodPressureReading = useCallback((id: string) => {
    setBloodPressureReadings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const saveBloodPressureReminder = useCallback(
    (config: BloodPressureReminderConfig) => {
      setBpReminders((prev) => {
        const filtered = prev.filter((c) => c.id !== config.id);
        return [config, ...filtered];
      });

      if (config.enabled && config.times && config.times.length > 0) {
        const today = getTodayString();
        const now = new Date().toISOString();
        const newReminders: Reminder[] = config.times.map((t) => ({
          id: generateId(),
          title: 'Check Blood Pressure',
          date: today,
          time: t,
          category: 'health',
          notes: config.notes || 'Rest 5 minutes beforehand. Keep arm at heart level.',
          repeat: 'daily',
          notificationMethod: 'in_app',
          voiceAlarm: config.voiceAlarmEnabled,
          voiceAlarmMode: config.voiceAlarmMode,
          sourceType: 'bp',
          completed: false,
          createdAt: now,
          updatedAt: now,
        }));

        setReminders((prev) => {
          const nonBp = prev.filter((r) => r.title !== 'Check Blood Pressure');
          return [...newReminders, ...nonBp];
        });

        triggerNotification(
          'BP Reminder Set',
          `Daily checks scheduled at ${config.times.join(', ')} with voice alert ${config.voiceAlarmEnabled ? 'ON' : 'OFF'}`,
          'reminder'
        );
      }
    },
    [triggerNotification]
  );

  // Voice Alarm Active Trigger Loop
  useEffect(() => {
    if (!isAuthenticated || isLocked) return;

    const checkVoiceAlarms = () => {
      const today = getTodayString();
      const currentTime = getCurrentTimeString();

      const dueReminders = reminders.filter(
        (r) => !r.completed && r.date === today && r.time === currentTime
      );

      for (const rem of dueReminders) {
        const alarmKey = `${rem.id}_${today}_${currentTime}`;
        if (!triggeredAlarmsRef.current.has(alarmKey)) {
          triggeredAlarmsRef.current.add(alarmKey);

          if (rem.voiceAlarm) {
            voiceAlarmService.triggerAlarm({
              id: rem.id,
              title: rem.title,
              body: rem.notes || 'Scheduled reminder is due',
              entityType: 'reminder',
              entityId: rem.id,
              mode: (rem.voiceAlarmMode as VoiceAlarmMode) || 'alarm_voice',
              timestamp: new Date().toISOString(),
            });
            setActiveAlarmReminder(rem);
          } else {
            triggerNotification('Reminder Due', rem.title, 'reminder', rem.id);
          }
        }
      }
    };

    checkVoiceAlarms();
    const interval = setInterval(checkVoiceAlarms, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLocked, reminders, triggerNotification]);

  const stopVoiceAlarm = useCallback(() => {
    voiceAlarmService.stopAlarm();
    setActiveAlarmReminder(null);
  }, []);

  const snoozeVoiceAlarm = useCallback((minutes = 5) => {
    voiceAlarmService.snoozeAlarm(minutes);
    if (activeAlarmReminder) {
      const [h, m] = (activeAlarmReminder.time || getCurrentTimeString()).split(':').map(Number);
      const totalMin = (h || 0) * 60 + (m || 0) + minutes;
      const newH = Math.floor(totalMin / 60) % 24;
      const newM = totalMin % 60;
      const newTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

      setReminders((prev) =>
        prev.map((r) => (r.id === activeAlarmReminder.id ? { ...r, time: newTime } : r))
      );
    }
    setActiveAlarmReminder(null);
  }, [activeAlarmReminder]);

  const completeVoiceAlarm = useCallback(() => {
    if (activeAlarmReminder) {
      toggleReminderComplete(activeAlarmReminder.id);
    }
    voiceAlarmService.stopAlarm();
    setActiveAlarmReminder(null);
  }, [activeAlarmReminder, toggleReminderComplete]);

  // Renewal actions
  const addRenewal = useCallback((renData: Omit<Renewal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRen: Renewal = {
      ...renData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setRenewals((prev) => [newRen, ...prev]);
  }, []);

  const updateRenewal = useCallback((id: string, updates: Partial<Renewal>) => {
    setRenewals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const deleteRenewal = useCallback((id: string) => {
    setRenewals((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const markRenewalDone = useCallback((id: string) => {
    setRenewals((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.repeat && r.repeat !== 'none') {
            const nextDate = getNextOccurrence(r.expiryDate, r.repeat);
            const nextRen: Renewal = {
              ...r,
              id: generateId(),
              expiryDate: nextDate,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setTimeout(() => setRenewals((curr) => [nextRen, ...curr]), 0);
          }
          return { ...r, status: 'renewed', updatedAt: new Date().toISOString() };
        }
        return r;
      })
    );
  }, []);

  // Calendar Event actions
  const addCalendarEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEv: CalendarEvent = {
      ...eventData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setCalendarEvents((prev) => [newEv, ...prev]);
  }, []);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Trip actions
  const addTrip = useCallback((tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'expenses'>) => {
    const now = new Date().toISOString();
    const newTrip: Trip = {
      ...tripData,
      id: generateId(),
      tasks: [],
      expenses: [],
      createdAt: now,
      updatedAt: now,
    };
    setTrips((prev) => [newTrip, ...prev]);
  }, []);

  const updateTrip = useCallback((id: string, updates: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addTripTask = useCallback((tripId: string, task: Omit<TripTask, 'id' | 'tripId' | 'createdAt'>) => {
    const newTask: TripTask = {
      ...task,
      id: generateId(),
      tripId,
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, tasks: [...t.tasks, newTask] } : t))
    );
  }, []);

  const toggleTripTask = useCallback((tripId: string, taskId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            tasks: t.tasks.map((tk) => (tk.id === taskId ? { ...tk, completed: !tk.completed } : tk)),
          };
        }
        return t;
      })
    );
  }, []);

  const deleteTripTask = useCallback((tripId: string, taskId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return { ...t, tasks: t.tasks.filter((tk) => tk.id !== taskId) };
        }
        return t;
      })
    );
  }, []);

  const addTripExpense = useCallback((tripId: string, exp: Omit<TripExpense, 'id' | 'tripId' | 'createdAt'>) => {
    const newExp: TripExpense = {
      ...exp,
      id: generateId(),
      tripId,
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, expenses: [newExp, ...t.expenses] } : t))
    );
  }, []);

  const deleteTripExpense = useCallback((tripId: string, expenseId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return { ...t, expenses: t.expenses.filter((e) => e.id !== expenseId) };
        }
        return t;
      })
    );
  }, []);

  // Habit methods
  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      completedDates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHabits((prev) => [newHabit, ...prev]);
    triggerNotification('Habit Created', `"${newHabit.name}" added to daily habits!`, 'habit', newHabit.id);
  }, [triggerNotification]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
      )
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleHabitCompletion = useCallback((id: string, targetDate?: string) => {
    const dateToToggle = targetDate || getTodayString();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const exists = h.completedDates.includes(dateToToggle);
        const nextDates = exists
          ? h.completedDates.filter((d) => d !== dateToToggle)
          : [...h.completedDates, dateToToggle].sort();
        return {
          ...h,
          completedDates: nextDates,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }, []);

  // Export / Import / Reset
  const exportDataJson = useCallback(async (): Promise<string> => {
    return await exportAllData();
  }, []);

  const importDataJson = useCallback(async (jsonStr: string, mode: 'overwrite' | 'merge' = 'overwrite'): Promise<boolean> => {
    try {
      const newState = await importData(jsonStr, mode);
      setTasks(newState.tasks);
      setReminders(newState.reminders);
      setBills(newState.bills);
      setEmis(newState.emis);
      setExpenses(newState.expenses);
      setIncomes(newState.incomes);
      setMedicines(newState.medicines);
      setHealthAppointments(newState.healthAppointments);
      setMedicalRecords(newState.medicalRecords || []);
      setBloodPressureReadings(newState.bloodPressureReadings || []);
      setBpReminders(newState.bpReminders || []);
      setRenewals(newState.renewals);
      setCalendarEvents(newState.calendarEvents);
      setTrips(newState.trips);
      setHabits(newState.habits || []);
      setCreditCards(newState.creditCards || []);
      setBankAccounts(newState.bankAccounts || []);
      setSettings(newState.settings);
      setNotifications(newState.notifications || []);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  }, []);

  const resetAllData = useCallback(async () => {
    const emptyState = await clearAllStorage();
    setTasks(emptyState.tasks);
    setReminders(emptyState.reminders);
    setBills(emptyState.bills);
    setEmis(emptyState.emis);
    setExpenses(emptyState.expenses);
    setIncomes(emptyState.incomes);
    setMedicines(emptyState.medicines);
    setHealthAppointments(emptyState.healthAppointments);
    setMedicalRecords([]);
    setBloodPressureReadings([]);
    setBpReminders([]);
    setRenewals(emptyState.renewals);
    setCalendarEvents(emptyState.calendarEvents);
    setTrips(emptyState.trips);
    setHabits(emptyState.habits || []);
    setCreditCards([]);
    setBankAccounts([]);
    setSettings(emptyState.settings);
    setNotifications([]);
  }, []);

  // Authentication & Security Methods
  const login = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setIsLocked(false);
      const state = await loadAllData();
      setTasks(state.tasks);
      setReminders(state.reminders);
      setBills(state.bills);
      setEmis(state.emis);
      setExpenses(state.expenses);
      setIncomes(state.incomes);
      setMedicines(state.medicines);
      setHealthAppointments(state.healthAppointments);
      setMedicalRecords(state.medicalRecords || []);
      setBloodPressureReadings(state.bloodPressureReadings || []);
      setBpReminders(state.bpReminders || []);
      setRenewals(state.renewals);
      setCalendarEvents(state.calendarEvents);
      setTrips(state.trips);
      setHabits(state.habits || []);
      setCreditCards(state.creditCards || []);
      setBankAccounts(state.bankAccounts || []);
      setSettings(state.settings);
      setNotifications(state.notifications);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string, autoLockMinutes?: number) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await api.register(email, password, name, autoLockMinutes);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setIsLocked(false);
      // New account starts completely empty - zero mock or demo records!
      setTasks([]);
      setReminders([]);
      setBills([]);
      setEmis([]);
      setExpenses([]);
      setIncomes([]);
      setMedicines([]);
      setHealthAppointments([]);
      setMedicalRecords([]);
      setBloodPressureReadings([]);
      setBpReminders([]);
      setRenewals([]);
      setCalendarEvents([]);
      setTrips([]);
      setHabits([]);
      setCreditCards([]);
      setBankAccounts([]);
      setNotifications([]);
      setSettings({ ...DEFAULT_SETTINGS, userName: res.user.name });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(msg);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
    setTasks([]);
    setReminders([]);
    setBills([]);
    setEmis([]);
    setExpenses([]);
    setIncomes([]);
    setMedicines([]);
    setHealthAppointments([]);
    setRenewals([]);
    setCalendarEvents([]);
    setTrips([]);
    setHabits([]);
    setCreditCards([]);
    setBankAccounts([]);
    setNotifications([]);
  }, []);

  const lockDashboard = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockDashboard = useCallback(async (secret: string): Promise<boolean> => {
    if (!currentUser) return false;
    // If quick PIN is enabled and secret matches 4-6 digits, try pin verification
    if (/^\d{4,6}$/.test(secret) && currentUser.hasQuickPin) {
      try {
        await api.verifyPin(secret);
        setIsLocked(false);
        setLastActivityTime(Date.now());
        return true;
      } catch {
        // Fall back to try password
      }
    }

    try {
      await api.login(currentUser.email, secret);
      setIsLocked(false);
      setLastActivityTime(Date.now());
      return true;
    } catch {
      return false;
    }
  }, [currentUser]);

  const togglePrivacyMask = useCallback(() => {
    setIsPrivacyMasked((prev) => {
      const next = !prev;
      saveUIPreferences({ privacyMasked: next });
      return next;
    });
  }, []);

  const formatMaskableCurrency = useCallback((amount: number): string => {
    if (isPrivacyMasked) {
      return `${settings.currency} ••••••`;
    }
    return `${settings.currency} ${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [isPrivacyMasked, settings.currency]);

  const changePassword = useCallback(async (oldPwd: string, newPwd: string) => {
    await api.changePassword(oldPwd, newPwd);
  }, []);

  const setupPin = useCallback(async (pin: string, password: string) => {
    const res = await api.setupPin(pin, password);
    if (currentUser) {
      setCurrentUser({ ...currentUser, hasQuickPin: res.hasQuickPin });
    }
  }, [currentUser]);

  const deleteAccount = useCallback(async (password: string) => {
    await api.deleteAccount(password);
    await logout();
  }, [logout]);

  const purgeAllData = useCallback(async (password: string) => {
    await api.purgeAllData(password);
    setTasks([]);
    setReminders([]);
    setBills([]);
    setEmis([]);
    setExpenses([]);
    setIncomes([]);
    setMedicines([]);
    setHealthAppointments([]);
    setRenewals([]);
    setCalendarEvents([]);
    setTrips([]);
    setHabits([]);
    setCreditCards([]);
    setBankAccounts([]);
    setNotifications([]);
  }, []);

  // Periodic reminder checking for notifications
  useEffect(() => {
    if (!isInitialized || !settings.notificationsEnabled) return;

    const interval = setInterval(() => {
      const today = getTodayString();
      const currentTime = getCurrentTimeString();

      // Check tasks due today with reminder
      tasks.forEach((t) => {
        if (!t.completed && t.reminder && t.date === today && t.time === currentTime) {
          triggerNotification(`Task Reminder: ${t.title}`, t.description || 'Due right now', 'task', t.id);
        }
      });

      // Check reminders
      reminders.forEach((r) => {
        if (!r.completed && r.date === today && r.time === currentTime) {
          triggerNotification(`Reminder: ${r.title}`, r.notes || 'Scheduled reminder', 'reminder', r.id);
        }
      });

      // Check habits
      habits.forEach((h) => {
        if (h.reminderTime === currentTime && !h.completedDates.includes(today)) {
          triggerNotification(`Habit Reminder: ${h.name}`, 'Keep up your daily streak!', 'habit', h.id);
        }
      });

      // Check medicines
      medicines.forEach((m) => {
        if (m.active && m.times.includes(currentTime)) {
          const doseTakenToday = (m.logs || []).some(
            (l) => l.date === today && l.time === currentTime && l.status === 'taken'
          );
          if (!doseTakenToday) {
            triggerNotification(
              `Medicine Time: ${m.name}`,
              `Dose: ${m.dosage} (${m.beforeAfterFood} food)`,
              'medicine',
              m.id
            );
          }
        }
      });
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [isInitialized, settings.notificationsEnabled, tasks, reminders, habits, medicines, triggerNotification]);

  // Current Month Financial Summary Calculation: Income - Expenses - Bills - EMI = Available Balance
  const financialSummary = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    const monthlyIncome = incomes
      .filter((inc) => {
        if (!inc.date) return false;
        const [y, m] = inc.date.split('-').map(Number);
        return y === currentYear && m - 1 === currentMonth;
      })
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const monthlyExpenses = expenses
      .filter((exp) => {
        if (!exp.date) return false;
        const [y, m] = exp.date.split('-').map(Number);
        return y === currentYear && m - 1 === currentMonth;
      })
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const monthlyBills = bills
      .filter((b) => {
        if (!b.dueDate) return false;
        const [y, m] = b.dueDate.split('-').map(Number);
        return y === currentYear && m - 1 === currentMonth;
      })
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const monthlyEmi = emis.reduce((sum, item) => {
      if (item.remainingInstallments > 0) {
        return sum + (Number(item.emiAmount) || 0);
      }
      return sum;
    }, 0);

    const totalCreditCardDues = creditCards.reduce((sum, c) => sum + (Number(c.currentDue) || 0), 0);
    const totalCreditLimit = creditCards.reduce((sum, c) => sum + (Number(c.creditLimit) || 0), 0);
    const totalUnpaidBills = bills
      .filter((b) => b.paymentStatus === 'unpaid')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalMonthlyEmi = monthlyEmi;
    const netSavings = monthlyIncome - monthlyExpenses - totalUnpaidBills - totalMonthlyEmi;

    const availableBalance = monthlyIncome - monthlyExpenses - monthlyBills - monthlyEmi;
    const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((availableBalance / monthlyIncome) * 100)) : 0;

    return {
      totalIncome: monthlyIncome,
      totalExpenses: monthlyExpenses,
      totalBills: monthlyBills,
      totalEmi: monthlyEmi,
      availableBalance,
      savingsRate,
      totalUnpaidBills,
      totalMonthlyEmi,
      netSavings,
      totalCreditCardDues,
      totalCreditLimit,
    };
  }, [incomes, expenses, bills, emis, creditCards]);

  return (
    <AppContext.Provider
      value={{
        tasks,
        reminders,
        bills,
        emis,
        emiLoans: emis,
        creditCards,
        bankAccounts,
        expenses,
        incomes,
        medicines,
        healthAppointments,
        medicalRecords,
        bloodPressureReadings,
        bpReminders,
        renewals,
        calendarEvents,
        trips,
        habits,
        settings,
        notifications,
        activeSection,
        setActiveSection,
        quickAddOpen,
        setQuickAddOpen,
        isQuickAddOpen: quickAddOpen,
        openQuickAdd,
        closeQuickAdd,
        voiceModalOpen,
        setVoiceModalOpen,
        isVoiceModalOpen: voiceModalOpen,
        openVoiceModal,
        closeVoiceModal,
        isNotificationDrawerOpen,
        openNotificationDrawer,
        closeNotificationDrawer,
        setVoiceInputOpen: setVoiceModalOpen,
        activeModal,
        modalState,
        openModal,
        closeModal,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleTaskCompleted: toggleTaskComplete,
        postponeTask,
        duplicateTask,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminderComplete,
        toggleReminderCompleted: toggleReminderComplete,
        addBill,
        updateBill,
        deleteBill,
        markBillPaid,
        toggleBillPaid: markBillPaid,
        addEmi,
        updateEmi,
        deleteEmi,
        payEmiInstallment,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        payCreditCardBill,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        syncFinancialDueToReminders,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        logMedicineDose,
        addHealthAppointment,
        updateHealthAppointment,
        deleteHealthAppointment,
        toggleAppointmentComplete,
        addMedicalRecord,
        updateMedicalRecord,
        deleteMedicalRecord,
        addBloodPressureReading,
        updateBloodPressureReading,
        deleteBloodPressureReading,
        saveBloodPressureReminder,
        activeAlarmReminder,
        stopVoiceAlarm,
        snoozeVoiceAlarm,
        completeVoiceAlarm,
        addRenewal,
        updateRenewal,
        deleteRenewal,
        markRenewalDone,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addTrip,
        updateTrip,
        deleteTrip,
        addTripTask,
        toggleTripTask,
        deleteTripTask,
        addTripExpense,
        deleteTripExpense,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        updateSettings,
        markNotificationRead,
        clearNotifications,
        requestNotificationPermission,
        exportDataJson,
        importDataJson,
        resetAllData,
        financialSummary,
        currentUser,
        isAuthenticated,
        isLoadingAuth,
        isLocked,
        isPrivacyMasked,
        togglePrivacyMask,
        formatMaskableCurrency,
        login,
        register,
        logout,
        lockDashboard,
        unlockDashboard,
        changePassword,
        setupPin,
        deleteAccount,
        purgeAllData,
        authError,
        isAuthenticating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
