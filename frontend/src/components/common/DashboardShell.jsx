import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Shared frame for the teacher and admin areas: sidebar navigation + content outlet.
export default function DashboardShell({ title, links }) {
  const { user, logout } = useAuth();
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div>
      <div className="border-b border-forest-100 bg-gradient-to-br from-forest-900 to-forest-800 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ochre-500 font-serif text-xl font-bold text-forest-950"
            >
              {initial}
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold !text-white">{title}</h1>
              <p className="text-sm text-forest-200">Signed in as {user?.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="btn border border-white/40 text-white hover:bg-white/10">
              View website
            </Link>
            <button type="button" onClick={logout} className="btn border border-white/60 text-white hover:bg-white/10">
              Logout
            </button>
          </div>
        </div>
        <div className="motif-strip" aria-hidden="true" />
      </div>

      <div className="container-page grid gap-6 py-8 md:grid-cols-[230px_1fr]">
        <nav aria-label={`${title} navigation`} className="md:sticky md:top-4 md:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:rounded md:border md:border-forest-100 md:bg-white md:p-2">
            {links.map((l) => (
              <li key={l.to} className="shrink-0">
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `block whitespace-nowrap rounded border-l-4 px-4 py-2 text-sm font-medium transition-colors md:whitespace-normal ${
                      isActive
                        ? 'border-l-ochre-500 bg-forest-800 text-white'
                        : 'border-l-transparent border-y border-r border-y-forest-100 border-r-forest-100 bg-white text-forest-900 hover:bg-forest-50 md:border-y-0 md:border-r-0'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
