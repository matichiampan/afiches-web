// Genera la landing publicable en dos idiomas a partir de la plantilla bilingüe
// public/direccion-episto.html. Salida: public/sitio/ (index.html, en/index.html,
// robots.txt, sitemap.xml, llms.txt). Al publicar, el contenido de sitio/ va a la raíz.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reports, listedReports } from '../src/data/reports.js';
import { toEnglish } from './site-paths.mjs';

const SITE = 'https://afiches.net';
const TODAY = new Date().toISOString().slice(0, 10);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../public');
const out = path.join(root, 'sitio');
const tpl = await fs.readFile(path.join(root, 'direccion-episto.html'), 'utf8');

const URLS = { es: `${SITE}/`, en: `${SITE}/en/` };
const SOCIAL = ['https://www.linkedin.com/company/afiches-consultora', 'https://www.instagram.com/afiches_consultora/', 'https://x.com/AfichesAC'];

const META = {
  es: {
    title: 'Afiches | Investigación cualitativa y cuantitativa potenciada por IA',
    description: 'Consultora de investigación de mercado y opinión pública en Argentina. Encuestas online y presenciales, exit polls y entrevistas cualitativas con IA.',
    locale: 'es_AR', altLocale: 'en_US', ogImage: `${SITE}/og-afiches-es.png`, ogAlt: 'Afiches: investigación cualitativa y cuantitativa potenciada por IA',
  },
  en: {
    title: 'Afiches | Qualitative & quantitative research powered by AI',
    description: 'Market research and public opinion firm in Argentina. Online and in-person surveys, exit polls and AI-assisted qualitative interviews.',
    locale: 'en_US', altLocale: 'es_AR', ogImage: `${SITE}/og-afiches-en.png`, ogAlt: 'Afiches: qualitative and quantitative research powered by AI',
  },
};

// Estudios: textos corregidos (tildes) y traducidos
const STUDY = {
  'informe-streaming-septiembre-2026': {
    es: ['Streaming', 'Informe sobre Streaming', 'Septiembre 2026', 'Nacional, 16 años y más', 'Argentina', 'Qué canales de streaming se conocen, qué se dice de Olga, Luzu TV y Gelatina, y qué imagen tienen sus figuras. Informe y dashboard interactivo.'],
    en: ['Streaming', 'Streaming Report', 'September 2026', 'National, aged 16+', 'Argentina', 'Which streaming channels people know, what they say about Olga, Luzu TV and Gelatina, and how their hosts are perceived. Report and interactive dashboard.'],
  },
  'encuesta-nacional-octubre-2026': {
    es: ['Opinión pública', 'Encuesta Nacional — Octubre 2026', 'Octubre 2026', 'Nacional, 16 años y más', 'Argentina', 'Milei frente a siete posibles rivales en un ballotage 2027, quiénes son los no polarizados y qué le piden. Informe y dashboard interactivo.'],
    en: ['Public opinion', 'National Survey — October 2026', 'October 2026', 'National, aged 16+', 'Argentina', 'Milei against seven possible rivals in a 2027 runoff, who the non-polarized voters are and what they ask of him. Report and interactive dashboard.'],
  },
  'opinion-publica-pba-julio-2026': {
    es: ['Opinión pública', 'Opinión pública — Provincia de Buenos Aires', 'Julio 2026', '600 casos', 'Provincia de Buenos Aires', 'Un estudio sobre clima social, economía, evaluación de gestión, imagen de dirigentes y escenario electoral en la Provincia de Buenos Aires.'],
    en: ['Public opinion', 'Public opinion — Buenos Aires Province', 'July 2026', '600 respondents', 'Buenos Aires Province', 'Public sentiment, the economy, government approval, perceptions of political leaders, and the electoral landscape in Buenos Aires Province.'],
  },
  'opinion-publica-argentina-junio-2026': {
    es: ['Opinión pública', 'Opinión pública — Argentina', 'Junio 2026', '1.110 casos', 'Argentina', 'Un mapa de clima social, agenda pública y percepciones ciudadanas construido sobre una muestra nacional.'],
    en: ['Public opinion', 'Public opinion — Argentina', 'June 2026', '1,110 respondents', 'Argentina', 'A nationwide overview of public sentiment, key public concerns, and citizens’ perceptions.'],
  },
  'reporte-fintech-q2-2026': {
    es: ['Fintech', 'Reporte Fintech', 'Mayo 2026', '650 casos', 'Argentina', 'Un relevamiento sobre billeteras virtuales, bancos, efectivo y nuevos hábitos de pago en Argentina.'],
    en: ['Fintech', 'Fintech Report', 'May 2026', '650 respondents', 'Argentina', 'A survey on digital wallets, banks, cash and new payment habits in Argentina.'],
  },
  'seguridad-comparada-2026': {
    es: ['Seguridad', 'Reporte de seguridad', '2025-2026', '4 estudios nacionales', 'Argentina, México, Honduras y Uruguay', 'Una comparación regional sobre percepción de inseguridad, experiencia directa y conversación pública.'],
    en: ['Security', 'Security report', '2025–2026', '4 national studies', 'Argentina, Mexico, Honduras and Uruguay', 'A regional comparison of perceptions of insecurity, personal experiences, and public discourse.'],
  },
  'crisis-venezuela-enero-2026': {
    es: ['Investigación', 'Crisis en Venezuela', 'Enero 2026', 'Resumen regional', 'Venezuela, Colombia, Brasil y Argentina', 'Una lectura regional sobre la crisis venezolana, la percepción del régimen y la posición frente a la intervención externa.'],
    en: ['Research', 'Crisis in Venezuela', 'January 2026', 'Regional summary', 'Venezuela, Colombia, Brazil and Argentina', 'A regional analysis of the Venezuelan crisis, perceptions of the regime, and attitudes toward foreign intervention.'],
  },
};
const studies = listedReports.filter(r => STUDY[r.slug]).map(r => ({ slug: r.slug, cover: r.coverUrl || `/studies/${r.slug}.jpg`, t: STUDY[r.slug] }));
// Estudios con dashboard público: la tarjeta suma un link directo al dashboard (el PDF sigue pidiendo el mail).
const dash = Object.fromEntries(reports.filter(r => r.dashboardUrl).map(r => [r.slug, r.dashboardUrl]));

