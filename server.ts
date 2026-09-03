import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  hashPassword,
  verifyPassword,
  validateNoProhibitedFields,
} from './server/crypto';
import {
  secureStorage,
  VALID_ENTITY_TYPES,
  EntityType,
} from './server/storage';
import {
  isDriveConfigured,
  buildAuthUrl,
  exchangeCodeForTokens,
} from './server/googleDrive';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Remove server footprint
app.disable('x-powered-by');

// Trust the first hop reverse proxy/load balancer (Cloud Run, Render, Railway,
// etc. all sit in front of the app). Without this, req.ip returns the proxy's
// address for every request, breaking the per-IP rate limiting below.
app.set('trust proxy', 1);

// Secure payload limits (accommodates encrypted medical document scans and backups)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Global Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent cross-site scripting
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Permissions Policy (Restricting access to hardware features)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=()');

  // HSTS (HTTP Strict Transport Security)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy (allows Google Fonts and AI Studio iframes)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' ws: wss: https:; " +
    "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  // For API endpoints, strictly prevent client/proxy caching of sensitive responses
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
});

// In-memory rate limiting map for sensitive endpoints
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitBucket>();

function checkRateLimit(key: string, maxAttempts = 10, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = rateLimits.get(key);

  if (!bucket || now > bucket.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (bucket.count >= maxAttempts) {
    return false;
  }

  bucket.count++;
  return true;
}

function clearRateLimit(key: string) {
  rateLimits.delete(key);
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is missing or invalid',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.substring(7).trim();
  const session = secureStorage.getSession(token);

  if (!session) {
    return res.status(401).json({
      error: 'Session expired or invalid. Please sign in again.',
      code: 'SESSION_EXPIRED',
    });
  }

  const user = secureStorage.getUserById(session.userId);
  if (!user) {
    return res.status(401).json({
      error: 'User account not found',
      code: 'USER_NOT_FOUND',
    });
  }

  req.userId = user.id;
  req.userEmail = user.email;
  next();
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    security: {
      encryption: 'AES-256-GCM at rest',
      passwordHashing: 'scrypt',
      dataIsolation: 'enforced',
      pciCompliantDesign: 'CVV/PIN prohibited',
      zeroClientStorage: 'enforced',
    },
  });
});

// Security status report
app.get('/api/security/status', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  let userRecordCount = 0;
  let isAuthenticated = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = secureStorage.getSession(token);
    if (session) {
      isAuthenticated = true;
      userRecordCount = secureStorage.countUserRecords(session.userId);
    }
  }

  res.json({
    encryptionAtRest: {
      algorithm: 'AES-256-GCM',
      status: 'Active',
      keyManagement: 'Server-side key / ENCRYPTION_SECRET',
    },
    authentication: {
      mechanism: 'Bearer Session Tokens (256-bit cryptographically secure)',
      passwordHashing: 'OWASP-compliant scrypt (N=16384, r=8, p=1) with 16-byte random salt',
      sessionTimeout: 'Sliding inactivity expiration',
      rateLimiting: 'Active on login/register endpoints',
    },
    dataProtection: {
      isolation: 'Strict per-user data partition on all database reads/writes',
      prohibitedSecrets: ['CVV/CVC', 'Card PIN', 'ATM PIN', 'NetBanking Password', 'Full 16-digit Card Numbers'],
      sensitiveStorageInBrowser: 'Prohibited (Zero sensitive data in localStorage/sessionStorage/IndexedDB)',
      autoLockSupport: 'Client idle lock screen with password/quick PIN re-verification',
    },
    userContext: {
      isAuthenticated,
      userRecordCount,
    },
  });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  try {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`register:${ip}`, 15, 10 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many registration requests. Please try again later.' });
    }

    const { email, password, name, autoLockMinutes = 15 } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = secureStorage.getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      name: (name && typeof name === 'string') ? name.trim() : 'User',
      autoLockMinutes: Number(autoLockMinutes) || 15,
      createdAt: now,
      updatedAt: now,
      settings: {
        currency: '₹',
        theme: 'light',
        palette: 'emerald',
        fontSize: 'normal',
      },
    };

    secureStorage.createUser(newUser);

    // Create session
    const session = secureStorage.createSession(userId);

    res.status(201).json({
      message: 'Account created successfully',
      token: session.token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        autoLockMinutes: newUser.autoLockMinutes,
        settings: newUser.settings,
        hasQuickPin: false,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ error: message });
  }
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const rateLimitKey = `login:${ip}:${normalizedEmail}`;

    if (!checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many failed login attempts. For security, access is temporarily locked. Please try again in 15 minutes.',
      });
    }

    const user = secureStorage.getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(String(password), user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Clear rate limit on successful authentication
    clearRateLimit(rateLimitKey);

    const session = secureStorage.createSession(user.id);

    res.json({
      message: 'Sign in successful',
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        autoLockMinutes: user.autoLockMinutes ?? 15,
        settings: user.settings,
        hasQuickPin: Boolean(user.quickPinHash),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ error: message });
  }
});

