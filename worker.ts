import { onRequest } from './functions/api/[[path]]';

export interface Env {
  ASSETS: { fetch: typeof fetch };
  BACKEND_API_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SF_LOGIN_URL?: string;
  SF_CLIENT_ID?: string;
  SF_CLIENT_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: { waitUntil: (p: Promise<unknown>) => void }): Promise<Response> {
    const url = new URL(request.url);

    // Handle API routes via edge function handler
    if (url.pathname.startsWith('/api')) {
      const context = {
        request,
        env,
        params: { path: url.pathname.replace(/^\/api\/?/, '').split('/') },
        data: {},
        waitUntil: (promise: Promise<unknown>) => ctx.waitUntil(promise),
        next: () => env.ASSETS.fetch(request),
        functionPath: url.pathname,
      };
      return onRequest(context as any);
    }

    // Serve static assets from Vite dist/
    return env.ASSETS.fetch(request);
  },
};
