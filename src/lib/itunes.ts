
const ITUNES_SEARCH_API_URL = 'https://itunes.apple.com';

export interface iTunesPodcastItem {
    collectionId: number;
    artistName: string;
    collectionName: string;
    feedUrl?: string;
    artworkUrl600?: string;
    artworkUrl100?: string;
    genres?: string[];
    primaryGenreName?: string;
}

export interface iTunesSearchResult {
    resultCount: number;
    results: iTunesPodcastItem[];
}

export const createITunes = () => {
    const fetchITunes = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
        const searchParams = new URLSearchParams(params);
        // iTunes API requires JSONP-like behavior or specific headers sometimes, but fetch usually works for search.
        const url = `${ITUNES_SEARCH_API_URL}${endpoint}?${searchParams.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`iTunes API Error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`iTunes API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    };

    return {
        async searchPodcasts(term: string, limit = 20) {
            return fetchITunes<iTunesSearchResult>('/search', {
                term,
                media: 'podcast',
                limit: limit.toString(),
            });
        },

        async getPodcast(id: string) {
            return fetchITunes<iTunesSearchResult>('/lookup', {
                id,
                entity: 'podcast',
            });
        }
    };
};
