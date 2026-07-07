# AI Interview Platform

[![Contributors](https://img.shields.io/github/contributors/bhuvii08/AI-INTERVIEW?style=for-the-badge)](https://github.com/bhuvii08/AI-INTERVIEW/graphs/contributors)
[![Top Language](https://img.shields.io/github/languages/top/bhuvii08/AI-INTERVIEW?style=for-the-badge)](https://github.com/bhuvii08/AI-INTERVIEW)
[![Languages Count](https://img.shields.io/github/languages/count/bhuvii08/AI-INTERVIEW?style=for-the-badge)](https://github.com/bhuvii08/AI-INTERVIEW)

Full-stack AI-powered interview practice platform with Google auth, voice interview flow, analytics reports, and Razorpay credits.

## Contributors & Languages

- Contributors graph: https://github.com/bhuvii08/AI-INTERVIEW/graphs/contributors
- Language stats: https://github.com/bhuvii08/AI-INTERVIEW

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