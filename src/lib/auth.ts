import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { drizzle } from "drizzle-orm/neon-http"; // Moved
// import { neon } from "@neondatabase/serverless"; // Moved
import * as schema from "../../drizzle/schema";

import { createDb, type Db } from "./db";

export const createAuth = (env: any, dbInstance?: Db) => {
    const db = dbInstance || createDb(env);
    return betterAuth({
        secret: env.AUTH_SECRET || import.meta.env.AUTH_SECRET,
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
                clientId: env.AUTH_GOOGLE_ID || import.meta.env.AUTH_GOOGLE_ID || env.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID,
                clientSecret: env.AUTH_GOOGLE_SECRET || import.meta.env.AUTH_GOOGLE_SECRET || env.GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET,
            },
        },
    });
};
