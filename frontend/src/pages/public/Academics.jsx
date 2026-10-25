import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import { school } from '../../config/school';

export default function Academics() {
  usePageTitle('Academics');
  const { data, loading, error } = useFetch('/academics');

  const classes = data?.classes || [];

  // Group classes that share the same exam pattern.
  const groups = useMemo(() => {
    const map = new Map();
    classes.forEach((c) => {
      if (!c.examPattern?.length) return;
      const key = JSON.stringify(c.examPattern);
      if (!map.has(key)) map.set(key, { exams: c.examPattern, classNames: [] });
      map.get(key).classNames.push(c.className);
    });
    return [...map.values()];
  }, [classes]);

  return (
    <>
      <PageHeader title="Academics" subtitle="Curriculum, examination pattern and subjects" />

      {/* CBSE affiliation strip */}
      <div className="border-b border-forest-100 bg-white">
        <div className="container-page py-6">
          <h2 className="sr-only">CBSE affiliation</h2>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded border border-forest-100 bg-forest-100 lg:grid-cols-4">
            {[
              ['Board', 'CBSE'],
              ['Affiliation no.', school.affiliationNo],
              ['Level', school.affiliationLevel],
              ['Period', school.affiliationPeriod],
            ].map(([k, v]) => (
              <div key={k} className="bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                <dd className="mt-1 font-serif text-lg font-semibold text-forest-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="container-page grid gap-6 py-10">
        <section className="card border-l-4 border-l-forest-700 p-6">
          <h2 className="section-title !text-xl sm:!text-2xl">Curriculum</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
            The Kalinga Model Residential School programme describes an English-medium, CBSE-oriented and
            NCERT-based educational framework. The school&apos;s current implementation, class structure and
            subject combinations are shown below as confirmed by the school.
          </p>
        </section>

        <section className="card p-6" aria-labelledby="exam-heading">
          <h2 id="exam-heading" className="section-title !text-xl sm:!text-2xl">Examination Pattern</h2>
          {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
          {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
          {!loading && !error && (groups.length ? (
            <>
              <div className="mt-5 space-y-7">
                {groups.map((g) => (
                  <div key={g.classNames.join('|')}>
                    <h3 className="font-serif text-lg font-semibold text-forest-900">{g.classNames.join(', ')}</h3>
                    <ol className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      {g.exams.map((e, i) => (
                        <li key={e} className="flex items-center gap-2">
                          <span className="flex items-center gap-3 rounded-full border border-forest-200 bg-forest-50 py-1.5 pl-1.5 pr-5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-800 text-sm font-bold text-white">
                              {i + 1}
                            </span>
                            <span className="font-medium text-forest-900">{e}</span>
                          </span>
                          {i < g.exams.length - 1 && (
                            <span aria-hidden="true" className="hidden h-0.5 w-6 bg-ochre-400 sm:block" />
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm">
                <Link to="/results" className="font-semibold underline">View examination results</Link>
              </p>
            </>
          ) : (
            <div className="mt-3"><PendingInfo /></div>
          ))}
        </section>

        <section aria-labelledby="class-heading">
          <h2 id="class-heading" className="section-title !text-xl sm:!text-2xl">Classes and Subjects</h2>
          {!loading && !error && (classes.length ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((c) => (
                <li key={c.className} className="card p-5">
                  <h3 className="font-serif text-xl font-semibold text-forest-900">{c.className}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Subjects in ${c.className}`}>
                    {c.subjects.map((s) => (
                      <li key={s} className="rounded-full bg-forest-50 px-3 py-1 text-sm text-forest-900">{s}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3"><PendingInfo>Class and subject information will be updated after confirmation by the school.</PendingInfo></div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="section-title !text-xl">Academic Calendar</h2>
            <div className="mt-3"><PendingInfo>The academic calendar will be published when provided by the school.</PendingInfo></div>
          </div>
          <div className="card p-6">
            <h2 className="section-title !text-xl">Learning Resources and Co-curricular Education</h2>
            <div className="mt-3"><PendingInfo /></div>
          </div>
        </section>

        <p className="text-sm text-slate-600">
          Academic notices and documents are available on the{' '}
          <Link to="/notices" className="font-semibold underline">Notices &amp; Downloads</Link> page.
        </p>
      </div>
    </>
  );
}
