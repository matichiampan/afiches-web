import {
  getAccessUrl,
  getReportByFileName,
  hasReportAccess,
} from '../_shared/report-access.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const fileName = decodeURIComponent(url.pathname.split('/').pop() || '');
  const report = getReportByFileName(fileName);

  if (!report) {
    return env.ASSETS.fetch(request);
  }

  const hasAccess = await hasReportAccess(request, report.slug, env);
  if (!hasAccess) {
    return Response.redirect(new URL(getAccessUrl(report), url).toString(), 302);
  }

  const response = await env.ASSETS.fetch(request);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `inline; filename="${report.fileName}"`,
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
