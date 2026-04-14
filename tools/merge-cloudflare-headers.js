import fs from 'node:fs';
import path from 'node:path';

function readIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function normalize(text) {
  return text.replace(/\r\n/g, '\n').trim();
}

function mergeHeaders(primary, secondary) {
  const primaryLines = new Set(normalize(primary).split('\n').filter(Boolean));
  const merged = normalize(primary).split('\n');

  for (const line of normalize(secondary).split('\n')) {
    if (!line.trim()) continue;
    if (primaryLines.has(line)) continue;
    merged.push(line);
  }

  return merged.join('\n').trim() + '\n';
}

const rootDir = process.cwd();
const distHeadersPath = path.join(rootDir, 'dist', '_headers');
const publicHeadersPath = path.join(rootDir, 'public', '_headers');
const distRedirectsPath = path.join(rootDir, 'dist', '_redirects');
const publicRedirectsPath = path.join(rootDir, 'public', '_redirects');

const publicHeaders = readIfExists(publicHeadersPath);
const distHeaders = readIfExists(distHeadersPath);
const publicRedirects = readIfExists(publicRedirectsPath);

if (!publicHeaders.trim() && !distHeaders.trim()) {
  // Still copy redirects if present.
  if (publicRedirects.trim()) {
    fs.mkdirSync(path.dirname(distRedirectsPath), { recursive: true });
    fs.writeFileSync(distRedirectsPath, normalize(publicRedirects) + '\n', 'utf8');
  }
  process.exit(0);
}

// Prefer keeping any auto-generated rules (e.g. videos) but always include public rules.
const merged = mergeHeaders(publicHeaders, distHeaders);
fs.mkdirSync(path.dirname(distHeadersPath), { recursive: true });
fs.writeFileSync(distHeadersPath, merged, 'utf8');

// Cloudflare Pages: ensure redirect rules are present in the uploaded artifact.
if (publicRedirects.trim()) {
  fs.mkdirSync(path.dirname(distRedirectsPath), { recursive: true });
  fs.writeFileSync(distRedirectsPath, normalize(publicRedirects) + '\n', 'utf8');
}
