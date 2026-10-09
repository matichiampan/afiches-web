const http = require('node:http');
const {route} = require('./demo-api.cjs');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
const types = {'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.pdf':'application/pdf','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
http.createServer(async (req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/borrador-clean.html' : pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403);return res.end();}
  const canonical = '/' + path.relative(root,file).split(path.sep).join('/');
  try { if(await route(req,res,canonical)) return; } catch { res.writeHead(500);return res.end('Error de la vista local'); }
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);return res.end('Not found');}
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let start=0,end=stat.size-1,status=200;
    if(req.headers.range){
      const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!m){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
      start=m[1]?Number(m[1]):Math.max(0,stat.size-Number(m[2]));
      end=m[1]&&m[2]?Math.min(Number(m[2]),end):end;
      if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length']=end-start+1;
    res.writeHead(status,headers);
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(file,{start,end}).pipe(res);
  });
}).listen(3001,'127.0.0.1',()=>console.log('Vista local en http://127.0.0.1:3001/direccion-episto.html'));


