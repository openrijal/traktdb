import { createDb } from '@/lib/db';
import { accountConnections } from 'drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { WatchStatus, MediaType } from '@/lib/constants';

const TRAKT_API_URL = 'https://api.trakt.tv';

export class TraktClient {
    private clientId: string;
    private userId: string;
    private db: ReturnType<typeof createDb>;

    constructor(env: any, userId: string) {
        this.clientId = env.TRAKT_CLIENT_ID || import.meta.env.TRAKT_CLIENT_ID;
        this.userId = userId;
        this.db = createDb(env);
    }

    private async getToken(): Promise<string | null> {
        const connection = await this.db.select({
            accessToken: accountConnections.accessToken,
        })
            .from(accountConnections)
            .where(and(
                eq(accountConnections.userId, this.userId),
                eq(accountConnections.provider, 'trakt')
            ))
            .limit(1);

        return connection[0]?.accessToken || null;
    }

    private async request(endpoint: string, method: string = 'GET', body?: any) {
        const token = await this.getToken();
        if (!token) return null;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': this.clientId,
            'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(`${TRAKT_API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            console.error(`Trakt API Error ${endpoint}:`, await response.text());
            return null;
        }

        return response.json(); // Trakt usually returns JSON, even for empty success, or handle status 204
    }

    async syncHistory(media: { tmdbId: number, type: MediaType, watchedAt?: Date }, action: 'add' | 'remove') {
        const endpoint = action === 'add' ? '/sync/history' : '/sync/history/remove';

        // Trakt expects specific payload structure
        const payload: any = {};

        // Note: Trakt uses 'movies' and 'shows'/'episodes'.
        // For simple movie/show sync:
        if (media.type === MediaType.MOVIE) {
            payload.movies = [{
                ids: { tmdb: media.tmdbId },
                watched_at: media.watchedAt?.toISOString(),
            }];
        } else if (media.type === MediaType.TV) {
            // Syncing a whole show?
            payload.shows = [{
                ids: { tmdb: media.tmdbId },
                watched_at: media.watchedAt?.toISOString(),
            }];
        }

        return this.request(endpoint, 'POST', payload);
    }

    async syncEpisode(episode: { tmdbId: number, watchedAt?: Date }, action: 'add' | 'remove') {
        const endpoint = action === 'add' ? '/sync/history' : '/sync/history/remove';
        const payload = {
            episodes: [{
                ids: { tmdb: episode.tmdbId },
                watched_at: episode.watchedAt?.toISOString(),
            }]
        };
        return this.request(endpoint, 'POST', payload);
    }

    async syncSeason(season: { tmdbId: number, watchedAt?: Date }, action: 'add' | 'remove') {
        // Trakt doesn't strictly have a "sync season" endpoint that takes a season TMDB ID for history directly 
        // usually you send episodes, BUT you can send 'seasons' in the payload if you have the show, 
        // or just lists of episodes.
        // Simplest is to map to episodes if possible, otherwise rely on show sync?
        // Actually /sync/history allows 'seasons' array inside 'shows'? No, top level keys are movies, shows, seasons, episodes.
        // Let's check docs: https://trakt.docs.apiary.io/#reference/sync/add-to-history/add-items-to-history
        // Support: movies, shows, seasons, episodes, people.

        const endpoint = action === 'add' ? '/sync/history' : '/sync/history/remove';
        const payload = {
            seasons: [{
                ids: { tmdb: season.tmdbId },
                watched_at: season.watchedAt?.toISOString(),
            }]
        };
        return this.request(endpoint, 'POST', payload);
    }
    async getCalendarShows(startDate: string, days: number) {
        return this.request(`/calendars/my/shows/${startDate}/${days}`);
    }

    async getCalendarMovies(startDate: string, days: number) {
        return this.request(`/calendars/my/movies/${startDate}/${days}`);
    }
}

export const createTrakt = (env: any, userId: string) => new TraktClient(env, userId);
