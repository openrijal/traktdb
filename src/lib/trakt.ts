// src/lib/trakt.ts
// Trakt.tv API Client Factory

import { type TraktCalendarShow, type TraktCalendarMovie } from '@/types/calendar';

const TRAKT_API_URL = 'https://api.trakt.tv';
const TRAKT_API_VERSION = '2';

export interface Env {
  TRAKT_CLIENT_ID?: string;
  TRAKT_CLIENT_SECRET?: string;
  TRAKT_ACCESS_TOKEN?: string;
  [key: string]: unknown;
}

export interface TraktClient {
  getCalendarShows: (startDate: string, days: number) => Promise<TraktCalendarShow[]>;
  getCalendarMovies: (startDate: string, days: number) => Promise<TraktCalendarMovie[]>;
}

const getHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'trakt-api-version': TRAKT_API_VERSION,
  'trakt-api-key': apiKey,
});

export const createTrakt = (env: Env): TraktClient => {
  const apiKey = env?.TRAKT_CLIENT_ID || import.meta.env.TRAKT_CLIENT_ID;
  const accessToken = env?.TRAKT_ACCESS_TOKEN || import.meta.env.TRAKT_ACCESS_TOKEN;

  if (!apiKey) {
    throw new Error('TRAKT_CLIENT_ID is not defined in environment variables');
  }

  const fetchTrakt = async <T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> => {
    if (!accessToken) {
      throw new Error('TRAKT_ACCESS_TOKEN is not defined');
    }

    const searchParams = new URLSearchParams(params);
    const url = `${TRAKT_API_URL}${endpoint}?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getHeaders(apiKey),
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Trakt API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Trakt API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  return {
    async getCalendarShows(startDate: string, days: number) {
      return fetchTrakt<TraktCalendarShow[]>(
        `/calendars/my/shows/${startDate}/${days}`,
        {}
      );
    },

    async getCalendarMovies(startDate: string, days: number) {
      return fetchTrakt<TraktCalendarMovie[]>(
        `/calendars/my/movies/${startDate}/${days}`,
        {}
      );
    },
  };
};
