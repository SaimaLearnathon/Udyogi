# Uddogi Fresh Project Prompt

Paste this into Claude Code, Codex, or another coding agent to create a new project with the same architecture and product behavior.

```
You are creating a new project named Uddogi from scratch.
Build the same frontend/backend structure, route contracts, database schema, auth/profile flow, and feature roadmap described below.
Start by scaffolding the project, then implement the files and modules listed in this prompt.

PROJECT GOAL
Uddogi is a Bangla-first web app for helping people turn startup ideas into real projects.
It has three main product areas:
- AI startup consultant: ideation and validation conversations that produce structured thesis documents.
- Thesis workspace: save, confirm, version, export, and optionally publish startup plans.
- Teammate matching: profiles, published listings, deterministic match scores, connection requests, and messages.

CURRENT STACK
- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI, Framer Motion, lucide-react.
- Backend: Node.js, TypeScript, Fastify, PostgreSQL, pg.
- Tests: Playwright for frontend flows, Node/tsx tests with PGlite for backend schema/auth/health.
- Language/UI: all user-facing UI copy should be Bangla. Keep the product feeling like a practical place where Bangladesh-based founders can make an idea real.

TARGET IMPLEMENTATION STATE
Create a working frontend shell with mock/demo data first, plus a separate backend with real auth/profile APIs.
Use the exact structure below as the target shape unless there is a concrete implementation reason to adjust it.

Required frontend structure:
- `src/App.tsx`: provider and page selection entry.
- `src/pages/LoginPage.tsx`: login/register UI, calls `/api/auth/login` and `/api/auth/register`.
- `src/pages/ProfilePage.tsx`: profile editor, calls `/api/profile` with bearer token when signed in.
- `src/pages/OnboardingPage.tsx`: entry flow.
- `src/pages/ConsultantPage.tsx`: consultant UI.
- `src/pages/WorkspacePage.tsx` and `src/pages/ThesisPage.tsx`: thesis workspace and document view.
- `src/pages/MatchingPage.tsx`: listing/search/match board.
- `src/pages/MessagesPage.tsx`: messages/inbox UI.
- `src/context/AuthContext.tsx`: stores token and public user in localStorage.
- `src/context/DemoContext.tsx`: shared demo state.
- `src/context/NavigationContext.tsx`: hash/page navigation.
- `src/utils/profilePayload.ts`: maps frontend profile form data to API payload and back.
- `src/components/ui/*`: shared small UI pieces.
- `src/components/layout/*`: app shell/sidebar.
- `src/components/matching/*` and `src/components/thesis/*`: feature components.

Required backend structure:
- `server/src/app.ts`: Fastify app setup.
- `server/src/index.ts`: server entrypoint.
- `server/src/config/env.ts`: environment config.
- `server/src/db/*`: pool, migrations, migrate runner, query abstraction.
- `server/src/modules/health/routes.ts`: health route.
- `server/src/modules/auth/routes.ts`: register/login/profile routes.
- `server/src/modules/auth/session.ts`: HMAC email lookup, session token creation/hash lookup, public user shape.
- `server/src/modules/auth/password.ts`: password hashing/verification.
- `server/migrations/001_initial_schema.sql`: main PostgreSQL schema for taxonomy, users, consultant sessions, theses, listings, matching, connection requests, messages, model calls.
- `server/migrations/002_seed_taxonomy.sql`: Bangla taxonomy seed data.
- `server/migrations/003_auth_sessions.sql`: auth session table.
- `server/migrations/004_user_custom_skills.sql`: custom user skills.
- `server/tests/auth.test.ts`, `health.test.ts`, `schema.test.ts`: backend tests.

AUTH / PROFILE CONTRACT
The frontend must use these endpoints through the Vite dev proxy:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`
- `PATCH /api/profile`

Register payload shape from the frontend must be:
{
  "email": string,
  "password": string,
  "publicName": string,
  "publicBio": string,
  "isFounder": true,
  "isSeeker": true,
  "availability": "full_time" | "part_time" | "advisor",
  "location": { "city": string, "region": string, "country": string },
  "field": string,
  "precision": string,
  "skills": string[],
  "interests": string
}

Backend response user shape must be:
{
  "id": string,
  "publicName": string,
  "publicBio": string,
  "isFounder": boolean,
  "isSeeker": boolean,
  "availability": "full_time" | "part_time" | "advisor",
  "field": string | null,
  "skills": string[],
  "interests": string[],
  "location": { "city": string | null, "region": string | null, "country": string | null }
}

Auth implementation notes:
- Use opaque session tokens, not JWTs, unless the user explicitly asks for JWT.
- Tokens are stored hashed in `auth_sessions`.
- Emails should use HMAC lookup. If full application encryption is not implemented yet, keep the ciphertext field isolated and clearly marked as pending.
- Profile save supports taxonomy-backed skills plus `user_custom_skills`.
- Location consent exists in schema. Preserve user privacy and precision choices.

BUILD PRIORITIES
Work in this order:

1. Stabilize Auth/Profile End-to-End
   - Ensure Vite proxies `/api` to the backend in development.
   - Ensure login/register/profile flows work against the real backend.
   - Add or fix frontend handling for `GET /api/profile` on app load when a token exists.
   - Add logout server behavior if needed: revoke the current auth session instead of only clearing localStorage.
   - Normalize profile `precision` mapping between Bangla UI labels and backend values: `exact`, `city`, `region`.
   - Validate and display backend errors in Bangla.
   - Keep the demo/offline fallback only if clearly separated from authenticated real data.

2. Improve Project Structure Without Rewriting Everything
   - Add a small frontend API layer, for example `src/api/client.ts`, `src/api/auth.ts`, and `src/api/profile.ts`, so fetch calls are not duplicated in pages.
   - Move repeated profile constants/options into a shared config file, for example `src/config/profile.ts`.
   - Keep page-specific form state inside pages, but move cross-page data contracts into `src/types` or feature-specific modules.
   - Avoid large abstractions unless they simplify actual duplication.
   - Preserve the current feature folders: `pages`, `components`, `context`, `data`, `hooks`, `config`, `utils`, `styles`.

3. Encoding and Bangla Copy Quality
   - Make sure all Bangla text renders correctly as UTF-8.
   - Do not introduce mojibake or broken encoded strings.
   - Set up and use Hind Siliguri for Bangla typography.
   - Keep user-facing copy concise, practical, and founder-focused.

4. Backend Auth/Profile Hardening
   - Add stricter request validation where needed.
   - Persist `location_precision` correctly.
   - Return custom skills and taxonomy skills consistently.
   - Add tests for profile update, custom skills, interests, location precision, expired/revoked sessions, and invalid payloads.
   - Keep PII out of public responses.

5. AI Consultant Service
   - Add a server-side Gemini integration only after auth/profile are stable.
   - The backend should orchestrate conversation state, call Gemini server-side, validate structured JSON, persist messages/theses, and stream responses.
   - Do not hardcode consultant question trees in application code. Consultant reasoning belongs in Gemini prompts.
   - Use deterministic code only for matching scores, validation, persistence, auth, and transport.

6. Thesis Workspace Real Data
   - Replace mock thesis/session data with authenticated API-backed sessions.
   - Persist draft and confirmed thesis versions.
   - Confirmed thesis versions must remain immutable.
   - Store raw model output alongside validated parsed thesis data.
   - Keep licensing and financial sections clearly informational only, not legal/financial advice.

7. Publishing and Matching
   - Build published listing APIs from confirmed theses.
   - Keep public listing summaries editable independently from the private thesis.
   - Normalize required skillsets into taxonomy tags with a Gemini classification call when needed.
   - Implement deterministic match scoring exactly from stored components:
     total_score =
       40 * skill_score +
       20 * location_score +
       20 * field_score +
       20 * interest_score
   - Read weights from `matching_config`, not magic numbers.
   - Store each component and show transparent score breakdowns in the UI.

8. Connection Requests and Messages
   - Implement seeker-to-founder connection requests for a specific role.
   - Founder can accept/decline.
   - Accepted requests create a private message thread.
   - Enforce participant checks on all message reads/writes.

NON-FUNCTIONAL REQUIREMENTS
- Keep all Gemini/API keys server-side only.
- Add rate limiting and model-call logging before production use.
- Encrypt sensitive profile, location, conversation, message, thesis, and raw model data before production use.
- Respect WCAG 2.1 AA for core flows.
- Respect `prefers-reduced-motion`.
- Use DaisyUI/lucide patterns consistently. Keep the app dense, useful, and calm, not a generic landing page.
- Do not use LLMs for deterministic matching decisions.
- Do not return whole database rows from public endpoints.

DEVELOPMENT COMMANDS
Frontend:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test:e2e`

Backend:
- `cd server`
- `npm install`
- `npm run dev`
- `npm run build`
- `npm test`
- `npm run db:migrate`

QUALITY BAR BEFORE FINISHING A CHANGE
- Run the relevant build/test commands.
- Update tests for auth/profile/backend contract changes.
- Manually verify the key flow touched by the change.
- Summarize exactly what changed and any remaining gaps.

START NOW
First scaffold the frontend and backend project structure.
Then implement priority 1: auth/profile end-to-end, with the smallest project-structure improvements needed to support it.
```