const TEAM = [
  { name: 'Matías Chiampan', img: 'matias-chiampan', es: ['Cofundador · Metodología', 'Lidera la metodología de Afiches. Ex Kantar. Formación en Ciencia Política (UBA).'], en: ['Co-founder · Methodology', 'Leads research methodology. Previously at Kantar. Studied political science at the University of Buenos Aires.'] },
  { name: 'Faustino Raggi', img: 'faustino-raggi', es: ['Cofundador · Comercial', 'Lidera el área comercial. Ex coordinador de Insights en Disney. Formación en Sociología (UBA).'], en: ['Co-founder · Commercial', 'Leads commercial strategy. Former Consumer Insights Coordinator at Disney. Background in sociology from the University of Buenos Aires.'] },
  { name: 'Luciana Modica', img: 'luciana-modica', es: ['Cofundadora · EE.UU.', 'Lidera el desarrollo de negocios en EE.UU. Fundadora de LIAP. MPA, Columbia University (2027).'], en: ['Co-founder · United States', 'Leads business development in the U.S. Founder of LIAP. MPA, Columbia University (2027).'] },
  { name: 'Yanny Rodríguez', img: 'yanny-rodriguez', es: ['Responsable Comercial · Regional', 'Lidera el desarrollo comercial regional. Ex Legislatura de la Ciudad de Buenos Aires. Background en Ciencia Política (UBA).'], en: ['Commercial Lead · Regional', 'Leads regional business development. Previously at the Buenos Aires City Legislature. Background in political science (University of Buenos Aires).'] },
];

