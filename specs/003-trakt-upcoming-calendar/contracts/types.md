---
# TypeScript Type Definitions
# Auto-generated from contracts/api.yml
# File extension is .ts but saved as .yml for reference

export interface CalendarApiResponse {
  success: boolean;
  data?: UpcomingCalendar;
  error?: string;
}

export interface UpcomingCalendar {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  fetchedAt: string; // ISO 8601
  days: CalendarDay[];
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  episodes: CalendarEpisode[];
  movies: CalendarMovie[];
}

export interface CalendarEpisode {
  id: string;
  traktEpisodeId: number;
  traktShowId: number;
  showTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  releaseDate: string; // ISO 8601
  tmdbShowId: number;
  tmdbEpisodeId: number;
  displayDate: string; // Human-readable (e.g., "Tomorrow (Feb 5)")
}

export interface CalendarMovie {
  id: string;
  traktMovieId: number;
  movieTitle: string;
  releaseDate: string; // YYYY-MM-DD
  releaseType: 'theatrical' | 'digital' | 'physical';
  tmdbMovieId: number;
  displayDate: string;
}

export interface CalendarError {
  success: false;
  error: string;
}
