import type { APIRoute } from 'astro';
import { createAuth } from '@/lib/auth';
import { createTraktSync } from '@/lib/services/trakt-sync';

export const POST: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime?.env || import.meta.env;
    const auth = createAuth(env);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const syncer = createTraktSync(env, session.user.id);
        
        // Run sync
        await syncer.syncAll();
        
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        console.error('Sync failed', e);
        return new Response(JSON.stringify({ error: 'Sync failed' }), { status: 500 });
    }
};
