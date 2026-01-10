export enum MediaType {
    MOVIE = 'movie',
    TV = 'tv',
    PERSON = 'person',
}

export enum WatchStatus {
    PLAN_TO_WATCH = 'plan_to_watch',
    COMPLETED = 'completed',
    WATCHING = 'watching',
    DROPPED = 'dropped',
}

export const WatchStatusLabels: Record<WatchStatus, string> = {
    [WatchStatus.PLAN_TO_WATCH]: 'Watchlist',
    [WatchStatus.COMPLETED]: 'Watched',
    [WatchStatus.WATCHING]: 'Watching',
    [WatchStatus.DROPPED]: 'Dropped',
};

// Map formatted/slug status back to Display Labels if needed (e.g., for tabs)
export const LibraryTabs = {
    WATCHLIST: 'watchlist',
    WATCHED: 'watched',
    // ... add others as we implement them
} as const;


export const TMDB_API_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/500x750?text=No+Image'; // Fallback


export const LibraryUI = {
    NO_ITEMS_FOUND: "No items found in",
    WATCHLIST_EMPTY: "your watchlist",
    WATCHED_EMPTY: "watched history",
    FIND_SOMETHING: "Find something to watch",
} as const;
