# Research: Trakt.tv Calendar Integration

## Decision: Use Trakt Calendar API with Factory Pattern

### Trakt Calendar API

**Endpoints:**
- `GET /calendars/my/shows/{start_date}/{days}` - Upcoming episodes
- `GET /calendars/my/movies/{start_date}/{days}` - Upcoming movies

**Key Response Fields:**

For Shows:
```json
{
  "first_aired": "2025-02-05T01:00:00.000Z",
  "episode": {
    "season": 1,
    "number": 1,
    "title": "Episode Title",
    "ids": { "trakt": 5165667, "tmdb": 2964686 }
  },
  "show": {
    "title": "Show Title",
    "ids": { "trakt": 180770, "tmdb": 125988 }
  }
}
```

For Movies:
```json
{
  "released": "2025-02-07",
  "movie": {
    "title": "Movie Title",
    "year": 2025,
    "ids": { "trakt": 916302, "tmdb": 1138194 }
  }
}
```

**Authentication:**
- OAuth 2.0 Bearer token
- Headers: `Authorization: Bearer <token>`, `trakt-api-version: 2`, `trakt-api-key: <client_id>`

**Rate Limits:**
- 1,000 GET requests per 5 minutes
- Max 30 days per request

---

### Existing Codebase Patterns

**API Client Pattern (src/lib/tmdb.ts):**
```typescript
// Factory pattern for API clients
export function createTmdb(env: Env) {
  return {
    searchMulti: (query: string) => fetch(...),
    getMovie: (id: number) => fetch(...),
  }
}
```

**Caching Pattern (src/pages/api/media/[type]/[id].ts):**
- Server-side caching via database upsert
- Proxy pattern: check DB first → fallback to external API → cache result
- Client-side state via Pinia stores

**Authentication Pattern:**
- BetterAuth for session management
- External API tokens stored in `accountConnections` table
- Custom encryption via `src/lib/crypto.ts`

**Dashboard Widgets Pattern:**
- `src/components/dashboard/UpcomingList.vue` - Placeholder exists
- Uses Shadcn/Vue Card components
- Horizontal scroll with `flex gap-4 overflow-x-auto`
- Poster aspect ratio: `aspect-[2/3]`
- TMDB base URL: `https://image.tmdb.org/t/p/w500`

---

### Date Handling

**Current State:** Ad-hoc, no date library installed
**Recommendation:** Install `date-fns` for date grouping and formatting

---

### Implementation Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| API Client | Create `src/lib/trakt.ts` factory | Follows existing TMDB pattern |
| Authentication | Reuse `accountConnections` token | Consistent with other Trakt features |
| Caching | 1-hour server TTL + client session | Specified in clarifications |
| Date Library | `date-fns` | Lightweight, tree-shakeable |
| Component | Extend `MediaCard.vue` | Consistent UI with existing patterns |
| Date Range | 30 days | Clarification Q1 |

---

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|----------------|
| Build custom API client | Factory pattern is already established |
| No caching | Would hit rate limits quickly |
| Use only DB cache | Would show stale data |
| Moment.js | Too large, deprecated |