const SERVICES = {
  es: [['Encuestas online', 'Cuestionarios por internet con preguntas cerradas, sin IA, para medir rápido y con muestras grandes.'], ['Encuestas con entrevistas IA', 'Encuestas con preguntas abiertas en las que la IA repregunta según cada respuesta: entrevistas en profundidad a escala cuantitativa.'], ['Encuestas presenciales', 'Encuestadores propios en la calle, en hogares o en puntos de interés.'], ['Exit polls', 'Encuestas a la salida de votaciones, eventos o actos, con resultados el mismo día.'], ['Mystery shopper', 'Evaluadores que visitan o contactan un negocio como clientes y registran la atención.'], ['Análisis de datos', 'Procesamiento y análisis de bases propias o de terceros, con codificación de abiertas con IA.'], ['Publicidad digital', 'Campañas segmentadas que usan lo que aprendemos en los estudios.']],
  en: [['Online surveys', 'Online questionnaires with closed-ended questions, without AI, to measure quickly with large samples.'], ['Surveys with AI interviews', 'Surveys with open-ended questions where the AI follows up on each answer: the depth of qualitative research at the scale of a survey.'], ['In-person surveys', 'Our own interviewers on the street, in homes or at points of interest.'], ['Exit polls', 'Surveys as people leave polling stations, events or rallies, with same-day results.'], ['Mystery shopping', 'Evaluators who visit or contact a business as customers and record how they were served.'], ['Data analysis', 'Processing and analysis of your own or third-party data, with AI coding of open-ended responses.'], ['Digital advertising', 'Social media ad campaigns that use what we learn in our studies.']],
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Quita el idioma que no corresponde (<span class="es|en">) fuera de <script> y <style>
function keepLang(html, lang) {
  const drop = lang === 'es' ? 'en' : 'es';
  return html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map(part => {
    if (/^<(script|style)/.test(part)) return part;
    const open = /<span class="(es|en)">/g;
    let s = part, m;
    while ((m = open.exec(s))) {
      const start = m.index, inner = start + m[0].length;
      let depth = 1, i = inner, close = -1;
      const tag = /<span\b[^>]*>|<\/span>/g; tag.lastIndex = inner;
      let t;
      while ((t = tag.exec(s))) { depth += t[0] === '</span>' ? -1 : 1; if (!depth) { close = t.index; break; } }
      if (close < 0) throw new Error('span sin cerrar cerca de: ' + s.slice(start, start + 80));
      const content = m[1] === drop ? '' : s.slice(inner, close);
      s = s.slice(0, start) + content + s.slice(close + 7);
      open.lastIndex = start;
    }
    return s;
  }).join('');
}

function faqs(html) {
  if (!html.includes('<div class="faqs">')) return [];
  html = html.slice(html.indexOf('<div class="faqs">'), html.indexOf('<div class="end-cta">'));
  return [...html.matchAll(/<details(?: open)?><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(m => ({ q: text(m[1]), a: text(m[2]) }));
}

function studyCards(lang) {
  const btn = lang === 'es' ? 'Acceder al informe ↗' : 'Access the report ↗';
  const sampleLabel = lang === 'es' ? 'Muestra' : 'Sample';
  return studies.map(({ slug, cover, t }) => {
    const [cat, title, period, sample, geo, summary] = t[lang];
    return `<article class="report-card" data-slug="${slug}"><img class="report-cover" src="${cover}" alt="${esc((lang === 'es' ? 'Portada del estudio ' : 'Cover of the study ') + title)}" loading="lazy" width="900" height="507"><small>${esc(cat)}</small><h3>${esc(title)}</h3><p class="report-meta">${sampleLabel}: ${esc(sample)} · ${esc(geo)}</p><p>${esc(summary)}</p><div class="report-actions"><button type="button">${btn}</button>${dash[slug] ? `<a class="report-open" href="${dash[slug]}">${lang === 'es' ? 'Ver el dashboard ↗' : 'Open the dashboard ↗'}</a>` : ''}<a class="report-more" href="/informes/${slug}/">${lang === 'es' ? 'Ver datos principales' : 'See key findings'} →</a></div></article>`;
  }).join('');
}

function jsonLd(lang, faqList) {
  const url = URLS[lang], org = `${SITE}/#org`;
  const people = TEAM.map((p, i) => ({
    '@type': 'Person', '@id': `${SITE}/#person-${p.img}`, name: p.name, jobTitle: p[lang][0], description: p[lang][1],
    image: `${SITE}/team/${p.img}.jpg`, worksFor: { '@id': org },
  }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'], '@id': org, name: 'Afiches', alternateName: 'Afiches Consultora', url: `${SITE}/`,
        logo: `${SITE}/afiches-logo-color.svg`, image: META[lang].ogImage, email: 'info@afiches.net',
        description: META[lang].description,
        address: { '@type': 'PostalAddress', addressLocality: 'Buenos Aires', addressCountry: 'AR' },
        areaServed: [{ '@type': 'Country', name: 'Argentina' }, { '@type': 'Place', name: lang === 'es' ? 'América Latina' : 'Latin America' }],
        founder: people.slice(0, 3).map(p => ({ '@id': p['@id'] })),
        employee: people.map(p => ({ '@id': p['@id'] })),
        sameAs: SOCIAL,
        knowsAbout: lang === 'es'
          ? ['Investigación de mercado', 'Opinión pública', 'Encuestas online', 'Encuestas presenciales', 'Exit polls', 'Investigación cualitativa', 'Investigación cuantitativa', 'Entrevistas con inteligencia artificial', 'Reclutamiento en redes sociales']
          : ['Market research', 'Public opinion', 'Online surveys', 'In-person surveys', 'Exit polls', 'Qualitative research', 'Quantitative research', 'AI-assisted interviews', 'Social media recruitment'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: lang === 'es' ? 'Servicios de investigación' : 'Research services',
          itemListElement: SERVICES[lang].map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description, provider: { '@id': org } } })),
        },
      },
      { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Afiches', inLanguage: ['es', 'en'], publisher: { '@id': org } },
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: META[lang].title, description: META[lang].description,
        inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': org }, dateModified: TODAY,
        primaryImageOfPage: { '@type': 'ImageObject', url: META[lang].ogImage },
      },
      ...people,
      // las preguntas frecuentes viven en su propia página (build-pages.mjs)
      ...(faqList.length ? [{
        '@type': 'FAQPage', '@id': `${url}#faq`, inLanguage: lang,
        mainEntity: faqList.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }] : []),
      {
        '@type': 'ItemList', '@id': `${url}#estudios`, name: lang === 'es' ? 'Estudios de Afiches' : 'Afiches studies',
        itemListElement: studies.map(({ slug, t }, i) => {
          const [cat, title, period, sample, geo, summary] = t[lang];
          return { '@type': 'ListItem', position: i + 1, item: { '@type': 'Report', name: title, description: `${summary} ${lang === 'es' ? 'Muestra' : 'Sample'}: ${sample}.`, about: cat, spatialCoverage: geo, inLanguage: 'es', publisher: { '@id': org }, url: `${url}#estudios` } };
        }),
      },
    ],
  };
}

