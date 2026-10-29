import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navigation, school } from '../../config/school';
import { useAuth } from '../../context/AuthContext';
import { Pencil } from '../common/Doodles';

const linkBase = 'nav-link px-3 py-2 text-sm font-medium rounded text-forest-900 transition-colors';
const linkClass = () => linkBase;
const blockLinkClass = () => `block ${linkBase}`;

function Wordmark() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label={`${school.fullName} – home`}>
      <img
        src="/images/KMRS-logo.png"
        alt=""
        aria-hidden="true"
        width="56"
        height="56"
        className="h-12 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transition-none sm:h-14"
      />
      <span className="leading-tight">
        <span className="block font-serif text-base font-bold text-forest-900 sm:text-lg">
          {school.name}
        </span>
        <span className="block text-xs text-slate-600">
          Umerkote, Nabarangpur, Odisha · CBSE Aff. No. {school.affiliationNo}
        </span>
      </span>
    </Link>
  );
}

function DesktopDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();
  const active = item.children.some((c) => c.to === pathname);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={`${linkBase} flex items-center gap-1.5 ${active ? 'is-active' : ''}`}
      >
        {item.label}
        <span
          aria-hidden="true"
          className={`text-[10px] transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>
      {open && (
        <ul className="paper absolute left-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-md border border-forest-100 border-t-2 border-t-ochre-500 py-1 shadow-lift">
          {item.children.map((c) => (
            <li key={c.to}>
              <NavLink
                to={c.to}
                end
                className={({ isActive }) =>
                  `block border-l-4 px-4 py-2 text-sm transition-all hover:pl-5 ${
                    isActive
                      ? 'border-l-ochre-500 bg-ochre-50 font-semibold text-forest-900'
                      : 'border-l-transparent text-ink hover:bg-forest-50'
                  }`
                }
              >
                {c.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboard = user?.role === 'admin' ? '/admin' : '/teacher';

  return (
    <header
      className={`paper sticky top-0 z-30 border-b-2 border-forest-100 transition-shadow motion-reduce:transition-none ${
        scrolled ? 'shadow-lift' : ''
      }`}
    >
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Wordmark />

        <div className="hidden items-center gap-2 xl:flex">
          {user ? (
            <>
              <Link to={dashboard} className="btn-outline">
                My Dashboard
              </Link>
              <button type="button" onClick={logout} className="btn-outline">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-outline">
              Teacher Login
            </Link>
          )}
          <Link to="/admissions" className="btn-accent">
            Admission Information
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md border-2 border-forest-800 px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50 xl:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Desktop navigation: ruled-notebook strip */}
      <nav aria-label="Main navigation" className="ruled hidden border-t border-forest-100 xl:block">
        <div className="container-page flex items-center">
          <ul className="flex items-center gap-1 py-1.5">
            {navigation.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <DesktopDropdown item={item} />
                ) : (
                  <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <Pencil className="ml-auto hidden w-24 -rotate-3 2xl:block" />
        </div>
      </nav>

      {/* Mobile navigation */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="ruled max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-forest-100 xl:hidden"
        >
          <ul className="container-page space-y-1 py-3">
            {navigation.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <p className="px-3 pt-3 text-sm font-semibold text-slate-600">{item.label}</p>
                    <ul className="ml-3 border-l-2 border-ochre-300 pl-1">
                      {item.children.map((c) => (
                        <li key={c.to}>
                          <NavLink to={c.to} end className={blockLinkClass}>
                            {c.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink to={item.to} end={item.to === '/'} className={blockLinkClass}>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
            <li className="flex flex-wrap gap-2 border-t border-forest-100 pt-4">
              <Link to="/admissions" className="btn-accent">
                Admission Information
              </Link>
              {user ? (
                <>
                  <Link to={dashboard} className="btn-outline">
                    My Dashboard
                  </Link>
                  <button type="button" onClick={logout} className="btn-outline">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-outline">
                  Teacher Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
