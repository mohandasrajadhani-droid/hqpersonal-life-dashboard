import fs from 'fs';
import path from 'path';
import {
  encryptAES256GCM,
  decryptAES256GCM,
  EncryptedPayload,
  validateNoProhibitedFields,
  generateToken,
} from './crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.enc');
const RECORDS_FILE = path.join(DATA_DIR, 'records.enc');

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  autoLockMinutes: number; // e.g. 5, 15, 30, 0 (disabled)
  quickPinHash?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UserDataPayload {
  tasks: Array<{ id: string; [k: string]: unknown }>;
  reminders: Array<{ id: string; [k: string]: unknown }>;
  bills: Array<{ id: string; [k: string]: unknown }>;
  emis: Array<{ id: string; [k: string]: unknown }>;
  expenses: Array<{ id: string; [k: string]: unknown }>;
  incomes: Array<{ id: string; [k: string]: unknown }>;
  medicines: Array<{ id: string; [k: string]: unknown }>;
  appointments: Array<{ id: string; [k: string]: unknown }>;
  medicalRecords: Array<{ id: string; [k: string]: unknown }>;
  bloodPressureReadings: Array<{ id: string; [k: string]: unknown }>;
  bpReminders: Array<{ id: string; [k: string]: unknown }>;
  renewals: Array<{ id: string; [k: string]: unknown }>;
  events: Array<{ id: string; [k: string]: unknown }>;
  trips: Array<{ id: string; [k: string]: unknown }>;
  habits: Array<{ id: string; [k: string]: unknown }>;
  creditCards: Array<{ id: string; [k: string]: unknown }>;
  bankAccounts: Array<{ id: string; [k: string]: unknown }>;
  notifications: Array<{ id: string; [k: string]: unknown }>;
  settings?: Record<string, unknown>;
}

export type EntityType =
  | 'tasks'
  | 'reminders'
  | 'bills'
  | 'emis'
  | 'expenses'
  | 'incomes'
  | 'medicines'
  | 'appointments'
  | 'medicalRecords'
  | 'bloodPressureReadings'
  | 'bpReminders'
  | 'renewals'
  | 'events'
  | 'trips'
  | 'habits'
  | 'creditCards'
  | 'bankAccounts'
  | 'notifications';

export const VALID_ENTITY_TYPES: EntityType[] = [
  'tasks',
  'reminders',
  'bills',
  'emis',
  'expenses',
  'incomes',
  'medicines',
  'appointments',
  'medicalRecords',
  'bloodPressureReadings',
  'bpReminders',
  'renewals',
  'events',
  'trips',
  'habits',
  'creditCards',
  'bankAccounts',
  'notifications',
];

interface StoredRecord {
  id: string;
  userId: string;
  entityType: EntityType;
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: number;
  lastActive: number;
  expiresAt: number;
}

