export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  priority: Priority;
  category: string;
  repeat: RecurrenceType;
  reminder: boolean;
  reminderMinutesBefore?: number;
  completed: boolean;
  important: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderCategory =
  | 'personal'
  | 'family'
  | 'financial'
  | 'health'
  | 'home'
  | 'vehicle'
  | 'work'
  | 'other';

export type VoiceAlarmMode = 'alarm_only' | 'voice_only' | 'alarm_voice' | 'silent';

export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  repeat: RecurrenceType;
  category: ReminderCategory;
  notes?: string;
  notificationMethod: 'browser' | 'in_app';
  completed: boolean;
  voiceAlarm?: boolean;
  voiceAlarmMode?: VoiceAlarmMode;
  sourceId?: string;
  sourceType?: 'emi' | 'credit_card' | 'bill' | 'general' | 'bp' | 'medicine' | 'medical';
  createdAt: string;
  updatedAt: string;
}

export type HabitCategory =
  | 'fitness'
  | 'health'
  | 'mindfulness'
  | 'learning'
  | 'productivity'
  | 'lifestyle'
  | 'other';

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type HabitTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  timeOfDay?: HabitTimeOfDay;
  color?: string; // e.g. emerald, blue, violet, amber, rose, cyan
  icon?: string; // e.g. Flame, Dumbbell, BookOpen, Droplets, Brain, Moon, Sun, Footprints, Heart
  reminderTime?: string; // HH:mm
  completedDates: string[]; // List of YYYY-MM-DD strings when completed
  targetDaysPerWeek?: number;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BillFrequency = 'one_time' | 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom';

export type BillCategory =
  | 'electricity'
  | 'water'
  | 'internet'
  | 'telephone'
  | 'insurance'
  | 'subscription'
  | 'rent'
  | 'education'
  | 'credit_card'
  | 'other';

