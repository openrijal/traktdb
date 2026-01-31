# Implementation Plan: Media Tracking Core

**Branch**: `001-media-tracking-core` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Status**: Partially Implemented

## Summary

Cross-platform media tracking application supporting movies, TV series, books, and podcasts. Users can add media to personalized libraries, track episode progress, rate content, and discover trending media. The app uses a server-first architecture with PostgreSQL and BetterAuth for authentication.

## Technical Context (ACTUAL IMPLEMENTATION)

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Astro 5.x, Vue 3, DrizzleORM, Capacitor 8.x, BetterAuth
**Storage**: Neon PostgreSQL (serverless), Pinia for client-side caching
**Testing**: Vitest with happy-dom
**Target Platform**: Web (Cloudflare Pages), iOS 15+, Android 10+
**Project Type**: Web + Mobile (shared codebase via Capacitor)
**Performance Goals**: <2s cold start, <100ms UI interactions
**Auth Method**: Google OAuth via BetterAuth

## What's Implemented ✅

### Infrastructure (Epic #1 - CLOSED)
- Astro 5.x with Vue 3 and TypeScript
- DrizzleORM with Neon PostgreSQL
- BetterAuth with Google OAuth
- ShadCN-Vue components with Tailwind v4
- Capacitor for iOS/Android
- Pinia state management
- Cloudflare deployment

### Database Schema (Epic #3 - CLOSED)
- users, sessions, accounts, verifications (auth)
- mediaItems, seasons, episodes (TMDB content)
- ratings, userProgress (user tracking)
- books, userBookProgress (book tracking)
- podcasts, userPodcastProgress (podcast tracking)
- friendships (social features)

### Core UI (Epic #4 - CLOSED)
- Media search & discovery
- Media detail pages
- Add-to-library flow
- Dashboard components (ContinueSection, TrendingSection, UpcomingList)

### API Routes
- `/api/auth/*` - BetterAuth endpoints
- `/api/media/*` - TMDB proxy routes
- `/api/library/*` - User library management
- `/api/books/*` - Google Books integration
- `/api/podcasts/*` - iTunes podcast integration
- `/api/friends/*` - Friendship management

## What's Remaining 🔄

### Epic #5: Rating & Progress System
- [ ] Half-star rating component (1-10 scale)
- [ ] Episode progress tracking UI
- [ ] Continue Watching calculations
- [ ] Time remaining estimates

### Epic #6: Calendar & Scheduling
- [ ] Calendar list view for upcoming releases
- [ ] Episode air date tracking
- [ ] Release notifications

### Epic #7: Watch Providers
- [ ] TMDB watch provider integration
- [ ] Platform availability badges
- [ ] Deep linking to streaming services

### Epic #8: Books & Podcasts Polish
- [ ] Book reading progress by page
- [ ] Podcast episode tracking
- [ ] Author/host information display

### Epic #9: Mobile App
- [ ] iOS build and testing
- [ ] Android build and testing
- [ ] Native features (push notifications, deep links)
- [ ] Mobile UI optimization

### Epic #10: Production Readiness
- [ ] Error handling & loading states
- [ ] Performance optimization
- [ ] SEO & metadata
- [ ] App Store submission

## Project Structure

```text
src/
├── components/        # Vue components (ShadCN-Vue)
│   ├── ui/            # Generic UI (buttons, cards, etc.)
│   ├── dashboard/     # Dashboard sections
│   ├── books/         # Book-specific components
│   ├── podcasts/      # Podcast-specific components
│   └── landing/       # Landing page components
├── pages/             # Astro pages and API routes
│   ├── api/           # Server-side API endpoints
│   └── media/         # Media detail pages
├── lib/               # Business logic
│   ├── services/      # API abstraction layer
│   └── *.ts           # Utilities (auth, db, tmdb, etc.)
├── stores/            # Pinia state management
└── middleware.ts      # Auth middleware

drizzle/
├── schema.ts          # Database schema
└── migrations/        # Migration files

specs/
└── 001-media-tracking-core/  # Feature specifications
```

## Migration Notes

This plan was originally created for a different repo (`tracktdb` - typo). The actual implementation uses:
- Neon PostgreSQL instead of Supabase
- BetterAuth instead of Supabase Auth
- iTunes API instead of ListenAPI for podcasts

All specs have been migrated and updated to reflect the actual implementation.
