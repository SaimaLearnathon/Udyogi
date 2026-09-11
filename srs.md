# Software Requirements Specification (SRS)

## Project: Uddogi

**Version:** 1.1  
**Date:** September 11, 2026  
**Status:** Fresh-project build specification

---

## 1. Introduction

### 1.1 Purpose

This SRS defines the requirements for **Uddogi**, a Bangla-first web application that helps founders turn startup ideas into structured plans and find suitable teammates.

The product combines:

1. **AI Startup Consultant**: an AI-guided ideation and validation flow that produces structured thesis documents.
2. **Thesis Workspace**: a private workspace for draft, confirmed, versioned, exported, and optionally published startup plans.
3. **Teammate Matching**: profile-based discovery, deterministic match scoring, connection requests, and private messaging.

This document is intended for developers and AI coding agents creating a new project that matches the target architecture and behavior.

### 1.2 Scope

Uddogi v1 shall include:

- Responsive Bangla web UI for desktop and mobile browsers.
- Authenticated user accounts.
- Founder/seeker profiles with skills, field, interests, availability, and privacy-aware location.
- AI consultant screens with ideation and validation modes.
- Thesis workspace for startup plan review and versioning.
- Published listing board for confirmed ideas.
- Deterministic teammate matching score breakdowns.
- Connection request and message-thread foundation.
- Backend API, PostgreSQL schema, migrations, and automated tests.

Out of scope for v1:

- Payments.
- Legal document generation.
- E-signatures.
- Video calling.
- Cap table or equity management.
- Verified professional credentials.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| Uddogi | The product name; a Bangla-first startup planning and teammate matching app. |
| Founder | A user creating, validating, and publishing an idea. |
| Seeker | A user looking for a project or team to join. |
| Thesis | The structured startup plan produced from consultant conversations. |
| Published Listing | A public or semi-public summary of a confirmed thesis. |
| Match Score | A deterministic 0-100 score showing fit between a seeker and a listing role. |
| Taxonomy | Shared canonical skill, field, and interest tags used for matching. |
| Gemini | The AI provider used for consultant reasoning and structured thesis generation. |

---

## 2. Product Overview

### 2.1 Product Perspective

Uddogi is a standalone web platform with a React frontend and a Fastify/PostgreSQL backend.

The AI consultant must be a thin orchestration layer over Gemini. Application code may manage state, transport, validation, persistence, and rendering, but must not hardcode consultant reasoning with decision trees.

The matching module is intentionally deterministic. Users must be able to see why a match score was produced.

### 2.2 User Classes

| User Class | Description |
|---|---|
| Founder | Validates an idea, confirms a thesis, optionally publishes a listing, reviews candidates. |
| Seeker | Creates a profile, browses listings, receives match scores, sends connection requests. |
| Dual-role User | Can both publish ideas and apply to join other ideas. |
| Admin | Future role for moderation, taxonomy management, and operational review. |

### 2.3 Operating Environment

- Client: modern Chrome, Edge, Safari, Firefox.
- Frontend runtime: Vite React app.
- Backend runtime: Node.js TypeScript service.
- Database: PostgreSQL.
- Development database/testing: PGlite allowed for backend tests.
- AI provider: Gemini API over HTTPS.

---

## 3. Target Architecture

### 3.1 Frontend Stack

- React 19.
- TypeScript.
- Vite.
- Tailwind CSS v4.
- DaisyUI.
- Framer Motion.
- lucide-react.
- Hind Siliguri for Bangla typography.

### 3.2 Backend Stack

- Node.js.
- TypeScript.
- Fastify.
- PostgreSQL using `pg`.
- SQL migrations.
- `tsx` for local dev/test execution.

### 3.3 Required Frontend Structure

```text
src/
  App.tsx
  main.tsx
  api/
    client.ts
    auth.ts
    profile.ts
  pages/
    LoginPage.tsx
    OnboardingPage.tsx
    ConsultantPage.tsx
    WorkspacePage.tsx
    ThesisPage.tsx
    MatchingPage.tsx
    MessagesPage.tsx
    ProfilePage.tsx
  components/
    layout/
    ui/
    matching/
    thesis/
  context/
    AuthContext.tsx
    DemoContext.tsx
    NavigationContext.tsx
  config/
    navigation.ts
    profile.ts
  data/
  hooks/
  styles/
  types/
  utils/
```

