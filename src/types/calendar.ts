// src/types/calendar.ts
// Trakt Calendar API Types

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
  releaseDate: string; // ISO 8601
  tmdbShowId: number;
  tmdbEpisodeId: number;
}

export interface UpcomingMovie {
  id: string; // `${movie.trakt}`
  traktMovieId: number;
  movieTitle: string;
  releaseDate: string; // YYYY-MM-DD
  releaseType: 'theatrical' | 'digital' | 'physical';
  tmdbMovieId: number;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  episodes: UpcomingEpisode[];
  movies: UpcomingMovie[];
}

export interface UpcomingCalendar {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  fetchedAt: string; // ISO 8601
  days: CalendarDay[];
}

export interface CalendarApiResponse {
  success: boolean;
  data?: UpcomingCalendar;
  error?: string;
}
