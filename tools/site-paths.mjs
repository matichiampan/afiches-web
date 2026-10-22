// Rutas públicas del sitio en cada idioma. La plantilla usa las rutas en español;
// build-landing.mjs las traduce para /en/ con toEnglish().
import { SERVICES } from './content/services.mjs';

export const SITE = 'https://afiches.net';
export const home = lang => (lang === 'en' ? '/en/' : '/');
export const servicesIndex = lang => (lang === 'en' ? '/en/services/' : '/servicios/');
export const reportsIndex = lang => (lang === 'en' ? '/en/reports/' : '/informes/');
export const serviceUrl = (key, lang) => { const s = SERVICES.find(x => x.key === key); return servicesIndex(lang) + s[lang].slug + '/'; };
export const faqUrl = lang => (lang === 'en' ? '/en/faq/' : '/preguntas-frecuentes/');
export const reportUrl = (slug, lang) => reportsIndex(lang) + slug + '/';

export function toEnglish(html) {
  for (const s of SERVICES) html = html.split(`href="/servicios/${s.es.slug}/"`).join(`href="/en/services/${s.en.slug}/"`);
  return html.split('href="/servicios/"').join('href="/en/services/"').split('href="/preguntas-frecuentes/"').join('href="/en/faq/"').replace(/href="\/informes\/([a-z0-9-]*\/?)"/g, 'href="/en/reports/$1"');
}
