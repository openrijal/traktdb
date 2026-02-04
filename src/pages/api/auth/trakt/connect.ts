import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ request, locals, redirect }) => {
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const clientId = env.TRAKT_CLIENT_ID || import.meta.env.TRAKT_CLIENT_ID;
    const redirectUri = env.TRAKT_REDIRECT_URI || import.meta.env.TRAKT_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return new Response(JSON.stringify({ error: 'Trakt OAuth not configured' }), { status: 500 });
    }

    const authUrl = new URL('https://trakt.tv/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    
    // Store user ID in state to verify on callback
    authUrl.searchParams.set('state', session.user.id);

    return redirect(authUrl.toString());
};