function headTags(lang) {
  const m = META[lang], url = URLS[lang];
  return [
    `<meta name="description" content="${esc(m.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="es" href="${URLS.es}">`,
    `<link rel="alternate" hreflang="en" href="${URLS.en}">`,
    `<link rel="alternate" hreflang="x-default" href="${URLS.es}">`,
    `<meta name="author" content="Afiches">`,
    `<meta name="theme-color" content="#f97316">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Afiches">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.description)}">`,
    `<meta property="og:image" content="${m.ogImage}">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(m.ogAlt)}">`,
    `<meta property="og:locale" content="${m.locale}"><meta property="og:locale:alternate" content="${m.altLocale}">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@AfichesAC">`,
    `<meta name="twitter:title" content="${esc(m.title)}"><meta name="twitter:description" content="${esc(m.description)}"><meta name="twitter:image" content="${m.ogImage}">`,
  ].join('\n');
}

const ARIA_EN = {
  'Navegación principal': 'Main navigation', 'Cambiar idioma': 'Change language', 'Activar modo oscuro': 'Switch to dark mode', 'Cerrar': 'Close',
  'Cerrar acceso al estudio': 'Close study access', 'Reproducir video': 'Play video', 'Accesos a Afiches': 'Afiches shortcuts', 'Accesos a informes': 'Report shortcuts',
  'Seleccioná un tema para explorar sus coocurrencias': 'Select a topic to explore how it connects', 'Video original del entrevistador de Afiches': 'Afiches AI interviewer video', 'Suscribirme': 'Subscribe', 'Clientes, instituciones y medios': 'Clients, institutions and media',
};

function build(lang) {
  let h = keepLang(tpl, lang);
  const other = lang === 'es' ? 'en' : 'es';
  h = h.replace(/<html lang="es"/, `<html lang="${lang}"`);
  h = h.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="index,follow,max-image-preview:large">');
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(META[lang].title)}</title>\n${headTags(lang)}`);
  // idioma fijo por URL: sin detección automática ni cambio en la misma página
  h = h.replace(/<script>\(\(\)=>\{let l;try\{l=localStorage\.getItem\("afiches-lang"\)\}[\s\S]*?<\/script>/, '<script>window.t=(es,en)=>document.documentElement.lang==="en"?en:es;</script>');
  h = h.replace(/ const langBtn=document\.querySelector\('\.lang-toggle'\);[\s\S]*?\r?\n applyLang\(\);\r?\n/, '\n');
  h = h.replace(/<button class="lang-toggle" type="button" aria-label="Cambiar idioma">([\s\S]*?)<\/button>/,
    `<a class="lang-toggle" href="${lang === 'es' ? 'en/' : '../'}" hreflang="${other}" lang="${other}" aria-label="${other === 'en' ? 'English version' : 'Versión en español'}">$1</a>`);
  h = h.replace(/placeholder="[^"]*" data-ph-es="([^"]*)" data-ph-en="([^"]*)"/g, (_, es, en) => `placeholder="${lang === 'es' ? es : en}"`);
  h = h.replace(/<p class="local-note">[\s\S]*?<\/p>/g, '');
  h = h.replace(/<div class="report-grid" id="report-grid">[\s\S]*?<\/div>/, `<div class="report-grid" id="report-grid">${studyCards(lang)}</div>`);
  if (lang === 'en') {
    h = h.replace('src="/videos/afiches-ia.mp4"', 'src="/videos/afiches-ia-en.mp4"');
    h = toEnglish(h);
    for (const [a, b] of Object.entries(ARIA_EN)) h = h.split(`aria-label="${a}"`).join(`aria-label="${b}"`).split(`alt="${a}"`).join(`alt="${b}"`);
    h = h.replace("theme.setAttribute('aria-label',dark?'Activar modo claro':'Activar modo oscuro');", "theme.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');");
  }
  const ld = JSON.stringify(jsonLd(lang, faqs(h))).replace(/</g, '\\u003c');
  h = h.replace('</head>', `<script type="application/ld+json">${ld}</script>\n</head>`);
  if (/class="(es|en)"/.test(h.replace(/<script[\s\S]*?<\/script>/g, ''))) throw new Error('Quedaron textos del otro idioma en ' + lang);
  if (/data-ph-/.test(h)) throw new Error('Quedaron placeholders sin resolver en ' + lang + ': ' + h.slice(h.indexOf('data-ph-') - 120, h.indexOf('data-ph-') + 40));
  return h;
}

function llms() {
  const s = (lang) => studies.map(({ t }) => { const [cat, title, period, sample, geo, summary] = t[lang]; return `- **${title}** (${sample}; ${geo}): ${summary}`; }).join('\n');
  return `# Afiches

