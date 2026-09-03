# Connecting Your Own Google Drive Backend

By default this server stores its encrypted database (`data/users.enc`,
`data/records.enc`) only on local disk. On a host with no persistent disk
(for example, a free-tier web service), that data is wiped every time the
server restarts or redeploys.

This guide connects the server to **Google Drive** instead, so the encrypted
database survives restarts and redeploys for free, without needing to pay
for a persistent disk. It works on any host you deploy this project to —
Render, Railway, Fly.io, a VPS, anywhere.

Anyone deploying this project can follow these steps with their **own**
Google account. You do not need our permission, our project, or any shared
credentials — everything below happens entirely inside your own free Google
Cloud project.

## How it works, and why it's OAuth rather than a "service account"

You might expect a server-to-server integration like this to use a Google
Cloud **service account** (a machine identity with its own key file, no
human sign-in required). That doesn't work here: service accounts have no
Drive storage quota of their own and cannot own files in Drive unless you're
on a paid Google Workspace plan using a "Shared Drive." A personal Gmail
account can't create one.

So instead, the server authenticates **as your own Google account** via
OAuth2, the same flow you'd use to let any app access your Drive. The
difference is that instead of a person clicking "Allow" every time, the
server is given a long-lived **refresh token** once, and uses it to mint
short-lived access tokens for itself indefinitely afterward — no human
needs to be present after the one-time setup below.

The app requests the narrowest possible scope, `drive.file`: it can only see
and manage files it creates itself, never anything else already in your
Drive.

**Single Drive, shared by all app users.** This server may have multiple
people registering their own accounts on it (see the app's sign-up screen).
All of their encrypted data still goes into the *one* Google Drive account
you connect here — there's no way to give each app user their own personal
Drive without asking every single one of them to do this OAuth dance
themselves, which defeats the point of a shared server. If you need
per-user Drive storage, that's a materially different design; ask for help
scoping it rather than assuming this guide covers it.

## Step 1 — Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   sign in with the Google account you want the app's data stored in.
2. Click the project dropdown (top left) → **New Project**.
3. Name it anything (e.g. "Personal Life Dashboard") and click **Create**.
   This is free — Google Cloud projects and OAuth clients cost nothing by
   themselves; you only pay for resources you explicitly provision, and
   this guide provisions none.

## Step 2 — Enable the Google Drive API

1. With your new project selected, go to **APIs & Services → Library**.
2. Search for "Google Drive API" and open it.
3. Click **Enable**.

## Step 3 — Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**.
2. User type: **External** (this is correct even though only you will use
   it — "Internal" is only available on a paid Google Workspace domain).
3. Fill in the required fields (app name, your email as support/developer
   contact). You do not need a privacy policy or terms-of-service URL for
   personal use.
4. Under **Scopes**, add `.../auth/drive.file`.
5. **Important — avoid the 7-day token expiry:** while this consent screen
   is in **Testing** status, Google expires refresh tokens after 7 days,
   which would silently break the Drive connection every week. Once you've
   finished configuring the consent screen, go to its summary page and
   click **Publish App** to move it from *Testing* to *In production*. For
   a personal app like this, that does **not** require Google's app
   verification review (verification is only required for apps requesting
   more sensitive/restricted scopes than `drive.file`, or serving many
   users) — it just removes the 7-day cap.
6. Because the app is published but unverified, Google will show an
   "unverified app" warning screen the one time you connect it (Step 6
   below). That's expected — click **Advanced → Go to [app name] (unsafe)**
   to proceed. This warning exists because Google hasn't manually reviewed
   the app, not because anything is actually wrong; you're the one who
   created it.

## Step 4 — Create OAuth credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**.
2. Application type: **Web application**.
3. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR-DEPLOYED-DOMAIN/api/admin/drive/callback
   ```
   replacing `YOUR-DEPLOYED-DOMAIN` with wherever this server is actually
   reachable (e.g. `personal-life-dashboard-s726.onrender.com`). This must
   match **exactly**, including `https://` and no trailing slash.
4. Click **Create**. Copy the **Client ID** and **Client Secret** shown.

## Step 5 — Set environment variables and deploy

On whatever platform hosts this server, set:

| Variable | Value |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | the Client ID from Step 4 |
| `GOOGLE_OAUTH_CLIENT_SECRET` | the Client Secret from Step 4 |
| `DRIVE_SETUP_TOKEN` | any random string you generate yourself (e.g. run `openssl rand -hex 24`) — this is a one-time password that protects the setup endpoint below from being triggered by anyone else |

Deploy/redeploy the server so it picks up these three variables. At this
point the app still behaves exactly as before (local disk only) — Drive
sync only activates once `GOOGLE_DRIVE_REFRESH_TOKEN` (Step 6) is also set.

## Step 6 — Connect your Google account (one-time)

1. In a browser signed in with the Google account from Step 1, visit:
   ```
   https://YOUR-DEPLOYED-DOMAIN/api/admin/drive/connect?key=YOUR_DRIVE_SETUP_TOKEN
   ```
2. Click through Google's consent screen, including the "unverified app"
   warning mentioned in Step 3 (**Advanced → Go to [app name] (unsafe)**).
3. Approve access. You'll land on a page showing a **refresh token**.
4. Copy it into a new environment variable, `GOOGLE_DRIVE_REFRESH_TOKEN`,
   and redeploy/restart the server one more time.

That's it — the server logs will show `[Google Drive] Backend sync active`
on startup, and a folder named **"Personal Life Dashboard (Encrypted
Backend Data)"** will appear in that Google account's Drive, containing two
files: `users.enc` and `records.enc`. Both are AES-256-GCM encrypted with
this server's own `ENCRYPTION_SECRET` — Google (and anyone who merely has
view access to that Drive folder) cannot read their contents without it.

**Optional cleanup:** once `GOOGLE_DRIVE_REFRESH_TOKEN` is set and working,
you can remove `DRIVE_SETUP_TOKEN` to close off the `/api/admin/drive/*`
setup endpoints entirely — they're no longer needed day-to-day.

## Cost

Nothing. A Google Cloud project, an OAuth client, and standard Drive API
usage are all free. This app's usage (a handful of small file reads/writes
per save) is a rounding error against Google's free quota
(1,000,000 quota units/minute, 400,000,000/day before any billing even
becomes possible) — you would need to be running something at a completely
different scale to ever be charged.

## Troubleshooting

- **"redirect_uri_mismatch"** — the URL in Step 3's "Authorized redirect
  URIs" doesn't exactly match your deployed domain + `/api/admin/drive/callback`.
  Fix it in Cloud Console under Credentials → your OAuth client.
- **"Access blocked: this app's request is invalid"** or similar — usually
  means the OAuth consent screen isn't fully configured (missing required
  fields) or the Drive API isn't enabled (Step 2).
- **Stuck on the "Google hasn't verified this app" screen with no way
  forward** — click **Advanced**, then **Go to [app name] (unsafe)**. This
  link is easy to miss; it's usually small text below the main warning.
- **No refresh token returned / had to reconnect and lost sync** — Google
  only issues a refresh token the first time an account grants consent (the
  `/api/admin/drive/connect` route already requests `prompt=consent` to
  force this every time, but if it still doesn't appear, revoke the app's
  access at
  [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
  and reconnect).
- **Drive sync silently stopped working after ~7 days** — the OAuth consent
  screen is still in *Testing* status; publish it to *In production*
  (Step 3.5).
