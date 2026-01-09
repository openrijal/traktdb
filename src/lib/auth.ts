import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { drizzle } from "drizzle-orm/neon-http"; // Moved
// import { neon } from "@neondatabase/serverless"; // Moved
import * as schema from "../../drizzle/schema";

import { db } from "./db";
import * as schema from "../../drizzle/schema";

// const sql = neon(import.meta.env.DATABASE_URL!); // Moved to db.ts
// const db = drizzle(sql, { schema }); // Moved to db.ts

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        }
    }),
    socialProviders: {
        google: {
            clientId: import.meta.env.GOOGLE_CLIENT_ID!,
            clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
