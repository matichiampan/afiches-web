// Genera las páginas internas a partir de la landing ya construida (public/sitio/index.html):
// servicios, informes (resumen público de cada estudio) y sus índices, en español e inglés.
// Los artículos en borrador van a public/sitio-borradores/ (noindex, no se publican).
// También rehace sitemap.xml y suma las páginas a llms.txt.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVICES } from './content/services.mjs';
import { STUDY_PAGES } from './content/studies.mjs';
import { listedReports } from '../src/data/reports.js';
import { ARTICLES } from './content/articles.mjs';
import { SITE, home, servicesIndex, reportsIndex, serviceUrl, reportUrl } from './site-paths.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(here, '../public');
const out = path.join(pub, 'sitio');
const draftsOut = path.join(pub, 'sitio-borradores');
const listedSlugs = new Set(listedReports.map(r => r.slug));
const listedStudies = STUDY_PAGES.filter(s => listedSlugs.has(s.slug));
const cover = st => listedReports.find(r => r.slug === st.slug)?.coverUrl || `/studies/${st.slug}.jpg`;
const TODAY = new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const L = (lang, es, en) => (lang === 'en' ? en : es);

// ---------- piezas de la landing ----------
const shell = {};
for (const lang of ['es', 'en']) {
  const h = await fs.readFile(path.join(out, lang === 'en' ? 'en/index.html' : 'index.html'), 'utf8');
  const grab = re => { const m = h.match(re); if (!m) throw new Error('No encontré ' + re + ' en la landing ' + lang); return m[0]; };
  const homeUrl = home(lang);
  const fix = s => s.replace(/href="#([a-z]+)"/g, `href="${homeUrl}#$1"`).replace(/href="#"/g, `href="${homeUrl}"`);
  shell[lang] = {
    themeInit: grab(/<script>\(\(\)=>\{let t;try\{t=localStorage\.getItem\("afiches-theme"\)[\s\S]*?<\/script>/),
    fonts: grab(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[^\n]*/),
    style: grab(/<style>[\s\S]*?<\/style>/),
    header: fix(grab(/<header class="site-header">[\s\S]*?<\/header>/)),
    footer: fix(grab(/<footer class="site-footer">[\s\S]*?<\/footer>/)),
  };
}

// Índice de circulitos: el mismo de la home (recorrido-afiches.js), con enlaces a /#sección
const railSrc = await fs.readFile(path.join(pub, 'recorrido-afiches.js'), 'utf8');
const DEST = JSON.parse(railSrc.match(/const destinations=(\[.*?\]\]);/)[1].replace(/'/g, '"'));
const rail = (lang, current) => `<nav class="journey top" aria-label="${L(lang, 'Seguí explorando Afiches', 'Keep exploring Afiches')}">${DEST.map(([id, label, color, d]) => `<a href="${home(lang)}${id === 'inicio' ? '' : '#' + id}" style="--dot:${color}" aria-label="${esc(label[lang === 'en' ? 1 : 0])}"${id === current ? ' aria-current="location"' : ''}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="${d}"/></svg><span>${esc(label[lang === 'en' ? 1 : 0])}</span></a>`).join('')}</nav>`;

const ICON = {
  online: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  ia: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  cuali: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/>',
  presencial: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  exit: '<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/>',
  mystery: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  analisis: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  publicidad: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
};
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${ICON[k] || ICON.online}</svg>`;

const ORG = { '@id': `${SITE}/#org` };
function page({ lang, url, alt, title, description, body, ld = [], robots = 'index,follow,max-image-preview:large', ogImage, banner = '', current = '' }) {
  const s = shell[lang], other = lang === 'es' ? 'en' : 'es';
  const header = s.header.replace(/<a class="lang-toggle" href="[^"]*"/, `<a class="lang-toggle" href="${alt}"`).replace('</header>', rail(lang, current) + '</header>');
  const og = ogImage || `${SITE}/og-afiches-${lang}.png`;
  const graph = { '@context': 'https://schema.org', '@graph': ld };
  return `<!doctype html>
<html lang="${lang}" data-theme="dark">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${robots}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${url}">
${robots.startsWith('index') ? `<link rel="alternate" hreflang="${lang}" href="${SITE}${url}"><link rel="alternate" hreflang="${other}" href="${SITE}${alt}"><link rel="alternate" hreflang="x-default" href="${SITE}${lang === 'es' ? url : alt}">` : ''}
<meta name="theme-color" content="#f97316"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:site_name" content="Afiches"><meta property="og:url" content="${SITE}${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${og}">
<meta property="og:locale" content="${lang === 'es' ? 'es_AR' : 'en_US'}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@AfichesAC">
${s.themeInit}
${s.fonts}
${s.style}<link rel="stylesheet" href="/recorrido-afiches.css"><link rel="stylesheet" href="/paginas.css">
${ld.length ? `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>` : ''}
</head><body class="subpage">
${banner}${header}
<main id="inicio">${body}</main>
${s.footer}
<script>(()=>{const r=document.documentElement,b=document.querySelector('.theme-toggle');if(b){const p=d=>{r.dataset.theme=d?'dark':'light';b.setAttribute('aria-pressed',String(d));};p(r.dataset.theme==='dark');b.addEventListener('click',()=>{const d=r.dataset.theme!=='dark';p(d);try{localStorage.setItem('afiches-theme',d?'dark':'light')}catch(e){}});}const n=document.getElementById('news-form');if(n)n.addEventListener('submit',e=>{e.preventDefault();const m=document.getElementById('news-email').value.trim();location.href='mailto:info@afiches.net?subject='+encodeURIComponent(${JSON.stringify(L(lang, 'Suscripción a los estudios de Afiches', 'Subscription to Afiches studies'))})+'&body='+encodeURIComponent(m);});})();</script>
</body></html>
`;
}

const crumbs = (lang, items) => `<nav class="crumbs" aria-label="${L(lang, 'Ruta', 'Breadcrumb')}"><ol>${items.map(([n, u], i) => i < items.length - 1 ? `<li><a href="${u}">${esc(n)}</a></li>` : `<li aria-current="page">${esc(n)}</li>`).join('')}</ol></nav>`;
const crumbsLd = items => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + u })) });
const faqLd = (url, faq) => ({ '@type': 'FAQPage', '@id': SITE + url + '#faq', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
// fila editorial: etiqueta numerada a la izquierda, contenido a la derecha
let rowN = 0;
const row = (label, inner, cls = '') => `<section class="pg-row ${cls}"><h2 class="pg-label"><span>${String(++rowN).padStart(2, '0')}</span>${esc(label)}</h2><div class="pg-body">${inner}</div></section>`;
const faqInner = faq => `<div class="faqs">${faq.map(([q, a], i) => `<details${i ? '' : ' open'}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
const balls = (lang, keys) => `<div class="pg-balls">${keys.map(k => { const r = SERVICES.find(x => x.key === k); return `<a href="${serviceUrl(k, lang)}" style="--c:${r.color}"><span>${icon(k)}</span><b>${esc(r[lang].name)}</b></a>`; }).join('')}</div>`;
const ending = (lang, line, subject, keys) => `<section class="pg-end"><p class="pg-end-line">${esc(line)}</p><div class="pg-end-actions"><a class="pill-button" href="${home(lang)}#contactanos">${L(lang, 'Pedir una propuesta', 'Request a proposal')} ↗</a><a class="pg-mail" href="mailto:info@afiches.net?subject=${encodeURIComponent(subject)}">info@afiches.net</a></div>${keys && keys.length ? `<p class="pg-end-sub">${L(lang, 'También te puede servir', 'You may also need')}</p>${balls(lang, keys)}` : ''}</section>`;
const studyLink = (lang, st) => { const t = st[lang]; return `<a class="pg-study" href="${reportUrl(st.slug, lang)}"><img src="${cover(st)}" alt="" loading="lazy" width="760" height="428"><span><small>${esc((t.sample || t.ficha[0][1]))}</small><b>${esc(t.title)}</b></span><i aria-hidden="true">→</i></a>`; };
// grilla de 10×10 puntos para los datos en porcentaje (el mismo lenguaje que el mapa)
const dots = n => { const p = Math.round(parseFloat(String(n).replace(',', '.'))); if (!/%/.test(n) || !(p >= 0 && p <= 100)) return `<span class="pg-dots pg-dots-big" aria-hidden="true"><i></i></span>`; return `<span class="pg-dots" aria-hidden="true">${Array.from({ length: 100 }, (_, i) => `<i${i < p ? ' class="on"' : ''}></i>`).join('')}</span>`; };
const files = [];
async function write(rel, html, base = out) { const f = path.join(base, rel); await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, html); if (base === out) files.push(rel); }

// ---------- servicios ----------
for (const sv of SERVICES) for (const lang of ['es', 'en']) {
  rowN = 0;
  const t = sv[lang], url = serviceUrl(sv.key, lang), alt = serviceUrl(sv.key, lang === 'es' ? 'en' : 'es');
  const items = [[L(lang, 'Inicio', 'Home'), home(lang)], [L(lang, 'Servicios', 'Services'), servicesIndex(lang)], [t.name, url]];
  const studies = sv.studies.map(s => STUDY_PAGES.find(x => x.slug === s)).filter(Boolean);
  const body = `<article class="pg" style="--c:${sv.color}"><div class="wrap">${crumbs(lang, items)}
<header class="pg-hero"><div class="pg-hero-text"><h1>${esc(t.h1)}</h1><p class="pg-lead">${esc(t.lead)}</p><div class="pg-actions"><a class="pill-button" href="${home(lang)}#contactanos">${L(lang, 'Pedir una propuesta', 'Request a proposal')} ↗</a>${sv.key === 'ia' ? `<a class="pg-mail" href="${home(lang)}#demo">${L(lang, 'Probar la demo', 'Try the demo')} →</a>` : ''}</div></div><div class="pg-orb" aria-hidden="true"><span class="pg-orb-main">${icon(sv.key)}</span><span class="pg-o o1"></span><span class="pg-o o2"></span><span class="pg-o o3"></span></div></header>
${row(L(lang, 'Qué es', 'What it is'), t.what.map(p => `<p>${esc(p)}</p>`).join(''))}
${row(L(lang, 'Cuándo conviene', 'When to use it'), `<ul class="pg-uses">${t.when.map(w => `<li>${esc(w)}</li>`).join('')}</ul>`)}
${row(L(lang, 'Cómo trabajamos', 'How we work'), `<ol class="pg-flow">${t.how.map(([h, p]) => `<li><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join('')}</ol>`)}
${row(L(lang, 'Qué entregamos', 'What we deliver'), `<ul class="pg-deliver">${t.deliver.map(d => `<li>${esc(d)}</li>`).join('')}</ul>`)}
${row(L(lang, 'Preguntas', 'Questions'), faqInner(t.faq))}
${ending(lang, L(lang, `Contanos qué querés medir y armamos la propuesta.`, `Tell us what you want to measure and we’ll put together a proposal.`), t.name, sv.related)}</div></article>`;
  const ld = [{ '@type': 'Service', '@id': SITE + url + '#service', name: t.name, serviceType: t.name, description: t.description, url: SITE + url, provider: ORG, areaServed: [{ '@type': 'Place', name: L(lang, 'América', 'Americas') }], inLanguage: lang }, crumbsLd(items), faqLd(url, t.faq)];
  await write(url.slice(1) + 'index.html', page({ lang, url, alt, title: t.title, description: t.description, body, ld, current: 'servicios' }));
}

// ---------- índice de servicios ----------
for (const lang of ['es', 'en']) {
  const url = servicesIndex(lang), alt = servicesIndex(lang === 'es' ? 'en' : 'es');
  const items = [[L(lang, 'Inicio', 'Home'), home(lang)], [L(lang, 'Servicios', 'Services'), url]];
  const body = `<article class="pg"><div class="wrap">${crumbs(lang, items)}<header class="pg-hero pg-hero-plain"><div class="pg-hero-text"><h1>${L(lang, 'Servicios', 'Services')}</h1><p class="pg-lead">${L(lang, 'Investigación cualitativa y cuantitativa potenciada por IA, con reclutamiento en redes sociales y trabajo de campo propio, en cualquier país de América.', 'AI-powered qualitative and quantitative research, with social media recruitment and our own fieldwork, in any country in the Americas.')}</p></div></header>
<ol class="pg-list">${SERVICES.map(sv => `<li><a href="${serviceUrl(sv.key, lang)}" style="--c:${sv.color}"><span class="pg-list-dot">${icon(sv.key)}</span><b>${esc(sv[lang].name)}</b><span class="pg-list-txt">${esc(sv[lang].lead.split('. ')[0])}.</span><i aria-hidden="true">→</i></a></li>`).join('')}</ol>
${ending(lang, L(lang, '¿No sabés cuál te sirve? Contanos qué necesitás averiguar.', 'Not sure which one fits? Tell us what you need to find out.'), L(lang, 'Consulta', 'Inquiry'))}</div></article>`;
  const ld = [{ '@type': 'CollectionPage', '@id': SITE + url, url: SITE + url, name: L(lang, 'Servicios de Afiches', 'Afiches services'), inLanguage: lang, about: ORG, hasPart: SERVICES.map(sv => ({ '@id': SITE + serviceUrl(sv.key, lang) + '#service' })) }, crumbsLd(items)];
  await write(url.slice(1) + 'index.html', page({ lang, url, alt, title: L(lang, 'Servicios de investigación de mercado y opinión pública | Afiches', 'Market research and public opinion services | Afiches'), description: L(lang, 'Encuestas online, encuestas con entrevistas IA, investigación cualitativa, encuestas presenciales, exit polls, mystery shopper, análisis de datos y publicidad digital.', 'Online surveys, surveys with AI interviews, qualitative research, in-person surveys, exit polls, mystery shopping, data analysis and digital advertising.'), body, ld, current: 'servicios' }));
}

// ---------- informes ----------
for (const st of STUDY_PAGES) for (const lang of ['es', 'en']) {
  rowN = 0;
  const t = st[lang], url = reportUrl(st.slug, lang), alt = reportUrl(st.slug, lang === 'es' ? 'en' : 'es');
  const items = [[L(lang, 'Inicio', 'Home'), home(lang)], [L(lang, 'Informes', 'Reports'), reportsIndex(lang)], [t.title, url]];
  const access = `${home(lang)}?estudio=${st.slug}#estudios`;
  const field = t.ficha.find(f => /Campo|Fieldwork/.test(f[0]))?.[1];
  const body = `<article class="pg pg-report"><div class="wrap">${crumbs(lang, items)}
<header class="pg-hero"><div class="pg-hero-text"><p class="pg-date">${[field, t.sample || t.ficha[0][1]].filter(Boolean).map(esc).join(' · ')}</p><h1>${esc(t.title)}</h1><p class="pg-lead">${esc(t.lead)}</p><div class="pg-actions"><a class="pill-button" href="${access}">${L(lang, 'Acceder al informe completo', 'Access the full report')} ↗</a>${st.dashboard ? `<a class="pg-mail" href="${st.dashboard}">${L(lang, 'Ver el dashboard', 'Open the dashboard')} ↗</a>` : ''}</div></div><a class="pg-cover" href="${access}" aria-label="${esc(L(lang, 'Abrir el informe ', 'Open the report ') + t.title)}"><img src="${cover(st)}" alt="" width="760" height="428"></a></header>
${row(L(lang, 'Datos principales', 'Key findings'), `<div class="pg-stats">${t.stats.map(([n, d]) => `<div class="pg-stat">${dots(n)}<div><b>${esc(n)}</b><span>${esc(d)}</span></div></div>`).join('')}</div>`)}
${row(L(lang, 'Lectura', 'Reading'), t.body.map(p => `<p>${esc(p)}</p>`).join(''))}
${row(L(lang, 'Ficha técnica', 'Methodology'), `<dl class="pg-ficha">${t.ficha.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`)}
${ending(lang, L(lang, 'Podemos hacer un estudio así para tu marca, tu sector o tu territorio.', 'We can run a study like this for your brand, sector or territory.'), t.title, st.services)}</div></article>`;
  const ld = [{ '@type': 'Report', '@id': SITE + url + '#report', name: t.title, headline: t.title, description: t.description, url: SITE + url, ...(listedSlugs.has(st.slug) ? {} : { datePublished: st.date }), inLanguage: lang, publisher: ORG, author: ORG, image: `${SITE}${cover(st)}`, isAccessibleForFree: true }, crumbsLd(items)];
  await write(url.slice(1) + 'index.html', page({ lang, url, alt, title: t.title + ' | Afiches', description: t.description, body, ld, ogImage: `${SITE}${cover(st)}`, current: 'estudios' }));
}
for (const lang of ['es', 'en']) {
  const url = reportsIndex(lang), alt = reportsIndex(lang === 'es' ? 'en' : 'es');
  const items = [[L(lang, 'Inicio', 'Home'), home(lang)], [L(lang, 'Informes', 'Reports'), url]];
  const body = `<article class="pg"><div class="wrap">${crumbs(lang, items)}<header class="pg-hero pg-hero-plain"><div class="pg-hero-text"><h1>${L(lang, 'Informes', 'Reports')}</h1><p class="pg-lead">${L(lang, 'Estudios de opinión pública y de mercado realizados por Afiches en Argentina y América Latina. Cada resumen incluye los datos principales y la ficha técnica; el informe completo se accede dejando un mail.', 'Public opinion and market studies by Afiches in Argentina and Latin America. Each summary includes key findings and methodology; the full report is available by leaving your email.')}</p></div></header>
<ol class="pg-reports">${listedStudies.map(st => { const t = st[lang]; return `<li><a href="${reportUrl(st.slug, lang)}"><img src="${cover(st)}" alt="" loading="lazy" width="760" height="428"><span class="pg-rep-meta">${esc((t.sample || t.ficha[0][1]))}</span><b>${esc(t.title)}</b><span class="pg-rep-stat"><em>${esc(t.stats[0][0])}</em> ${esc(t.stats[0][1])}</span></a></li>`; }).join('')}</ol></div></article>`;
  const ld = [{ '@type': 'CollectionPage', '@id': SITE + url, url: SITE + url, name: L(lang, 'Informes de Afiches', 'Afiches reports'), inLanguage: lang, about: ORG, hasPart: listedStudies.map(st => ({ '@id': SITE + reportUrl(st.slug, lang) + '#report' })) }, crumbsLd(items)];
  await write(url.slice(1) + 'index.html', page({ lang, url, alt, title: L(lang, 'Informes de opinión pública y mercado | Afiches', 'Public opinion and market research reports | Afiches'), description: L(lang, 'Informes de Afiches sobre streaming, fintech y seguridad comparada en cuatro países.', 'Afiches reports on streaming, fintech and comparative security in four countries.'), body, ld, current: 'estudios' }));
}

// ---------- artículos en borrador (fuera del sitio publicado) ----------
await fs.rm(draftsOut, { recursive: true, force: true });
for (const a of ARTICLES) {
  const url = '/recursos/' + a.slug + '/';
  const items = [['Inicio', '/'], ['Recursos', '/recursos/'], [a.title, url]];
  const body = `<article class="pg pg-article"><div class="wrap">${crumbs('es', items)}<header class="pg-hero pg-hero-plain"><div class="pg-hero-text"><p class="pg-date">Recursos · Metodología</p><h1>${esc(a.title)}</h1><p class="pg-lead">${esc(a.description)}</p></div></header>
<div class="pg-prose">${a.sections.map(([h, ps]) => `${h ? `<h2>${esc(h)}</h2>` : ''}${ps.map(p => `<p>${p}</p>`).join('')}`).join('')}<h2>Referencias</h2><ol class="pg-refs">${a.refs.map(r => `<li>${r}</li>`).join('')}</ol></div>${ending('es', 'Contanos qué querés investigar y armamos la propuesta.', a.title, a.services)}</div></article>`;
  const ld = [{ '@type': 'Article', headline: a.title, description: a.description, datePublished: a.date, inLanguage: 'es', author: ORG, publisher: ORG }];
  const banner = a.draft ? '<div class="draft-banner">BORRADOR · no publicado · noindex</div>' : '';
  await write('recursos/' + a.slug + '/index.html', page({ lang: 'es', url, alt: '/en/', title: a.title + ' | Afiches', description: a.description, body, ld, robots: 'noindex,nofollow', banner }), draftsOut);
}
await write('recursos/index.html', page({ lang: 'es', url: '/recursos/', alt: '/en/', title: 'Recursos (borradores) | Afiches', description: 'Borradores de artículos', robots: 'noindex,nofollow', banner: '<div class="draft-banner">BORRADORES · no publicados</div>', body: `<article class="pg"><div class="wrap"><header class="pg-hero pg-hero-plain"><div class="pg-hero-text"><h1>Recursos</h1><p class="pg-lead">Borradores para revisar.</p></div></header><ol class="pg-list">${ARTICLES.map(a => `<li><a href="/borradores/recursos/${a.slug}/" style="--c:#ddd6fe"><span class="pg-list-dot">${icon(a.services[0])}</span><b>${esc(a.title)}</b><span class="pg-list-txt">${esc(a.description)}</span><i aria-hidden="true">→</i></a></li>`).join('')}</ol></div></article>` }), draftsOut);

// ---------- sitemap y llms.txt ----------
const pairs = [['/', '/en/'], [servicesIndex('es'), servicesIndex('en')], ...SERVICES.map(s => [serviceUrl(s.key, 'es'), serviceUrl(s.key, 'en')]), [reportsIndex('es'), reportsIndex('en')], ...listedStudies.map(s => [reportUrl(s.slug, 'es'), reportUrl(s.slug, 'en')])];
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pairs.flatMap(([es, en]) => [es, en].map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><xhtml:link rel="alternate" hreflang="es" href="${SITE}${es}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${es}"/></url>`)).join('\n')}
</urlset>
`;
await fs.writeFile(path.join(out, 'sitemap.xml'), sm);
let llms = await fs.readFile(path.join(out, 'llms.txt'), 'utf8');
llms = llms.replace(/\n## Páginas[\s\S]*?(?=\n## Contacto)/, '');
llms = llms.replace('\n## Contacto', `\n## Páginas\n### Servicios\n${SERVICES.map(s => `- [${s.es.name}](${SITE}${serviceUrl(s.key, 'es')}): ${s.es.description}`).join('\n')}\n\n### Informes\n${listedStudies.map(s => `- [${s.es.title}](${SITE}${reportUrl(s.slug, 'es')}): ${s.es.stats.map(([n, d]) => n + ' ' + d).slice(0, 2).join(' ')}`).join('\n')}\n\n## Contacto`);
await fs.writeFile(path.join(out, 'llms.txt'), llms);
console.log(`Páginas: ${files.length} en public/sitio · borradores: ${ARTICLES.length} en public/sitio-borradores · sitemap con ${pairs.length * 2} URLs`);
