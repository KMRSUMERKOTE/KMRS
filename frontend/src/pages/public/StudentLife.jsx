import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import SafeImage from '../../components/common/SafeImage';
import { activityCategories } from '../../config/options';

// Dates are stored as calendar dates, so format them without time-zone shifting.
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';

export default function StudentLife() {
  usePageTitle('Student Life');
  const { data, loading, error } = useFetch('/activities');
  const [category, setCategory] = useState('All');

  const activities = data?.activities || [];
  const visible = category === 'All' ? activities : activities.filter((a) => a.category === category);
  const countFor = (c) => activities.filter((a) => a.category === c).length;

  return (
    <>
      <PageHeader title="Student Life and Activities" subtitle="Academic, cultural and extracurricular life" />
      <div className="container-page py-10">
        <section className="mb-8" aria-labelledby="areas">
          <h2 id="areas" className="section-title !text-xl sm:!text-2xl">Areas of Student Life</h2>

          {activities.length === 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {activityCategories.map((c) => (
                <li key={c} className="rounded-full border border-forest-200 bg-white px-4 py-1.5 text-sm font-medium text-forest-900">
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <div role="group" aria-label="Filter activities by category" className="mt-4 flex flex-wrap gap-2">
              {['All', ...activityCategories].map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    category === c
                      ? 'border-forest-800 bg-forest-800 text-white'
                      : 'border-forest-200 bg-white text-forest-900 hover:bg-forest-50'
                  }`}
                >
                  {c}
                  {c !== 'All' && (
                    <span
                      className={`rounded-full px-2 text-xs ${
                        category === c ? 'bg-white/20 text-white' : 'bg-forest-100 text-forest-800'
                      }`}
                    >
                      {countFor(c)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {loading && <p role="status" className="text-slate-600">Loading activities…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}

        {!loading && !error && activities.length === 0 && (
          <PendingInfo>
            Student activities, events and achievements will be shown here once the school provides approved
            information and photographs.
          </PendingInfo>
        )}

        {!loading && !error && activities.length > 0 && visible.length === 0 && (
          <PendingInfo>No activities have been published for {category} yet.</PendingInfo>
        )}

        {visible.length > 0 && (
          <>
            <p className="mb-3 text-sm text-slate-600" role="status">
              Showing {visible.length} {visible.length === 1 ? 'activity' : 'activities'}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((a) => (
                <li key={a._id} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                  {a.photoUrl && (
                    <div className="overflow-hidden">
                      <div className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none">
                        <SafeImage src={a.photoUrl} alt={a.photoAlt} />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-ochre-100 px-2 py-0.5 font-semibold text-ochre-800">{a.category}</span>
                      {a.date && <time dateTime={a.date} className="text-slate-600">{formatDate(a.date)}</time>}
                    </p>
                    <h3 className="mt-2 font-serif text-lg font-semibold text-forest-900">{a.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{a.description}</p>
                    {a.link && (
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-block pt-3 text-sm font-semibold underline"
                      >
                        More information
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}