import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { drizzle } from "drizzle-orm/neon-http"; // Moved
// import { neon } from "@neondatabase/serverless"; // Moved
import * as schema from "../../drizzle/schema";

import { createDb, type Db } from "./db";

export const createAuth = (env: any, dbInstance?: Db) => {
    const db = dbInstance || createDb(env);
    const adapter = drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        }
    }) as any;

    const originalCreate = adapter.create;
    const originalFindOne = adapter.findOne;

    adapter.create = async (data: any) => {
        // Check if encryption key is available
        const encryptionKey = env.ENCRYPTION_KEY || import.meta.env.ENCRYPTION_KEY;

        if (data.model === 'account' && encryptionKey) {
            try {
                const { encrypt } = await import('./crypto');
                // Encrypt tokens before saving
                if (data.accessToken) data.accessToken = await encrypt(data.accessToken, encryptionKey);
                if (data.refreshToken) data.refreshToken = await encrypt(data.refreshToken, encryptionKey);
            } catch (e) {
                console.error('Encryption failed:', e);
            }
        }
        return originalCreate(data);
    };

    adapter.findOne = async (data: any) => {
        const result = await originalFindOne(data);
        const encryptionKey = env.ENCRYPTION_KEY || import.meta.env.ENCRYPTION_KEY;

        if (result && data.model === 'account' && encryptionKey) {
            try {
                const { decrypt } = await import('./crypto');
                // Decrypt tokens after fetching
                if (result.accessToken && result.accessToken.includes(':')) {
                    result.accessToken = await decrypt(result.accessToken, encryptionKey);
                }
                if (result.refreshToken && result.refreshToken.includes(':')) {
                    result.refreshToken = await decrypt(result.refreshToken, encryptionKey);
                }
            } catch (e) {
                console.error('Decryption failed:', e);
            }
        }
        return result;
    };

    return betterAuth({
        trustedOrigins: ["https://traktdb.niteshrijal.com"],
        secret: env.AUTH_SECRET || import.meta.env.AUTH_SECRET,
        database: adapter,
        socialProviders: {
            google: {
                clientId: env.AUTH_GOOGLE_ID || import.meta.env.AUTH_GOOGLE_ID || env.GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID,
                clientSecret: env.AUTH_GOOGLE_SECRET || import.meta.env.AUTH_GOOGLE_SECRET || env.GOOGLE_CLIENT_SECRET || import.meta.env.GOOGLE_CLIENT_SECRET,
            },
        },
    });
};