// Auth: Logout
app.post('/api/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    secureStorage.invalidateSession(token);
  }
  res.json({ success: true, message: 'Signed out successfully' });
});

// Auth: Get Current User Profile
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = secureStorage.getUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      autoLockMinutes: user.autoLockMinutes ?? 15,
      settings: user.settings,
      hasQuickPin: Boolean(user.quickPinHash),
      createdAt: user.createdAt,
    },
  });
});

// Auth: Change Password
app.post('/api/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const user = secureStorage.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isValid = verifyPassword(String(currentPassword), user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const newHash = hashPassword(newPassword);
    secureStorage.updateUser(user.id, { passwordHash: newHash });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update password';
    res.status(500).json({ error: message });
  }
});

// Auth: Setup / Update Quick Unlock PIN
app.post('/api/auth/setup-pin', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pin, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Account password required to configure PIN.' });
    }

    const user = secureStorage.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    if (!pin) {
      // Remove PIN
      secureStorage.updateUser(user.id, { quickPinHash: undefined });
      return res.json({ success: true, hasQuickPin: false, message: 'Quick PIN removed' });
    }

    if (typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4 to 6 numeric digits.' });
    }

    const pinHash = hashPassword(pin);
    secureStorage.updateUser(user.id, { quickPinHash: pinHash });

    res.json({ success: true, hasQuickPin: true, message: 'Quick PIN configured successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'PIN setup failed';
    res.status(500).json({ error: message });
  }
});

// Auth: Verify Quick Unlock PIN (for resuming from Auto-Lock)
app.post('/api/auth/verify-pin', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ error: 'PIN is required.' });
    }

    // A 4-6 digit PIN has far fewer combinations than a password, so throttle
    // attempts the same way /api/auth/login does, even though a valid session
    // token is already required to reach this endpoint.
    const rateLimitKey = `verify-pin:${req.userId}`;
    if (!checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many incorrect PIN attempts. Please try again in 15 minutes, or unlock with your password.',
      });
    }

    const user = secureStorage.getUserById(req.userId!);
    if (!user || !user.quickPinHash) {
      return res.status(400).json({ error: 'No quick PIN configured for this account.' });
    }

    const isValid = verifyPassword(pin, user.quickPinHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect PIN.' });
    }

    clearRateLimit(rateLimitKey);
    res.json({ success: true, message: 'Unlocked successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unlock failed';
    res.status(500).json({ error: message });
  }
});

// Auth: Update Preferences & Security Settings (Auto-Lock timeout, UI settings)
app.post('/api/auth/update-settings', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { autoLockMinutes, settings } = req.body;
    const user = secureStorage.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const updates: Partial<typeof user> = {};
    if (typeof autoLockMinutes === 'number') {
      updates.autoLockMinutes = Math.max(0, Math.min(120, autoLockMinutes));
    }
    if (settings && typeof settings === 'object') {
      validateNoProhibitedFields(settings);
      updates.settings = { ...(user.settings || {}), ...settings };
    }

    const updated = secureStorage.updateUser(user.id, updates);
    res.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        autoLockMinutes: updated.autoLockMinutes,
        settings: updated.settings,
        hasQuickPin: Boolean(updated.quickPinHash),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update settings';
    res.status(500).json({ error: message });
  }
});

