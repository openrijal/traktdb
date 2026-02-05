# Implementation Plan: Display TV Series Seasons and Episodes from TMDB

## Technology Stack

### Core Technologies
- **Framework**: Astro + Vue (hybrid SSR/CSR)
- **State Management**: Pinia (stores/library.ts)
- **Database**: PostgreSQL via Drizzle ORM
- **Authentication**: BetterAuth
- **Styling**: Tailwind CSS with custom design tokens (Stone/Sky/Orange)

### Key Libraries & Patterns
- **TMDB Integration**: Custom client in src/lib/tmdb.ts
- **API Routes**: Astro API endpoints (src/pages/api/)
- **Components**: Vue 3 with Composition API
- **Icons**: Lucide Vue Next
- **Type Safety**: TypeScript throughout

## Architecture

### Data Flow
1. **Detail Page** (src/pages/media/[type]/[id].astro) fetches series data via API
2. **MediaHeader** (Vue component) displays hero section with basic info
3. **SeasonsList** (NEW Vue component) fetches and displays seasons
4. **EpisodesList** (NEW Vue component) fetches and displays episodes on demand
5. **EpisodeWatchStatus** (NEW Vue component) handles watch status

### API Endpoints Needed
- `GET /api/media/tv/{id}/season/{seasonNumber}` - Fetch season details with episodes
- `POST /api/library/episode-status` - Update episode watch status

### Component Hierarchy
```
media/[type]/[id].astro (page)
└── MediaHeader.vue (hero section)
└── SeasonsList.vue (NEW - collapsible season cards)
    └── SeasonCard.vue (NEW - individual season display)
        └── EpisodesList.vue (NEW - expanded episode list)
            └── EpisodeItem.vue (NEW - individual episode with watch status)
```

## File Structure

### New Files to Create
- `src/components/media/SeasonsList.vue` - Main seasons accordion
- `src/components/media/SeasonCard.vue` - Single season display
- `src/components/media/EpisodesList.vue` - Episode list within season
- `src/components/media/EpisodeItem.vue` - Individual episode with status
- `src/pages/api/media/tv/[id]/season/[seasonNumber].ts` - Season API endpoint
- `src/pages/api/library/episode-status.ts` - Episode status API

### Files to Modify
- `src/pages/media/[type]/[id].astro` - Add seasons/episodes section
- `src/lib/tmdb.ts` - Add Season/Episode type exports (already exists)
- `drizzle/schema.ts` - Add episode_progress table
- `src/stores/library.ts` - Add episode watch status methods

## Implementation Strategy

### Phase Approach
1. **Setup Phase**: Database schema extension for episode tracking
2. **API Phase**: Season/episode endpoints
3. **UI Phase**: Vue components for seasons and episodes
4. **Integration Phase**: Connect to detail page
5. **Polish Phase**: Loading states, error handling, accessibility

### Key Design Decisions

#### API Strategy
- **Lazy Loading**: Seasons load on page, episodes load when season expanded
- **Caching**: Cache season data in local DB similar to media_items
- **Rate Limiting**: Respect TMDB limits (40 requests/10 seconds)

#### Database Schema
- Add `episode_progress` table linking user_id, tmdb_id, season_number, episode_number, watched status, updated_at

#### UI/UX
- Accordion pattern for seasons (expand/collapse)
- Visual indicator for watched episodes (checkmark, opacity)
- Loading skeleton states during data fetch
- Error states with retry button

## Quickstart

### Testing Scenarios
1. Navigate to any TV series detail page (e.g., /media/tv/1396 for Game of Thrones)
2. Verify seasons list appears below the hero section
3. Click to expand a season and verify episodes load
4. Mark an episode as watched and refresh to verify persistence
5. Test with series that has many seasons (20+) for performance

### Environment Variables Needed
- `TMDB_API_KEY` - Already configured in project

## Dependencies

### External
- TMDB API (v3) - Existing integration

### Internal
- Existing media_items table
- Existing user_progress table
- Existing design system tokens
