// Genera la landing publicable en dos idiomas a partir de la plantilla bilingüe
// public/direccion-episto.html. Salida: public/sitio/ (index.html, en/index.html,
// robots.txt, sitemap.xml, llms.txt). Al publicar, el contenido de sitio/ va a la raíz.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reports, listedReports } from '../src/data/reports.js';
import { toLang, LANGS } from './site-paths.mjs';
import { SERVICES as SERVICE_PAGES } from './content/services.mjs';
import { langScript, langSwitch } from './lang-redirect.mjs';
import { analyticsScript } from './analytics.mjs';

const SITE = 'https://afiches.net';
const TODAY = new Date().toISOString().slice(0, 10);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../public');
const out = path.join(root, 'sitio');
const tpl = await fs.readFile(path.join(root, 'direccion-episto.html'), 'utf8');

const URLS = { es: `${SITE}/`, en: `${SITE}/en/`, pt: `${SITE}/pt/`, fr: `${SITE}/fr/` };
const PATHS = { es: '/', en: '/en/', pt: '/pt/', fr: '/fr/' };
// elige el texto del idioma (es, en, pt)
const T = (lang, es, en, pt, fr) => ({ es, en, pt, fr })[lang];
const SOCIAL = ['https://www.linkedin.com/company/afiches-consultora', 'https://www.instagram.com/afiches_consultora/', 'https://x.com/AfichesAC'];

const META = {
  es: {
    title: 'Afiches | Investigación cualitativa y cuantitativa potenciada por IA',
    description: 'Consultora de investigación de mercado y opinión pública en Argentina. Encuestas online y presenciales, exit polls y entrevistas cualitativas con IA.',
    locale: 'es_AR', ogImage: `${SITE}/og-afiches-es.png`, ogAlt: 'Afiches: investigación cualitativa y cuantitativa potenciada por IA',
  },
  en: {
    title: 'Afiches | Qualitative & quantitative research powered by AI',
    description: 'Market research and public opinion firm in Argentina. Online and in-person surveys, exit polls and AI-assisted qualitative interviews.',
    locale: 'en_US', ogImage: `${SITE}/og-afiches-en.png`, ogAlt: 'Afiches: qualitative and quantitative research powered by AI',
  },
  pt: {
    title: 'Afiches | Pesquisa qualitativa e quantitativa potencializada por IA',
    description: 'Consultoria de pesquisa de mercado e opinião pública na Argentina. Pesquisas online e presenciais, pesquisas de boca de urna e entrevistas qualitativas com IA.',
    locale: 'pt_BR', ogImage: `${SITE}/og-afiches-pt.png`, ogAlt: 'Afiches: pesquisa qualitativa e quantitativa potencializada por IA',
  },
  fr: {
    title: 'Afiches | Recherche qualitative et quantitative propulsée par l\'IA',
    description: 'Cabinet d\'études de marché et d\'opinion publique en Argentine. Enquêtes en ligne et en face à face, sondages à la sortie des urnes et entretiens qualitatifs avec IA.',
    locale: 'fr_FR', ogImage: `${SITE}/og-afiches-fr.png`, ogAlt: 'Afiches\u00a0: recherche qualitative et quantitative propulsée par l\'IA',
  },
};

