// Último paso del build: la landing nueva queda en la raíz del sitio.
// - Todo public/sitio/ (landing en / y /en/, servicios, informes) va a la raíz (build-landing.mjs y build-pages.mjs).
// - La app de React vieja (index.html + assets/ de vite) NO se publica. Sus direcciones /estudios/<slug> y
//   /reportes/<slug> (links viejos de PDFs y mails) redirigen al cartel de mail de la home.
// - No se publican los borradores ni los respaldos de trabajo que hay en public/.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const site = path.join(root, 'public', 'sitio');

// fuera la app de React vieja
await fs.rm(path.join(dist, 'index.html'), { force: true });
await fs.rm(path.join(dist, 'app.html'), { force: true });
await fs.rm(path.join(dist, 'assets'), { recursive: true, force: true });
// landing, páginas internas (servicios, informes) y robots/sitemap/llms
await fs.cp(site, dist, { recursive: true, force: true });

// fuera borradores, respaldos y la carpeta intermedia
await fs.rm(path.join(dist, 'sitio'), { recursive: true, force: true });
await fs.rm(path.join(dist, 'sitio-borradores'), { recursive: true, force: true });
const DRAFT = /^(direccion-episto.*|borrador-clean.*|identidad-visual|visuales-prueba|recorrido-afiches-v\d+\w*-backup.*)\.(html|css|js)$/;
for (const f of await fs.readdir(dist)) if (DRAFT.test(f)) await fs.rm(path.join(dist, f));

await fs.writeFile(path.join(dist, '_redirects'), [
  '/estudios/:slug /?estudio=:slug 301',
  '/reportes/:slug /?estudio=:slug 301',
  '/estudios / 301',
  '/reportes / 301',
  '/app / 301',
].join('\n') + '\n');
console.log('Landing publicada en dist/ (/, /en/) · /estudios/* y /reportes/* redirigen al cartel de mail de la home');
