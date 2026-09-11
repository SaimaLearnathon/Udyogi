# Uddogi

Uddogi is a Bangla-first web application concept for helping founders turn startup ideas into structured plans and find suitable teammates.

The product is planned around three core areas:

- AI startup consultant for ideation, validation, and structured thesis generation.
- Thesis workspace for saving, confirming, versioning, exporting, and publishing startup plans.
- Teammate matching with founder/seeker profiles, deterministic match scores, connection requests, and messaging.

## Planned Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI, Framer Motion, lucide-react.
- Backend: Node.js, TypeScript, Fastify, PostgreSQL, pg.
- Tests: Playwright for frontend flows, Node/tsx tests with PGlite for backend schema, auth, and health checks.
- AI provider: Gemini for consultant reasoning and thesis generation.

## Repository Contents

- `srs.md`: Software Requirements Specification for the Uddogi v1 product.
- `guideline.md`: Fresh project prompt and implementation guidance for coding agents.
- `.gitignore`: Local ignore rules.

## Product Scope

Uddogi v1 is intended to include:

- Responsive Bangla UI for desktop and mobile browsers.
- Authenticated user accounts.
- Founder and seeker profiles.
- AI consultant screens for ideation and validation.
- Private thesis workspace and optional published listings.
- Transparent teammate match scoring.
- Connection requests and message-thread foundations.
- Backend API, PostgreSQL migrations, and automated tests.

Out of scope for v1:

- Payments.
- Legal document generation.
- E-signatures.
- Video calling.
- Cap table or equity management.
- Verified professional credentials.

## Status

This repository currently contains product and implementation planning documents for building the Uddogi application from scratch.
