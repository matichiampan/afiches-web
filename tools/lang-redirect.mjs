// Idioma automático del sitio (lo usan build-landing.mjs y build-pages.mjs).
// Cada página publicada tiene su versión en español y en inglés, cada una en su propia dirección
// (/ y /en/, /servicios/… y /en/services/…), con hreflang para Google. Este script va en el <head> y:
//   1. Si la persona ya eligió idioma con el botón ES/EN de arriba, se respeta esa elección.
//   2. Si no, se usa el idioma principal del navegador: español → versión en español;
//      cualquier otro idioma (inglés, francés, portugués, chino…) → versión en inglés.
//   3. Si la página abierta no es la del idioma que corresponde, pasa a la versión equivalente
//      (misma ruta, conserva ?consulta y #ancla) con location.replace, así el botón "atrás" no rebota.
// Los buscadores y las vistas previas de links no se redirigen: Google tiene que seguir viendo cada idioma en su dirección.
// El botón de idioma es un link normal a la otra versión; al tocarlo se guarda la elección (afiches-lang).
export const BOT = '/bot|crawl|spider|slurp|facebookexternalhit|embedly|lighthouse|pagespeed|inspectiontool|yandex|baidu|duckduck/i';

export function langScript(lang, altUrl) {
  return `<script>(()=>{var L=${JSON.stringify(lang)},A=${JSON.stringify(altUrl)};` +
    `document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a.lang-toggle");if(a){try{localStorage.setItem("afiches-lang",a.getAttribute("lang")==="es"?"es":"en")}catch(x){}}});` +
    `var s;try{s=localStorage.getItem("afiches-lang")}catch(x){}` +
    `if(s!=="es"&&s!=="en"){if(${BOT}.test(navigator.userAgent||""))return;var n=(navigator.languages&&navigator.languages[0])||navigator.language||"";if(!n)return;s=/^es(?:[-_]|$)/i.test(n)?"es":"en"}` +
    `if(s!==L)location.replace(A+location.search+location.hash)})();</script>`;
}
