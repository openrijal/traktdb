# TracktDB

TracktDB is a modern, full-stack media tracking application capable of managing movies, TV shows, and user progress. Built for performance and scalability, it leverages server-side rendering (SSR), edge-ready database connections, and a reactive frontend.

## 🚀 Tech Stack

-   **Framework**: [Astro](https://astro.build) (SSR mode)
-   **Frontend**: [Vue.js](https://vuejs.org) + [Tailwind CSS](https://tailwindcss.com) (v4)
-   **Database**: [Neon](https://neon.tech) (Serverless PostgreSQL)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team)
-   **Authentication**: [BetterAuth](https://better-auth.com) (Google OAuth)
-   **State Management**: [Pinia](https://pinia.vuejs.org) (with persistence)
-   **Video Metadata**: [TMDB API](https://developer.themoviedb.org/docs)
-   **Mobile**: [Capacitor](https://capacitorjs.com) (iOS/Android support)

---

## ✨ Features

### 🔐 Authentication & User Management
-   **Google OAuth Login**: Secure, one-click sign-in flow.
-   **Session Management**: Persistent sessions with secure cookies.
-   **Protected Routes**: Middleware guards dashboard and profile pages.
-   **Profile Customization**: Update display names and upload avatars (integrated with Capacitor Camera).

### 🎬 Media Discovery & Tracking
-   **Smart Search**: Real-time search for Movies and TV Shows via TMDB.
-   **Metadata Caching**: Automatically caches media details, seasons, and episodes to the local database on first fetch to reduce API usage and improve speed.
-   **Detailed Views**: Rich metadata presentation including posters, backdrops, ratings, and release dates.

### 📱 Mobile Ready
-   **PWA Elements**: Camera integration works on web and native mobile.
-   **Responsive Design**: Mobile-first UI optimized for all screen sizes.

---

## 🛠️ Getting Started

### Prerequisites
-   Node.js (v18+)
-   pnpm
-   A Neon Database project
-   Google Cloud Console project (for OAuth)
-   TMDB API Key

### 1. Clone & Install
```bash
git clone <repository-url>
cd traktdb
pnpm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```bash
DATABASE_URL="postgresql://user:password@endpoint.db/db?sslmode=require"
BETTER_AUTH_SECRET="your-secure-random-secret"
BETTER_AUTH_URL="http://localhost:4321" # or your production URL
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
TMDB_API_KEY="your-tmdb-v3-api-key"
```

### 3. Database Setup
Generate and run migrations to create the schema:
```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Run Development Server
```bash
pnpm dev
```
Visit `http://localhost:4321` in your browser.

---

## 📂 Project Structure

```text
/
├── drizzle/            # Database schema and migrations
├── src/
│   ├── components/     # Vue components (Auth, Profile, UI)
│   ├── layouts/        # Astro layouts
│   ├── lib/            # Utilities (Auth client, DB, TMDB)
│   ├── pages/          # File-based routing (Astro & API)
│   │   ├── api/        # Backend API routes (Auth, Media)
│   │   └── ...         # Frontend pages
│   ├── stores/         # Pinia state stores
│   └── middleware.ts   # Route protection logic
└── astro.config.mjs    # Astro configuration
```

## 🔮 Architecture Notes

**Hybrid Caching Strategy**:
The application uses a proxy pattern for media data. When a user requests media details:
1.  The internal API checks if data exists in the Neon database.
2.  If missing, it fetches fresh data from TMDB.
3.  New data is upserted into `media_items` (and `seasons`/`episodes`) tables.
4.  Data is returned to the frontend.
This ensures user personal data (ratings, watch history) can be relationally linked to media items without storing redundant copies of static metadata manually.
