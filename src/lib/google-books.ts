
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1';

export interface GoogleBookVolumeInfo {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    printType?: string; // BOOK, MAGAZINE
}

export interface GoogleBookSaleInfo {
    isEbook?: boolean;
}

export interface GoogleBookItem {
    id: string;
    volumeInfo: GoogleBookVolumeInfo;
    saleInfo?: GoogleBookSaleInfo;
}

export interface GoogleBooksSearchResult {
    kind: string;
    totalItems: number;
    items?: GoogleBookItem[];
}

export const createGoogleBooks = (env: any) => {
    const apiKey = env?.GOOGLE_BOOKS_API_KEY || import.meta.env.GOOGLE_BOOKS_API_KEY;

    const fetchGoogleBooks = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
        const searchParams = new URLSearchParams(params);
        if (apiKey) {
            searchParams.append('key', apiKey);
        }

        const url = `${GOOGLE_BOOKS_API_URL}${endpoint}?${searchParams.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Google Books API Error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Google Books API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    };

    return {
        async search(query: string, startIndex = 0, maxResults = 20) {
            return fetchGoogleBooks<GoogleBooksSearchResult>('/volumes', {
                q: query,
                startIndex: startIndex.toString(),
                maxResults: maxResults.toString(),
            });
        },

        async getBook(id: string) {
            return fetchGoogleBooks<GoogleBookItem>(`/volumes/${id}`);
        }
    };
};