class SecureStorageManager {
  private users: Map<string, UserRecord> = new Map(); // key: userId
  private usersByEmail: Map<string, string> = new Map(); // key: lowercase email -> userId
  private records: Map<string, StoredRecord> = new Map(); // key: `${userId}:${entityType}:${id}`
  private sessions: Map<string, Session> = new Map(); // key: token
  private initialized = false;

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
    }
  }

  public init() {
    if (this.initialized) return;
    this.ensureDir();
    this.loadUsersFromDisk();
    this.loadRecordsFromDisk();
    this.initialized = true;

    // Background session cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000).unref();
  }

  private loadUsersFromDisk() {
    if (!fs.existsSync(USERS_FILE)) return;
    try {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      const payload: EncryptedPayload = JSON.parse(raw);
      const decrypted = decryptAES256GCM(payload);
      const userList: UserRecord[] = JSON.parse(decrypted);

      this.users.clear();
      this.usersByEmail.clear();
      for (const u of userList) {
        this.users.set(u.id, u);
        this.usersByEmail.set(u.email.toLowerCase(), u.id);
      }
    } catch (err) {
      console.error('Failed to load encrypted users file, starting clean:', err);
    }
  }

  private saveUsersToDisk() {
    this.ensureDir();
    const userList = Array.from(this.users.values());
    const json = JSON.stringify(userList);
    const encrypted = encryptAES256GCM(json);

    const tmpFile = `${USERS_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(encrypted), { mode: 0o600 });
    fs.renameSync(tmpFile, USERS_FILE);
  }

  private loadRecordsFromDisk() {
    if (!fs.existsSync(RECORDS_FILE)) return;
    try {
      const raw = fs.readFileSync(RECORDS_FILE, 'utf8');
      const payload: EncryptedPayload = JSON.parse(raw);
      const decrypted = decryptAES256GCM(payload);
      const recordList: StoredRecord[] = JSON.parse(decrypted);

      this.records.clear();
      for (const r of recordList) {
        this.records.set(`${r.userId}:${r.entityType}:${r.id}`, r);
      }
    } catch (err) {
      console.error('Failed to load encrypted records file, starting clean:', err);
    }
  }

  private saveRecordsToDisk() {
    this.ensureDir();
    const recordList = Array.from(this.records.values());
    const json = JSON.stringify(recordList);
    const encrypted = encryptAES256GCM(json);

    const tmpFile = `${RECORDS_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(encrypted), { mode: 0o600 });
    fs.renameSync(tmpFile, RECORDS_FILE);
  }

  // Session Methods
  public createSession(userId: string, durationMs = 24 * 60 * 60 * 1000): Session {
    // Generate secure session token
    const token = generateToken();
    const now = Date.now();
    const session: Session = {
      token,
      userId,
      createdAt: now,
      lastActive: now,
      expiresAt: now + durationMs,
    };
    this.sessions.set(token, session);
    return session;
  }

  public getSession(token: string): Session | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    const now = Date.now();
    if (now > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    // Refresh activity
    session.lastActive = now;
    return session;
  }

  public invalidateSession(token: string): void {
    this.sessions.delete(token);
  }

  public invalidateUserSessions(userId: string): void {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
      }
    }
  }

  // User Management
  public getUserByEmail(email: string): UserRecord | null {
    const userId = this.usersByEmail.get(email.toLowerCase().trim());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  public getUserById(userId: string): UserRecord | null {
    return this.users.get(userId) || null;
  }

  public createUser(user: UserRecord): void {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase().trim(), user.id);
    this.saveUsersToDisk();
  }

  public updateUser(userId: string, updates: Partial<UserRecord>): UserRecord {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const updated: UserRecord = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.email && updates.email !== user.email) {
      this.usersByEmail.delete(user.email.toLowerCase());
      this.usersByEmail.set(updates.email.toLowerCase(), userId);
    }

    this.users.set(userId, updated);
    this.saveUsersToDisk();
    return updated;
  }

  public deleteUser(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.usersByEmail.delete(user.email.toLowerCase());
      this.users.delete(userId);
      this.saveUsersToDisk();
    }

    // Cascade delete all records belonging to this user
    this.purgeUserData(userId);
    this.invalidateUserSessions(userId);
  }

  // Data Isolation: Get all entities belonging exclusively to this user
  public getUserData(userId: string): UserDataPayload {
    const payload: UserDataPayload = {
      tasks: [],
      reminders: [],
      bills: [],
      emis: [],
      expenses: [],
      incomes: [],
      medicines: [],
      appointments: [],
      medicalRecords: [],
      bloodPressureReadings: [],
      bpReminders: [],
      renewals: [],
      events: [],
      trips: [],
      habits: [],
      creditCards: [],
      bankAccounts: [],
      notifications: [],
      settings: this.users.get(userId)?.settings || {},
    };

    for (const record of this.records.values()) {
      if (record.userId === userId) {
        const list = payload[record.entityType] as Array<{ id: string; [k: string]: unknown }>;
        if (Array.isArray(list)) {
          list.push({ ...record.data, id: record.id });
        }
      }
    }

    return payload;
  }

  // Save single entity with strict user ownership and prohibited field checks
  public saveEntity(userId: string, entityType: EntityType, item: { id: string; [k: string]: unknown }): Record<string, unknown> {
    if (!VALID_ENTITY_TYPES.includes(entityType)) {
      throw new Error(`Invalid entity type: ${entityType}`);
    }
    if (!item.id || typeof item.id !== 'string') {
      throw new Error('Item must have a valid string id');
    }

    // Security validation: ensure no prohibited card numbers, CVV, PINs, or credentials exist
    validateNoProhibitedFields(item);

    const now = new Date().toISOString();
    const dataToStore = {
      ...item,
      updatedAt: now,
    };

    const key = `${userId}:${entityType}:${item.id}`;
    this.records.set(key, {
      id: item.id,
      userId,
      entityType,
      data: dataToStore,
      updatedAt: now,
    });

    this.saveRecordsToDisk();
    return dataToStore;
  }

  // Delete single entity verifying ownership
  public deleteEntity(userId: string, entityType: EntityType, id: string): boolean {
    const key = `${userId}:${entityType}:${id}`;
    const existing = this.records.get(key);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    this.records.delete(key);
    this.saveRecordsToDisk();
    return true;
  }

  // Bulk sync: safely upsert or replace entities for this user
  public syncUserData(userId: string, data: Partial<UserDataPayload>): void {
    validateNoProhibitedFields(data);

    for (const entityType of VALID_ENTITY_TYPES) {
      const items = data[entityType];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && typeof item === 'object' && 'id' in item) {
            const key = `${userId}:${entityType}:${(item as { id: string }).id}`;
            this.records.set(key, {
              id: (item as { id: string }).id,
              userId,
              entityType,
              data: item as Record<string, unknown>,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    if (data.settings && typeof data.settings === 'object') {
      const user = this.users.get(userId);
      if (user) {
        user.settings = { ...(user.settings || {}), ...data.settings };
        this.saveUsersToDisk();
      }
    }

    this.saveRecordsToDisk();
  }

  // Purge all records belonging to a user (e.g. for complete data reset)
  public purgeUserData(userId: string): void {
    const keysToDelete: string[] = [];
    for (const [key, record] of this.records.entries()) {
      if (record.userId === userId) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.records.delete(key);
    }
    this.saveRecordsToDisk();
  }

  // Count total records for this user
  public countUserRecords(userId: string): number {
    let count = 0;
    for (const record of this.records.values()) {
      if (record.userId === userId) count++;
    }
    return count;
  }
}

export const secureStorage = new SecureStorageManager();
secureStorage.init();
