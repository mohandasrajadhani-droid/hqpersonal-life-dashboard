<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5e635cc2-3188-419c-ac47-e6bd486caa3f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend Storage

The server encrypts and stores all data (AES-256-GCM) under `data/` on local
disk by default. On a host with no persistent disk, that's wiped on every
restart/redeploy. To keep data durable for free instead, connect the server
to your own Google Drive — see [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md)
for the full walkthrough (anyone deploying this project can do this with
their own Google account; no shared credentials needed).
