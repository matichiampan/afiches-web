# Borrador interactivo Afiches

Vista: http://127.0.0.1:3001/direccion-episto.html

Iniciar desde este proyecto:

```powershell
node tools/preview-clean.cjs --ai
```

Sin `--ai`, el diseño, el ejemplo de dashboard y los formularios locales funcionan, pero la entrevista indica que falta conectar la IA. El servidor escucha únicamente en 127.0.0.1.

## Integración de la demo

- Lee `OPENAI_API_KEY` de la configuración existente de AfiChesManager. Nunca la entrega al navegador ni la imprime. `AFICHES_MANAGER_PATH` permite cambiar la ubicación.
- Reutiliza el prompt base de `src/lib/aiInterviewPrompts.ts` del Manager. No modifica ese proyecto ni sus bases de datos.
- Dos preguntas fijas y una repregunta real. La repregunta y la codificación usan OpenAI (`gpt-4o-mini`; configurable con `AFICHES_DEMO_MODEL`).
- Sesiones en memoria por una hora, tamaño acotado de respuestas, límite de llamadas y protección contra envíos desde otros orígenes. Es un adaptador para esta demo, no el runner completo de encuestas.
- Los temas se muestran solamente si la cita devuelta por IA aparece literalmente en una respuesta del usuario. No se calculan porcentajes sobre una única entrevista.
- El ejemplo de coocurrencias usa seis entrevistas ficticias, señaladas en pantalla. Replica el criterio de entrevistas distintas por par de temas de `public/generador.html`, sin copiar datos de clientes.

## Contactos y estudios

- Catálogo leído de `src/data/reports.js`.
- Los mails y mensajes se guardan en `.local-preview/leads.jsonl`, fuera de la carpeta pública e ignorados por Git. No se mandan mails ni se escriben contactos de prueba en producción.
- Cada estudio exige registro de mail y genera acceso local por cookie HttpOnly. Las rutas directas al PDF del catálogo también exigen ese permiso.
- El flujo productivo de `functions/api/request-report.js` y los componentes React existentes quedan intactos.

## Antes de publicar

Este borrador no fue publicado. Para llevarlo al sitio se necesita integrar los nuevos componentes con la aplicación, conectar el formulario de contacto a su destino definitivo y desplegar la demo en un backend con gestión de secretos, límites de uso y política de conservación apropiados. No publicar este servidor de desarrollo.

## Verificado

- Entrevista real de tres respuestas: repregunta contextual, segunda pregunta, temas con citas y contacto después del resultado.
- Coocurrencias recalculadas al seleccionar cada tema del ejemplo.
- Mails inválidos rechazados; PDF habilitado después del registro; el acceso a un estudio no habilita otro.
- Escritorio, móvil de 390 px, tema oscuro y modal de descarga.

## Versión publicable (SEO / GEO, español e inglés)

`public/direccion-episto.html` es la plantilla bilingüe (sigue con `noindex`). Después de cada cambio:

```powershell
npm run build:landing
```

Genera `public/sitio/`:

- `index.html` (español, `/`) y `en/index.html` (inglés, `/en/`): cada uno con un solo idioma, title, description, canonical, hreflang, Open Graph/Twitter, JSON-LD (Organization, WebSite, WebPage, Person, FAQPage, ItemList de estudios) y los estudios escritos en el HTML.
- `robots.txt`, `sitemap.xml`, `llms.txt` y las imágenes para compartir `og-afiches-es.png` / `og-afiches-en.png` (se generan desde `tools/og-image.html`).

Vista local: http://127.0.0.1:3001/sitio/ y http://127.0.0.1:3001/sitio/en/

Al publicar, el contenido de `sitio/` va a la raíz del dominio (los recursos como logos, fotos y CSS ya están en `public/`).
