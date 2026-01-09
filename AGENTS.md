# AGENTS.md

## Project Overview
Media tracking app built with Astro, Vue, DrizzleORM, and Capacitor. Uses BetterAuth for authentication, PostgreSQL via Supabase, and TMDB API for movie/TV data.

## Dev Environment Setup
- Run `npm install` to install dependencies.
- Copy `.env.example` to `.env` and configure database connection and API keys.
- Run `npm run db:migrate` to apply database migrations.
- Run `npm run dev` to start the development server.

## Key Directories
- `src/components/` - Vue components (ShadCN wrapped via shadcn-vue)
- `src/pages/` - Astro pages and API routes
- `src/lib/db/` - Database connection and query helpers
- `src/stores/` - Pinia stores for state management
- `drizzle/` - DrizzleORM schema and migrations

## Database Commands
- `npm run db:generate` - Generate migration files from schema changes.
- `npm run db:migrate` - Run pending migrations.
- `npm run db:studio` - Open Drizzle Studio for database inspection.

## Mobile (Capacitor)
- `npm run build` then `npx cap sync` to sync web build to native projects.
- iOS: Open `ios/` in Xcode.
- Android: Open `android/` in Android Studio.

## Testing & Linting
- Run `npm run lint` before committing.
- Run `npm test` to execute the test suite.
- Fix any TypeScript or lint errors before merging.

## API Routes
- All authenticated routes validate session via BetterAuth middleware.
- API routes live in `src/pages/api/`.
- Use DrizzleORM queries from `src/lib/db/queries/` for database operations.

## PR Instructions
- Title format: `[feature-area] <Title>` (e.g., `[auth] Add Google OAuth`).
- Always run lint and tests before committing.
- Include migration files if schema changes are made.