// Estudios: textos corregidos (tildes) y traducidos
const STUDY = {
  'informe-streaming-septiembre-2026': {
    es: ['Streaming', 'Informe sobre Streaming', 'Septiembre 2026', 'Nacional, 16 años y más', 'Argentina', 'Qué canales de streaming se conocen, qué se dice de Olga, Luzu TV y Gelatina, y qué imagen tienen sus figuras. Informe y dashboard interactivo.'],
    en: ['Streaming', 'Streaming Report', 'September 2026', 'National, aged 16+', 'Argentina', 'Which streaming channels people know, what they say about Olga, Luzu TV and Gelatina, and how their hosts are perceived. Report and interactive dashboard.'],
    pt: ['Streaming', 'Relatório de Streaming', 'Setembro de 2026', 'Nacional, 16 anos ou mais', 'Argentina', 'Quais canais de streaming as pessoas conhecem, o que se diz da Olga, da Luzu TV e da Gelatina e que imagem seus apresentadores têm. Relatório e dashboard interativo.'],
    fr: ['Streaming', 'Rapport Streaming', 'Septembre 2026', 'National, 16 ans et plus', 'Argentine', 'Quelles chaînes de streaming les gens connaissent, ce que l\'on dit d\'Olga, de Luzu TV et de Gelatina, et quelle image ont leurs animateurs. Rapport et tableau de bord interactif.'],
  },
  'encuesta-nacional-octubre-2026': {
    es: ['Opinión pública', 'Encuesta Nacional — Octubre 2026', 'Octubre 2026', 'Nacional, 16 años y más', 'Argentina', 'Milei frente a siete posibles rivales en un ballotage 2027, quiénes son los no polarizados y qué le piden. Informe y dashboard interactivo.'],
    en: ['Public opinion', 'National Survey — October 2026', 'October 2026', 'National, aged 16+', 'Argentina', 'Milei against seven possible rivals in a 2027 runoff, who the non-polarized voters are and what they ask of him. Report and interactive dashboard.'],
    pt: ['Opinião pública', 'Pesquisa Nacional — Outubro de 2026', 'Outubro de 2026', 'Nacional, 16 anos ou mais', 'Argentina', 'Milei contra sete possíveis rivais em um segundo turno em 2027, quem são os não polarizados e o que eles pedem a ele. Relatório e dashboard interativo.'],
    fr: ['Opinion publique', 'Enquête nationale — Octobre 2026', 'Octobre 2026', 'National, 16 ans et plus', 'Argentine', 'Milei face à sept rivaux possibles lors d\'un second tour en 2027, qui sont les électeurs non polarisés et ce qu\'ils lui demandent. Rapport et tableau de bord interactif.'],
  },
  'opinion-publica-pba-julio-2026': {
    es: ['Opinión pública', 'Opinión pública — Provincia de Buenos Aires', 'Julio 2026', '600 casos', 'Provincia de Buenos Aires', 'Un estudio sobre clima social, economía, evaluación de gestión, imagen de dirigentes y escenario electoral en la Provincia de Buenos Aires.'],
    en: ['Public opinion', 'Public opinion — Buenos Aires Province', 'July 2026', '600 respondents', 'Buenos Aires Province', 'Public sentiment, the economy, government approval, perceptions of political leaders, and the electoral landscape in Buenos Aires Province.'],
    pt: ['Opinião pública', 'Opinião pública — Província de Buenos Aires', 'Julho de 2026', '600 respondentes', 'Província de Buenos Aires', 'Um estudo sobre clima social, economia, avaliação do governo, imagem de lideranças políticas e cenário eleitoral na Província de Buenos Aires.'],
    fr: ['Opinion publique', 'Opinion publique — Province de Buenos Aires', 'Juillet 2026', '600\u00a0répondants', 'Province de Buenos Aires', 'Une étude sur le climat social, l\'économie, l\'évaluation du gouvernement, l\'image des dirigeants et le scénario électoral dans la province de Buenos Aires.'],
  },
  'opinion-publica-argentina-junio-2026': {
    es: ['Opinión pública', 'Opinión pública — Argentina', 'Junio 2026', '1.110 casos', 'Argentina', 'Un mapa de clima social, agenda pública y percepciones ciudadanas construido sobre una muestra nacional.'],
    en: ['Public opinion', 'Public opinion — Argentina', 'June 2026', '1,110 respondents', 'Argentina', 'A nationwide overview of public sentiment, key public concerns, and citizens’ perceptions.'],
    pt: ['Opinião pública', 'Opinião pública — Argentina', 'Junho de 2026', '1.110 respondentes', 'Argentina', 'Um mapa do clima social, da agenda pública e das percepções dos cidadãos, construído sobre uma amostra nacional.'],
    fr: ['Opinion publique', 'Opinion publique — Argentine', 'Juin 2026', '1\u00a0110\u00a0répondants', 'Argentine', 'Une carte du climat social, de l\'agenda public et des perceptions des citoyens, construite sur un échantillon national.'],
  },
  'reporte-fintech-q2-2026': {
    es: ['Fintech', 'Reporte Fintech', 'Mayo 2026', '650 casos', 'Argentina', 'Un relevamiento sobre billeteras virtuales, bancos, efectivo y nuevos hábitos de pago en Argentina.'],
    en: ['Fintech', 'Fintech Report', 'May 2026', '650 respondents', 'Argentina', 'A survey on digital wallets, banks, cash and new payment habits in Argentina.'],
    pt: ['Fintech', 'Relatório Fintech', 'Maio de 2026', '650 respondentes', 'Argentina', 'Um levantamento sobre carteiras digitais, bancos, dinheiro vivo e novos hábitos de pagamento na Argentina.'],
    fr: ['Fintech', 'Rapport Fintech', 'Mai 2026', '650\u00a0répondants', 'Argentine', 'Une enquête sur les portefeuilles électroniques, les banques, les espèces et les nouvelles habitudes de paiement en Argentine.'],
  },
  'seguridad-comparada-2026': {
    es: ['Seguridad', 'Reporte de seguridad', '2025-2026', '4 estudios nacionales', 'Argentina, México, Honduras y Uruguay', 'Una comparación regional sobre percepción de inseguridad, experiencia directa y conversación pública.'],
    en: ['Security', 'Security report', '2025–2026', '4 national studies', 'Argentina, Mexico, Honduras and Uruguay', 'A regional comparison of perceptions of insecurity, personal experiences, and public discourse.'],
    pt: ['Segurança', 'Relatório de segurança', '2025-2026', '4 estudos nacionais', 'Argentina, México, Honduras e Uruguai', 'Uma comparação regional sobre percepção de insegurança, experiência direta e conversa pública.'],
    fr: ['Sécurité', 'Rapport sur la sécurité', '2025-2026', '4 études nationales', 'Argentine, Mexique, Honduras et Uruguay', 'Une comparaison régionale de la perception d\'insécurité, de l\'expérience directe et du débat public.'],
  },
  'crisis-venezuela-enero-2026': {
    es: ['Investigación', 'Crisis en Venezuela', 'Enero 2026', 'Resumen regional', 'Venezuela, Colombia, Brasil y Argentina', 'Una lectura regional sobre la crisis venezolana, la percepción del régimen y la posición frente a la intervención externa.'],
    en: ['Research', 'Crisis in Venezuela', 'January 2026', 'Regional summary', 'Venezuela, Colombia, Brazil and Argentina', 'A regional analysis of the Venezuelan crisis, perceptions of the regime, and attitudes toward foreign intervention.'],
    pt: ['Pesquisa', 'Crise na Venezuela', 'Janeiro de 2026', 'Resumo regional', 'Venezuela, Colômbia, Brasil e Argentina', 'Uma leitura regional sobre a crise venezuelana, a percepção do regime e a posição diante da intervenção externa.'],
    fr: ['Recherche', 'Crise au Venezuela', 'Janvier 2026', 'Synthèse régionale', 'Venezuela, Colombie, Brésil et Argentine', 'Une lecture régionale de la crise vénézuélienne, de la perception du régime et de la position face à l\'intervention extérieure.'],
  },
};
const studies = listedReports.filter(r => STUDY[r.slug]).map(r => ({ slug: r.slug, cover: r.coverUrl || `/studies/${r.slug}.jpg`, t: STUDY[r.slug] }));
// Estudios con dashboard público: la tarjeta suma un link directo al dashboard (el PDF sigue pidiendo el mail).
const dash = Object.fromEntries(reports.filter(r => r.dashboardUrl).map(r => [r.slug, r.dashboardUrl]));

