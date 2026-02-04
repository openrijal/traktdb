# Tasks: Media Tracking Core

**Branch**: 001-media-tracking-core
**Date**: 2026-01-31 (Updated after repo merge)
**Status**: Partially Complete

## Overview

This task list has been consolidated from two repositories:
- `traktdb` (real repo with code)
- `tracktdb` (typo repo with specs only)

Tasks reflect actual implementation status.

---

## Phase 1: Setup & Infrastructure ✅ COMPLETE

### Epic 1: Project Setup (GitHub Issue #1 - CLOSED)
All tasks complete. See closed issues #9, #10, #11.

- [x] T001 Initialize Astro project with TypeScript
- [x] T002 Configure @astrojs/vue integration
- [x] T003 Configure Tailwind CSS v4 with ShadCN-Vue
- [x] T004 Install and configure Pinia with persisted state
- [x] T005 Configure DrizzleORM with Neon PostgreSQL
- [x] T006 Configure BetterAuth with Google OAuth
- [x] T007 Initialize Capacitor for iOS/Android
- [x] T008 Configure Vitest for testing
- [x] T009 Set up Cloudflare deployment via wrangler

---

## Phase 2: Core Features ✅ MOSTLY COMPLETE

### Epic 2: Authentication (Original traktdb #2, #4, #7)
- [x] T010 Implement Google OAuth login flow
- [x] T011 Create auth middleware
- [x] T012 Implement logout functionality (#9 - CLOSED)
- [ ] T013 Fix auth/middleware refactor (#4 - OPEN)

### Epic 3: Database & API (Original traktdb #3, #8)
- [x] T014 Create DrizzleORM schema for all entities
- [x] T015 Set up database migrations
- [x] T016 Implement TMDB API integration
- [x] T017 Create library status API routes
- [x] T018 Complete Phase 2: Library Management (#8 - CLOSED)

### Epic 4: Media Management UI (Original traktdb #4)
- [x] T019 Create media search & discovery
- [x] T020 Build media detail pages
- [x] T021 Implement add-to-library flow
- [x] T022 Create dashboard with TrendingSection, ContinueSection
- [ ] T023 Homepage enhancements (#3 - OPEN)
- [ ] T024 Implement global search UI (#6 - OPEN)
- [ ] T025 Implement app layout & navigation (#5 - OPEN)

---

## Phase 3: Extended Features 🔄 IN PROGRESS

### Epic 5: Rating & Progress System (tracktdb Epic #5)
- [ ] T026 [US2] Implement half-star rating component (1-10 scale)
- [ ] T027 [US2] Build episode progress tracking UI
- [ ] T028 [US2] Calculate and display series completion percentage
- [ ] T029 [US2] Add "Continue Watching" logic with timestamps
- [ ] T030 [US2] Implement time remaining estimates

### Epic 6: Calendar & Scheduling (tracktdb Epic #6)
- [ ] T031 [US3] Create calendar list view for upcoming releases
- [ ] T032 [US3] Track episode air dates
- [ ] T033 [US3] Implement release schedule management
- [ ] T034 [US3] Add upcoming notifications (future)

### Epic 7: Watch Providers (tracktdb Epic #7)
- [ ] T035 [US5] Fetch watch providers from TMDB
- [ ] T036 [US5] Display platform availability badges
- [ ] T037 [US5] Add deep linking to streaming services
- [ ] T038 [US5] Implement manual provider entry for non-video content

---

## Phase 4: Books & Podcasts 🔄 IN PROGRESS

### Epic 8: Books, Audiobooks & Podcasts (tracktdb Epic #8)
Database schema exists. UI needs polish.

- [x] T039 Create books database schema
- [x] T040 Create podcasts database schema
- [x] T041 Implement Google Books API integration
- [x] T042 Implement iTunes podcast search
- [ ] T043 [US6] Build book management UI
- [ ] T044 [US6] Build podcast management UI
- [ ] T045 [US6] Implement reading progress by page
- [ ] T046 [US6] Implement podcast episode tracking
- [ ] T047 [US6] Display author/host information

---

## Phase 5: Mobile App 🔄 PLANNED

### Epic 9: Mobile Development (tracktdb Epic #9)
Capacitor is configured. Native builds need testing.

- [x] T048 Configure Capacitor for iOS
- [x] T049 Configure Capacitor for Android
- [ ] T050 Build and test iOS app
- [ ] T051 Build and test Android app
- [ ] T052 Implement push notifications
- [ ] T053 Add deep linking (`traktdb://media/[id]`)
- [ ] T054 Optimize UI for mobile screens
- [ ] T055 Add swipe gestures and touch optimization

---

## Phase 6: Production Readiness 🔄 PLANNED

### Epic 10: Polish & Deploy (tracktdb Epic #10)
- [ ] T056 Implement global error boundary
- [ ] T057 Add loading skeletons
- [ ] T058 Optimize images and code splitting
- [ ] T059 Add SEO metadata to all pages
- [ ] T060 Deploy web app to production
- [ ] T061 Submit iOS app to App Store
- [ ] T062 Submit Android app to Play Store

---

## Security & Fixes 🔴 ACTIVE

### Open Issues from traktdb
- [ ] #1 Fix MediaType typo in MediaCard.vue
- [ ] #2 Implement design system with Shadcn tokens
- [ ] #12 [Security] Fix unauthenticated resource consumption & CSRF risks

---

## Summary

| Phase | Status | Tasks Done | Tasks Remaining |
|-------|--------|------------|-----------------|
| Phase 1: Setup | ✅ Complete | 9 | 0 |
| Phase 2: Core | 🔄 Mostly Complete | 12 | 4 |
| Phase 3: Extended | 🔄 In Progress | 0 | 8 |
| Phase 4: Books/Pods | 🔄 In Progress | 4 | 5 |
| Phase 5: Mobile | 🔄 Planned | 2 | 6 |
| Phase 6: Production | 🔄 Planned | 0 | 7 |
| Security Fixes | 🔴 Active | 0 | 3 |

**Total**: 27 done, 33 remaining
