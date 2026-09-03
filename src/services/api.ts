/**
 * Authenticated API client for secure backend communication.
 * Strictly avoids storing sensitive personal, financial, or health data in browser storage.
 * All sensitive records are persisted exclusively in the encrypted server-side database.
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

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  autoLockMinutes: number;
  hasQuickPin: boolean;
  settings?: Partial<AppSettings>;
  createdAt?: string;
}

export interface DashboardDataResponse {
  tasks: Task[];
  reminders: Reminder[];
  bills: Bill[];
  emis: EmiLoan[];
  expenses: Expense[];
  incomes: Income[];
  medicines: Medicine[];
  appointments: HealthAppointment[];
  medicalRecords?: MedicalRecord[];
  bloodPressureReadings?: BloodPressureReading[];
  bpReminders?: BloodPressureReminderConfig[];
  renewals: Renewal[];
  events: CalendarEvent[];
  trips: Trip[];
  habits: Habit[];
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  notifications: InAppNotification[];
  settings?: Partial<AppSettings>;
}

export interface SecurityStatusResponse {
  encryptionAtRest: {
    algorithm: string;
    status: string;
    keyManagement: string;
  };
  authentication: {
    mechanism: string;
    passwordHashing: string;
    sessionTimeout: string;
    rateLimiting: string;
  };
  dataProtection: {
    isolation: string;
    prohibitedSecrets: string[];
    sensitiveStorageInBrowser: string;
    autoLockSupport: string;
  };
  userContext: {
    isAuthenticated: boolean;
    userRecordCount: number;
  };
}

// In-memory token storage (isolated from localStorage to prevent persistent disk leakage of tokens)
let inMemoryToken: string | null = null;
const TOKEN_SESSION_KEY = 'pl_auth_session_token';

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      try {
        sessionStorage.setItem(TOKEN_SESSION_KEY, token);
      } catch {
        // Safe fallback to memory
      }
    } else {
      try {
        sessionStorage.removeItem(TOKEN_SESSION_KEY);
      } catch {
        // Safe ignore
      }
    }
  }
}

export function getAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(TOKEN_SESSION_KEY);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    } catch {
      return null;
    }
  }
  return null;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // Use fallback error message
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  async register(email: string, password: string, name?: string, autoLockMinutes?: number) {
    const data = await apiRequest<{ message: string; token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, autoLockMinutes }),
    });
    setAuthToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiRequest<{ message: string; token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during sign out
    } finally {
      setAuthToken(null);
    }
  },

  async getMe() {
    return apiRequest<{ user: AuthUser }>('/api/auth/me');
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return apiRequest<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async setupPin(pin: string, password: string) {
    return apiRequest<{ success: boolean; hasQuickPin: boolean; message: string }>('/api/auth/setup-pin', {
      method: 'POST',
      body: JSON.stringify({ pin, password }),
    });
  },

  async verifyPin(pin: string) {
    return apiRequest<{ success: boolean; message: string }>('/api/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  async updateSettings(autoLockMinutes?: number, settings?: Partial<AppSettings>) {
    return apiRequest<{ success: boolean; user: AuthUser }>('/api/auth/update-settings', {
      method: 'POST',
      body: JSON.stringify({ autoLockMinutes, settings }),
    });
  },

  async deleteAccount(password: string) {
    const res = await apiRequest<{ success: boolean; message: string }>('/api/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    setAuthToken(null);
    return res;
  },

  // Dashboard Data
  async fetchDashboardData(): Promise<DashboardDataResponse> {
    return apiRequest<DashboardDataResponse>('/api/dashboard/data');
  },

  async saveEntity<T extends { id: string }>(entityType: string, item: T): Promise<T> {
    const res = await apiRequest<{ success: boolean; item: T }>(`/api/records/${entityType}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return res.item;
  },

  async updateEntity<T extends { id: string }>(entityType: string, id: string, item: Partial<T>): Promise<T> {
    const res = await apiRequest<{ success: boolean; item: T }>(`/api/records/${entityType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return res.item;
  },

  async deleteEntity(entityType: string, id: string): Promise<void> {
    await apiRequest(`/api/records/${entityType}/${id}`, {
      method: 'DELETE',
    });
  },

  async syncAllData(payload: Partial<DashboardDataResponse>): Promise<void> {
    await apiRequest('/api/dashboard/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Backups
  async exportSecureBackup() {
    return apiRequest<Record<string, unknown>>('/api/backup/export', {
      method: 'POST',
    });
  },

  async importSecureBackup(backupData: Record<string, unknown>, replaceAll = false) {
    return apiRequest<{ success: boolean; message: string; data: DashboardDataResponse }>('/api/backup/import', {
      method: 'POST',
      body: JSON.stringify({ backupData, replaceAll }),
    });
  },

  async purgeAllData(password: string) {
    return apiRequest<{ success: boolean; message: string }>('/api/backup/purge-all', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  async getSecurityStatus(): Promise<SecurityStatusResponse> {
    return apiRequest<SecurityStatusResponse>('/api/security/status');
  },
};
