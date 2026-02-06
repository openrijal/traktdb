# Implementation Tasks: Trakt.tv Integration - Smart Calendar / Upcoming Releases

**Feature**: 003-trakt-upcoming-calendar | **Generated**: 2026-02-05
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Dependency Graph

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├───────────────────────────────┐
    │                               │
    ▼                               ▼
Phase 3 [US1]                  Phase 4 [US2]
Episodes Only                  Movies Only
    │                               │
    └───────────────────────────────┘
                │
                ▼
           Phase 5 [US3]
        Navigation + UI Polish
                │
                ▼
           Phase 6 [US4]
        Visual Presentation
```

## Execution Order

1. Phase 1: Setup (dependencies for all stories)
2. Phase 2: Foundational (blocking prerequisites)
3. Phase 3: US1 Episodes (MVP - P1)
4. Phase 4: US2 Movies (P1)
5. Phase 5: US3 Navigation (P2)
6. Phase 6: US4 Visual (P2)
7. Phase 7: Polish

---

## Phase 1: Setup

**Goal**: Install dependencies and configure project for calendar feature

### Independent Test
No test - infrastructure setup only

---

- [ ] T001 Install date-fns for date formatting
  ```bash
  pnpm add date-fns
  pnpm add -D @types/date-fns
  ```
  
- [ ] T002 [P] Create Trakt API types file `src/types/calendar.ts`
  - Define `TraktCalendarShow` interface from research.md
  - Define `TraktCalendarMovie` interface from research.md
  - Define `UpcomingEpisode` interface
  - Define `UpcomingMovie` interface
  - Define `CalendarDay` interface
  - Define `UpcomingCalendar` interface
  
- [ ] T003 [P] Create Trakt API client factory `src/lib/trakt.ts`
  - Export `createTrakt(env: Env)` factory function
  - Add `getCalendarShows(startDate: string, days: number)` method
  - Add `getCalendarMovies(startDate: string, days: number)` method
  - Include proper headers: `trakt-api-version: 2`, `trakt-api-key`, `Authorization`
  - Follow factory pattern from `src/lib/tmdb.ts`

- [ ] T004 [P] Create date utilities `src/lib/date.ts`
  - Export `formatDisplayDate(date: Date)` function for "Tomorrow (Feb 5)" format
  - Export `getRelativeDateLabel(date: Date)` function
  - Export `groupByDate(items: Array<{releaseDate: Date}>)` helper
  - Use date-fns library

---

## Phase 2: Foundational

**Goal**: API endpoint with caching - required before all user stories

### Independent Test
Can be tested via curl/HTTP client: `GET /api/calendar/upcoming` returns JSON with episodes and movies grouped by date

---

- [ ] T005 Create calendar API endpoint `src/pages/api/calendar/upcoming.ts`
  - Implement `GET` handler
  - Add BetterAuth session check
  - Fetch Trakt access token from `accountConnections` table
  - Call `trakt.getCalendarShows()` with 30-day window
  - Call `trakt.getCalendarMovies()` with 30-day window
  - Parse and normalize response data
  - Group by date using date utilities
  - Add 1-hour server-side cache headers
  - Handle errors: 401, 429, 500

- [ ] T006 [P] Write unit tests for calendar API `src/pages/api/calendar/upcoming.test.ts`
  - Mock Trakt API responses for shows and movies
  - Test 30-day window calculation
  - Test date grouping logic
  - Test authentication failure (401)
  - Test rate limiting response (429)

---

## Phase 3: User Story 1 - View Personalized Upcoming Episodes

**Priority**: P1 | **Goal**: Users see upcoming TV episodes from tracked shows

### Independent Test
Can be fully tested by: Visiting homepage, scrolling to Upcoming section, verifying episodes from watched shows appear with dates and episode numbers

**Tests**: Not requested in spec

---

- [ ] T007 [US1] Implement UpcomingList component `src/components/dashboard/UpcomingList.vue`
  - Replace placeholder with functional component
  - Fetch from `/api/calendar/upcoming` on mount
  - Display loading skeleton while fetching
  - Show empty state "No upcoming releases" if no episodes/movies
  - Group and render episodes by date header
  - Use relative + absolute date format "Tomorrow (Feb 5)"

- [ ] T008 [US1] Create episode card component for calendar `src/components/calendar/EpisodeCard.vue`
  - Display poster image (TMDB)
  - Show show title
  - Display "S02E05" format
  - Display episode title
  - Handle poster load failure with placeholder
  - Click navigates to `/media/show/{tmdbShowId}`

- [ ] T009 [US1] Style episode cards per design system `src/components/calendar/EpisodeCard.vue`
  - Use Shadcn Card component pattern
  - Aspect ratio 2/3 for poster
  - Horizontal scroll container
  - Hover effects and transitions

---

## Phase 4: User Story 2 - View Upcoming Movies in Collection

**Priority**: P1 | **Goal**: Users see upcoming movie releases from their collection

### Independent Test
Can be fully tested by: Adding movies to collection, visiting homepage, verifying movies appear in Upcoming section with release dates

**Tests**: Not requested in spec

---

- [ ] T010 [US2] Create movie card component for calendar `src/components/calendar/MovieCard.vue`
  - Display poster image (TMDB)
  - Display movie title
  - Display release date
  - Handle poster load failure with placeholder
  - Click navigates to `/media/movie/{tmdbMovieId}`

- [ ] T011 [US2] Style movie cards per design system `src/components/calendar/MovieCard.vue`
  - Use Shadcn Card component pattern
  - Aspect ratio 2/3 for poster
  - Consistent with EpisodeCard styling

- [ ] T012 [US2] Integrate movie cards into UpcomingList `src/components/dashboard/UpcomingList.vue`
  - Render movie cards alongside episode cards
  - Sort all items by release date
  - Merge into unified date-grouped view

---

## Phase 5: User Story 3 - Navigate to Media Details

**Priority**: P2 | **Goal**: Click calendar items to view details

### Independent Test
Can be fully tested by: Clicking any episode or movie card, verifying navigation to correct media detail page

**Tests**: Not requested in spec

---

- [ ] T013 [US3] Add navigation handlers to EpisodeCard `src/components/calendar/EpisodeCard.vue`
  - Wrap card in clickable element
  - Navigate to `/media/show/{tmdbShowId}`
  - Add visual feedback on hover

- [ ] T014 [US3] Add navigation handlers to MovieCard `src/components/calendar/MovieCard.vue`
  - Wrap card in clickable element
  - Navigate to `/media/movie/{tmdbMovieId}`
  - Add visual feedback on hover

---

## Phase 6: User Story 4 - Visual Calendar Presentation

**Priority**: P2 | **Goal**: Polished UI with posters and date formatting

### Independent Test
Can be fully tested by: Viewing calendar, verifying all items show posters, dates display correctly, layout is responsive

**Tests**: Not requested in spec

---

- [ ] T015 [US4] Implement loading skeleton `src/components/calendar/CalendarSkeleton.vue`
  - Create skeleton matching card layout
  - Animate pulse effect
  - Show while calendar data is loading

- [ ] T016 [US4] Implement empty state `src/components/calendar/EmptyCalendar.vue`
  - Display "No upcoming releases" message
  - Include helpful icon

- [ ] T017 [US4] Add responsive layout `src/components/dashboard/UpcomingList.vue`
  - Horizontal scroll on mobile
  - Grid layout on desktop
  - Proper spacing and gaps

- [ ] T018 [US4] Add date headers between groups `src/components/dashboard/UpcomingList.vue`
  - Format: "Wednesday, February 5"
  - Style distinct from card content

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Performance, error handling, final polish

### Independent Test
All user stories work end-to-end with no regressions

---

- [ ] T019 Add client-side session cache `src/lib/calendar-cache.ts`
  - Store fetched calendar in sessionStorage
  - Implement get/set with timestamp
  - Use cached data if < 5 minutes old

- [ ] T020 Add error boundary `src/components/dashboard/UpcomingList.vue`
  - Catch API errors gracefully
  - Show retry button on error
  - Log errors for debugging

- [ ] T021 Performance optimization `src/components/dashboard/UpcomingList.vue`
  - Lazy load poster images
  - Use `v-show` for skeleton-to-content transition
  - Memoize date formatting

- [ ] T022 Add manual refresh button `src/components/dashboard/UpcomingList.vue`
  - Allow users to force-refresh calendar
  - Show last updated timestamp

- [ ] T023 Write integration test `src/components/dashboard/UpcomingList.e2e.test.ts`
  - Test full user flow: view calendar → see episodes → click item → navigate

---

## Summary

| Phase | User Story | Task Count |
|-------|-----------|------------|
| Phase 1 | Setup | 4 tasks |
| Phase 2 | Foundational | 2 tasks |
| Phase 3 | US1 Episodes | 3 tasks |
| Phase 4 | US2 Movies | 3 tasks |
| Phase 5 | US3 Navigation | 2 tasks |
| Phase 6 | US4 Visual | 4 tasks |
| Phase 7 | Polish | 5 tasks |
| **Total** | | **23 tasks** |

### Parallel Execution Opportunities

- T002, T003, T004 can run in parallel (types, API client, date utils)
- T010, T011 can run in parallel (movie card create + style)
- T013, T014 can run in parallel (navigation handlers)

### MVP Scope

**User Story 1 only** (Phases 1-3):
- Install date-fns
- Create types and API client
- Create calendar endpoint with caching
- Implement UpcomingList with episode cards only
- Total: ~10 tasks

### File Paths Summary

| File Path | Tasks |
|-----------|-------|
| `src/types/calendar.ts` | T002 |
| `src/lib/trakt.ts` | T003 |
| `src/lib/date.ts` | T004 |
| `src/pages/api/calendar/upcoming.ts` | T005 |
| `src/pages/api/calendar/upcoming.test.ts` | T006 |
| `src/components/dashboard/UpcomingList.vue` | T007, T012, T017, T018, T019, T020, T021, T022 |
| `src/components/calendar/EpisodeCard.vue` | T008, T009, T013 |
| `src/components/calendar/MovieCard.vue` | T010, T011, T014 |
| `src/components/calendar/CalendarSkeleton.vue` | T015 |
| `src/components/calendar/EmptyCalendar.vue` | T016 |
| `src/components/dashboard/UpcomingList.e2e.test.ts` | T023 |
