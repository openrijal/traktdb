# Implementation Plan: Trakt.tv Integration - Smart Calendar / Upcoming Releases

**Branch**: `003-trakt-upcoming-calendar` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-trakt-upcoming-calendar/spec.md`

## Summary

Implement a personalized upcoming releases calendar on the homepage that fetches data from Trakt.tv Calendar API endpoints (`/calendars/my/shows` and `/calendars/my/movies`). The feature displays episodes from tracked shows and movies in the user's collection that release within a 30-day window, grouped by date with poster images from TMDB. Uses 1-hour server-side TTL caching plus client-side session cache.

## Technical Context

**Language/Version**: TypeScript 5.x (Astro project)  
**Primary Dependencies**: Trakt.tv API, TMDB API (existing), date-fns (new)  
**Storage**: PostgreSQL + Drizzle ORM (existing), Trakt OAuth tokens in `accountConnections` table  
**Testing**: Vitest (existing)  
**Target Platform**: Web (Astro + Vue.js)  
**Performance Goals**: <3s page load (cached), <5s (fresh API), 95% image load success  
**Constraints**: <200ms API response time target, Trakt rate limit: 1,000 req/5min  
**Scale/Scope**: Single-user dashboard widget, ~30 days of content per request

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Verification-First | ✅ Pass | Will implement unit tests for API client, manual walkthrough for UI |
| II. Spec-Driven | ✅ Pass | Following spec-first workflow with clarifications resolved |
| III. Aesthetic & UX | ✅ Pass | Extends existing MediaCard component patterns |
| IV. Architecture & Type Safety | ✅ Pass | Factory pattern for API client, strict TypeScript |
| V. User Partnership | ✅ Pass | Clarifications documented in spec |

## Project Structure

### Documentation (this feature)

```
specs/003-trakt-upcoming-calendar/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── api.yml          # OpenAPI spec for calendar endpoints
│   └── types.yml        # TypeScript type definitions
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```
src/
├── lib/
│   ├── trakt.ts         # NEW: Trakt API client factory
│   └── date.ts          # NEW: Date formatting utilities (date-fns wrapper)
├── pages/api/
│   └── calendar/
│       └── upcoming.ts   # NEW: Calendar API endpoint (30-day fetch)
├── components/
│   └── dashboard/
│       └── UpcomingList.vue  # EXISTING: Placeholder to implement
└── types/
    └── calendar.ts      # NEW: TypeScript interfaces for calendar data
```

**Structure Decision**: Follows existing patterns:
- `src/lib/` for API clients (like `tmdb.ts`)
- `src/pages/api/` for endpoints (file-based routing)
- `src/components/dashboard/` for dashboard widgets

## Complexity Tracking

> **None** - No constitution violations requiring justification.
