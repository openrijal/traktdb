# Data Model: Media Tracking Core

**Date**: 2026-01-31 (Updated to match implementation)
**Branch**: 001-media-tracking-core
**Source**: `drizzle/schema.ts`

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    users    │───────│   userProgress   │───────│   mediaItems    │
└─────────────┘  1:N  └──────────────────┘  N:1  └─────────────────┘
      │                       │                          │
      │                       │                          │ 1:N
      │               ┌───────────────┐           ┌─────────────┐
      │               │    ratings    │           │   seasons   │
      │               └───────────────┘           └─────────────┘
      │                       │                          │ 1:N
      │                       │                   ┌─────────────┐
      │                       │                   │  episodes   │
      │                       │                   └─────────────┘
      │
      │         ┌──────────────────┐       ┌─────────────────┐
      ├─────────│  userBookProgress │───────│     books       │
      │         └──────────────────┘       └─────────────────┘
      │
      │         ┌──────────────────┐       ┌─────────────────┐
      ├─────────│userPodcastProgress│───────│    podcasts     │
      │         └──────────────────┘       └─────────────────┘
      │
      │         ┌──────────────────┐
      └─────────│   friendships    │
                └──────────────────┘
```

## Authentication Entities (BetterAuth)

### users
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PK | BetterAuth user ID |
| name | text | not null | Display name |
| email | text | unique, not null | Email address |
| emailVerified | boolean | not null | Email verification status |
| image | text | nullable | Profile image URL |
| createdAt | timestamp | not null | Account creation |
| updatedAt | timestamp | not null | Last update |

### sessions
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PK | Session ID |
| expiresAt | timestamp | not null | Session expiry |
| token | text | unique, not null | Session token |
| userId | text | FK → users | User reference |
| ipAddress | text | nullable | Client IP |
| userAgent | text | nullable | Browser/device info |

### accounts
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PK | Account ID |
| accountId | text | not null | Provider account ID |
| providerId | text | not null | OAuth provider (google) |
| userId | text | FK → users | User reference |
| accessToken | text | nullable | OAuth access token |
| refreshToken | text | nullable | OAuth refresh token |

## Media Entities

### mediaItems (Movies & TV)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| tmdbId | integer | not null | TMDB ID |
| type | text | not null | 'movie' or 'tv' |
| title | text | not null | Display title |
| originalTitle | text | nullable | Original language title |
| overview | text | nullable | Synopsis |
| posterPath | text | nullable | TMDB poster path |
| backdropPath | text | nullable | TMDB backdrop path |
| releaseDate | date | nullable | Release/first air date |
| lastAirDate | date | nullable | Last episode air date (TV) |
| status | text | nullable | 'Released', 'Ended', etc. |
| voteAverage | integer | nullable | TMDB rating |
| voteCount | integer | nullable | Number of votes |

**Unique Index**: `(tmdbId, type)`

### seasons
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| tmdbId | integer | unique | TMDB season ID |
| mediaItemId | integer | FK → mediaItems | Parent show |
| seasonNumber | integer | not null | Season number |
| name | text | not null | Season name |
| episodeCount | integer | nullable | Number of episodes |
| airDate | date | nullable | Season premiere date |

### episodes
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| tmdbId | integer | unique | TMDB episode ID |
| seasonId | integer | FK → seasons | Parent season |
| episodeNumber | integer | not null | Episode number |
| name | text | not null | Episode title |
| airDate | date | nullable | Air date |
| voteAverage | integer | nullable | Episode rating |

## User Tracking Entities

### userProgress
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| userId | text | FK → users | User reference |
| mediaItemId | integer | FK → mediaItems | Media reference |
| status | text | not null | 'watching', 'completed', 'plan_to_watch', 'dropped' |
| progress | integer | default 0 | Episode number or percentage |

**Unique Index**: `(userId, mediaItemId)`

### ratings
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| userId | text | FK → users | User reference |
| mediaItemId | integer | FK → mediaItems | Media reference |
| rating | integer | not null | 1-10 scale |

## Books & Podcasts

### books
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| googleId | text | unique | Google Books ID |
| title | text | not null | Book title |
| authors | text[] | nullable | Author names |
| description | text | nullable | Book description |
| thumbnail | text | nullable | Cover image URL |
| pageCount | integer | nullable | Total pages |
| categories | text[] | nullable | Genre categories |
| isEbook | boolean | default false | Ebook availability |

### userBookProgress
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| userId | text | FK → users | User reference |
| bookId | integer | FK → books | Book reference |
| status | text | not null | 'reading', 'completed', 'plan_to_read', 'dropped' |
| progress | integer | default 0 | Current page |

### podcasts
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| itunesId | text | unique | iTunes podcast ID |
| collectionName | text | not null | Podcast name |
| artistName | text | nullable | Publisher/host |
| artworkUrl | text | nullable | Cover art URL |
| feedUrl | text | nullable | RSS feed URL |
| genres | text[] | nullable | Categories |

### userPodcastProgress
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| userId | text | FK → users | User reference |
| podcastId | integer | FK → podcasts | Podcast reference |
| status | text | not null | 'listening', 'listened', 'plan_to_listen', 'dropped' |
| progress | integer | default 0 | Episode count |

## Social

### friendships
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | serial | PK | Internal ID |
| userId | text | FK → users | Requester |
| friendId | text | FK → users | Recipient |
| status | text | not null | 'pending', 'accepted' |

**Unique Index**: `(userId, friendId)`
