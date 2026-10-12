// Optimiza lo que se publica (los archivos fuente en public/ quedan legibles):
// - CSS: quita reglas cuyos selectores no aparecen en ninguna página ni script, y minifica.
// - JS: minifica recorrido-afiches.js.
// - <style> en línea de cada página: mismo tratamiento.
// - Versiona los archivos (?v=hash) para que el navegador no use copias viejas.
// Salida en public/sitio/ (se publica en la raíz). Si faltan postcss o esbuild, copia sin optimizar.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(here, '../public');
const site = path.join(pub, 'sitio');
let postcss, esbuild;
try { postcss = (await import('postcss')).default; esbuild = await import('esbuild'); } catch { console.warn('optimize-assets: sin postcss/esbuild, se copia sin optimizar'); }

async function htmlFiles(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await htmlFiles(p)); else if (e.name.endsWith('.html') && !e.name.startsWith('_')) out.push(p);
  }
  return out;
}
const pages = await htmlFiles(site);
const jsSrc = await fs.readFile(path.join(pub, 'recorrido-afiches.js'), 'utf8');
const htmls = await Promise.all(pages.map(p => fs.readFile(p, 'utf8')));
// conjunto amplio de nombres usados: cualquier palabra que aparezca en el HTML o en los scripts
const used = new Set();
for (const text of [jsSrc, ...htmls]) for (const m of text.matchAll(/[A-Za-z_][\w-]*/g)) used.add(m[0]);

function purge(css) {
  if (!postcss) return css;
  const root = postcss.parse(css);
  root.walkRules(rule => {
    if (rule.parent && rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    const keep = rule.selectors.filter(sel => {
      const names = [...sel.replace(/:not\([^)]*\)/g, '').matchAll(/[.#]([A-Za-z_][\w-]*)/g)].map(m => m[1]); // lo de :not() no hace falta que exista
      return names.every(n => used.has(n));
    });
    if (!keep.length) rule.remove(); else rule.selectors = keep;
  });
  root.walkAtRules(at => { if (at.nodes && !at.nodes.length) at.remove(); });
  return root.toString();
}
async function minify(code, loader) {
  if (!esbuild) return code;
  return (await esbuild.transform(code, { loader, minify: true, legalComments: 'none' })).code;
}
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const report = [];
const assets = {};
for (const name of ['recorrido-afiches.css', 'paginas.css']) {
  const src = await fs.readFile(path.join(pub, name), 'utf8');
  const out = await minify(purge(src), 'css');
  await fs.writeFile(path.join(site, name), out);
  assets[name] = hash(out); report.push(`${name}: ${(src.length / 1024).toFixed(1)} → ${(out.length / 1024).toFixed(1)} KB`);
}
{
  const out = await minify(jsSrc, 'js');
  await fs.writeFile(path.join(site, 'recorrido-afiches.js'), out);
  assets['recorrido-afiches.js'] = hash(out); report.push(`recorrido-afiches.js: ${(jsSrc.length / 1024).toFixed(1)} → ${(out.length / 1024).toFixed(1)} KB`);
}
let inlineBefore = 0, inlineAfter = 0;
for (let i = 0; i < pages.length; i++) {
  let h = htmls[i];
  const styles = [...h.matchAll(/<style>([\s\S]*?)<\/style>/g)];
  for (const m of styles) {
    const out = await minify(purge(m[1]), 'css');
    inlineBefore += m[1].length; inlineAfter += out.length;
    h = h.replace(m[0], () => `<style>${out}</style>`);
  }
  for (const [name, v] of Object.entries(assets)) h = h.split(`"/${name}"`).join(`"/${name}?v=${v}"`);
  await fs.writeFile(pages[i], h);
}
report.push(`CSS en línea (${pages.length} páginas): ${(inlineBefore / 1024).toFixed(0)} → ${(inlineAfter / 1024).toFixed(0)} KB`);
console.log('Optimizado: ' + report.join(' · '));
