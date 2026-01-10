# GEMINI.md - Traktdb Project Context

## Project Purpose
Traktdb is a personal media tracking application designed to help users organize their movie and TV show libraries, track watching progress, and discover new content. It aims to provide a sleek, modern interface for managing media consumption.

## Architecture Overview
- **Frontend:** Astro with Vue.js components for interactive UI elements.
- **Styling:** Tailwind CSS (v4) with a custom "Deep Dark Blue" / "Gunmetal" theme.
- **Database:** PostgreSQL (using Drizzle ORM).
- **Backend:** Astro API routes (Node.js/Edge).
- **Authentication:** Custom implementation using HTTP-only cookies and sessions stored in the database.

## Key Directories
- `src/pages`: Astro pages and API routes.
- `src/components`: Reusable UI components (mostly Vue).
- `src/lib`: Shared utilities, constants, and database client.
- `drizzle`: Database schema and migration files.
- `public`: Static assets.

## Local Setup
1.  **Install dependencies:** `pnpm install`
2.  **Environment Variables:** Ensure `.env` is configured with database credentials and API keys (TMDB).
3.  **Database Migration:** `pnpm drizzle-kit push`
4.  **Run Development Server:** `pnpm dev`

## Project-Specific Conventions
- **Type Safety:** Strict TypeScript adherence.
- **Components:** Favor Shadcn/Vue patterns where applicable.
- **Media Handling:** Use centralized `MediaCard` for displaying items.
