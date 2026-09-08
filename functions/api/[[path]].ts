interface Env {
  BACKEND_API_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle CORS preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const backendBase = env.BACKEND_API_URL;

  // 1. If BACKEND_API_URL environment variable is set, proxy request to backend server
  if (backendBase) {
    try {
      const targetUrl = `${backendBase.replace(/\/$/, '')}${url.pathname}${url.search}`;
      const init: RequestInit = {
        method: request.method,
        headers: request.headers,
      };
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = await request.arrayBuffer();
      }
      const res = await fetch(targetUrl, init);
      const resHeaders = new Headers(res.headers);
      resHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(res.body, {
        status: res.status,
        headers: resHeaders,
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: 'Backend proxy error', message: err.message }),
        { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }
  }

  // 2. Handle POST /api/onboarding/resolve Edge function
  if (url.pathname === '/api/onboarding/resolve' && request.method === 'POST') {
    try {
      const body: any = await request.json();
      const phone = body?.phone;

      if (!phone) {
        return new Response(
          JSON.stringify({ success: false, code: 'INVALID_PHONE_NUMBER', message: 'Mobile number is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      const supabaseUrl = env.SUPABASE_URL || 'https://jqxmyxuagerayrgvxjwg.supabase.co';
      const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';

      if (supabaseUrl && supabaseKey) {
        try {
          const sbRes = await fetch(
            `${supabaseUrl}/rest/v1/enrollments?or=(phone_number.ilike.*${cleanPhone}*,whatsapp_number.ilike.*${cleanPhone}*)&limit=1`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            }
          );
          const rows: any = await sbRes.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const row = rows[0];
            return new Response(
              JSON.stringify({
                success: true,
                student: {
                  phone: cleanPhone,
                  name: row.student_name || 'Learner',
                  maskedPhone: `+91 ${cleanPhone.slice(0, 2)}••••${cleanPhone.slice(-4)}`,
                },
                salesforce: {
                  recordId: row.id,
                  object: 'Academy_Onboarding_PRE__c',
                  status: row.nbfc_overall_stages || 'Yet To Contact',
                  stagePre: row.lms_access_status || 'program',
                },
                journey: {
                  stage: 'PROGRAM_REVIEW',
                  route: 'program',
                  targetRoute: 'program',
                  token: row.token || row.id,
                  authRequired: false,
                },
              }),
              { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            );
          }
        } catch (e) {
          console.error('Supabase lookup warning:', e);
        }
      }

      // Default active record response
      return new Response(
        JSON.stringify({
          success: true,
          student: {
            phone: cleanPhone,
            name: 'Learner',
            maskedPhone: `+91 ${cleanPhone.slice(0, 2)}••••${cleanPhone.slice(-4)}`,
          },
          salesforce: {
            recordId: 'a03fv0000014m0zAAA',
            object: 'Academy_Onboarding_PRE__c',
            status: 'Yet To Contact',
            stagePre: 'program',
          },
          journey: {
            stage: 'PROGRAM_REVIEW',
            route: 'program',
            targetRoute: 'program',
            token: 'a03fv0000014m0zAAA',
            authRequired: false,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, message: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }
  }

  // 3. Fallback for GET /api/enrollment/:token/journey or other GET endpoints
  if (url.pathname.includes('/journey')) {
    const token = url.pathname.split('/')[3] || 'a03fv0000014m0zAAA';
    return new Response(
      JSON.stringify({
        success: true,
        journey: {
          journeyId: token,
          token: token,
          authenticated: true,
          learner: { name: 'Learner', firstName: 'Learner', mobileMasked: '+91 95••••2271' },
          program: { name: 'Genius', baseFee: 180000, scholarshipAmount: 0, seatReservationPaid: 18000, amountPayable: 132000 },
          payment: { method: 'NO_COST_EMI', status: 'PENDING', amountPaid: 18000 },
          financing: { applied: true, appliedAmount: 120000, nbfcName: 'NORTHERN ARC', status: 'UNDER_REVIEW' },
          classAccess: { status: 'LOCKED' },
          journey: { currentStage: 'PROGRAM_REVIEW', nextAction: 'SELECT_PAYMENT', recommendedRoute: 'program' },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Cloudflare Pages API route OK', path: url.pathname }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
};
