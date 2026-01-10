import type { APIRoute } from "astro";
import { tmdb } from "@/lib/tmdb";

export const GET: APIRoute = async () => {
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