### 3.4 Required Backend Structure

```text
server/
  src/
    app.ts
    index.ts
    config/
      env.ts
    db/
      pool.ts
      queryable.ts
      migrations.ts
      migrate.ts
    modules/
      health/
        routes.ts
      auth/
        routes.ts
        session.ts
        password.ts
  migrations/
    001_initial_schema.sql
    002_seed_taxonomy.sql
    003_auth_sessions.sql
    004_user_custom_skills.sql
  tests/
    auth.test.ts
    health.test.ts
    schema.test.ts
```

---

## 4. Functional Requirements

### 4.1 Authentication

- FR-AUTH-1: The system shall support email/password registration.
- FR-AUTH-2: The system shall support email/password login.
- FR-AUTH-3: The backend shall issue opaque session tokens, not JWTs by default.
- FR-AUTH-4: Session tokens shall be stored hashed in `auth_sessions`.
- FR-AUTH-5: The frontend shall store the token and public user locally for session continuity.
- FR-AUTH-6: When a stored token exists, the frontend shall call `GET /api/profile` to refresh the authenticated user.
- FR-AUTH-7: Logout shall clear frontend auth state and should revoke the current server session when the endpoint exists.
- FR-AUTH-8: Invalid auth requests shall return clear errors that can be displayed in Bangla.

### 4.2 Profile

- FR-PROF-1: Each user shall maintain a public profile with name, bio, role flags, availability, field, skills, interests, and public location.
- FR-PROF-2: A user may act as founder, seeker, or both.
- FR-PROF-3: Availability shall support `full_time`, `part_time`, and `advisor`.
- FR-PROF-4: Location precision shall support `exact`, `city`, and `region`.
- FR-PROF-5: The UI may show Bangla labels, but API payloads shall use normalized backend values.
- FR-PROF-6: Profile skills shall support taxonomy-backed skill tags and user custom skills.
- FR-PROF-7: Profile updates shall preserve privacy constraints and shall not return private database rows.
- FR-PROF-8: Profile create/update must record location consent when public location data is supplied.

### 4.3 AI Startup Consultant

- FR-AI-1: Users shall choose between ideation mode and validation mode when starting a consultant session.
- FR-AI-2: Ideation mode shall help users discover possible startup ideas based on background, skills, interests, resources, and risk appetite.
- FR-AI-3: Validation mode shall interview users about an existing idea.
- FR-AI-4: Gemini shall decide question order, depth, follow-ups, feasibility reasoning, roadmap content, and required skillsets.
- FR-AI-5: Application code shall not contain deterministic consultant question trees.
- FR-AI-6: The backend shall send relevant conversation context to Gemini on every turn.
- FR-AI-7: The backend shall request structured JSON for thesis output.
- FR-AI-8: Gemini keys must remain server-side only.
- FR-AI-9: Model calls shall be logged for status, purpose, model version, and token usage.

### 4.4 Thesis Workspace

- FR-THESIS-1: Each user shall have a workspace listing draft and confirmed consultant sessions.
- FR-THESIS-2: A thesis shall contain eight structured sections:
  1. Idea summary.
  2. Feasibility assessment.
  3. Market analysis.
  4. Licensing or legal considerations.
  5. MVP roadmap.
  6. Financial evaluation.
  7. Required resources.
  8. Required skillsets.
- FR-THESIS-3: Users shall explicitly confirm a thesis.
- FR-THESIS-4: Confirming a thesis shall create an immutable confirmed version.
- FR-THESIS-5: Later changes shall create new versions instead of mutating confirmed versions.
- FR-THESIS-6: Draft sessions shall remain private.
- FR-THESIS-7: Confirmed theses shall only become visible in matching after explicit publish consent.
- FR-THESIS-8: The system shall store raw model output alongside validated parsed thesis data.
- FR-THESIS-9: Licensing and financial sections shall include informational-only disclaimers.

### 4.5 Published Listings

