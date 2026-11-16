// Rutas públicas del sitio en cada idioma (es, en, pt, fr). La plantilla usa las rutas en español;
// build-landing.mjs las traduce para /en/, /pt/ y /fr/ con toLang().
import { SERVICES } from './content/services.mjs';
import { LANGS } from './lang-redirect.mjs';

export { LANGS };
export const SITE = 'https://afiches.net';
const ROOT = { es: '/', en: '/en/', pt: '/pt/', fr: '/fr/' };
const SECTION = {
  es: { services: 'servicios/', reports: 'informes/', faq: 'preguntas-frecuentes/' },
  en: { services: 'services/', reports: 'reports/', faq: 'faq/' },
  pt: { services: 'servicos/', reports: 'relatorios/', faq: 'perguntas-frequentes/' },
  fr: { services: 'services/', reports: 'rapports/', faq: 'questions-frequentes/' },
};
export const home = lang => ROOT[lang];
export const servicesIndex = lang => ROOT[lang] + SECTION[lang].services;
export const reportsIndex = lang => ROOT[lang] + SECTION[lang].reports;
export const serviceUrl = (key, lang) => { const s = SERVICES.find(x => x.key === key); return servicesIndex(lang) + s[lang].slug + '/'; };
export const faqUrl = lang => ROOT[lang] + SECTION[lang].faq;
export const reportUrl = (slug, lang) => reportsIndex(lang) + slug + '/';
// la misma página en cada idioma: { es, en, pt }
export const urlsOf = fn => Object.fromEntries(LANGS.map(l => [l, fn(l)]));

export function toLang(html, lang) {
  if (lang === 'es') return html;
  for (const s of SERVICES) html = html.split(`href="/servicios/${s.es.slug}/"`).join(`href="${servicesIndex(lang)}${s[lang].slug}/"`);
  return html.split('href="/servicios/"').join(`href="${servicesIndex(lang)}"`).split('href="/preguntas-frecuentes/"').join(`href="${faqUrl(lang)}"`).replace(/href="\/informes\/([a-z0-9-]*\/?)"/g, (_, rest) => `href="${reportsIndex(lang)}${rest}"`);
}
export const toEnglish = html => toLang(html, 'en');
