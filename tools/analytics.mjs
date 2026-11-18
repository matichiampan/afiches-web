// Google Tag Manager (contenedor GTM-5SWV3HP2, que adentro tiene Google Analytics G-HD8X82ZP7M).
// Se carga recién cuando la página terminó de cargar, para no hacerla más lenta,
// y solo en afiches.net (la vista local y las copias de prueba no suman visitas).
export const GTM_ID = 'GTM-5SWV3HP2';
export const analyticsScript = () => `<script>(()=>{const h=location.hostname;if(h!=='afiches.net'&&!h.endsWith('.afiches.net'))return;window.dataLayer=window.dataLayer||[];dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});const go=()=>{const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';document.head.append(s)};if(document.readyState==='complete')go();else addEventListener('load',()=>setTimeout(go,0))})()</script>`;
