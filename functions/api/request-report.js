import {
  createAccessCookie,
  getFileUrl,
  getReportBySlug,
  isValidEmail,
  json,
} from '../_shared/report-access.js';

const SUPABASE_URL = 'https://ekznrtfuqvazdqueimgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrem5ydGZ1cXZhemRxdWVpbWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzYyOTQsImV4cCI6MjA2ODQ1MjI5NH0.IqKOiJ3Ci7zIA4iCRY5NXHHCa2_gmyBsXG8T239jYOI';
const DEFAULT_COLLECTOR_URL = 'https://afiches-web-1zo.pages.dev/api/collect-lead';

function getSupabaseConfig(env) {
  return {
    url: (env.SUPABASE_URL || SUPABASE_URL).replace(/\/$/, ''),
    key: env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
  };
}

async function saveLead({ request, env, email, report }) {
  const sourcePath = request.headers.get('referer') || null;
  const userAgent = request.headers.get('user-agent') || null;

  if (env.DB) {
    await env.DB.prepare(`
      insert into report_leads (email, report_slug, report_title, source_path, user_agent)
      values (?, ?, ?, ?, ?)
    `).bind(email, report.slug, report.title, sourcePath, userAgent).run();
    return;
  }

  const collectorUrl = env.LEADS_COLLECTOR_URL || DEFAULT_COLLECTOR_URL;
  if (collectorUrl) {
    const collectorResponse = await fetch(collectorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        slug: report.slug,
        sourcePath,
        userAgent,
      }),
    });
    if (collectorResponse.ok) return;
  }

  const { url, key } = getSupabaseConfig(env);
  const insertResponse = await fetch(`${url}/rest/v1/report_leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      email,
      report_slug: report.slug,
      report_title: report.title,
      source_path: sourcePath,
      user_agent: userAgent,
    }),
  });

  if (!insertResponse.ok) {
    throw new Error('No pudimos guardar el mail.');
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Pedido invalido.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const slug = String(body.slug || '').trim();
  const report = getReportBySlug(slug);

  if (!report) return json({ error: 'Estudio no encontrado.' }, { status: 404 });
  if (!isValidEmail(email)) return json({ error: 'Escribi un mail valido.' }, { status: 400 });

  try {
    await saveLead({ request, env, email, report });
  } catch {
    return json({ error: 'No pudimos guardar el mail. Revisar la base report_leads.' }, { status: 502 });
  }

  const accessCookie = await createAccessCookie(report.slug, env);
  return json(
    { fileUrl: getFileUrl(report) },
    {
      status: 200,
      headers: {
        'Set-Cookie': accessCookie,
        'Cache-Control': 'no-store',
      },
    },
  );
}
