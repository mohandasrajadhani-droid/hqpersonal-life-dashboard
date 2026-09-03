// Optional server-side Google Drive backend.
//
// Why OAuth (not a Google Cloud "service account"): service accounts have no
// Drive storage quota of their own and can't own files outside of a Google
// Workspace "Shared Drive" (a paid business feature). For a normal personal
// Google account, the only way to durably store files in Drive is to
// authenticate AS that account via OAuth2 and keep a long-lived refresh
// token. See GOOGLE_DRIVE_SETUP.md for the full one-time setup walkthrough.
//
// This module is entirely optional. If GOOGLE_OAUTH_CLIENT_ID /
// GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_DRIVE_REFRESH_TOKEN are not set, the
// app behaves exactly as it did before: local-disk-only encrypted storage.

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

// A dedicated folder name in the connected Google account's own Drive. Kept
// distinctive so it doesn't collide with anything else already in the
// account, and so it's obvious to the account owner what it's for if they
// ever look in their Drive themselves.
const FOLDER_NAME = 'Personal Life Dashboard (Encrypted Backend Data)';

// Drive.file: the app can only see/manage files *it* creates, never the
// rest of the user's Drive. Deliberately the narrowest scope that works.
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

interface TokenCache {
  accessToken: string;
  expiresAt: number; // ms epoch
}

let tokenCache: TokenCache | null = null;
let folderIdCache: string | null = null;
const fileIdCache = new Map<string, string>(); // filename -> Drive file id

export function isDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  );
}

/** Builds the URL to send a browser to in order to grant this app Drive access. */
export function buildAuthUrl(redirectUri: string): string {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_OAUTH_CLIENT_ID is not set');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: DRIVE_SCOPE,
    access_type: 'offline',
    // Forces Google to hand back a refresh_token even if this account
    // previously granted consent (otherwise it's only returned the very
    // first time).
    prompt: 'consent',
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

/** Exchanges a one-time authorization code for tokens (used once, during setup). */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not set');
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Google token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt - 60_000 > now) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN!;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token refresh failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { accessToken: json.access_token, expiresAt: now + json.expires_in * 1000 };
  return json.access_token;
}

async function driveFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(url, { ...init, headers });
}

function escapeForQuery(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Two uploadToDrive() calls in flight at once (e.g. users.enc and
// records.enc both syncing right after boot) would otherwise each run
// their own "search, then create if missing" sequence — Drive's API isn't
// atomic across that, so both can see "not found" and each create their
// own folder. Sharing one in-flight promise per process makes concurrent
// callers await the same creation instead of racing.
let folderCreationInFlight: Promise<string> | null = null;

async function ensureFolder(): Promise<string> {
  if (folderIdCache) return folderIdCache;
  if (folderCreationInFlight) return folderCreationInFlight;

  folderCreationInFlight = ensureFolderUncached();
  try {
    return await folderCreationInFlight;
  } finally {
    folderCreationInFlight = null;
  }
}

async function ensureFolderUncached(): Promise<string> {
  // Ordered by creation time so that if a duplicate folder exists (e.g.
  // from before this race fix), the oldest one — the one most likely to
  // actually hold the real data — is used consistently rather than an
  // arbitrary one.
  const q = `name='${escapeForQuery(FOLDER_NAME)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchRes = await driveFetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(q)}&orderBy=createdTime&fields=files(id,name)&spaces=drive`
  );
  if (!searchRes.ok) {
    throw new Error(`Drive folder search failed: ${searchRes.status} ${await searchRes.text()}`);
  }
  const searchJson = (await searchRes.json()) as { files: Array<{ id: string; name: string }> };

  if (searchJson.files && searchJson.files.length > 0) {
    folderIdCache = searchJson.files[0].id;
    return folderIdCache;
  }

  const createRes = await driveFetch(`${DRIVE_API}/files?fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (!createRes.ok) {
    throw new Error(`Drive folder create failed: ${createRes.status} ${await createRes.text()}`);
  }
  const createJson = (await createRes.json()) as { id: string };
  folderIdCache = createJson.id;
  return folderIdCache;
}

async function findFileId(name: string): Promise<string | null> {
  if (fileIdCache.has(name)) return fileIdCache.get(name)!;

  const folderId = await ensureFolder();
  const q = `name='${escapeForQuery(name)}' and '${folderId}' in parents and trashed=false`;
  const res = await driveFetch(`${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`);
  if (!res.ok) {
    throw new Error(`Drive file search failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { files: Array<{ id: string; name: string }> };

  if (json.files && json.files.length > 0) {
    fileIdCache.set(name, json.files[0].id);
    return json.files[0].id;
  }
  return null;
}

/** Downloads a file's raw text content from the dedicated Drive folder, or null if it doesn't exist yet. */
export async function downloadFromDrive(name: string): Promise<string | null> {
  const fileId = await findFileId(name);
  if (!fileId) return null;

  const res = await driveFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
  if (res.status === 404) {
    fileIdCache.delete(name);
    return null;
  }
  if (!res.ok) {
    throw new Error(`Drive download failed for ${name}: ${res.status} ${await res.text()}`);
  }
  return res.text();
}

/** A cold start (Render Free instances spin down when idle) shouldn't silently
 *  present an empty dashboard just because of one flaky network request. */
export async function downloadFromDriveWithRetry(name: string, attempts = 3): Promise<string | null> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await downloadFromDrive(name);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

/** Creates or updates a file's content in the dedicated Drive folder. */
export async function uploadToDrive(name: string, content: string): Promise<void> {
  const existingId = await findFileId(name);

  if (existingId) {
    const res = await driveFetch(`${DRIVE_UPLOAD_API}/files/${existingId}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: content,
    });
    if (!res.ok) {
      throw new Error(`Drive update failed for ${name}: ${res.status} ${await res.text()}`);
    }
    return;
  }

  const folderId = await ensureFolder();
  const boundary = `pld-drive-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const metadata = JSON.stringify({ name, parents: [folderId] });
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n${content}\r\n` +
    `--${boundary}--`;

  const res = await driveFetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipartBody,
  });
  if (!res.ok) {
    throw new Error(`Drive create failed for ${name}: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { id: string };
  fileIdCache.set(name, json.id);
}
