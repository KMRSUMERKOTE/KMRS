import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, crumbs = [] }) {
  return (
    <section className="border-b border-forest-100 bg-gradient-to-br from-forest-900 via-forest-900 to-forest-800 text-white">
      <div className="container-page py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-forest-200">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-white hover:underline focus-visible:text-white focus-visible:underline">
                Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <span aria-hidden="true">›</span>
                {c.to ? (
                  <Link to={c.to} className="hover:text-white hover:underline focus-visible:text-white focus-visible:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span aria-hidden="true">›</span>
              <span aria-current="page" className="text-white">
                {title}
              </span>
            </li>
          </ol>
        </nav>
        <h1 className="font-serif text-3xl font-semibold !text-white sm:text-4xl lg:text-5xl">{title}</h1>
        <div className="mt-4 h-1 w-16 rounded-full bg-ochre-500" aria-hidden="true" />
        {subtitle && <p className="mt-4 max-w-3xl text-lg text-forest-100">{subtitle}</p>}
      </div>
      <div className="motif-strip" aria-hidden="true" />
    </section>
  );
}