// Auth: Delete Account & All Encrypted Data
app.post('/api/auth/delete-account', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required to delete account.' });
    }

    const user = secureStorage.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect password. Deletion aborted.' });
    }

    // Permanently purge user and all associated records from encrypted storage at rest
    secureStorage.deleteUser(user.id);

    res.json({
      success: true,
      message: 'Account and all associated encrypted records permanently deleted.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Account deletion failed';
    res.status(500).json({ error: message });
  }
});

// --- DASHBOARD DATA ENDPOINTS (STRICT USER ISOLATION) ---

// Get all entities belonging strictly to the authenticated user
app.get('/api/dashboard/data', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = secureStorage.getUserData(req.userId!);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load user dashboard data';
    res.status(500).json({ error: message });
  }
});

// Sync / Upsert single entity record
app.post('/api/records/:entityType', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType } = req.params;
    if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
      return res.status(400).json({ error: `Invalid entity type: ${entityType}` });
    }

    const item = req.body;
    if (!item || typeof item !== 'object') {
      return res.status(400).json({ error: 'Invalid payload: object expected' });
    }

    // Ensure item has an ID
    if (!item.id) {
      item.id = crypto.randomUUID();
    }

    // Validate no prohibited card numbers, CVV, PIN, or banking passwords exist
    validateNoProhibitedFields(item);

    const saved = secureStorage.saveEntity(req.userId!, entityType as EntityType, item);
    res.json({ success: true, item: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save entity';
    res.status(400).json({ error: message });
  }
});

// Update single entity record
app.put('/api/records/:entityType/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, id } = req.params;
    if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
      return res.status(400).json({ error: `Invalid entity type: ${entityType}` });
    }

    const item = req.body;
    if (!item || typeof item !== 'object') {
      return res.status(400).json({ error: 'Invalid payload: object expected' });
    }

    item.id = id;
    validateNoProhibitedFields(item);

    const saved = secureStorage.saveEntity(req.userId!, entityType as EntityType, item);
    res.json({ success: true, item: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update entity';
    res.status(400).json({ error: message });
  }
});

// Delete single entity record
app.delete('/api/records/:entityType/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, id } = req.params;
    if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
      return res.status(400).json({ error: `Invalid entity type: ${entityType}` });
    }

    const deleted = secureStorage.deleteEntity(req.userId!, entityType as EntityType, id);
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found or unauthorized' });
    }

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete entity';
    res.status(500).json({ error: message });
  }
});

// Bulk sync endpoint (atomic update)
app.post('/api/dashboard/sync', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    validateNoProhibitedFields(payload);
    secureStorage.syncUserData(req.userId!, payload);

    res.json({ success: true, message: 'Data synced successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    res.status(400).json({ error: message });
  }
});

// Backup: Export User Data (Requires Authentication & generates structured snapshot)
app.post('/api/backup/export', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userData = secureStorage.getUserData(req.userId!);
    const user = secureStorage.getUserById(req.userId!);

    const exportPayload = {
      format: 'PersonalLifeDashboardSecureExport',
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
      },
      warning: 'CONFIDENTIAL: This file contains personal, financial, and health records. Store in a secure, encrypted location.',
      data: userData,
    };

    res.json(exportPayload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    res.status(500).json({ error: message });
  }
});

// Backup: Import / Restore User Data
app.post('/api/backup/import', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { backupData, replaceAll = false } = req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ error: 'Invalid backup file format' });
    }

    const payloadToImport = backupData.data || backupData;
    validateNoProhibitedFields(payloadToImport);

    if (replaceAll) {
      secureStorage.purgeUserData(req.userId!);
    }

    secureStorage.syncUserData(req.userId!, payloadToImport);

    const refreshed = secureStorage.getUserData(req.userId!);
    res.json({
      success: true,
      message: replaceAll ? 'Data restored successfully (previous records replaced).' : 'Data merged successfully.',
      data: refreshed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Restore failed';
    res.status(400).json({ error: message });
  }
});

// Purge all records for authenticated user (Data Reset)
app.post('/api/backup/purge-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password required to purge all data.' });
    }

    const user = secureStorage.getUserById(req.userId!);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    secureStorage.purgeUserData(user.id);
    res.json({ success: true, message: 'All personal records permanently purged from encrypted database.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Purge failed';
    res.status(500).json({ error: message });
  }
});

