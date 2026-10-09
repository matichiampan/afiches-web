// Último paso del build: la landing nueva queda en la raíz del sitio.
// - dist/index.html (español) y dist/en/index.html (inglés) salen de public/sitio/ (tools/build-landing.mjs).
// - La app de React se mueve a dist/app.html y atiende /estudios/* y /reportes/* (links de los PDF y de los mails).
// - No se publican los borradores ni los respaldos de trabajo que hay en public/.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const site = path.join(root, 'public', 'sitio');

await fs.rename(path.join(dist, 'index.html'), path.join(dist, 'app.html'));
await fs.copyFile(path.join(site, 'index.html'), path.join(dist, 'index.html'));
await fs.mkdir(path.join(dist, 'en'), { recursive: true });
await fs.copyFile(path.join(site, 'en', 'index.html'), path.join(dist, 'en', 'index.html'));
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt']) await fs.copyFile(path.join(site, f), path.join(dist, f));

// fuera borradores, respaldos y la carpeta intermedia
await fs.rm(path.join(dist, 'sitio'), { recursive: true, force: true });
const DRAFT = /^(direccion-episto.*|borrador-clean.*|identidad-visual|visuales-prueba|recorrido-afiches-v\d+\w*-backup.*)\.(html|css|js)$/;
for (const f of await fs.readdir(dist)) if (DRAFT.test(f)) await fs.rm(path.join(dist, f));

await fs.writeFile(path.join(dist, '_redirects'), '/estudios/* /app.html 200\n/reportes/* /app.html 200\n');
console.log('Landing publicada en dist/ (/, /en/) · React en /estudios/* y /reportes/*');
