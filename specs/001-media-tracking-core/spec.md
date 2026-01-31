# Feature Specification: Media Tracking Core

**Feature Branch**: `001-media-tracking-core`  
**Created**: 2026-01-31  
**Status**: Draft  
**Input**: Comprehensive media tracking application with support for movies, TV series, books, and podcasts including TMDB, Google Books, and ListenAPI integrations

## User Scenarios & Testing

### User Story 1 - Quick Add from Search (Priority: P1)

A user wants to add a movie to their "Want to Watch" list while browsing. They open the app, use global search to find "Dune: Part Two", and tap a button to add it to their list. The entire flow takes under 10 seconds.

**Why this priority**: The core value proposition of TracktDB is quickly capturing media the user wants to track. If this is slow or cumbersome, users won't adopt the app.

**Independent Test**: User can search for any movie/show by title and add it to a list without creating an account (local-first).

**Acceptance Scenarios**:

1. **Given** the user is on the home screen, **When** they tap the search bar and type "Dune", **Then** they see results from movies, TV, books, and podcasts within 2 seconds
2. **Given** search results are displayed, **When** the user taps the "+" button on a result, **Then** a list selector appears (Want to Watch, Watching, Watched, Dropped)
3. **Given** the user selects "Want to Watch", **When** they confirm, **Then** the item appears in their Want to Watch list immediately

---

### User Story 2 - Track Episode Progress (Priority: P1)

A user is watching a TV series and wants to mark episodes as watched. They navigate to their "Watching" list, select a series, see all seasons/episodes, and mark episode 5 of season 2 as watched. The app remembers their progress.

**Why this priority**: Episode tracking is essential for TV series and podcasts. Without it, users would have to manually remember their progress.

**Independent Test**: User can mark individual episodes as watched and see overall series progress.

**Acceptance Scenarios**:

1. **Given** a series is in the user's Watching list, **When** they select it, **Then** they see all seasons and episodes
2. **Given** the episode list is displayed, **When** the user marks an episode as watched, **Then** the episode shows a checkmark and series progress updates
3. **Given** episodes are marked, **When** the user reopens the app later, **Then** their progress is preserved

---

### User Story 3 - Discover Trending Media (Priority: P2)

A user opens the app to browse what's popular. The homepage shows trending movies, TV shows, and new book releases. They can swipe through categories and add anything interesting to their lists.

**Why this priority**: Discovery drives engagement. Users who find new content keep using the app.

**Independent Test**: Homepage shows trending content from all media types without user input.

**Acceptance Scenarios**:

1. **Given** the user opens the app, **When** the homepage loads, **Then** they see sections for Trending Movies, Trending TV, and Popular Books
2. **Given** trending sections are displayed, **When** the user scrolls horizontally, **Then** they see more items in each category
3. **Given** any trending item, **When** the user taps it, **Then** they see full details (synopsis, ratings, cast/author, where to watch)

---

### User Story 4 - Google OAuth Authentication (Priority: P2) ✅ IMPLEMENTED

A user wants to sync their data across devices. They tap "Sign In with Google", authenticate with their Google account, and are immediately logged in. Simple and secure.

**Why this priority**: Sync enables multi-device use. OAuth reduces friction and eliminates password management.

**Independent Test**: User can sign in with Google and access their data across devices.

**Acceptance Scenarios**:

1. **Given** the user is not signed in, **When** they tap "Sign In with Google", **Then** they are redirected to Google OAuth
2. **Given** the user authenticates with Google, **When** they are redirected back, **Then** they are logged in with their profile info displayed
3. **Given** the user is authenticated on a new device, **When** they sign in with the same Google account, **Then** their existing lists and progress appear

**Implementation Status**: Complete - BetterAuth with Google OAuth

---

### User Story 5 - View Media Details (Priority: P2)

A user taps on a movie to see full details: synopsis, cast & crew, ratings from multiple sources (IMDB, Rotten Tomatoes, Metacritic), and where to watch (Netflix, HBO, etc.).

