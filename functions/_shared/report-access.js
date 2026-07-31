export const REPORTS = [
  {
    slug: 'opinion-publica-pba-julio-2026',
    title: 'Opinión pública — Provincia de Buenos Aires',
    fileName: 'opinion-publica-pba-julio-2026.pdf',
  },
  {
    slug: 'opinion-publica-argentina-junio-2026',
    title: 'Opinion publica Argentina',
    fileName: 'opinion-publica-argentina-junio-2026.pdf',
  },
  {
    slug: 'reporte-fintech-q2-2026',
    title: "Reporte Fintech Q2'26",
    fileName: 'reporte-fintech-q2-2026-afiches.pdf',
  },
  {
    slug: 'seguridad-comparada-2026',
    title: 'Reporte de seguridad',
    fileName: 'reporte-seguridad-afiches-2026.pdf',
  },
  {
    slug: 'crisis-venezuela-enero-2026',
    title: 'Crisis en Venezuela',
    fileName: 'crisis-venezuela.pdf',
  },
];

export const COOKIE_NAME = 'afiches_report_access';
export const ACCESS_TTL_SECONDS = 30 * 24 * 60 * 60;

const encoder = new TextEncoder();

export function getReportBySlug(slug) {
  return REPORTS.find((report) => report.slug === slug);
}

export function getReportByFileName(fileName) {
  return REPORTS.find((report) => report.fileName === fileName);
}

export function getFileUrl(report) {
  return `/docs/${report.fileName}`;
}

export function getAccessUrl(report) {
  return `/estudios/${report.slug}`;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function getSecret(env) {
  return env.REPORT_ACCESS_SECRET || env.SUPABASE_ANON_KEY || 'afiches-local-report-access';
}

export async function createAccessCookie(slug, env) {
  const payload = base64UrlEncode(JSON.stringify({
    slug,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
  }));
  const signature = await sign(payload, getSecret(env));
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/; Max-Age=${ACCESS_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const parts = header.split(';').map((part) => part.trim());
  const prefix = `${name}=`;
  const value = parts.find((part) => part.startsWith(prefix));
  return value ? value.slice(prefix.length) : '';
}

export async function hasReportAccess(request, slug, env) {
  const cookie = readCookie(request, COOKIE_NAME);
  const [payload, signature] = cookie.split('.');
  if (!payload || !signature) return false;

  const expected = await sign(payload, getSecret(env));
  if (signature !== expected) return false;

  try {
    const data = JSON.parse(base64UrlDecode(payload));
    return data.slug === slug && data.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}
