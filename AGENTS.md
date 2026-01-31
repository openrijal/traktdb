# AGENTS.md

## Project Overview
TraktDB is a media tracking app built with Astro, Vue, DrizzleORM, and Capacitor. Uses BetterAuth for authentication with Google OAuth, Neon PostgreSQL for the database, and integrates with TMDB, Google Books, and iTunes APIs.

## Quick Start
```bash
pnpm install
cp .env.example .env  # Configure your API keys
pnpm db:migrate
pnpm dev
```

## Key Directories
- `src/components/` - Vue components (ShadCN-Vue based)
- `src/pages/` - Astro pages and API routes
- `src/lib/` - Services and utilities (auth, db, TMDB, etc.)
- `src/stores/` - Pinia stores for state management
- `drizzle/` - Database schema and migrations
- `specs/` - Feature specifications and PRD

## Specifications
Feature specs are in `specs/001-media-tracking-core/`:
- `spec.md` - Product Requirements Document
- `plan.md` - Technical implementation plan  
- `tasks.md` - Task breakdown with status
- `data-model.md` - Entity definitions
- `research.md` - Technology decisions

Constitution (project principles): `.specify/memory/constitution.md`

## Database
- **ORM**: DrizzleORM
- **Provider**: Neon PostgreSQL (serverless)
- **Commands**:
  - `pnpm db:generate` - Generate migrations from schema changes
  - `pnpm db:migrate` - Run pending migrations
  - `pnpm db:studio` - Open Drizzle Studio

## Authentication
- **Library**: BetterAuth
- **Method**: Google OAuth only (no password auth)
- **Protected Routes**: Use middleware in `src/middleware.ts`

## API Integrations
- **TMDB**: Movies and TV shows (`src/lib/tmdb.ts`)
- **Google Books**: Book metadata (`src/lib/google-books.ts`)
- **iTunes**: Podcast search (`src/lib/itunes.ts`)

## Mobile (Capacitor)
```bash
pnpm build
npx cap sync
# iOS: open ios/App/App.xcworkspace in Xcode
# Android: open android/ in Android Studio
```

## Testing
```bash
pnpm test        # Run all tests
pnpm test:ui     # Open Vitest UI
```

## Deployment
- **Web**: Cloudflare Pages via `pnpm deploy`
- **Mobile**: App Store / Play Store (manual)

## GitHub Issues
Track work via GitHub Issues. Key epics:
- #5 Rating & Progress System
- #6 Calendar & Scheduling
- #7 Watch Providers
- #8 Books & Podcasts
- #9 Mobile App Development
- #10 Production Readiness

## PR Guidelines
- Title format: `[feature-area] <Title>`
- Run `pnpm test` before committing
- Include migration files if schema changes
- Link to relevant GitHub issue
