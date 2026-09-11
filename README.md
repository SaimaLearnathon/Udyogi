# উদ্যোগী (Uddogi)

**Uddogi** is a Bangla-first web platform that helps founders in Bangladesh turn a raw startup idea into a structured, validated plan, then find the right teammates to build it with. It combines an AI startup consultant, a versioned thesis workspace, and a deterministic teammate-matching system in one app.

This repository was originally scaffolded from [`srs.md`](srs.md) and [`guideline.md`](guideline.md); this README describes the app as it's actually built today, which has evolved somewhat from that original spec (see [Divergence from the original spec](#divergence-from-the-original-spec) below).

## Who it's for

| User class | Description |
|---|---|
| **প্রতিষ্ঠাতা (Founder)** | Has (or is looking for) a startup idea, validates it with the AI consultant, confirms a thesis, and searches for teammates against it. |
| **সিকার (Seeker)** | Builds a profile with their skills/interests/availability, gets found by founders searching for matching skills, and can accept or decline team requests. |
| **Dual-role user** | Most accounts can be both at once — Uddogi doesn't force a single role. |

## Core functionality

### 1. AI স্টার্টআপ কনসালট্যান্ট — AI Startup Consultant
A Gemini-powered chat consultant with two modes, chosen per session:
- **আইডিয়েশন (Ideation)** — for a user with no fixed idea yet; explores their skills, interests, resources, and risk appetite to help surface possible ideas.
- **ভ্যালিডেশন (Validation)** — for a user who already has an idea; interviews them to pressure-test it.

The conversation streams token-by-token over SSE, with live status lines (e.g. "বাজার বিশ্লেষণ তৈরি করছি...") shown while the full analysis is being generated. The consultant decides question order, depth, and when it has enough information itself — the backend never hardcodes a decision tree; that reasoning lives entirely in the Gemini system prompt (`server/src/modules/consultant/gemini.ts`). The output is a structured JSON thesis produced via function calling, not free-form text.

### 2. থিসিস ওয়ার্কস্পেস — Thesis Workspace
Each consultant conversation can produce a thesis with 8 structured sections:
1. Idea summary (problem, solution, target customer, value proposition)
2. Feasibility assessment (rating + rationale)
3. Market analysis (market description, target segment, competitors, differentiation)
4. Licensing / legal notes (informational only, not legal advice)
5. MVP roadmap (phased)
6. Financial evaluation (cost categories, revenue model, runway notes — informational only, not financial advice)
7. Required resources
8. Required skillsets (tagged, with priority)

Theses are versioned. Drafting and confirming are separate, explicit steps — confirming a thesis is what makes it visible to teammate matching.

### 3. টিমমেট ম্যাচিং — Teammate Matching
Once a thesis is confirmed it acts as the listing — founders don't need a separate "publish" step. From a listing, a founder searches for candidates per required skill tag; candidates are matched by a **deterministic** score, never an LLM-decided ranking, so the ranking is always explainable:

```text
score = skill_score (0-50)        — required-skill overlap with the candidate's profile
      + location_score (6/18/30)  — 30 same city, 18 same region, 6 otherwise
      + availability_score        — 20 full-time, 12 part-time, 8 advisor
total = min(100, score)
```

The UI always shows this breakdown, not just the total. Skill matching is fuzzy/substring-based on normalized labels, so it works across both taxonomy-backed and free-text custom skills.

### 4. টিম রিকোয়েস্ট — Team Requests
Founders send a request to a candidate for a specific skill/role; the candidate accepts or declines from an inbox (the "মেসেজ" page). Accepted requests show up as a current/joined project on both the founder's and the candidate's side (the "আমার কাজ" page).

### 5. প্রোফাইল — Profiles
Founder/seeker role flags, availability (`full_time` / `part_time` / `advisor`), field, and **free-text skills and interests** — typed as tags, not picked from a fixed list. Each tag is matched against a shared taxonomy first (for fast cross-user matching) and falls back to a per-user custom-value table when it isn't a known term, so nothing a user types is ever silently dropped. Location has three privacy precision levels: exact, city, or region-only.

### 6. অনবোর্ডিং — Onboarding
The post-registration hub shows the 3 core flows and the signed-in user's **real** current activity — consultant sessions, thesis count, projects joined — not placeholder numbers.

## Tech stack

**Frontend** (`/`)

| | |
|---|---|
| Framework | React 19 + TypeScript, built with Vite 6 |
| Styling | Tailwind CSS v4 + DaisyUI 5 |
| Animation | Framer Motion 12 |
| Icons | lucide-react |
| Content rendering | react-markdown + remark-gfm (AI replies, thesis content) |
| Routing | Hash-based, no router library — see `src/context/NavigationContext.tsx` |
| Fonts | Hind Siliguri for Bangla typography |

**Backend** (`/server`)

| | |
|---|---|
| Runtime | Node.js + TypeScript, Fastify 5 |
| Database | PostgreSQL via `pg`, with a hand-rolled sequential SQL migration runner (no ORM) |
| AI provider | `@google/genai` — Gemini (default model `gemini-3.5-flash-lite`) |
| Auth | Opaque, hashed session tokens (not JWT) |
| Dev runner | `tsx` |

**Testing**
- Playwright for frontend end-to-end flows (`npm run test:e2e`)
- Node's built-in test runner via `tsx --test` for backend module tests (`npm test` in `server/`)

## Architecture principles

