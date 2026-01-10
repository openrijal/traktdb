import { createAuth } from "./lib/auth";
import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const isProtectedRoute = context.url.pathname.startsWith("/dashboard") || context.url.pathname.startsWith("/profile");
    const isAuthPage = context.url.pathname === "/login" || context.url.pathname === "/register";

    // @ts-ignore
    const env = context.locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);

    const session = await auth.api.getSession({
        headers: context.request.headers,
    });

    if (session) {
        context.locals.user = session.user;
        context.locals.session = session.session;

        // Redirect authenticated users away from auth pages
        if (isAuthPage) {
            return context.redirect("/dashboard");
        }
    } else {
        // Redirect unauthenticated users away from protected pages
        if (isProtectedRoute) {
            return context.redirect("/login");
        }
    }

    return next();
});