**Why this priority**: Rich details help users decide what to watch and where to find it.

**Independent Test**: User can view complete details for any movie, including external ratings and streaming availability.

**Acceptance Scenarios**:

1. **Given** any movie in search results or lists, **When** the user taps it, **Then** they see title, poster, release year, runtime, synopsis
2. **Given** the details screen, **When** it loads, **Then** ratings from IMDB, Rotten Tomatoes (if available) are displayed
3. **Given** the details screen, **When** the user scrolls to "Where to Watch", **Then** they see streaming platforms with availability status

---

### User Story 6 - Navigate by Media Type (Priority: P3)

A user wants to see only their books. They tap the "Books" tab at the bottom, then see sub-tabs for Reading, Read, Want to Read, and Dropped.

**Why this priority**: Clean navigation prevents overwhelming users with mixed content.

**Independent Test**: User can filter lists by media type using tabs.

**Acceptance Scenarios**:

1. **Given** the user has items in multiple media types, **When** they tap the "Books" tab, **Then** only books are displayed
2. **Given** the Books tab is active, **When** the user selects "Reading" sub-tab, **Then** only books marked as Reading appear
3. **Given** the user switches to "Podcasts" tab, **When** they view episodes, **Then** host/guest information is displayed

---

### User Story 7 - Movie Collections (Priority: P3)

A user views "John Wick" and sees it belongs to the "John Wick Collection" (4 films). They can view all movies in the collection and track which ones they've watched.

**Why this priority**: Collections enhance discovery and completionist tracking.

**Independent Test**: User can view all movies in a collection and see watch status for each.

**Acceptance Scenarios**:

1. **Given** a movie that belongs to a collection, **When** the user views its details, **Then** they see a "Part of [Collection Name]" section
2. **Given** the collection is displayed, **When** the user expands it, **Then** they see all movies in order with watch status
3. **Given** the collection view, **When** the user taps an unwatched movie, **Then** they can add it to their list

---

### Edge Cases

- What happens when the user searches for a title that exists in multiple media types? → Show all results grouped by type
- What happens when a movie is on the user's list but is removed from TMDB? → Keep local record, mark as "unavailable from source"
- How does the system handle a series that's still airing? → Show future episodes with air dates, don't allow marking as watched
- What happens when the user loses internet while adding an item? → Queue locally, sync when connection restored
- What happens if magic link expires? → Show error, offer to resend link

## Requirements

### Functional Requirements

**Core Data Management**
- **FR-001**: System MUST store user's media lists locally before any network sync
- **FR-002**: System MUST sync local data to Supabase when user is authenticated and online
- **FR-003**: System MUST handle offline-first operations with eventual consistency
- **FR-004**: System MUST preserve user data if they delete and reinstall the app (when authenticated)

**Search & Discovery**
- **FR-005**: System MUST provide global search across movies, TV, books, and podcasts
- **FR-006**: System MUST query TMDB for movies and TV series metadata
- **FR-007**: System MUST query Google Books API for book metadata
- **FR-008**: System MUST query ListenAPI for podcast metadata
- **FR-009**: System MUST display trending content on the homepage from all media types

**Lists & Tracking**
- **FR-010**: Users MUST be able to categorize media as: Want to Watch/Read/Listen, Watching/Reading/Listening, Watched/Read/Listened, Dropped
- **FR-011**: System MUST track individual episode progress for TV series
- **FR-012**: System MUST track individual episode progress for podcasts
- **FR-013**: System MUST display movie collections when available
- **FR-014**: System MUST calculate and display overall progress percentage for series/podcasts

**Authentication**
- **FR-015**: System MUST support passwordless email authentication via magic links
- **FR-016**: System MUST NOT require authentication for local-only usage
- **FR-017**: System MUST prompt for authentication only when sync features are needed

