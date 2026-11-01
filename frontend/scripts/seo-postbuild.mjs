// Runs after `vite build` (see package.json). Creates per-route HTML with unique head tags,
// sitemap.xml, robots.txt and 404.html inside dist/. Uses only Node built-ins.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes, DEFAULT_SITE_URL, SITE_NAME, OG_IMAGE_PATH } from '../src/config/seoRoutes.mjs';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const SITE = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

const indexPath = path.join(dist, 'index.html');
if (!fs.existsSync(indexPath)) throw new Error(`seo-postbuild: ${indexPath} not found. Run "vite build" first.`);
const template = fs.readFileSync(indexPath, 'utf8');

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
if (!SEO_BLOCK.test(template)) throw new Error('seo-postbuild: <!--seo:start--> ... <!--seo:end--> markers missing in index.html');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const finish = (html) => html.replaceAll('__SITE_URL__', SITE);

function headFor(p, r) {
  const url = `${SITE}${p === '/' ? '/' : p}`;
  const t = esc(r.title);
  const d = esc(r.description);
  return `<!--seo:start-->
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}${OG_IMAGE_PATH}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <!--seo:end-->`;
}

// Per-route pages: /about -> dist/about.html (Cloudflare Pages serves it at /about)
for (const [p, r] of Object.entries(routes)) {
  const file = p === '/' ? 'index.html' : `${p.slice(1)}.html`;
  fs.writeFileSync(path.join(dist, file), finish(template.replace(SEO_BLOCK, headFor(p, r))));
}

// 404.html: unknown URLs get a real 404 status. The SPA still boots (so /admin/... refreshes keep working).
fs.writeFileSync(
  path.join(dist, '404.html'),
  finish(
    template.replace(
      SEO_BLOCK,
      `<!--seo:start-->
    <title>Page not found | ${esc(SITE_NAME)}</title>
    <meta name="robots" content="noindex, nofollow" />
    <!--seo:end-->`
    )
  )
);

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const urls = Object.keys(routes)
  .map((p) => `  <url>\n    <loc>${SITE}${p === '/' ? '/' : p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join('\n');
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

// robots.txt
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /admin\nDisallow: /teacher\n\nSitemap: ${SITE}/sitemap.xml\n`
);

console.log(`SEO post-build done for ${SITE} (${Object.keys(routes).length} routes + 404.html, sitemap.xml, robots.txt)`);
