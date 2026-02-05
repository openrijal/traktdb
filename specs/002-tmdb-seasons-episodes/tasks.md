# Implementation Tasks: Display TV Series Seasons and Episodes from TMDB

**Feature Branch**: `002-tmdb-seasons-episodes`
**Created**: 2025-02-05
**Status**: Ready for Implementation

## Dependency Graph

```
Phase 1: Setup
    └── Phase 2: Foundational (Database + API)

Phase 2: Foundational
    ├── US1: Seasons List (can start in parallel with US2 components)
    ├── US2: Episodes List (depends on US1 SeasonCard component)
    ├── US3: Episode Watch Status (depends on database schema)
    └── US4: Episode Navigation (can start in parallel)

Phase 3: US1 - View TV Series Seasons List
Phase 4: US2 - View Season Episodes
Phase 5: US3 - Mark Episodes as Watched
Phase 6: US4 - Episode Navigation
Phase 7: Polish & Cross-Cutting Concerns
```

## Parallel Execution Opportunities

- **Phase 2**: API endpoint and database schema can be implemented in parallel
- **Phase 3**: SeasonsList, SeasonCard components can be built in parallel with API
- **Phase 4**: EpisodesList and EpisodeItem can be built in parallel with SeasonCard
- **Phase 5**: Episode status API and EpisodeItem status button can be parallel

---

## Phase 1: Setup

**Goal**: Ensure project is ready for feature implementation

**Independent Test Criteria**: Project builds successfully with no new errors

### Tasks

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Verify TMDB API key is configured in environment
- [ ] T003 Run pnpm build to verify current state

---

## Phase 2: Foundational

**Goal**: Create database schema and API endpoints that all user stories depend on

**Independent Test Criteria**: Database schema created, API endpoints return valid season/episode data

### Database Schema

- [ ] T010 [P] Add episode_progress table to drizzle/schema.ts
    - Path: `drizzle/schema.ts`
    - Dependencies: None
    - Description: Add episode_progress table with columns for user_id, tmdb_id, season_number, episode_number, watched (boolean), updated_at

### API Endpoints

- [ ] T020 [P] Create season details API endpoint
    - Path: `src/pages/api/media/tv/[id]/season/[seasonNumber].ts`
    - Dependencies: None
    - Description: Implement GET endpoint that calls tmdb.getSeason() and returns season data with episodes

- [ ] T021 [P] Create episode status API endpoint
    - Path: `src/pages/api/library/episode-status.ts`
    - Dependencies: T010 (episode_progress table)
    - Description: Implement POST/PUT endpoint to update episode watch status

---

## Phase 3: User Story 1 - View TV Series Seasons List

**Goal**: Display all seasons for a TV series on the detail page

**Independent Test Criteria**: Navigate to any TV series detail page, verify seasons list appears with correct season numbers and metadata

**User Story**: US1

### Components

- [ ] T030 [P] [US1] Create SeasonsList.vue component
    - Path: `src/components/media/SeasonsList.vue`
    - Dependencies: T020 (season API)
    - Description: Main accordion component that fetches and displays seasons list

- [ ] T031 [P] [US1] Create SeasonCard.vue component
    - Path: `src/components/media/SeasonCard.vue`
    - Dependencies: T030 (parent component)
    - Description: Individual season card with expand/collapse, season number, title, episode count

- [ ] T032 [US1] Integrate SeasonsList into media detail page
    - Path: `src/pages/media/[type]/[id].astro`
    - Dependencies: T030, T031 (components)
    - Description: Add SeasonsList component below MediaHeader in detail page

### Implementation Strategy

1. Build SeasonCard first (standalone, no episodes)
2. Build SeasonsList as accordion wrapper
3. Integrate into Astro page
4. Test with TV series that has multiple seasons

---

## Phase 4: User Story 2 - View Season Episodes

**Goal**: Display episodes when a season is expanded

**Independent Test Criteria**: Click a season expansion button, verify episodes load with correct episode numbers, titles, air dates, and overviews

**User Story**: US2

### Components

- [ ] T040 [P] [US2] Create EpisodesList.vue component
    - Path: `src/components/media/EpisodesList.vue`
    - Dependencies: T020 (season API)
    - Description: List component for episodes within a season

- [ ] T041 [P] [US2] Create EpisodeItem.vue component
    - Path: `src/components/media/EpisodeItem.vue`
    - Dependencies: T040 (parent component)
    - Description: Individual episode display with episode number, title, air date, overview

- [ ] T042 [US2] Connect SeasonCard to EpisodesList
    - Path: `src/components/media/SeasonCard.vue`
    - Dependencies: T040, T041, T031 (from US1)
    - Description: Add expand/collapse logic to show/hide EpisodesList

### Implementation Strategy

1. Build EpisodeItem (basic display)
2. Build EpisodesList (fetches and renders episodes)
3. Connect to SeasonCard expand/collapse
4. Test expanding/collapsing seasons

---

## Phase 5: User Story 3 - Mark Episodes as Watched

**Goal**: Allow users to mark individual episodes as watched with visual feedback

**Independent Test Criteria**: Click a watch status button on an episode, verify the status updates visually and persists across sessions