export interface Bill {
  id: string;
  name: string;
  provider?: string;
  category: BillCategory;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  frequency: BillFrequency;
  paymentStatus: 'unpaid' | 'paid';
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  creditCardId?: string;
  bankAccountId?: string;
  reminderDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmiPayment {
  id: string;
  installmentNumber: number;
  amount: number;
  paymentDate: string;
  notes?: string;
}

export interface EmiLoan {
  id: string;
  name: string;
  lender: string;
  principalAmount: number;
  emiAmount: number;
  interestRate: number; // percentage
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalInstallments: number;
  remainingInstallments: number;
  dueDayOfMonth: number; // 1-31
  paymentStatus: 'pending' | 'paid_this_month';
  reminder: boolean;
  notes?: string;
  payments: EmiPayment[];
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'medical'
  | 'household'
  | 'bills'
  | 'entertainment'
  | 'travel'
  | 'education'
  | 'personal'
  | 'other';

export type PaymentMethod =
  | 'cash'
  | 'bank'
  | 'card'
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'other';

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'discover' | 'other';

export interface CreditCard {
  id: string;
  cardName: string; // e.g. "HDFC Millennia", "Chase Sapphire"
  bankName: string; // e.g. "HDFC Bank", "Chase"
  cardNumberLast4: string; // e.g. "4582"
  cardNetwork: CardNetwork;
  creditLimit: number;
  currentDue: number; // outstanding balance
  statementDate?: number; // billing date (day of month 1-31)
  dueDate: number; // payment due date (day of month 1-31)
  color?: string; // 'indigo' | 'slate' | 'emerald' | 'rose' | 'amber' | 'purple'
  reminder?: boolean; // sync due date to reminders
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BankAccountType = 'savings' | 'checking' | 'salary' | 'current';

export interface BankAccount {
  id: string;
  accountName: string; // e.g. "Primary Salary Account"
  bankName: string; // e.g. "HDFC Bank", "Chase"
  accountNumberLast4: string; // e.g. "9876"
  accountType: BankAccountType;
  balance?: number;
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  creditCardId?: string; // Linked credit card ID
  bankAccountId?: string; // Linked bank account ID
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type IncomeCategory =
  | 'salary'
  | 'business'
  | 'pension'
  | 'investment'
  | 'rental'
  | 'other';

export type IncomeFrequency = 'one_time' | 'monthly' | 'bi_weekly' | 'weekly' | 'annual';

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // YYYY-MM-DD
  frequency: IncomeFrequency;
  category: IncomeCategory;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'taken' | 'skipped';
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string; // e.g. 500mg, 1 tablet
  frequency: 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly' | 'as_needed' | 'custom';
  startDate: string;
  endDate?: string;
  times: string[]; // ['08:00', '20:00']
  instructions?: string;
  beforeAfterFood: 'before' | 'after' | 'with' | 'any';
  notes?: string;
  active: boolean;
  logs: MedicineLog[];
  createdAt: string;
  updatedAt: string;
}

export type HealthRecordType = 'consultation' | 'checkup';

export type CheckupCategory = 'general' | 'dental' | 'eye' | 'blood_test' | 'cardio' | 'other';

export interface HealthAppointment {
  id: string;
  type: HealthRecordType;
  doctorName?: string;
  specialty?: string;
  hospitalClinic?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  reason: string;
  notes?: string;
  followUpDate?: string;
  reminder: boolean;
  checkupCategory?: CheckupCategory;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Medical Records Center Types ---
export type MedicalRecordType =
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'doctor_consultation'
  | 'medical_bill'
  | 'vaccination'
  | 'imaging_scan'
  | 'other';

export interface PrescriptionMedicineItem {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "1 tablet"
  frequency: string; // e.g. "Twice daily after food", "Once at night"
  duration: string; // e.g. "5 days", "Ongoing"
  instructions?: string; // e.g. "Take with full glass of water"
}

export interface LabTestItem {
  id: string;
  testName: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Borderline' | 'Abnormal';
  notes?: string;
}

export interface MedicalAttachment {
  id: string;
  fileName: string;
  fileType: string; // 'application/pdf' | 'image/jpeg' | 'image/png' etc.
  fileSize: number;
  dataUrl: string; // Base64 data URL
  uploadedAt: string;
}

export interface MedicalRecord {
  id: string;
  recordType: MedicalRecordType;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  doctorName?: string;
  specialty?: string;
  hospitalClinic?: string;
  shortDescription?: string;
  notes?: string;
  followUpDate?: string; // YYYY-MM-DD
  diagnosis?: string;
  medicines?: PrescriptionMedicineItem[];
  labName?: string;
  testResults?: LabTestItem[];
  admissionDate?: string;
  dischargeDate?: string;
  procedures?: string;
  importantFindings?: string;
  medicinesAtDischarge?: string;
  followUpInstructions?: string;
  billAmount?: number;
  attachments: MedicalAttachment[];
  linkedRecordIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Blood Pressure Monitoring Types ---
export interface BloodPressureReading {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  systolic: number; // mmHg
  diastolic: number; // mmHg
  pulse: number; // bpm
  arm: 'left' | 'right';
  position: 'sitting' | 'standing' | 'lying';
  notes?: string;
  weight?: number;
  symptoms?: string;
  medicationTaken?: string;
  beforeAfterMedication?: 'none' | 'before' | 'after';
  beforeAfterExercise?: 'none' | 'before' | 'after' | 'resting';
  createdAt: string;
  updatedAt: string;
}

export interface BloodPressureReminderConfig {
  id: string;
  enabled: boolean;
  frequency: 'once_daily' | 'twice_daily' | 'custom';
  times: string[]; // e.g. ['08:00', '20:00']
  voiceAlarmEnabled: boolean;
  voiceAlarmMode: VoiceAlarmMode;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RenewalType =
  | 'insurance'
  | 'vehicle_insurance'
  | 'driving_license'
  | 'passport'
  | 'membership'
  | 'subscription'
  | 'domain'
  | 'warranty'
  | 'amc'
  | 'documents'
  | 'other';

export interface Renewal {
  id: string;
  itemName: string;
  renewalType: RenewalType;
  expiryDate: string; // YYYY-MM-DD
  renewalCost?: number;
  reminderDate?: string;
  repeat: RecurrenceType;
  notes?: string;
  status: 'active' | 'renewed';
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  category: string;
  description?: string;
  location?: string;
  repeat: RecurrenceType;
  reminder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripTask {
  id: string;
  tripId: string;
  title: string;
  category: 'booking' | 'packing' | 'documents' | 'shopping' | 'preparation' | 'other';
  completed: boolean;
  createdAt: string;
}

export interface TripExpense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: 'transportation' | 'accommodation' | 'food' | 'shopping' | 'activities' | 'other';
  date: string;
  createdAt: string;
}

export interface TripChecklistItem {
  id: string;
  item: string;
  completed: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  travelers?: string;
  budget: number;
  transportation?: string;
  accommodation?: string;
  notes?: string;
  checklist?: TripChecklistItem[];
  tasks: TripTask[];
  expenses: TripExpense[];
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'high-contrast';
export type ColorPalette = 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'slate';
export type FontSize = 'compact' | 'normal' | 'large' | 'xlarge';

export interface AppSettings {
  name: string;
  userName?: string;
  preferredLanguage: string;
  currency: string;
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  timeFormat: '12h' | '24h';
  notificationsEnabled: boolean;
  defaultReminderMinutes: number;
  fontSize: FontSize;
  theme: ThemeMode | 'system';
  palette: ColorPalette;
  voiceEnabled?: boolean;
  elderlyMode?: boolean;
  voiceRemindersEnabled?: boolean;
  alarmSoundEnabled?: boolean;
  voiceAnnouncementEnabled?: boolean;
  defaultSnoozeMinutes?: number;
  voiceLanguage?: string;
  alarmVolume?: number; // 0.0 to 1.0
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  entityType:
    | 'task'
    | 'reminder'
    | 'bill'
    | 'emi'
    | 'medicine'
    | 'health'
    | 'medical_record'
    | 'blood_pressure'
    | 'renewal'
    | 'calendar'
    | 'trip'
    | 'habit'
    | 'credit_card';
  entityId?: string;
  timestamp: string;
  read: boolean;
}

export type NavigationSection =
  | 'today'
  | 'habits'
  | 'tasks'
  | 'reminders'
  | 'expenses'
  | 'income'
  | 'bills'
  | 'credit_cards'
  | 'emi'
  | 'financial_summary'
  | 'medicines'
  | 'health_appointments'
  | 'medical_records'
  | 'blood_pressure'
  | 'calendar'
  | 'trips'
  | 'renewals'
  | 'reports'
  | 'search'
  | 'settings';
