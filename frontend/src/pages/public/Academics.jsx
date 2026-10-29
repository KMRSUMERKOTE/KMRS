import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import { Reveal } from '../../components/common/Motion';
import { school } from '../../config/school';

// Subject tags cycle through the school palette, like coloured highlighters.
const tagColors = [
  'bg-forest-100 text-forest-900',
  'bg-ochre-100 text-ochre-700',
  'bg-forest-50 text-forest-800 ring-1 ring-forest-200',
  'bg-ochre-50 text-forest-900 ring-1 ring-ochre-200',
];

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
      <div className="paper border-b border-forest-100">
        <div className="container-page py-6">
          <h2 className="sr-only">CBSE affiliation</h2>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-forest-100 bg-forest-100 lg:grid-cols-4">
            {[
              ['Board', 'CBSE'],
              ['Affiliation no.', school.affiliationNo],
              ['Level', school.affiliationLevel],
              ['Period', school.affiliationPeriod],
            ].map(([k, v]) => (
              <div key={k} className="paper p-4">
                <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                <dd className="mt-1 font-serif text-lg font-semibold text-forest-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="container-page grid gap-6 py-10">
        <Reveal as="section" className="card paper border-l-4 border-l-forest-700 p-6">
          <h2 className="section-title !text-xl sm:!text-2xl">Curriculum</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
            The Kalinga Model Residential School programme describes an English-medium, CBSE-oriented and
            NCERT-based educational framework. The school&apos;s current implementation, class structure and
            subject combinations are shown below as confirmed by the school.
          </p>
        </Reveal>

        <Reveal as="section" className="card paper p-6" aria-labelledby="exam-heading">
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
                          <span className="flex items-center gap-3 rounded-md border-2 border-forest-200 bg-white py-1.5 pl-1.5 pr-5 shadow-[0_3px_0_#cfcbed]">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ochre-400 text-sm font-bold text-forest-950">
                              {i + 1}
                            </span>
                            <span className="font-medium text-forest-900">{e}</span>
                          </span>
                          {i < g.exams.length - 1 && (
                            <span aria-hidden="true" className="hidden w-8 border-t-2 border-dashed border-ochre-500 sm:block" />
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
        </Reveal>

        <Reveal as="section" aria-labelledby="class-heading">
          <h2 id="class-heading" className="section-title !text-xl sm:!text-2xl">Classes and Subjects</h2>
          {!loading && !error && (classes.length ? (
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((c) => (
                <li key={c.className} className="card-lift paper overflow-hidden">
                  {/* Notebook cover strip */}
                  <div className="flex items-center justify-between bg-forest-800 px-5 py-3">
                    <h3 className="font-serif text-xl font-semibold !text-white">{c.className}</h3>
                    <span aria-hidden="true" className="flex gap-1">
                      {[0, 1, 2].map((n) => <span key={n} className="h-2.5 w-2.5 rounded-full bg-ochre-300" />)}
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-2 p-5" aria-label={`Subjects in ${c.className}`}>
                    {c.subjects.map((s, i) => (
                      <li key={s} className={`rounded-md px-3 py-1 text-sm font-medium ${tagColors[i % tagColors.length]}`}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3"><PendingInfo>Class and subject information will be updated after confirmation by the school.</PendingInfo></div>
          ))}
        </Reveal>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="card paper p-6">
            <h2 className="section-title !text-xl">Academic Calendar</h2>
            <div className="mt-3"><PendingInfo>The academic calendar will be published when provided by the school.</PendingInfo></div>
          </div>
          <div className="card paper p-6">
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
