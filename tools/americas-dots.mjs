// Genera la grilla de puntos del mapa de América (sección Alcance).
// Uso: node tools/americas-dots.mjs > americas.json
// Salida: {W,H,R,dots:[[x,y,país]],countries:[[es,en,x,y,w,h]],cities:[[nombre,x,y,país]]}
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { geoEquirectangular, geoContains } = require('d3-geo');
const { feature } = require('topojson-client');

const world = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url), 'utf8'));
const all = feature(world, world.objects.countries).features;
const EXCLUDE = new Set(['304', '010']); // Groenlandia, Antártida
const americas = all.filter(f => {
  if (EXCLUDE.has(f.id)) return false;
  const c = f.geometry.coordinates.flat(3);
  let lon = 0, n = 0;
  for (let i = 0; i < c.length; i += 2) { lon += c[i]; n++; }
  return lon / n < -30;
});
// Países con ciudades de ejemplo: [nombre en world-atlas, español, inglés]
const COUNTRIES = [
  ['Argentina', 'Argentina', 'Argentina'], ['Uruguay', 'Uruguay', 'Uruguay'], ['Chile', 'Chile', 'Chile'], ['Peru', 'Perú', 'Peru'],
  ['Colombia', 'Colombia', 'Colombia'], ['Ecuador', 'Ecuador', 'Ecuador'], ['Brazil', 'Brasil', 'Brazil'], ['Paraguay', 'Paraguay', 'Paraguay'],
  ['Bolivia', 'Bolivia', 'Bolivia'], ['Mexico', 'México', 'Mexico'], ['Guatemala', 'Guatemala', 'Guatemala'], ['Costa Rica', 'Costa Rica', 'Costa Rica'],
  ['Panama', 'Panamá', 'Panama'], ['Dominican Rep.', 'República Dominicana', 'Dominican Republic'], ['United States of America', 'Estados Unidos', 'United States'], ['Canada', 'Canadá', 'Canada'],
];
const feats = COUNTRIES.map(([n]) => { const f = americas.find(x => x.properties.name === n); if (!f) throw new Error('No encuentro ' + n); return f; });
const W = 520, H = 500, STEP = 7.2;
const proj = geoEquirectangular().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'MultiPoint', coordinates: [[-168, 72], [-34, -56]] });
const dots = [];
for (let y = STEP / 2; y < H; y += STEP) for (let x = STEP / 2; x < W; x += STEP) {
  const ll = proj.invert([x, y]);
  if (ll[1] > 72 || ll[1] < -56 || (ll[0] < -150 && ll[1] < 30)) continue;
  if (!americas.some(f => geoContains(f, ll))) continue;
  dots.push([+x.toFixed(1), +y.toFixed(1), feats.findIndex(f => geoContains(f, ll))]);
}
// Recuadro de cada país (solo continente principal: se recorta a lo que tiene puntos)
const countries = COUNTRIES.map(([, es, en], i) => {
  const ds = dots.filter(d => d[2] === i);
  let x0 = Math.min(...ds.map(d => d[0])), x1 = Math.max(...ds.map(d => d[0])), y0 = Math.min(...ds.map(d => d[1])), y1 = Math.max(...ds.map(d => d[1]));
  if (es === 'Estados Unidos') { const m = ds.filter(d => d[1] > 90); x0 = Math.min(...m.map(d => d[0])); x1 = Math.max(...m.map(d => d[0])); y0 = Math.min(...m.map(d => d[1])); y1 = Math.max(...m.map(d => d[1])); }
  return [es, en, +x0.toFixed(1), +y0.toFixed(1), +(x1 - x0).toFixed(1), +(y1 - y0).toFixed(1)];
});
const CITIES = [
  ['Buenos Aires', -58.38, -34.6, 0], ['Córdoba', -64.18, -31.42, 0], ['Rosario', -60.64, -32.95, 0], ['Mendoza', -68.83, -32.89, 0],
  ['Montevideo', -56.16, -34.9, 1], ['Santiago', -70.67, -33.45, 2], ['Lima', -77.04, -12.05, 3], ['Bogotá', -74.07, 4.71, 4], ['Medellín', -75.57, 6.25, 4],
  ['Quito', -78.47, -0.18, 5], ['São Paulo', -46.63, -23.55, 6], ['Río de Janeiro', -43.17, -22.91, 6], ['Asunción', -57.58, -25.26, 7], ['La Paz', -68.15, -16.5, 8],
  ['Ciudad de México', -99.13, 19.43, 9], ['Guadalajara', -103.35, 20.66, 9], ['Monterrey', -100.31, 25.69, 9], ['Guatemala', -90.51, 14.63, 10],
  ['San José', -84.09, 9.93, 11], ['Panamá', -79.52, 8.98, 12], ['Miami', -80.19, 25.76, 14],
  ['Nueva York', -74.0, 40.71, 14], ['Chicago', -87.63, 41.88, 14], ['Los Ángeles', -118.24, 34.05, 14], ['Houston', -95.37, 29.76, 14],
  ['Toronto', -79.38, 43.65, 15], ['Montreal', -73.57, 45.5, 15], ['Vancouver', -123.12, 49.28, 15],
];
const cities = CITIES.map(([name, lon, lat, c]) => { const [x, y] = proj([lon, lat]); return [name, +x.toFixed(1), +y.toFixed(1), c]; });
process.stdout.write(JSON.stringify({ W, H, R: +(STEP * 0.36).toFixed(2), dots, countries, cities }));
