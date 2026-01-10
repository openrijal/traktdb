import { createAuth } from "@/lib/auth";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime?.env || import.meta.env;
    return createAuth(env).handler(request);
};
