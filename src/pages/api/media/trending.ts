import type { APIRoute } from "astro";
import { createTmdb } from "@/lib/tmdb";

export const GET: APIRoute = async ({ locals }) => {
    // @ts-ignore
    const env = locals.runtime?.env || import.meta.env;
    const tmdb = createTmdb(env);
    try {
        const data = await tmdb.getTrending();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Failed to fetch trending" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
