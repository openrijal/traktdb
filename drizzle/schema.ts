import { pgTable, text, serial, timestamp, boolean, integer, date, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => users.id),
});

export const accounts = pgTable('accounts', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => users.id),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const verifications = pgTable('verifications', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
});

export const mediaItems = pgTable('media_items', {
    id: serial('id').primaryKey(),
    tmdbId: integer('tmdb_id').notNull(),
    type: text('type').notNull(), // 'movie', 'tv'
    title: text('title').notNull(),
    originalTitle: text('original_title'),
    overview: text('overview'),
    posterPath: text('poster_path'),
    backdropPath: text('backdrop_path'),
    releaseDate: date('release_date'), // release_date for movies, first_air_date for tv
    lastAirDate: date('last_air_date'), // for tv shows to track new episodes
    status: text('status'), // 'Released', 'Ended', 'Returning Series'
    voteAverage: integer('vote_average'),
    voteCount: integer('vote_count'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('media_items_tmdb_id_type_unique').on(t.tmdbId, t.type),
}));

export const seasons = pgTable('seasons', {
    id: serial('id').primaryKey(),
    tmdbId: integer('tmdb_id').notNull(),
    mediaItemId: integer('media_item_id').notNull().references(() => mediaItems.id, { onDelete: 'cascade' }),
    seasonNumber: integer('season_number').notNull(),
    name: text('name').notNull(),
    overview: text('overview'),
    posterPath: text('poster_path'),
    airDate: date('air_date'),
    episodeCount: integer('episode_count'),
    voteAverage: integer('vote_average'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('seasons_tmdb_id_unique').on(t.tmdbId),
}));

export const episodes = pgTable('episodes', {
    id: serial('id').primaryKey(),
    tmdbId: integer('tmdb_id').notNull(),
    seasonId: integer('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
    episodeNumber: integer('episode_number').notNull(),
    name: text('name').notNull(),
    overview: text('overview'),
    stillPath: text('still_path'),
    airDate: date('air_date'),
    voteAverage: integer('vote_average'),
    voteCount: integer('vote_count'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('episodes_tmdb_id_unique').on(t.tmdbId),
}));

export const ratings = pgTable('ratings', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    mediaItemId: integer('media_item_id').notNull().references(() => mediaItems.id),
    rating: integer('rating').notNull(), // 1-10 or 0.5-5.0 logic handled in app
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProgress = pgTable('user_progress', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    mediaItemId: integer('media_item_id').notNull().references(() => mediaItems.id),
    status: text('status').notNull(), // 'watching', 'completed', 'plan_to_watch', 'dropped'
    progress: integer('progress').default(0), // episode number or percentage
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('user_progress_user_media_unique').on(t.userId, t.mediaItemId),
}));

export const books = pgTable('books', {
    id: serial('id').primaryKey(),
    googleId: text('google_id').notNull().unique(),
    title: text('title').notNull(),
    authors: text('authors').array(),
    description: text('description'),
    thumbnail: text('thumbnail'),
    publishedDate: text('published_date'),
    pageCount: integer('page_count'),
    categories: text('categories').array(),
    averageRating: integer('average_rating'), 
    ratingsCount: integer('ratings_count'),
    isEbook: boolean('is_ebook').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const podcasts = pgTable('podcasts', {
    id: serial('id').primaryKey(),
    listenNotesId: text('listen_notes_id').unique(),
    itunesId: text('itunes_id').unique(),
    collectionName: text('collection_name').notNull(),
    artistName: text('artist_name'),
    artworkUrl: text('artwork_url'),
    feedUrl: text('feed_url'),
    description: text('description'),
    totalEpisodes: integer('total_episodes'),
    listenScore: integer('listen_score'),
    genres: text('genres').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userPodcastProgress = pgTable('user_podcast_progress', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    podcastId: integer('podcast_id').notNull().references(() => podcasts.id),
    status: text('status').notNull(), // 'listening', 'listened', 'plan_to_listen', 'dropped'
    progress: integer('progress').default(0), // episode count or specific episode ID? For now simple.
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('user_podcast_progress_user_podcast_unique').on(t.userId, t.podcastId),
}));

export const userBookProgress = pgTable('user_book_progress', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    bookId: integer('book_id').notNull().references(() => books.id),
    status: text('status').notNull(), // 'reading', 'completed', 'plan_to_read', 'dropped'
    progress: integer('progress').default(0), // page number
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('user_book_progress_user_book_unique').on(t.userId, t.bookId),
}));

export const friendships = pgTable('friendships', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    friendId: text('friend_id').notNull().references(() => users.id),
    status: text('status').notNull(), // 'pending', 'accepted'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('friendships_user_friend_unique').on(t.userId, t.friendId),
}));

export const accountConnections = pgTable('account_connections', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'trakt'
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at'),
    providerUserId: text('provider_user_id'), // trakt user id
    providerUsername: text('provider_username'), // trakt username
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('account_connections_user_provider_unique').on(t.userId, t.provider),
}));

export const episodeProgress = pgTable('episode_progress', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    episodeId: integer('episode_id').notNull().references(() => episodes.id, { onDelete: 'cascade' }),
    watched: boolean('watched').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: uniqueIndex('episode_progress_user_episode_unique').on(t.userId, t.episodeId),
}));
