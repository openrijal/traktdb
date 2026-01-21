
const LISTEN_NOTES_API_URL = 'https://listen-api.listennotes.com/api/v2';

export interface ListenNotesPodcast {
    id: string;
    title_original: string;
    title_highlighted?: string;
    publisher_original: string;
    publisher_highlighted?: string;
    description_original?: string;
    description_highlighted?: string;
    image: string;
    thumbnail: string;
    total_episodes: number;
    itunes_id?: number;
    latest_pub_date_ms?: number;
    listen_score?: number;
    listen_score_global_rank?: string;
    genre_ids?: number[];
    website?: string;
    explicit_content?: boolean;
    listennotes_url?: string;
}

export interface ListenNotesSearchResponse {
    next_offset: number;
    took: number;
    total: number;
    count: number;
    results: ListenNotesPodcast[];
}

export interface ListenNotesTypeaheadResponse {
    terms: string[];
    genres: { id: number; name: string; parent_id: number }[];
    podcasts: ListenNotesPodcast[];
}

export const createListenNotes = (apiKey: string) => {
    const fetchListenNotes = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
        const searchParams = new URLSearchParams(params);
        const url = `${LISTEN_NOTES_API_URL}${endpoint}?${searchParams.toString()}`;

        const response = await fetch(url, {
            headers: {
                'X-ListenAPI-Key': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Listen Notes API Error: ${response.status} ${response.statusText}`, errorText);
            
            if (response.status === 429) {
                throw new Error('Listen Notes API rate limit exceeded');
            }
            
            throw new Error(`Listen Notes API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    };

    return {
        async searchPodcasts(query: string, options: {
            offset?: number;
            sortByDate?: boolean;
            language?: string;
            genreIds?: string;
        } = {}) {
            const params: Record<string, string> = {
                q: query,
                type: 'podcast',
            };

            if (options.offset !== undefined) {
                params.offset = options.offset.toString();
            }
            if (options.sortByDate) {
                params.sort_by_date = '1';
            }
            if (options.language) {
                params.language = options.language;
            }
            if (options.genreIds) {
                params.genre_ids = options.genreIds;
            }

            return fetchListenNotes<ListenNotesSearchResponse>('/search', params);
        },

        async typeahead(query: string, showPodcasts: boolean = true) {
            return fetchListenNotes<ListenNotesTypeaheadResponse>('/typeahead', {
                q: query,
                show_podcasts: showPodcasts ? '1' : '0',
            });
        },

        async getPodcast(id: string) {
            return fetchListenNotes<ListenNotesPodcast>(`/podcasts/${id}`, {});
        },

        async getBestPodcasts(genreId?: number, page?: number) {
            const params: Record<string, string> = {};
            if (genreId) params.genre_id = genreId.toString();
            if (page) params.page = page.toString();
            
            return fetchListenNotes<{
                podcasts: ListenNotesPodcast[];
                total: number;
                has_next: boolean;
                page_number: number;
            }>('/best_podcasts', params);
        },
    };
};
