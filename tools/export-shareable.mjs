import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reports } from '../src/data/reports.js';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../public');
let html=await fs.readFile(path.join(root,'direccion-episto.html'),'utf8');
const css=await fs.readFile(path.join(root,'recorrido-afiches.css'),'utf8');
let js=await fs.readFile(path.join(root,'recorrido-afiches.js'),'utf8');
const catalogue=reports.map(({slug,title,period,category,summary})=>({slug,title,period,category,summary}));
js=js.replace(/  async function post\(url,data\) \{[\s\S]*?\n  \}/,`  async function post() { throw new Error('Esta copia es para revisión visual. La IA, el envío de formularios y las descargas requieren la versión conectada.'); }`);
js=js.replace(/  fetch\('\/api\/demo\/status'\)\.then\(async response=>\{[\s\S]*?return response.json\(\);\}\)\.then\(data=>\{/,`  Promise.resolve(${JSON.stringify({available:false,reports:catalogue}).replace(/</g,'\\u003c')}).then(data=>{`);
js=js.replace("'IA pendiente de conexión'","'Demo IA · requiere conexión al servidor'");
js=js.replace('La demo necesita la conexión con el entrevistador para continuar.','Copia para revisión: podés explorar el diseño, las bolitas, el video y el dashboard. La entrevista en vivo funciona en la versión conectada.');
js=js.replace("$('#report-dialog').showModal();", "$('#report-dialog').showModal();$('#report-email').disabled=true;$('#report-form button').disabled=true;$('#report-form button').textContent='Descarga en la versión conectada';");
// portadas de los estudios (las pide el JS, no el HTML)
const covers={};
for(const {slug} of catalogue){try{covers[slug]='data:image/jpeg;base64,'+(await fs.readFile(path.join(root,'studies',slug+'.jpg'))).toString('base64');}catch{}}
js=js.replace("cover.src='/studies/'+report.slug+'.jpg';","cover.src=(window.COVERS||{})[report.slug]||'';");
js='window.COVERS='+JSON.stringify(covers)+';\n'+js;
html=html.replace('<link rel="stylesheet" href="/recorrido-afiches.css">',`<style>${css}</style>`);
html=html.replace('<script src="/recorrido-afiches.js" defer></script>',`<script>${js.replace(/<\/script/gi,'<\\/script')}</script>`);
const files=[...new Set([...html.matchAll(/src="(\/[^"?#]+)"/g)].map(m=>m[1]))];
const mime={'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4'};
for(const file of files){
  const type=mime[path.extname(file)];if(!type)throw new Error('Tipo inesperado: '+file);
  let bytes;try{bytes=await fs.readFile(path.join(root,file));}catch{html=html.replaceAll(`src="${file}"`,'src=""');console.warn('Falta (se muestra el texto alternativo):',file);continue;}
  html=html.replaceAll(`src="${file}"`,`src="data:${type};base64,${bytes.toString('base64')}"`);
}
html=html.replace('<title>Afiches · Dirección visual 04</title>','<title>Afiches · Borrador para revisión</title>');
html=html.replace('AFICHES · RECORRIDO INTERACTIVO','AFICHES · COPIA PARA REVISIÓN');
html=html.replace('En este borrador el mail se guarda localmente. La descarga se habilita después de registrarlo.','Vista del formulario: en la web, cada estudio se descarga después de dejar el mail. Esta copia no registra datos ni descarga los PDFs.');
html=html.replace('Tus respuestas se procesan con IA de OpenAI para generar la repregunta y el resultado. No incluyas datos confidenciales. En este borrador no se guardan en la base de estudios.','La entrevista con IA real está disponible en la versión conectada. Este archivo permite revisar su presentación, sin enviar respuestas ni datos.');
html=html.replace('Afiches · Exploración visual local · Dirección 04','Afiches · Borrador visual · Copia para revisión');
if(/(?:src|href)="\/(?!\/)/.test(html))throw new Error('Quedaron recursos locales sin incluir');
if(/\bfetch\(/.test(html))throw new Error('Quedaron solicitudes de red al servidor');
if(/OPENAI_API_KEY|Bearer |127\.0\.0\.1|localhost/.test(html))throw new Error('Quedó una referencia de servidor local');
const out=path.resolve(here,'../../Para compartir');await fs.mkdir(out,{recursive:true});
const output=path.join(out,'Afiches - borrador visual.html');await fs.writeFile(output,html);
console.log(JSON.stringify({file:output,megabytes:(Buffer.byteLength(html)/1024/1024).toFixed(2),embeddedAssets:files.length,studies:catalogue.length}));
