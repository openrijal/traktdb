
import { TMDB_API_URL, MediaType } from './constants';

export interface TMDBMediaItem {
  id: number;
  media_type: MediaType | 'person';
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];

  // Optional Union Properties
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  status?: string;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
}

export interface TMDBMovie extends TMDBMediaItem {
  media_type: MediaType.MOVIE;
  title: string;
  original_title?: string;
  release_date?: string;
}

export interface TMDBTVShow extends TMDBMediaItem {
  media_type: MediaType.TV;
  name: string;
  original_name?: string;
  first_air_date?: string;
  last_air_date?: string;
  seasons?: TMDBSeason[];
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  season_number: number;
  vote_average: number;
  air_date?: string;
  episodes?: TMDBEpisode[];
  episode_count?: number;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date?: string;
  episode_number: number;
  still_path?: string;
  season_number: number;
  show_id?: number;
}

// Add more detailed interfaces as needed (e.g. for full details)

const getHeaders = () => {
  return {
    accept: 'application/json',
  };
};

export const tmdb = {
  async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const apiKey = import.meta.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY is not defined in environment variables');
    }

    // Use api_key query param for V3 Auth
    const searchParams = new URLSearchParams(params);
    searchParams.append('api_key', apiKey);

    const url = `${TMDB_API_URL}${endpoint}?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async searchMulti(query: string, page = 1) {
    return this.fetch<TMDBSearchResult>('/search/multi', { query, page: page.toString() });
  },

  async getMovie(id: number) {
    return this.fetch<TMDBMovie>(`/movie/${id}`);
  },

  async getTV(id: number) {
    return this.fetch<TMDBTVShow>(`/tv/${id}`);
  },

  async getSeason(tvId: number, seasonNumber: number) {
    return this.fetch<TMDBSeason>(`/tv/${tvId}/season/${seasonNumber}`);
  },

  async getEpisode(tvId: number, seasonNumber: number, episodeNumber: number) {
    return this.fetch<TMDBEpisode>(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
  }
};
