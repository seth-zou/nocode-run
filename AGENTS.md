# AGENTS.md

This document provides guidance for autonomous AI agents working in the NoCode Run repository.

## Project Overview

NoCode Run is a no-code application platform that lets users create, preview, and deploy applications through natural-language descriptions. The project is a JavaScript/TypeScript monorepo with a React frontend and an Express backend backed by SQLite.

## Repository Layout

```
nocode-run/
├── package.json            # Root workspace: orchestrates frontend + backend scripts
├── frontend/               # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components (e.g. Header)
│   │   ├── pages/          # Route-level pages (HomePage, DevelopmentPage)
│   │   ├── services/       # API clients (axios-based api.ts)
│   │   ├── store/          # Zustand state stores and shared types (App)
│   │   ├── App.tsx         # Routes definition
│   │   └── main.tsx        # Vite entry point
│   ├── .eslintrc.cjs       # ESLint config (eslint:recommended + react-hooks)
│   ├── tsconfig.json       # Strict TS config with `@/*` path alias to ./src/*
│   └── vite.config.ts      # Dev server on :3000, proxies /api -> :3003
├── backend/                # Node.js + Express REST API
│   ├── src/
│   │   ├── database/init.js  # SQLite connection + schema bootstrap
│   │   ├── models/App.js     # App model (CRUD over apps table)
│   │   ├── routes/apps.js    # REST routes + Joi validation
│   │   └── index.js          # Express server entry (middleware + routes)
│   ├── .env.example         # Environment variable template
│   └── package.json
└── PRDs/                   # Product requirement documents
```

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

The frontend is TypeScript; the backend is plain CommonJS JavaScript (`require`/`module.exports`). Match this split when adding code: do not introduce ESM `import` syntax in the backend or CommonJS `require` in the frontend.

## Setup

From the repository root:

```bash
# Install root, frontend, and backend dependencies together
npm run install:all

# Copy backend environment config
cp backend/.env.example backend/.env
```

The backend reads `PORT`, `DB_PATH`, `CORS_ORIGIN`, `JWT_SECRET`, and other vars from `backend/.env` via `dotenv`. The dev backend listens on port 3003 (despite `PORT=3001` in `.env.example`, `src/index.js` falls back to 3003).

## Common Commands

All commands assume the repository root unless noted.

| Task                     | Command                       |
| ------------------------ | ----------------------------- |
| Install all deps         | `npm run install:all`         |
| Start frontend + backend | `npm run dev`                 |
| Start frontend only      | `npm run dev:frontend`        |
| Start backend only       | `npm run dev:backend`         |
| Build frontend + backend | `npm run build`               |
| Lint frontend            | `cd frontend && npm run lint` |
| Run backend tests        | `cd backend && npm test`      |

- Frontend dev server: `http://localhost:3000` (proxies `/api` to the backend).
- Backend API: `http://localhost:3003/api`.
- Health check: `http://localhost:3003/api/health`.

## Build & Test

- **Frontend build**: `npm run build:frontend` runs `vite build` and outputs to `frontend/dist/`. In production the backend serves this directory as static files and falls back to `index.html` for SPA routes.
- **Backend build**: the `build` script is a no-op (`echo 'Backend build completed'`); the backend runs directly from source via `node src/index.js`.
- **Backend tests**: `cd backend && npm test` runs Jest. Tests are expected to use `supertest` (already a devDependency); add test files under `backend/` following Jest conventions.
- **Frontend lint**: ESLint is configured in `frontend/.eslintrc.cjs` with `eslint:recommended`, `@typescript-eslint/recommended`, and `react-hooks/recommended`. Run with `--max-warnings 0` (CI will fail on warnings).

There is no frontend test runner configured; do not assume Jest/Vitest is available on the frontend without setup.

## Architecture & Conventions

### Frontend

- **Routing**: `react-router-dom` v6. Routes are defined in `src/App.tsx`. `HomePage` is served at `/`; `DevelopmentPage` at `/app/:appId`.
- **State**: Zustand stores in `src/store/`. The primary store (`appStore.ts`) also defines the shared `App` type imported by the API service.
- **API layer**: `src/services/api.ts` creates a shared axios instance (`baseURL: '/api'`) and exports `appApi` with `getApps`, `createApp`, `getApp`, `updateApp`, `deleteApp`. Add new endpoints by extending this object rather than creating ad-hoc axios calls.
- **Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json`). Prefer `@/...` imports for cross-directory references.
- **TypeScript**: `tsconfig.json` has `strict`, `noUnusedLocals`, and `noUnusedParameters` enabled. Do not leave unused variables or parameters; the lint and type-check will fail.
- **UI library**: Ant Design (`antd`) and `@ant-design/icons`. Styling uses `styled-components` and the global `src/index.css`.

### Backend

- **Entry**: `src/index.js` wires middleware (helmet, cors, morgan, express.json) and mounts routes under `/api/apps`. It also serves the built frontend and provides SPA fallback.
- **Models**: `src/models/App.js` is the only model and wraps the `apps` table. It uses callback-style `sqlite3` APIs wrapped in Promises. Follow the same Promise-wrapping pattern when adding models.
- **Routes**: `src/routes/apps.js` defines CRUD endpoints with Joi validation. Validation schemas (`createAppSchema`, `updateAppSchema`) sit at the top of the file. Error responses are in Chinese to match the existing UI; keep error message language consistent.
- **Database**: `src/database/init.js` creates the SQLite file under `src/data/` (gitignored) and bootstraps the `apps` and `app_code` tables. The DB connection is a module-level singleton accessed via `getDatabase()`. Never commit the `.db` file.
- **Validation**: All request bodies are validated with Joi before reaching the model layer. Always validate input in the route handler; do not push unvalidated data to models.
- **Naming**: Backend files use `PascalCase` for models (`App.js`) and `lowerCamelCase` for route modules (`apps.js`). DB columns use `snake_case`; API responses use `camelCase` (the model maps between the two).

### API Surface

| Method   | Endpoint         | Description          |
| -------- | ----------------- | -------------------- |
| `GET`    | `/api/apps`       | List all apps        |
| `GET`    | `/api/apps/:id`   | Get a single app     |
| `POST`   | `/api/apps`       | Create an app        |
| `PUT`    | `/api/apps/:id`   | Update an app        |
| `DELETE` | `/api/apps/:id`   | Delete an app        |
| `GET`    | `/api/health`     | Server health check  |

### Database Schema

- `apps`: `id` (PK, UUID), `name` (UNIQUE), `description`, `created_at`, `updated_at`.
- `app_code`: `id` (PK), `app_id` (FK -> apps, ON DELETE CASCADE), `requirement`, `generated_code`, `created_at`.

Schema changes must be additive and backward compatible: add new columns with defaults, and extend `initDatabase()` rather than dropping/recreating tables in a migration.

## Environment Variables

Configure in `backend/.env` (copy from `backend/.env.example`):

- `PORT` - backend port (defaults to 3003 in code).
- `NODE_ENV` - `development` or `production`.
- `DB_PATH` - SQLite database file path.
- `CORS_ORIGIN` - allowed origin for CORS.
- `JWT_SECRET`, `SESSION_SECRET` - secrets for auth (rotate before production).
- `MAX_FILE_SIZE`, `UPLOAD_DIR` - file upload limits.
- `API_RATE_LIMIT`, `API_WINDOW_MS` - rate limiting config.

Never commit real secrets. `.env` is gitignored.

## Agent Workflow

1. **Understand the scope**: This is a monorepo with two independently versioned packages. Determine whether a change is frontend, backend, or both before editing.
2. **Install before running**: Run `npm run install:all` from the root first. Frontend and backend each have their own `node_modules`.
3. **Validate changes**:
   - Frontend: run `cd frontend && npm run lint` before considering work done. Fix all warnings (`--max-warnings 0`).
   - Backend: run `cd backend && npm test` if tests exist for the touched code. Ensure the server still boots with `npm run dev:backend`.
   - Both: ensure `npm run build` succeeds from the root.
4. **Keep error messages consistent**: existing API errors are in Chinese to match the frontend. Match the surrounding language and tone.
5. **Respect the language split**: TypeScript/ESM in `frontend/`, CommonJS JavaScript in `backend/`. Do not mix module systems.
6. **Database changes**: extend `initDatabase()` in `backend/src/database/init.js`. The SQLite file lives under `backend/src/data/` and is gitignored, so schema bootstrapping runs on every fresh start.
7. **PRs**: Keep changes focused. Reference the relevant PRD in `PRDs/` if the work implements a documented requirement.
