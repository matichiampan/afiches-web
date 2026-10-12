// Vista local igual a producción: la raíz es public/sitio (landing y páginas generadas),
// los borradores se ven en /borradores/ y el resto de los archivos sale de public/.
// Uso: node tools/preview-site.cjs  ->  http://127.0.0.1:3002/
const http = require('node:http');
const {route} = require('./demo-api.cjs');
const fs = require('node:fs');
const path = require('node:path');
const pub = path.resolve(__dirname, '../public');
const site = path.join(pub, 'sitio');
const drafts = path.join(pub, 'sitio-borradores');
const types = {'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.pdf':'application/pdf','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
const pick = (base, rel) => { const f = path.resolve(base, '.' + rel); return f.startsWith(base) && fs.existsSync(f) && fs.statSync(f).isFile() ? f : null; };
http.createServer(async (req,res)=>{
  let p;
  try { p = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
  try { if(await route(req,res,p)) return; } catch { res.writeHead(500);return res.end('Error de la vista local'); }
  const rel = p.endsWith('/') ? p + 'index.html' : p;
  const file = p.startsWith('/borradores/') ? pick(drafts, rel.slice('/borradores'.length)) : (pick(site, rel) || pick(pub, rel));
  if(!file){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('No encontrado');}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  fs.createReadStream(file).pipe(res);
}).listen(3002,'127.0.0.1',()=>console.log('Vista como producción en http://127.0.0.1:3002/'));
