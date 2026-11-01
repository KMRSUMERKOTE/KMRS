import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { routes, SITE_NAME, DEFAULT_SITE_URL, OG_IMAGE_PATH } from '../config/seoRoutes.mjs';

// Production site URL. Set VITE_SITE_URL in Cloudflare Pages after buying a custom domain.
const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

const normalise = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

function upsert(selector, create, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

const setMeta = (name, content) =>
  upsert(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('name', name);
    return m;
  }, { content });

const setOg = (property, content) =>
  upsert(`meta[property="${property}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('property', property);
    return m;
  }, { content });

const BREADCRUMB_ID = 'ld-breadcrumb';

/**
 * Keeps <head> correct on every client-side navigation.
 * Mounted once in Layout. Public routes (listed in config/seoRoutes.mjs) get their own title,
 * description, canonical, Open Graph tags and breadcrumb data. Every other path (login,
 * dashboards, unknown URLs) gets noindex.
 */
export function useSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalise(pathname);
    const route = routes[path];
    document.getElementById(BREADCRUMB_ID)?.remove();

    if (!route) {
      setMeta('robots', 'noindex, nofollow');
      document.head.querySelector('link[rel="canonical"]')?.remove();
      return;
    }

    const url = `${SITE_URL}${path === '/' ? '/' : path}`;
    document.title = route.title;
    document.head.querySelector('meta[name="robots"]')?.remove(); // indexable: no robots tag
    setMeta('description', route.description);
    upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }, { href: url });
    setOg('og:title', route.title);
    setOg('og:description', route.description);
    setOg('og:url', url);
    setOg('og:image', `${SITE_URL}${OG_IMAGE_PATH}`);
    setMeta('twitter:title', route.title);
    setMeta('twitter:description', route.description);

    if (path !== '/') {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = BREADCRUMB_ID;
      s.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: route.label, item: url },
        ],
      });
      document.head.appendChild(s);
    }
  }, [pathname]);
}

/**
 * Existing per-page hook (same signature as before). For public routes the title now comes from
 * config/seoRoutes.mjs via useSeo(); for other pages (login, dashboards, 404) it sets the title as before.
 */
export default function usePageTitle(title = '') {
  const { pathname } = useLocation();

  useEffect(() => {
    if (routes[normalise(pathname)]) return;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [pathname, title]);
}
