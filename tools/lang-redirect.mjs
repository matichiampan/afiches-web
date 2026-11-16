// Idioma automático del sitio (lo usan build-landing.mjs y build-pages.mjs).
// Cada página publicada tiene su versión en español, inglés y portugués, cada una en su propia dirección
// (/ , /en/ y /pt/ ; /servicios/… , /en/services/… y /pt/servicos/…), con hreflang para Google.
// Este script va en el <head> y:
//   1. Si la persona ya eligió idioma con el selector ES / EN / PT de arriba, se respeta esa elección.
//   2. Si no, se usa el idioma principal del navegador: español → versión en español; portugués → versión
//      en portugués; cualquier otro idioma (inglés, francés, chino…) → versión en inglés.
//   3. Si la página abierta no es la del idioma que corresponde, pasa a la versión equivalente
//      (misma ruta, conserva ?consulta y #ancla) con location.replace, así el botón "atrás" no rebota.
// Los buscadores y las vistas previas de links no se redirigen: Google tiene que seguir viendo cada idioma en su dirección.
// El selector son links normales a cada versión; al tocar uno se guarda la elección (afiches-lang).
export const LANGS = ['es', 'en', 'pt'];
export const BOT = '/bot|crawl|spider|slurp|facebookexternalhit|embedly|lighthouse|pagespeed|inspectiontool|yandex|baidu|duckduck/i';

// urls: { es, en, pt } con la dirección de ESTA misma página en cada idioma (rutas desde la raíz)
export function langScript(lang, urls) {
  return `<script>(()=>{var L=${JSON.stringify(lang)},U=${JSON.stringify(urls)};` +
    `document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest(".lang-toggle a");if(a){var v=a.getAttribute("lang");if(v==="es"||v==="en"||v==="pt")try{localStorage.setItem("afiches-lang",v)}catch(x){}}});` +
    `var s;try{s=localStorage.getItem("afiches-lang")}catch(x){}` +
    `if(s!=="es"&&s!=="en"&&s!=="pt"){if(${BOT}.test(navigator.userAgent||""))return;var n=(navigator.languages&&navigator.languages[0])||navigator.language||"";if(!n)return;s=/^es(?:[-_]|$)/i.test(n)?"es":/^pt(?:[-_]|$)/i.test(n)?"pt":"en"}` +
    `if(s!==L&&U[s])location.replace(U[s]+location.search+location.hash)})();</script>`;
}

const NAME = { es: 'Español', en: 'English', pt: 'Português' };
const GROUP = { es: 'Idioma', en: 'Language', pt: 'Idioma' };

// Selector de idioma del encabezado: un link por idioma, el actual marcado con aria-current
export function langSwitch(lang, urls) {
  return `<div class="lang-toggle" role="group" aria-label="${GROUP[lang]}">` +
    LANGS.map(l => `<a class="lt" data-l="${l}" href="${urls[l]}" hreflang="${l}" lang="${l}" aria-label="${NAME[l]}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('') + '</div>';
}
