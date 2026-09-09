interface HealthEnv {
  BACKEND_API_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export const onRequestGet: PagesFunction<HealthEnv> = async ({ env }) => {
  return new Response(
    JSON.stringify({
      ok: true,
      runtime: 'cloudflare-pages',
      service: 'pre-onboarding-journey',
      config: {
        backendConfigured: Boolean(env.BACKEND_API_URL),
        supabaseUrlConfigured: Boolean(env.SUPABASE_URL),
        supabaseCredentialConfigured: Boolean(
          env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
        ),
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
};