- FR-LIST-1: A founder may publish a confirmed thesis as a listing.
- FR-LIST-2: A founder may confirm a thesis without publishing it.
- FR-LIST-3: Published listings shall show title, short pitch, required roles/skills, field, founder summary, and location according to chosen precision.
- FR-LIST-4: A founder may edit the public listing summary without changing the private thesis.
- FR-LIST-5: A founder may pause or unpublish a listing.

### 4.6 Matching

- FR-MATCH-1: Seekers shall browse and search published listings.
- FR-MATCH-2: Search shall support skill, field, location, recency, distance, and match-score sorting.
- FR-MATCH-3: The system shall compute match scores deterministically.
- FR-MATCH-4: The UI shall show component score breakdowns.
- FR-MATCH-5: Founders shall be able to view ranked candidate seekers for listing roles.
- FR-MATCH-6: Match weights shall come from `matching_config`.

### 4.7 Connection Requests and Messaging

- FR-CONN-1: A seeker may send a connection request for a specific listing role.
- FR-CONN-2: A founder may accept or decline a request.
- FR-CONN-3: Accepted requests shall create a private message thread.
- FR-CONN-4: Only request participants may read or write messages in the thread.
- FR-CONN-5: Messages shall be persisted with encrypted content before production use.

---

## 5. API Requirements

### 5.1 Auth/Profile Endpoints

The frontend shall call the backend through the Vite `/api` proxy.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create user and session. |
| POST | `/api/auth/login` | Create session for existing user. |
| POST | `/api/auth/logout` | Revoke current session when implemented. |
| GET | `/api/profile` | Return current public user profile. |
| PATCH | `/api/profile` | Update current public user profile. |

### 5.2 Registration Payload

```json
{
  "email": "user@example.com",
  "password": "minimum-8-chars",
  "publicName": "string",
  "publicBio": "string",
  "isFounder": true,
  "isSeeker": true,
  "availability": "full_time",
  "location": {
    "city": "Dhaka",
    "region": "Dhaka",
    "country": "Bangladesh"
  },
  "field": "string",
  "precision": "city",
  "skills": ["string"],
  "interests": "string"
}
```

### 5.3 Public User Response

```json
{
  "id": "uuid",
  "publicName": "string",
  "publicBio": "string",
  "isFounder": true,
  "isSeeker": true,
  "availability": "part_time",
  "field": "string",
  "skills": ["string"],
  "interests": ["string"],
  "location": {
    "city": "string",
    "region": "string",
    "country": "string"
  }
}
```

---

## 6. Data Requirements

### 6.1 Core Tables

The database shall include:

- `users`
- `auth_sessions`
- `field_taxonomy`
- `field_adjacencies`
- `skill_taxonomy`
- `interest_taxonomy`
- `user_skills`
- `user_custom_skills`
- `user_fields`
- `user_interests`
- `consultant_sessions`
- `consultant_messages`
- `theses`
- `thesis_skills`
- `published_listings`
- `listing_roles`
- `listing_role_skills`
- `listing_interests`
- `matching_config`
- `match_scores`
- `connection_requests`
- `message_threads`
- `messages`
- `model_calls`

### 6.2 Privacy-Sensitive Data

- Email lookup shall use HMAC.
- Email ciphertext shall be isolated for application encryption.
- Private profile, precise location, consultant messages, thesis documents, raw model output, and messages shall be encrypted before production use.
- Public endpoints must return only explicit public fields.

### 6.3 Thesis JSON Schema

```json
{
  "idea_summary": {
    "problem": "string",
    "solution": "string",
    "target_customer": "string",
    "value_proposition": "string"
  },
  "feasibility_assessment": {
    "rating": "Low | Medium | High",
    "rationale": "string"
  },
  "market_analysis": {
    "market_description": "string",
    "target_segment": "string",
    "competitors": ["string"],
    "differentiation": "string"
  },
  "licensing_notes": "string",
  "mvp_roadmap": [
    {
      "phase": "string",
      "description": "string",
      "estimated_timeframe": "string"
    }
  ],
  "financial_evaluation": {
    "estimated_cost_categories": ["string"],
    "revenue_model": "string",
    "runway_notes": "string"
  },
  "required_resources": ["string"],
  "required_skillsets": [
    {
      "skill_tag": "string",
      "description": "string",
      "priority": "High | Medium | Low"
    }
  ]
}
```

