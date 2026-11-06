import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import PencilCursor from '../common/PencilCursor';
import Splash from '../common/Splash';
import ScrollPencil from '../common/ScrollPencil';
import { useSeo } from '../../hooks/usePageTitle';

export default function Layout() {
  const { pathname, hash } = useLocation();

  // Per-route <head> tags (title, description, canonical, Open Graph, robots).
  useSeo();

  // On every page change: jump to a #section if the link has one, otherwise scroll to the top.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded bg-white px-4 py-2 font-semibold text-forest-900 focus:not-sr-only focus:absolute focus:left-2 focus:top-2"
      >
        Skip to main content
      </a>
      <ScrollPencil />
      <TopBar />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <PencilCursor />
      <Splash />
    </div>
  );
}