> Consultora de investigación de mercado y opinión pública con base en Buenos Aires, Argentina. Hace investigación cualitativa y cuantitativa potenciada por inteligencia artificial: recluta participantes en las principales plataformas digitales, realiza entrevistas cualitativas asistidas por IA a escala de encuesta y analiza los resultados.

## Qué hace Afiches
- Alcance de más de 30 millones de personas en Argentina a través de las principales plataformas digitales (Facebook, Instagram, WhatsApp).
- Recluta con anuncios segmentados en Meta (Facebook, Instagram, WhatsApp) en cualquier país de América: por edad, nivel socioeconómico, intereses y ubicación, entre otros. Puede investigar públicos de menos del 0,01% de la población.
- Suma encuestadores propios en campo cuando el estudio lo requiere.
- Entrevistas cualitativas asistidas por IA: cada respuesta orienta la siguiente pregunta, combinando profundidad cualitativa con escala cuantitativa.
- Resultados con porcentajes y cruces, temas detectados y frases textuales de los participantes.

## Servicios
${SERVICES.es.map(([n, d]) => `- **${n}**: ${d}`).join('\n')}

## Estudios publicados
${s('es')}

Los informes se acceden en ${URLS.es}#estudios (requiere dejar un mail).

## Equipo
${TEAM.map(p => `- **${p.name}**, ${p.es[0]}. ${p.es[1]}`).join('\n')}

## Contacto
- Web: ${URLS.es} (español) · ${URLS.en} (English)
- Mail: info@afiches.net
- LinkedIn: ${SOCIAL[0]}
- Instagram: ${SOCIAL[1]}
- X: ${SOCIAL[2]}

## English summary
Afiches is a market research and public opinion firm based in Buenos Aires, Argentina. It runs qualitative and quantitative research powered by AI: it recruits participants through major digital platforms (500+ million social media users across the Americas, 30+ million in Argentina), conducts AI-assisted qualitative interviews at survey scale, and delivers online and in-person surveys, exit polls and digital advertising.

${s('en')}
`;
}

const robots = `# Afiches
User-agent: *
Allow: /
Disallow: /api/

# Buscadores con IA (ChatGPT, Claude, Perplexity, Gemini) incluidos: Allow / aplica a todos.
Sitemap: ${SITE}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['es', 'en'].map(l => `  <url>
    <loc>${URLS[l]}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="${URLS.es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${URLS.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${URLS.es}"/>
  </url>`).join('\n')}
</urlset>
`;

await fs.mkdir(path.join(out, 'en'), { recursive: true });
await fs.writeFile(path.join(out, 'index.html'), build('es'));
await fs.writeFile(path.join(out, 'en', 'index.html'), build('en'));
await fs.writeFile(path.join(out, 'robots.txt'), robots);
await fs.writeFile(path.join(out, 'sitemap.xml'), sitemap);
await fs.writeFile(path.join(out, 'llms.txt'), llms());
console.log('Listo: public/sitio/ (index.html, en/index.html, robots.txt, sitemap.xml, llms.txt)');
