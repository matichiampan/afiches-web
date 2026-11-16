// Idioma automático del sitio (lo usan build-landing.mjs y build-pages.mjs).
// Cada página publicada tiene su versión en español, inglés, portugués y francés, cada una en su propia dirección
// (/ , /en/ , /pt/ y /fr/ ; /servicios/… , /en/services/… , /pt/servicos/… y /fr/services/…), con hreflang para Google.
// Este script va en el <head> y:
//   1. Si la persona ya eligió idioma con el selector ES / EN / PT / FR de arriba, se respeta esa elección.
//   2. Si no, se usa el idioma principal del navegador: español → versión en español; portugués → versión
//      en portugués; francés → versión en francés; cualquier otro idioma (inglés, alemán, chino…) → versión en inglés.
//   3. Si la página abierta no es la del idioma que corresponde, pasa a la versión equivalente
//      (misma ruta, conserva ?consulta y #ancla) con location.replace, así el botón "atrás" no rebota.
// Los buscadores y las vistas previas de links no se redirigen: Google tiene que seguir viendo cada idioma en su dirección.
// El selector son links normales a cada versión; al tocar uno se guarda la elección (afiches-lang).
export const LANGS = ['es', 'en', 'pt', 'fr'];
export const BOT = '/bot|crawl|spider|slurp|facebookexternalhit|embedly|lighthouse|pagespeed|inspectiontool|yandex|baidu|duckduck/i';

// urls: { es, en, pt, fr } con la dirección de ESTA misma página en cada idioma (rutas desde la raíz)
export function langScript(lang, urls) {
  return `<script>(()=>{var L=${JSON.stringify(lang)},U=${JSON.stringify(urls)},K=${JSON.stringify(LANGS)};` +
    `document.addEventListener("click",function(e){var t=e.target,a=t&&t.closest&&t.closest(".lang-toggle a,.lang-menu a");if(a){var v=a.getAttribute("lang");if(K.indexOf(v)>=0)try{localStorage.setItem("afiches-lang",v)}catch(x){}}var m=document.querySelectorAll?document.querySelectorAll(".lang-menu[open]"):[];for(var i=0;i<m.length;i++)if(!m[i].contains(t))m[i].removeAttribute("open")});` +
    `var s;try{s=localStorage.getItem("afiches-lang")}catch(x){}` +
    `if(K.indexOf(s)<0){if(${BOT}.test(navigator.userAgent||""))return;var n=(navigator.languages&&navigator.languages[0])||navigator.language||"";if(!n)return;s=/^es(?:[-_]|$)/i.test(n)?"es":/^pt(?:[-_]|$)/i.test(n)?"pt":/^fr(?:[-_]|$)/i.test(n)?"fr":"en"}` +
    `if(s!==L&&U[s])location.replace(U[s]+location.search+location.hash)})();</script>`;
}

const NAME = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français' };
const GROUP = { es: 'Idioma', en: 'Language', pt: 'Idioma', fr: 'Langue' };

// Selector de idioma del encabezado. En pantallas anchas es un selector en línea (ES EN PT FR); en pantallas chicas
// (menos de 460 px) pasa a ser un menú desplegable, porque cuatro idiomas más el botón de contacto no entran en una fila.
// Los dos comparten los mismos links; el actual va marcado con aria-current. Los comentarios <!--lang--> delimitan el bloque
// para que build-pages.mjs lo reemplace entero en cada página.
export function langSwitch(lang, urls) {
  const inline = `<div class="lang-toggle" role="group" aria-label="${GROUP[lang]}">` +
    LANGS.map(l => `<a class="lt" data-l="${l}" href="${urls[l]}" hreflang="${l}" lang="${l}" aria-label="${NAME[l]}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('') + '</div>';
  const menu = `<details class="lang-menu"><summary aria-label="${GROUP[lang]}: ${NAME[lang]}">${lang.toUpperCase()}</summary><div class="lm-list" role="group" aria-label="${GROUP[lang]}">` +
    LANGS.map(l => `<a class="lm" href="${urls[l]}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${NAME[l]}</a>`).join('') + '</div></details>';
  return `<!--lang-->${inline}${menu}<!--/lang-->`;
}
