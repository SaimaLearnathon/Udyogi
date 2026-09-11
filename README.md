# Uddogi

Uddogi is a Bangla-first web app that helps founders turn startup ideas into structured plans and find suitable teammates.

This repository is scaffolded from `srs.md` and `guideline.md`.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI, Framer Motion, lucide-react.
- Backend: Node.js, TypeScript, Fastify, PostgreSQL, pg.
- Tests: Playwright for frontend flows and Node/tsx tests for backend modules.

## Development

Frontend:

```sh
npm install
npm run dev
npm run build
npm run test:e2e
```

Backend:

```sh
cd server
npm install
npm run dev
npm run build
npm test
npm run db:migrate
```

## Project Shape

- `src/` contains the Bangla-first frontend shell and mock workspace screens.
- `server/` contains the backend skeleton, route modules, database helpers, migrations, and starter tests.
