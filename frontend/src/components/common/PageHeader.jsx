import { Link } from 'react-router-dom';
import { Pencil, Ruler, Star, Squiggle } from './Doodles';

const crumbLink = 'hover:text-white hover:underline focus-visible:text-white focus-visible:underline';

export default function PageHeader({ title, subtitle, crumbs = [] }) {
  return (
    <section className="relative overflow-hidden border-b border-forest-100 bg-gradient-to-br from-forest-900 via-forest-900 to-forest-800 text-white">
      {/* Faint notebook lines behind the title */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #fff 35px, #fff 36px)' }}
      />
      {/* Stationery doodles, desktop only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-80 lg:block">
        <Pencil className="absolute right-10 top-10 w-52 rotate-[-18deg]" />
        <Ruler className="absolute bottom-10 right-24 w-44 rotate-[6deg] opacity-90" />
        <Star className="absolute right-6 top-36 w-8 rotate-12" />
        <Star className="absolute right-56 top-8 w-5 -rotate-12 opacity-80" />
      </div>

      <div className="container-page relative py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-forest-200">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className={crumbLink}>Home</Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <span aria-hidden="true">›</span>
                {c.to ? <Link to={c.to} className={crumbLink}>{c.label}</Link> : <span>{c.label}</span>}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span aria-hidden="true">›</span>
              <span aria-current="page" className="text-white">{title}</span>
            </li>
          </ol>
        </nav>
        <h1 className="font-serif text-3xl font-semibold !text-white sm:text-4xl lg:text-5xl">{title}</h1>
        <Squiggle className="mt-3 w-28" />
        {subtitle && <p className="mt-4 max-w-3xl text-lg text-forest-100">{subtitle}</p>}
      </div>
      <div className="motif-strip relative" aria-hidden="true" />
    </section>
  );
}