**Media Details**
- **FR-018**: System MUST display ratings from multiple sources (IMDB, Rotten Tomatoes, Metacritic) when available
- **FR-019**: System MUST display streaming availability ("Where to Watch") for movies and TV
- **FR-020**: System MUST display cast and crew information for movies/TV
- **FR-021**: System MUST display author information for books
- **FR-022**: System MUST display host and guest information for podcasts

**Navigation**
- **FR-023**: System MUST provide tab-based navigation for Movies, Series, Books, Podcasts
- **FR-024**: Each media type tab MUST have sub-tabs for each tracking status
- **FR-025**: Homepage MUST display "Currently Watching/Reading/Listening" sections
- **FR-026**: Homepage MUST display "Trending" sections for each media type

### Key Entities

- **Media Item**: Represents any trackable content (movie, show, book, podcast) with external ID, title, type, metadata, poster/cover
- **User List Entry**: Links a user to a media item with status (want/active/done/dropped), date added, date status changed
- **Episode**: Represents a single episode of a series or podcast with watched/listened status
- **Series Progress**: Aggregates episode status to show overall completion percentage
- **Collection**: Groups related movies (franchises, series) with ordering

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add any media item to a list in under 10 seconds from app launch
- **SC-002**: Search results appear within 2 seconds of query submission
- **SC-003**: App launches and displays cached content within 1 second (offline mode)
- **SC-004**: 95% of users successfully complete first add-to-list action on first attempt
- **SC-005**: Episode progress is accurately preserved across app restarts with 100% reliability
- **SC-006**: Sync conflicts occur in less than 0.1% of operations
- **SC-007**: Google OAuth authentication completes in under 30 seconds (click to authenticated)
- **SC-008**: App works fully offline for list management (no network required for core features)
- **SC-009**: Cross-platform feature parity: same features work on web and mobile
- **SC-010**: 90% of users who sign in on a second device see their data within 5 seconds

## Clarifications

### Session 2026-01-31

- Q: What happens if an external API (TMDB, Google Books, ListenAPI) is temporarily unavailable? → A: Show cached data with "Last updated" timestamp; queue searches for retry; never block user from accessing their lists
- Q: How should the app handle rate limiting from external APIs? → A: Implement client-side caching (1 hour for metadata), batch requests where possible, queue and retry with exponential backoff
- Q: What authentication fallback exists if magic link email fails to arrive? → A: Retry with same email after 60 seconds; offer alternative email entry; no password fallback (passwordless only)
- Q: What is the data conflict resolution strategy for sync? → A: Last-write-wins with device ID tracking; user can view conflict history in settings
- Q: What accessibility standards should the app meet? → A: WCAG 2.1 AA compliance for web; native accessibility APIs for mobile

## Non-Functional Requirements

### Performance
- App cold start: < 2 seconds on modern devices
- Search response: < 2 seconds (end-to-end including API)
- Cached data display: < 500ms
- List updates (add/remove): < 100ms perceived latency

### Reliability
- Offline functionality: 100% for list management, 0% for search (requires network)
- Data sync: Eventually consistent within 30 seconds of reconnection
- Local data persistence: Survives app crashes and device restarts

### Security
- All network traffic via HTTPS
- Magic links expire after 10 minutes
- Session tokens expire after 30 days of inactivity
- Local database encrypted at rest on mobile devices

### Observability
- Error tracking with user consent (Sentry or equivalent)
- Anonymous usage analytics opt-in only
- No personally identifiable information in logs

## Assumptions

- TMDB API provides sufficient movie/TV metadata including collections and where-to-watch data
- Google Books API provides author information and cover images
- iTunes Search API provides podcast metadata (using iTunes instead of ListenAPI)
- Neon PostgreSQL free tier is sufficient for initial user base
- Users have Google accounts for authentication
- Cloudflare Pages supports the required Astro adapter configuration

## Implementation Notes

**Actual tech stack differs from original spec:**
- Database: Neon PostgreSQL (not Supabase)
- Auth: BetterAuth with Google OAuth (not Supabase Auth with magic links)
- Podcasts: iTunes Search API (not ListenAPI)

See `plan.md` for full technical details.
