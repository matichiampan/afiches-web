import {
  getAccessUrl,
  getReportByDashboardPath,
  hasReportAccess,
} from '../_shared/report-access.js';

// Los dashboards de un estudio piden el mismo mail que su PDF. Sin la cookie de acceso
// se redirige al cartel de mail de la home, que al guardar el mail abre el dashboard.
// Lo que no es un dashboard registrado (por ejemplo /dashboards/vendor/*) pasa directo.
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const report = getReportByDashboardPath(url.pathname);

  if (!report) {
    return env.ASSETS.fetch(request);
  }

  const hasAccess = await hasReportAccess(request, report.slug, env);
  if (!hasAccess) {
    return Response.redirect(new URL(getAccessUrl(report, 'dashboard'), url).toString(), 302);
  }

  const response = await env.ASSETS.fetch(request);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function onRequestHead(context) {
  const response = await onRequestGet(context);
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
