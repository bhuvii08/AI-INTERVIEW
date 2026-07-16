# Deployment Guide

This project is deployed as:

- Frontend (`client`) on Vercel
- Backend (`server`) on Render

## 1) Deploy Backend to Render

### Option A: Using `render.yaml` (recommended)

1. Push this repository to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select your repository.
4. Render will detect `render.yaml` and create `aiinterview-api` service.
5. Fill all env vars marked `sync: false` in Render dashboard:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `CLIENT_URL` (set this to your Vercel frontend URL)
   - `CLIENT_URLS` (optional comma-separated extra origins, e.g. Vercel preview URLs)
   - `OPENROUTER_API_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
6. Deploy and copy the backend URL, e.g. `https://aiinterview-api.onrender.com`.

### Option B: Manual Web Service

Use these settings:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Runtime: Node

Add env vars from `server/.env.example`.

## 2) Deploy Frontend to Vercel

1. Import the same GitHub repo into Vercel.
2. Set **Root Directory** to `client`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add environment variables:
   - `VITE_SERVER_URL=https://<your-render-backend>.onrender.com`
   - `VITE_FIREBASE_APIKEY=<your_firebase_web_api_key>`
   - `VITE_RAZORPAY_KEY_ID=<your_razorpay_key_id>`
7. Deploy.

`client/vercel.json` already includes SPA rewrites so refresh/deep-links work.

## 3) Final Cross-Origin Setup

After Vercel deploy gives a URL like `https://your-app.vercel.app`:

1. Open Render service env vars.
2. Set `CLIENT_URL=https://your-app.vercel.app`.
3. Trigger a redeploy on Render.

This is required for CORS + cookie auth between Vercel and Render.

## 4) Quick Smoke Test

1. Open frontend URL.
2. Sign in.
3. Check browser network tab that API calls go to your Render URL.
4. Verify auth cookie-based endpoints work (`/api/user/current-user`).
5. Test interview generation and payment flow.
