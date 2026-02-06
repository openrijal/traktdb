# Quickstart: Trakt Calendar Integration

## Dependencies

```bash
# Add date-fns for date handling
pnpm add date-fns
pnpm add -D @types/date-fns
```

## Environment Variables

No new environment variables required. Uses existing:
- `TRAKT_CLIENT_ID` (from accountConnections)
- `TRAKT_CLIENT_SECRET` (from accountConnections)
- `TRAKT_ACCESS_TOKEN` (from accountConnections)

## File Creation Order

1. **Create API client**: `src/lib/trakt.ts`
   - Factory function following `createTmdb` pattern
   - Methods: `getCalendarShows(startDate, days)`, `getCalendarMovies(startDate, days)`

2. **Create types**: `src/types/calendar.ts`
   - Export interfaces from data-model.md

3. **Create API endpoint**: `src/pages/api/calendar/upcoming.ts`
   - GET handler with auth check
   - Caching logic (1-hour TTL)
   - Error handling

4. **Create date utilities**: `src/lib/date.ts`
   - Date formatting functions
   - Relative date labels ("Tomorrow", etc.)

5. **Implement component**: `src/components/dashboard/UpcomingList.vue`
   - Fetch from `/api/calendar/upcoming`
   - Render grouped by date
   - Handle loading and empty states

6. **Add tests**: `src/pages/api/calendar/upcoming.test.ts`
   - Mock Trakt API responses
   - Test error handling
   - Test caching logic

## Configuration

### Trakt API Headers

```typescript
const TRAKT_HEADERS = {
  'Content-Type': 'application/json',
  'trakt-api-version': '2',
  'trakt-api-key': TRAKT_CLIENT_ID,
  'Authorization': `Bearer ${accessToken}`,
};
```

### Caching Configuration

```typescript
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
```

## Testing Checklist

- [ ] API returns 401 for unauthenticated requests
- [ ] API respects 30-day limit
- [ ] Dates are correctly grouped
- [ ] Empty state displays correctly
- [ ] Loading skeleton shows while fetching
- [ ] Click navigates to media detail page
- [ ] Cached data loads faster than fresh fetch
