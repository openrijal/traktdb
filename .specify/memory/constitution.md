# TraktDB Constitution

<!-- Sync Impact Report
Version change: 1.0.0 → 1.1.0 (Updated to reflect actual implementation)
Modified: Technology Stack section to match real implementation
- Changed from Supabase to Neon PostgreSQL
- Changed from Supabase Auth to BetterAuth with Google OAuth
- Added Friends feature to scope
Templates requiring updates: ✅ Updated
-->

## Core Principles

### I. Component-First Architecture
Every UI feature MUST be built as a reusable Vue component before integration into pages. Components MUST be independently testable. Shared components live in `src/components/` using ShadCN-Vue patterns.

**Rationale**: Astro + Vue architecture demands clear component boundaries. Reusable components accelerate development and ensure visual consistency across web and mobile via Capacitor.

### II. API-First Design
All external integrations (TMDB, Google Books, iTunes/Podcasts) MUST be abstracted behind a service layer in `src/lib/`. Direct API calls from components are forbidden. Each service MUST define TypeScript interfaces for request/response contracts.

**Rationale**: Media APIs have rate limits, varying schemas, and may change. Abstraction enables caching, fallbacks, and future provider swaps without UI changes.

### III. Database-Backed State
User data (watchlists, progress, ratings) MUST be stored in PostgreSQL via DrizzleORM. Pinia stores are for UI state and caching only, not as source of truth. Database is the single source of truth.

**Rationale**: Server-side persistence enables multi-device sync and prevents data loss.

### IV. Test Coverage Requirements
- Unit tests MUST cover all service layer functions
- Integration tests MUST verify auth flows and database operations
- E2E tests MUST cover critical user journeys: search, add to library, track progress
- Run `npm test` before committing

**Rationale**: Media tracking involves complex state (episodes, progress, ratings). Tests prevent regressions.

### V. Cross-Platform Parity
Features MUST work identically on web and mobile (iOS/Android via Capacitor). Platform-specific code MUST be isolated in Capacitor plugins. UI MUST be responsive-first.

**Rationale**: Users expect seamless experience across devices.

### VI. Data Privacy & User Control
User data MUST never be shared with third parties. Authentication via Google OAuth only - no password storage.

**Rationale**: Media consumption is personal. Trust is foundational.

## Technology Stack

**Implemented stack (non-negotiable):**
- **Framework**: Astro 5.x with Vue 3 integration
- **Database**: DrizzleORM with Neon PostgreSQL (serverless)
- **Auth**: BetterAuth with Google OAuth
- **Mobile**: Capacitor 8.x for iOS/Android
- **Deployment**: Cloudflare Pages (via wrangler)
- **APIs**: 
  - TMDB (movies/TV)
  - Google Books API (books)
  - iTunes Search API (podcasts)

**Styling**: Tailwind CSS v4 with ShadCN-Vue components
**State**: Pinia with persisted state plugin
**Testing**: Vitest with happy-dom

## Features Scope

### Implemented (Closed)
- ✅ Project setup & infrastructure (#1)
- ✅ Authentication with Google OAuth (#2)
- ✅ Core database & API layer (#3)
- ✅ Media management UI basics (#4)
- ✅ Design system with ShadCN (#10)

### In Progress (Open)
- 🔄 Rating & Progress System (#5)
- 🔄 Calendar & Scheduling (#6)
- 🔄 Watch Providers & Platforms (#7)
- 🔄 Books, Audiobooks & Podcasts (#8)
- 🔄 Mobile App Development (#9)
- 🔄 Production Readiness (#10)

### Future (Not Started)
- Friends & Social features
- Collections for movie franchises
- Multi-region watch provider support

## Development Workflow

1. **Feature Specification**: Reference specs in `/specs/<feature>/spec.md`
2. **Task Breakdown**: Epics and tasks tracked via GitHub Issues
3. **Branch Strategy**: `main` (production), feature branches for work
4. **PR Requirements**: 
   - Linked to GitHub issue
   - Passing CI (tests, lint, type-check)
   - Migration files included if schema changes
5. **Database Changes**: Always generate and commit migrations

## Governance

This constitution supersedes all ad-hoc decisions. Amendments require:
1. Written proposal with rationale
2. Update to this document with version bump
3. Commit with clear message

All code reviews MUST verify compliance with these principles.

**Version**: 1.1.0 | **Ratified**: 2026-01-31 | **Last Amended**: 2026-01-31