// --- GOOGLE DRIVE BACKEND: ONE-TIME SETUP ENDPOINTS ---
//
// These are not part of the regular user-facing API and are not reachable
// by an ordinary registered user. They exist so whoever deploys this server
// can connect it to their own Google Drive without hand-crafting an OAuth
// exchange. Full walkthrough: GOOGLE_DRIVE_SETUP.md.
//
// Gated by DRIVE_SETUP_TOKEN — a random secret only the deployer knows,
// generated once and set as an environment variable alongside the Google
// OAuth client credentials.

const DRIVE_CALLBACK_PATH = '/api/admin/drive/callback';

function getDriveRedirectUri(req: Request): string {
  // An explicit override is useful if the platform's forwarded-host headers
  // are unreliable; otherwise it's derived from the incoming request so
  // this works out of the box on Render, Railway, Fly, etc.
  if (process.env.GOOGLE_OAUTH_REDIRECT_URI) return process.env.GOOGLE_OAUTH_REDIRECT_URI;
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || req.protocol;
  return `${proto}://${req.get('host')}${DRIVE_CALLBACK_PATH}`;
}

app.get('/api/admin/drive/connect', (req: Request, res: Response) => {
  const setupToken = process.env.DRIVE_SETUP_TOKEN;
  if (!setupToken) {
    return res
      .status(503)
      .send('DRIVE_SETUP_TOKEN is not configured on this server. See GOOGLE_DRIVE_SETUP.md.');
  }
  if (req.query.key !== setupToken) {
    return res.status(403).send('Invalid or missing setup key.');
  }
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    return res
      .status(503)
      .send('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not configured. See GOOGLE_DRIVE_SETUP.md.');
  }

  try {
    const redirectUri = getDriveRedirectUri(req);
    res.redirect(buildAuthUrl(redirectUri));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to start Google Drive connection';
    res.status(500).send(message);
  }
});

app.get(DRIVE_CALLBACK_PATH, async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`Google Drive connection was not completed: ${error}`);
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).send('Missing authorization code from Google.');
  }

  try {
    const redirectUri = getDriveRedirectUri(req);
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.refresh_token) {
      return res.status(200).send(
        '<h2>No refresh token returned</h2>' +
        '<p>Google only issues a refresh token the first time an account grants consent. ' +
        'Revoke this app\'s access at ' +
        '<a href="https://myaccount.google.com/permissions" target="_blank">myaccount.google.com/permissions</a> ' +
        'and try connecting again.</p>'
      );
    }

    res.status(200).send(
      '<!doctype html><html><head><meta charset="utf-8"><title>Google Drive Connected</title></head>' +
      '<body style="font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; line-height: 1.5;">' +
      '<h2>Google Drive connected</h2>' +
      '<p>Copy the value below into this server\'s <code>GOOGLE_DRIVE_REFRESH_TOKEN</code> environment ' +
      'variable, then redeploy/restart. Google will not show this value again.</p>' +
      `<pre id="refresh-token" style="background:#f4f4f4;border:1px solid #ccc;padding:12px;border-radius:8px;white-space:pre-wrap;word-break:break-all;">${tokens.refresh_token}</pre>` +
      '<p>Once <code>GOOGLE_DRIVE_REFRESH_TOKEN</code> is set, you can remove <code>DRIVE_SETUP_TOKEN</code> ' +
      'to close off this setup endpoint.</p>' +
      '</body></html>'
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete Google Drive connection';
    res.status(500).send(message);
  }
});

// --- VITE MIDDLEWARE & STATIC SERVING ---

async function startServer() {
  // Hosts without a persistent disk (e.g. a free-tier web service) start
  // every instance with an empty data/ directory, so any Drive-backed data
  // must be pulled down before the app starts accepting requests.
  await secureStorage.init();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Security Architecture] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Security Architecture] AES-256-GCM encryption active at rest`);
    console.log(`[Security Architecture] Security headers & rate limiting enforced`);
    console.log(
      isDriveConfigured()
        ? '[Google Drive] Backend sync active — encrypted data is backed up to Google Drive.'
        : '[Google Drive] Not configured — using local disk only. See GOOGLE_DRIVE_SETUP.md to enable it.'
    );
  });
}

startServer();
