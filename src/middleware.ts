import { auth } from "./lib/auth";
import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const isProtectedRoute = context.url.pathname.startsWith("/dashboard") || context.url.pathname.startsWith("/profile");

    if (isProtectedRoute) {
        const session = await auth.api.getSession({
            headers: context.request.headers,
        });

        if (!session) {
            return context.redirect("/login");
        }

        context.locals.user = session.user;
        context.locals.session = session.session;
    }
    return next();
});