const TEAM = [
  { name: 'Matías Chiampan', img: 'matias-chiampan', es: ['Cofundador, Metodología', 'Lidera la metodología de cada estudio. Antes trabajó en Kantar. Formación en Ciencia Política (UBA).'], en: ['Co-founder, Methodology', 'Leads the methodology of every study. Previously at Kantar. Background in political science (University of Buenos Aires).'], pt: ['Cofundador, Metodologia', 'Lidera a metodologia de cada estudo. Antes trabalhou na Kantar. Formação em Ciência Política (Universidade de Buenos Aires).'], fr: ['Cofondateur, Méthodologie', 'Dirige la méthodologie de chaque étude. A travaillé chez Kantar. Formation en science politique (Université de Buenos Aires).'] },
  { name: 'Faustino Raggi', img: 'faustino-raggi', es: ['Cofundador, Comercial', 'Lidera el área comercial. Antes fue Consumer Insights Coordinator en Disney. Formación en Sociología (UBA).'], en: ['Co-founder, Commercial', 'Leads the commercial area. Previously Consumer Insights Coordinator at Disney. Background in sociology (University of Buenos Aires).'], pt: ['Cofundador, Comercial', 'Lidera a área comercial. Antes foi Consumer Insights Coordinator na Disney. Formação em Sociologia (Universidade de Buenos Aires).'], fr: ['Cofondateur, Commercial', 'Dirige le pôle commercial. Auparavant Consumer Insights Coordinator chez Disney. Formation en sociologie (Université de Buenos Aires).'] },
  { name: 'Luciana Modica', img: 'luciana-modica', es: ['Cofundadora, EE.UU.', 'Lidera el desarrollo de negocios en EE.UU. Fundó LIAP. MPA, Columbia University (2027).'], en: ['Co-founder, United States', 'Leads business development in the U.S. Founded LIAP. MPA, Columbia University (2027).'], pt: ['Cofundadora, EUA', 'Lidera o desenvolvimento de negócios nos EUA. Fundou a LIAP. MPA, Columbia University (2027).'], fr: ['Cofondatrice, États-Unis', 'Dirige le développement commercial aux États-Unis. A fondé LIAP. MPA, Columbia University (2027).'] },
  { name: 'Yanny Rodríguez', img: 'yanny-rodriguez', es: ['Responsable Comercial, Regional', 'Lidera el desarrollo comercial regional. Antes trabajó en la Legislatura de la Ciudad de Buenos Aires. Formación en Ciencia Política (UBA).'], en: ['Commercial Lead, Regional', 'Leads regional business development. Previously at the Buenos Aires City Legislature. Background in political science (University of Buenos Aires).'], pt: ['Responsável Comercial, Regional', 'Lidera o desenvolvimento comercial regional. Antes trabalhou na Legislatura da Cidade de Buenos Aires. Formação em Ciência Política (Universidade de Buenos Aires).'], fr: ['Direction commerciale régionale', 'Dirige le développement commercial régional. A travaillé auparavant à la Législature de la Ville de Buenos Aires. Formation en science politique (Université de Buenos Aires).'] },
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Deja solo el idioma que corresponde (<span class="es|en|pt">) fuera de <script> y <style>
function keepLang(html, lang) {
  return html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map(part => {
    if (/^<(script|style)/.test(part)) return part;
    const open = /<span class="(es|en|pt|fr)">/g;
    let s = part, m;
    while ((m = open.exec(s))) {
      const start = m.index, inner = start + m[0].length;
      let depth = 1, i = inner, close = -1;
      const tag = /<span\b[^>]*>|<\/span>/g; tag.lastIndex = inner;
      let t;
      while ((t = tag.exec(s))) { depth += t[0] === '</span>' ? -1 : 1; if (!depth) { close = t.index; break; } }
      if (close < 0) throw new Error('span sin cerrar cerca de: ' + s.slice(start, start + 80));
      const content = m[1] === lang ? s.slice(inner, close) : '';
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
  const btn = T(lang, 'Acceder al informe ↗', 'Access the report ↗', 'Acessar o relatório ↗', 'Accéder au rapport ↗');
  const sampleLabel = T(lang, 'Muestra', 'Sample', 'Amostra', 'Échantillon');
  return studies.map(({ slug, cover, t }) => {
    const [cat, title, period, sample, geo, summary] = t[lang];
    return `<article class="report-card" data-slug="${slug}"><img class="report-cover" src="${cover}" alt="${esc(T(lang, 'Portada del estudio ', 'Cover of the study ', 'Capa do estudo ', 'Couverture de l\'étude ') + title)}" loading="lazy" width="900" height="507"><small>${esc(cat)}</small><h3>${esc(title)}</h3><p class="report-meta">${sampleLabel}${lang === 'fr' ? ' ' : ''}: ${esc(sample)}, ${esc(geo)}</p><p>${esc(summary)}</p><div class="report-actions"><button type="button">${btn}</button>${dash[slug] ? `<a class="report-open" href="${dash[slug]}">${T(lang, 'Ver el dashboard ↗', 'Open the dashboard ↗', 'Ver o dashboard ↗', 'Voir le tableau de bord ↗')}</a>` : ''}<a class="report-more" href="/informes/${slug}/">${T(lang, 'Ver datos principales', 'See key findings', 'Ver dados principais', 'Voir les résultats clés')} →</a></div></article>`;
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
        areaServed: [{ '@type': 'Country', name: 'Argentina' }, { '@type': 'Place', name: T(lang, 'América Latina', 'Latin America', 'América Latina', 'Amérique latine') }],
        founder: people.slice(0, 3).map(p => ({ '@id': p['@id'] })),
        employee: people.map(p => ({ '@id': p['@id'] })),
        sameAs: SOCIAL,
        knowsAbout: T(lang,
          ['Investigación de mercado', 'Opinión pública', 'Encuestas online', 'Encuestas presenciales', 'Exit polls', 'Investigación cualitativa', 'Investigación cuantitativa', 'Entrevistas con inteligencia artificial', 'Reclutamiento en redes sociales'],
          ['Market research', 'Public opinion', 'Online surveys', 'In-person surveys', 'Exit polls', 'Qualitative research', 'Quantitative research', 'AI-assisted interviews', 'Social media recruitment'],
          ['Pesquisa de mercado', 'Opinião pública', 'Pesquisas online', 'Pesquisas presenciais', 'Pesquisas de boca de urna', 'Pesquisa qualitativa', 'Pesquisa quantitativa', 'Entrevistas com inteligência artificial', 'Recrutamento em redes sociais'],
          ['Études de marché', 'Opinion publique', 'Enquêtes en ligne', 'Enquêtes en face à face', 'Sondages à la sortie des urnes', 'Recherche qualitative', 'Recherche quantitative', 'Entretiens avec intelligence artificielle', 'Recrutement sur les réseaux sociaux']),
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: T(lang, 'Servicios de investigación', 'Research services', 'Serviços de pesquisa', 'Services d\'études'),
          itemListElement: SERVICE_PAGES.map(sv => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: sv[lang].name, description: sv[lang].description, provider: { '@id': org } } })),
        },
      },
      { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Afiches', inLanguage: LANGS, publisher: { '@id': org } },
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
        '@type': 'ItemList', '@id': `${url}#estudios`, name: T(lang, 'Estudios de Afiches', 'Afiches studies', 'Estudos da Afiches', 'Études d\'Afiches'),
        itemListElement: studies.map(({ slug, t }, i) => {
          const [cat, title, period, sample, geo, summary] = t[lang];
          return { '@type': 'ListItem', position: i + 1, item: { '@type': 'Report', name: title, description: `${summary} ${T(lang, 'Muestra', 'Sample', 'Amostra', 'Échantillon')}: ${sample}.`, about: cat, spatialCoverage: geo, inLanguage: 'es', publisher: { '@id': org }, url: `${url}#estudios` } };
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
    ...LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${URLS[l]}">`),
    `<link rel="alternate" hreflang="x-default" href="${URLS.en}">`,
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
    `<meta property="og:locale" content="${m.locale}">${LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${META[l].locale}">`).join('')}`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@AfichesAC">`,
    `<meta name="twitter:title" content="${esc(m.title)}"><meta name="twitter:description" content="${esc(m.description)}"><meta name="twitter:image" content="${m.ogImage}">`,
  ].join('\n');
}

const ARIA_EN = { 'Seguí explorando Afiches': 'Keep exploring Afiches',
  'Navegación principal': 'Main navigation', 'Cambiar idioma': 'Change language', 'Activar modo oscuro': 'Switch to dark mode', 'Cerrar': 'Close',
  'Cerrar acceso al estudio': 'Close study access', 'Reproducir video': 'Play video', 'Accesos a Afiches': 'Afiches shortcuts', 'Accesos a informes': 'Report shortcuts',
  'Seleccioná un tema para explorar sus coocurrencias': 'Select a topic to explore how it connects', 'Video original del entrevistador de Afiches': 'Afiches AI interviewer video', 'Suscribirme': 'Subscribe', 'Clientes, instituciones y medios': 'Clients, institutions and media',
};
const ARIA_PT = { 'Seguí explorando Afiches': 'Continue explorando a Afiches',
  'Navegación principal': 'Navegação principal', 'Cambiar idioma': 'Mudar de idioma', 'Activar modo oscuro': 'Ativar modo escuro', 'Cerrar': 'Fechar',
  'Cerrar acceso al estudio': 'Fechar acesso ao estudo', 'Reproducir video': 'Reproduzir vídeo', 'Accesos a Afiches': 'Atalhos da Afiches', 'Accesos a informes': 'Atalhos dos relatórios',
  'Seleccioná un tema para explorar sus coocurrencias': 'Selecione um tema para explorar como ele se conecta', 'Video original del entrevistador de Afiches': 'Vídeo do entrevistador de IA da Afiches', 'Suscribirme': 'Inscrever-me', 'Clientes, instituciones y medios': 'Clientes, instituições e mídia',
};
const ARIA_FR = { 'Seguí explorando Afiches': 'Continuez à explorer Afiches',
  'Navegación principal': 'Navigation principale', 'Cambiar idioma': 'Changer de langue', 'Activar modo oscuro': 'Activer le mode sombre', 'Cerrar': 'Fermer',
  'Cerrar acceso al estudio': 'Fermer l\'accès à l\'étude', 'Reproducir video': 'Lire la vidéo', 'Accesos a Afiches': 'Raccourcis Afiches', 'Accesos a informes': 'Raccourcis des rapports',
  'Seleccioná un tema para explorar sus coocurrencias': 'Sélectionnez un thème pour explorer ses liens', 'Video original del entrevistador de Afiches': 'Vidéo de l\'enquêteur IA d\'Afiches', 'Suscribirme': 'S\'abonner', 'Clientes, instituciones y medios': 'Clients, institutions et médias',
};

function build(lang) {
  let h = keepLang(tpl, lang);
  h = h.replace(/<html lang="es"/, `<html lang="${lang}"`);
  h = h.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="index,follow,max-image-preview:large">');
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(META[lang].title)}</title>\n${headTags(lang)}`);
  // cada idioma vive en su URL; el idioma del navegador (o la elección del botón ES/EN) decide a cuál ir (ver lang-redirect.mjs)
  h = h.replace(/<script>\(\(\)=>\{let l;try\{l=localStorage\.getItem\("afiches-lang"\)\}[\s\S]*?<\/script>/, () => '<script>window.t=(es,en,pt,fr)=>{var l=document.documentElement.lang;return l==="en"?en:l==="pt"?(pt==null?en:pt):l==="fr"?(fr==null?en:fr):es};</script>\n' + langScript(lang, PATHS));
  h = h.replace(/ const langBtn=document\.querySelector\('\.lang-toggle'\);[\s\S]*?\r?\n applyLang\(\);\r?\n/, '\n');
  h = h.replace(/<button class="lang-toggle" type="button" aria-label="Cambiar idioma">([\s\S]*?)<\/button>/, () => langSwitch(lang, PATHS));
  h = h.replace(/placeholder="[^"]*" data-ph-es="([^"]*)" data-ph-en="([^"]*)" data-ph-pt="([^"]*)" data-ph-fr="([^"]*)"/g, (_, es, en, pt, fr) => `placeholder="${T(lang, es, en, pt, fr)}"`);
  h = h.replace(/<p class="local-note">[\s\S]*?<\/p>/g, '');
  h = h.replace(/<div class="report-grid" id="report-grid">[\s\S]*?<\/div>/, `<div class="report-grid" id="report-grid">${studyCards(lang)}</div>`);
  if (lang !== 'es') {
    // el video del entrevistador de IA solo existe en español e inglés: el portugués usa el de inglés
    h = h.replace('src="/videos/afiches-ia.mp4"', 'src="/videos/afiches-ia-en.mp4"'); h = h.replace('poster="/videos/afiches-ia-es.jpg"', 'poster="/videos/afiches-ia-en.jpg"');
    h = toLang(h, lang);
    for (const [a, b] of Object.entries({ en: ARIA_EN, pt: ARIA_PT, fr: ARIA_FR }[lang])) h = h.split(`aria-label="${a}"`).join(`aria-label="${b}"`).split(`alt="${a}"`).join(`alt="${b}"`);
    h = h.replace("theme.setAttribute('aria-label',dark?'Activar modo claro':'Activar modo oscuro');", T(lang, '', "theme.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');", "theme.setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo escuro');", "theme.setAttribute('aria-label',dark?'Activer le mode clair':'Activer le mode sombre');"));
  }
  const ld = JSON.stringify(jsonLd(lang, faqs(h))).replace(/</g, '\\u003c');
  h = h.replace('</head>', `<script type="application/ld+json">${ld}</script>\n${analyticsScript()}\n</head>`);
  if (/class="(es|en|pt|fr)"/.test(h.replace(/<script[\s\S]*?<\/script>/g, ''))) throw new Error('Quedaron textos del otro idioma en ' + lang);
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
${SERVICE_PAGES.map(sv => `- **${sv.es.name}**: ${sv.es.description}`).join('\n')}

## Estudios publicados
${s('es')}

Los informes se acceden en ${URLS.es}#estudios (requiere dejar un mail).

## Equipo
${TEAM.map(p => `- **${p.name}**, ${p.es[0]}. ${p.es[1]}`).join('\n')}

## Contacto
- Web: ${URLS.es} (español), ${URLS.en} (English), ${URLS.pt} (Português), ${URLS.fr} (Français)
- Mail: info@afiches.net
- LinkedIn: ${SOCIAL[0]}
- Instagram: ${SOCIAL[1]}
- X: ${SOCIAL[2]}

## English summary
Afiches is a market research and public opinion firm based in Buenos Aires, Argentina. It runs qualitative and quantitative research powered by AI: it recruits participants through major digital platforms (500+ million social media users across the Americas, 30+ million in Argentina), conducts AI-assisted qualitative interviews at survey scale, and delivers online and in-person surveys, exit polls and digital advertising.

${s('en')}

## Resumo em português
A Afiches é uma consultoria de pesquisa de mercado e opinião pública com sede em Buenos Aires, Argentina. Faz pesquisa qualitativa e quantitativa potencializada por IA: recruta participantes nas principais plataformas digitais (mais de 500 milhões de usuários de redes sociais nas Américas, mais de 30 milhões na Argentina), realiza entrevistas qualitativas assistidas por IA em escala de pesquisa e entrega pesquisas online e presenciais, pesquisas de boca de urna e publicidade digital.

${s('pt')}

## Résumé en français
Afiches est un cabinet d'études de marché et d'opinion publique basé à Buenos Aires, en Argentine. Il mène des recherches qualitatives et quantitatives propulsées par l'IA : il recrute les participants sur les principales plateformes numériques (plus de 500 millions d'utilisateurs de réseaux sociaux dans les Amériques, plus de 30 millions en Argentine), réalise des entretiens qualitatifs assistés par IA à l'échelle d'une enquête et propose des enquêtes en ligne et en face à face, des sondages à la sortie des urnes et de la publicité digitale.

${s('fr')}
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
${LANGS.map(l => `  <url>
    <loc>${URLS[l]}</loc>
    <lastmod>${TODAY}</lastmod>
${LANGS.map(k => `    <xhtml:link rel="alternate" hreflang="${k}" href="${URLS[k]}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${URLS.en}"/>
  </url>`).join('\n')}
</urlset>
`;

for (const l of LANGS) {
  await fs.mkdir(path.join(out, l === 'es' ? '' : l), { recursive: true });
  await fs.writeFile(path.join(out, l === 'es' ? '' : l, 'index.html'), build(l));
}
await fs.writeFile(path.join(out, 'robots.txt'), robots);
await fs.writeFile(path.join(out, 'sitemap.xml'), sitemap);
await fs.writeFile(path.join(out, 'llms.txt'), llms());
console.log('Listo: public/sitio/ (index.html, en/, pt/ y fr/, robots.txt, sitemap.xml, llms.txt)');
