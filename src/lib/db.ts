import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../drizzle/schema";

export const createDb = (env: any) => {
    const url = env.DATABASE_URL || import.meta.env.DATABASE_URL;
    if (!url) {
        throw new Error("DATABASE_URL is not defined");
    }
    const sql = neon(url);
    return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof createDb>;
