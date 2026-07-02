import {
  getReportBySlug,
  isValidEmail,
  json,
} from '../_shared/report-access.js';

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
  if (!env.DB) {
    return json({ error: 'Lead database not configured.' }, { status: 503 });
  }

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

  await env.DB.prepare(`
    insert into report_leads (email, report_slug, report_title, source_path, user_agent)
    values (?, ?, ?, ?, ?)
  `).bind(
    email,
    report.slug,
    report.title,
    String(body.sourcePath || request.headers.get('referer') || ''),
    String(body.userAgent || request.headers.get('user-agent') || ''),
  ).run();

  return json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
