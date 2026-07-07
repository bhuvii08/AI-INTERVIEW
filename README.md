# AI Interview Platform

Full-stack AI-powered interview practice platform with Google auth, voice interview flow, analytics reports, and Razorpay credits.

## Monorepo Structure

- `client/` React + Vite frontend
- `server/` Node.js + Express API

## Quick Start (Local)

1. Install dependencies:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

2. Create env files from examples:

```bash
copy client/.env.example client/.env
copy server/.env.example server/.env
```

3. Start both frontend and backend:

```bash
npm run start:all
```

## Scripts

- `npm run start:all` - run client and server together
- `npm run dev` - run server in dev mode
- `npm run server:dev` - run server in dev mode

Client scripts are available in `client/package.json` (`npm run lint`, `npm run build`, `npm run dev`).

## Documentation

- Frontend docs: `client/README.md`
- Backend docs: `server/README.md`