**User Story**: US3

### Components

- [ ] T050 [US3] Create EpisodeWatchStatus.vue component
    - Path: `src/components/media/EpisodeWatchStatus.vue`
    - Dependencies: T021 (episode status API)
    - Description: Watch/unwatch button with visual indicator for episode items

- [ ] T051 [US3] Update EpisodeItem to include watch status
    - Path: `src/components/media/EpisodeItem.vue`
    - Dependencies: T041, T050
    - Description: Add EpisodeWatchStatus button and watched visual distinction

- [ ] T052 [P] [US3] Update library store for episode tracking
    - Path: `src/stores/library.ts`
    - Dependencies: T010, T021
    - Description: Add episode watch status methods to Pinia store

### Implementation Strategy

1. Create EpisodeWatchStatus component
2. Update store with episode methods
3. Integrate into EpisodeItem
4. Test watch/unwatch persistence

---

## Phase 6: User Story 4 - Episode Navigation

**Goal**: Enhance episode interaction with hover states and click actions

**Independent Test Criteria**: Hover over episode, verify visual feedback; click episode, verify interactive actions work

**User Story**: US4

### Enhancements

- [ ] T060 [P] [US4] Add hover states to EpisodeItem
    - Path: `src/components/media/EpisodeItem.vue`
    - Dependencies: T041 (from US2)
    - Description: Add visual feedback on hover (cursor change, background highlight)

- [ ] T061 [P] [US4] Add click action to EpisodeItem
    - Path: `src/components/media/EpisodeItem.vue`
    - Dependencies: T060
    - Description: Add click handler for quick watch status toggle or navigation

- [ ] T062 [US4] Handle missing air dates with TBA placeholder
    - Path: `src/components/media/EpisodeItem.vue`
    - Dependencies: T041 (from US2)
    - Description: Display "TBA" for episodes without air dates

### Implementation Strategy

1. Add hover states to EpisodeItem
2. Add click-to-toggle behavior
3. Handle edge cases (missing dates)
4. Test interaction feedback

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Ensure robust, accessible, and performant implementation

### Loading States

- [ ] T070 [P] Add loading skeleton to SeasonsList
    - Path: `src/components/media/SeasonsList.vue`
    - Dependencies: T030 (from US1)
    - Description: Show skeleton UI while fetching seasons

- [ ] T071 [P] Add loading skeleton to EpisodesList
    - Path: `src/components/media/EpisodesList.vue`
    - Dependencies: T040 (from US2)
    - Description: Show skeleton UI while fetching episodes

### Error Handling

- [ ] T072 [P] Add error state to SeasonsList
    - Path: `src/components/media/SeasonsList.vue`
    - Dependencies: T030 (from US1)
    - Description: Display error message with retry button if season fetch fails

- [ ] T073 [P] Add error state to EpisodesList
    - Path: `src/components/media/EpisodesList.vue`
    - Dependencies: T040 (from US2)
    - Description: Display error message with retry button if episode fetch fails

### Accessibility

- [ ] T074 [P] Ensure keyboard navigation for accordion
    - Path: `src/components/media/SeasonCard.vue`
    - Dependencies: T031 (from US1)
    - Description: Add keyboard controls (Enter/Space to expand/collapse)

- [ ] T075 [P] Add ARIA labels to seasons and episodes
    - Path: `src/components/media/SeasonsList.vue`, `src/components/media/EpisodeItem.vue`
    - Dependencies: T030, T041
    - Description: Add proper ARIA attributes for screen readers

### Performance

- [ ] T076 [P] Implement lazy loading for episodes
    - Path: `src/components/media/EpisodesList.vue`
    - Dependencies: T040 (from US2)
    - Description: Only fetch episodes when season is expanded

### Final Integration

- [ ] T077 Run full build verification
    - Path: `package.json`
    - Dependencies: All previous tasks
    - Description: Run pnpm build to verify all changes compile

- [ ] T078 Manual end-to-end testing
    - Path: `src/pages/media/[type]/[id].astro`
    - Dependencies: All previous tasks
    - Description: Test complete user flow from seasons to episode watch status

---

## Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1 | 3 | Setup |
| Phase 2 | 3 | Foundational (DB + API) |
| Phase 3 | 3 | US1 - Seasons List |
| Phase 4 | 3 | US2 - Episodes List |
| Phase 5 | 3 | US3 - Watch Status |
| Phase 6 | 3 | US4 - Navigation |
| Phase 7 | 9 | Polish & Cross-Cutting |
| **Total** | **30** | |

### Suggested MVP Scope

**User Story 1 (US1)** alone delivers value:
- Users can see all seasons of a TV series
- Minimal implementation: SeasonsList + SeasonCard + page integration
- Skips: episodes display, watch status, navigation polish

**MVP Tasks**: T001-T003, T010, T020, T030-T032, T070, T072, T074-T075, T077 (14 tasks)

### Independent Test Criteria

- **US1**: Navigate to /media/tv/1396, verify seasons list appears
- **US2**: Click season expand, verify episodes load
- **US3**: Click watch button, refresh page, verify status persists
- **US4**: Hover over episode, verify visual feedback
