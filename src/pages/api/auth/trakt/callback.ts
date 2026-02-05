import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createDb } from '@/lib/db';
import { accountConnections } from 'drizzle/schema';
import { and, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals, redirect }) => {
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);
    const db = createDb(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return redirect('/login?error=unauthorized');
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
        return redirect('/profile?error=trakt_auth_failed');
    }

    // Verify state matches the user
    if (state !== session.user.id) {
        return redirect('/profile?error=trakt_state_mismatch');
    }

    const clientId = env.TRAKT_CLIENT_ID || import.meta.env.TRAKT_CLIENT_ID;
    const clientSecret = env.TRAKT_CLIENT_SECRET || import.meta.env.TRAKT_CLIENT_SECRET;
    const redirectUri = env.TRAKT_REDIRECT_URI || import.meta.env.TRAKT_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        return redirect('/profile?error=trakt_not_configured');
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://api.trakt.tv/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            console.error('Trakt token exchange failed:', await tokenResponse.text());
            return redirect('/profile?error=trakt_token_failed');
        }

        const tokens = await tokenResponse.json();

        // Get user info from Trakt
        const userResponse = await fetch('https://api.trakt.tv/users/me', {
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': clientId,
                'Authorization': `Bearer ${tokens.access_token}`,
            },
        });

        if (!userResponse.ok) {
            console.error('Trakt user fetch failed:', await userResponse.text());
            return redirect('/profile?error=trakt_user_failed');
        }

        const traktUser = await userResponse.json();

        // Calculate token expiration
        const expiresAt = tokens.expires_in 
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : null;

        // Upsert the connection
        await db.insert(accountConnections)
            .values({
                userId: session.user.id,
                provider: 'trakt',
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || null,
                expiresAt,
                providerUserId: traktUser.ids?.slug || traktUser.username,
                providerUsername: traktUser.username,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [accountConnections.userId, accountConnections.provider],
                set: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || null,
                    expiresAt,
                    providerUserId: traktUser.ids?.slug || traktUser.username,
                    providerUsername: traktUser.username,
                    updatedAt: new Date(),
                },
            });

        return redirect('/profile?trakt=connected');
    } catch (error) {
        console.error('Trakt callback error:', error);
        return redirect('/profile?error=trakt_error');
    }
};