- **AI is an orchestration layer, not a decision tree.** The consultant's question flow, depth, and completion judgment come from the Gemini prompt, not application code. Because LLM tool-calling isn't 100% reliable in practice, the backend adds a couple of deterministic safety nets around it — e.g. it can offer the "proceed to full analysis" action itself once enough of the conversation has happened and the model's reply reads as a wrap-up rather than another question, and every Gemini call is wrapped in a bounded timeout so a stalled connection surfaces a clear error instead of hanging the chat forever.
- **Matching is deterministic, not AI-driven.** Scores come from a fixed formula in `server/src/modules/listings/routes.ts` so founders can always see and trust why a candidate ranked where they did.
- **Secrets stay server-side.** The Gemini API key is only ever read by the backend; the frontend never sees it.

## Project structure

```text
src/                          # frontend
  App.tsx                     # provider stack + page router
  api/                        # one file per backend resource (auth, consultant, thesis, listings, requests, profile)
  pages/                      # one component per screen (Landing, Login/Register, Onboarding,
                               #   Consultant, Workspace, Thesis, Matching, MyWork, Messages, Profile, ...)
  components/
    layout/                   # app shell, sidebar, mobile nav
    landing/                  # public landing page sections
    matching/                 # match score card, etc.
    profile/                  # profile sub-components
    thesis/                   # thesis section list/view
    ui/                       # shared primitives (Card, StatPill, PageHeader, ThemeToggle, ...)
  context/                    # AuthContext, NavigationContext, ThemeContext, DemoContext
  config/                     # profile option lists, motion presets, navigation config
  types/                      # shared frontend types
  utils/                      # small helpers (e.g. profile payload mapping)

server/                       # backend
  src/
    app.ts                    # Fastify app + route registration (all routes under /api)
    index.ts                  # entrypoint
    config/env.ts             # env var loading with dev-safe defaults
    db/                       # pg pool, migration runner, migrate script
    modules/
      auth/                   # register/login/logout, profile get/update, session handling
      consultant/             # Gemini orchestration + SSE chat endpoint
      thesis/                 # thesis CRUD/confirm
      listings/               # candidate search + deterministic scoring
      requests/               # team requests inbox + current projects
      health/                 # health check
  migrations/                 # sequential, idempotent SQL migrations (001 → 008+)
  tests/                      # backend module tests
```

## Getting started

### Prerequisites
- Node.js 20+
- A local PostgreSQL instance
- A Gemini API key (free tier is fine for development) for the AI consultant to work

### 1. Backend

```sh
cd server
npm install
cp .env.example .env   # then fill in DATABASE_URL, SESSION_SECRET, EMAIL_LOOKUP_SECRET, GEMINI_API_KEY
npm run db:migrate      # creates/updates all tables
npm run dev              # starts Fastify on :4000 with auto-reload
```

| Env var | Purpose |
|---|---|
| `HOST` / `PORT` | Bind address (defaults `0.0.0.0:4000`) |
| `DATABASE_URL` | Postgres connection string. `localhost` connections skip SSL automatically; anything else (Render, Neon, Supabase, ...) enables it |
| `SESSION_SECRET` | Used for session-related hashing — set a real random value outside local dev |
| `EMAIL_LOOKUP_SECRET` | HMAC key for the email lookup index (so raw emails aren't used as a DB key) |
| `GEMINI_API_KEY` | Required for the AI consultant; without it, `/consultant/*` returns a clear "not configured" error instead of crashing |
| `GEMINI_MODEL` | Defaults to `gemini-3.5-flash-lite` |

### 2. Frontend

```sh
npm install
npm run dev   # starts Vite on :5173, proxies /api to localhost:4000 (see vite.config.ts)
```

Open `http://localhost:5173`.

### Other backend commands

```sh
npm run build    # tsc -p tsconfig.json → dist/
npm start         # runs the compiled server (dist/src/index.js)
npm test           # runs tests/*.test.ts with tsx
```

### Other frontend commands

```sh
npm run build      # tsc -b && vite build
npm run preview     # preview the production build locally
npm run test:e2e     # Playwright end-to-end tests
```

## Deployment

This app deploys as two separate services:

- **Backend → Render** (or any Node host): root directory `server`, build command `npm install && npm run build`, start command `npm run db:migrate && npm start` (migrations are idempotent, safe to run on every deploy), health check path `/api/health`. Needs the same env vars as local dev, with a real `DATABASE_URL` and `GEMINI_API_KEY`.
- **Frontend → Vercel** (or any static host): root directory is the repo root. Since the frontend calls relative `/api/...` paths (matching the local dev proxy), the production host needs a rewrite from `/api/*` to the deployed backend URL — see `vercel.json` at the repo root for the exact rule used.

## Divergence from the original spec

[`srs.md`](srs.md) describes a slightly larger schema than what's actually wired up today. Migration `001_initial_schema.sql` creates `published_listings`, `listing_roles`, `connection_requests`, `message_threads`, `messages`, `matching_config`, and `match_scores` tables matching the original spec — but no application code reads or writes them. In practice:

- **Listings** are just `theses` with `status = 'confirmed'`; there's no separate publish/unpublish step or public listing summary distinct from the thesis.
- **Connection requests and messaging** run through `team_requests` (added in migration `006`/`007`), not `connection_requests`/`message_threads`/`messages`. The "মেসেজ" page is a team-request inbox (accept/decline), not a threaded chat system.
- **Match scoring** uses the simpler skill/location/availability formula documented above, not the SRS's 40/20/20/20 skill/location/field/interest weighted formula or the `matching_config`/`match_scores` tables.

None of this is broken — it's just that the product evolved past the initial scaffold without the unused tables being cleaned up. Worth knowing before assuming those tables are load-bearing.