---

## 7. Matching Algorithm

### 7.1 Formula

```text
total_score =
  skill_score * skill_weight +
  location_score * location_weight +
  field_score * field_weight +
  interest_score * interest_weight
```

Default weights:

```text
skill_weight = 40
location_weight = 20
field_weight = 20
interest_weight = 20
```

Weights shall be read from `matching_config` and must total 100.

### 7.2 Component Scores

- `skill_score`: Jaccard overlap between seeker skills and role-required skills after taxonomy normalization.
- `location_score`: Haversine distance score when exact location is available; stepped city/region/country score when precision is coarse.
- `field_score`: 1.0 exact field match, 0.5 taxonomy-adjacent field, 0 otherwise.
- `interest_score`: Jaccard overlap between seeker interests and listing interests.

### 7.3 Explainability

The system shall store raw component scores, weights, weighted contributions, total score, config version, and computed time.

---

## 8. User Interface Requirements

- UI copy shall be Bangla-first.
- The product shall feel like a practical founder workspace, not a generic landing page.
- Use DaisyUI components consistently.
- Use lucide-react icons for actions.
- Use cards only for appropriate repeated items, forms, modals, or focused panels.
- Consultant chat shall support streaming and typing states once the AI backend is implemented.
- Thesis workspace shall show scannable tabs/sections instead of a wall of chat text.
- Matching UI shall show score totals and component breakdowns.
- Core flows shall be responsive on mobile and desktop.
- Motion shall be subtle and must respect `prefers-reduced-motion`.
- Target WCAG 2.1 AA.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Server-side secrets only, hashed session tokens, HMAC email lookup, no private row leakage. |
| Privacy | User-controlled location precision and explicit publish/location consent. |
| Reliability | Consultant sessions and profile changes must not silently lose user progress. |
| Performance | Profile/auth calls should feel immediate; matching queries should return within 2 seconds for moderate datasets. |
| Auditability | Store model call metadata and raw model output. |
| Cost Control | Track Gemini token usage and add rate limiting before production use. |
| Accessibility | WCAG 2.1 AA target for primary flows. |
| Maintainability | Use small API modules, shared profile config, typed payloads, and focused tests. |

---

## 10. Testing Requirements

### 10.1 Frontend

- Build shall pass with `npm run build`.
- Key flows shall be covered by Playwright:
  - onboarding navigation
  - login/register screen behavior
  - profile editing
  - workspace navigation
  - matching board interaction

### 10.2 Backend

- Build shall pass with `npm run build` inside `server/`.
- Tests shall run with `npm test` inside `server/`.
- Backend tests shall cover:
  - health route
  - schema migrations
  - registration
  - login
  - profile fetch/update
  - custom skills
  - interests
  - location precision
  - invalid payloads
  - expired/revoked sessions

---

## 11. Build Order

1. Scaffold frontend and backend project structure.
2. Build Bangla frontend shell with mock data for all major screens.
3. Build backend schema, migrations, health route, and tests.
4. Implement auth/profile APIs.
5. Wire frontend login/register/profile to real backend APIs.
6. Add frontend API client modules and shared profile config.
7. Harden auth/profile validation, session revocation, location precision, and tests.
8. Implement Gemini consultant orchestration.
9. Implement real thesis persistence and versioning.
10. Implement publishing flow.
11. Implement deterministic matching and score UI.
12. Implement connection requests and messages.
13. Add production hardening: encryption, rate limits, logging, accessibility, and deployment config.

---

## 12. Open Issues

- Exact Gemini model version must be selected before AI implementation.
- Final encryption approach for email/profile/location/message/thesis data must be selected before production.
- Legal and financial disclaimer wording should be reviewed before launch.
- Admin moderation and taxonomy management can be deferred unless needed for initial deployment.
- Live web grounding for market analysis is optional for v1.

---

## 13. Development Commands

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

---

End of SRS.
