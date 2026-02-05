# Data Model: Trakt Calendar

## TypeScript Interfaces

### Calendar API Response Types

```typescript
// src/types/calendar.ts

export interface TraktCalendarShow {
  first_aired: string; // ISO 8601 datetime
  episode: {
    season: number;
    number: number;
    title: string;
    ids: {
      trakt: number;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
  };
  show: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
  };
}

export interface TraktCalendarMovie {
  released: string; // YYYY-MM-DD
  movie: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
    };
  };
}

export interface UpcomingEpisode {
  id: string; // `${show.trakt}-${season}-${number}`
  traktEpisodeId: number;
  traktShowId: number;
  showTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  releaseDate: Date; // Parsed from first_aired
  tmdbShowId: number;
  tmdbEpisodeId: number;
}

export interface UpcomingMovie {
  id: string; // `${movie.trakt}`
  traktMovieId: number;
  movieTitle: string;
  releaseDate: Date; // Parsed from released
  releaseType: 'theatrical' | 'digital' | 'physical';
  tmdbMovieId: number;
}

export interface CalendarDay {
  date: Date;
  episodes: UpcomingEpisode[];
  movies: UpcomingMovie[];
}

export interface UpcomingCalendar {
  startDate: Date;
  endDate: Date;
  days: CalendarDay[];
  fetchedAt: Date;
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| `first_aired` | Required, valid ISO 8601 datetime |
| `released` | Required, valid YYYY-MM-DD date string |
| `tmdb_id` | Required, positive integer |
| `season` | Required, positive integer (0-999) |
| `number` | Required, positive integer (0-999) |

## State Transitions

Not applicable - calendar data is read-only from the API perspective.

## Relationships

```
UpcomingCalendar
├── CalendarDay (1..*)
│   ├── UpcomingEpisode (0..*)
│   │   └── Links to: media_items (via tmdb_id)
│   └── UpcomingMovie (0..*)
│       └── Links to: media_items (via tmdb_id)
```
