import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import MarksLists from '../../components/results/MarksLists';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const TABS = [
  { id: 'documents', label: 'Result documents (PDF)' },
  { id: 'marks', label: 'Marks lists' },
];

export default function Results() {
  usePageTitle('Examination Results');

  const [tab, setTab] = useState('documents');
  const [className, setClassName] = useState('');
  const [exam, setExam] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  // Classes and their exam patterns come from the admin-managed academics settings.
  const academics = useFetch('/academics');
  const results = useFetch('/results', { className, exam, academicYear });

  const classEntries = academics.data?.classes || [];
  const classes = classEntries.map((c) => c.className);

  // With a class selected, offer only that class's exams. Otherwise offer every exam name once.
  const exams = className
    ? classEntries.find((c) => c.className === className)?.examPattern || []
    : [...new Set(classEntries.flatMap((c) => c.examPattern || []))];

  const list = results.data?.results || [];

  // Academic year choices: last 5 years, e.g. "2026-27".
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const y = thisYear - i;
    return `${y}-${String(y + 1).slice(-2)}`;
  });

  const changeClass = (e) => {
    setClassName(e.target.value);
    setExam(''); // the chosen exam may not exist in the new class
  };

  const hasFilters = className || exam || academicYear;
  const clear = () => {
    setClassName('');
    setExam('');
    setAcademicYear('');
  };

  // Left / Right arrows move between the two tabs.
  const onTabKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tab === 'documents' ? 'marks' : 'documents';
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <>
      <PageHeader title="Examination Results" subtitle="Results published by the school" />
      <div className="container-page py-10">
        <div role="tablist" aria-label="Type of result" className="mb-6 flex flex-wrap gap-2 border-b border-forest-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={onTabKey}
              className={`-mb-px border-b-4 px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? 'border-forest-700 text-forest-900' : 'border-transparent text-slate-600 hover:text-forest-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="card mb-6 p-4" aria-label="Filter results">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="r-class" className="label">Class</label>
              <select id="r-class" className="input" value={className} onChange={changeClass}>
                <option value="">All classes</option>
                {classes.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="r-exam" className="label">Examination</label>
              <select id="r-exam" className="input" value={exam} onChange={(e) => setExam(e.target.value)}>
                <option value="">All examinations</option>
                {exams.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="r-year" className="label">Academic year</label>
              <select id="r-year" className="input" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                <option value="">All years</option>
                {years.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {hasFilters && (
            <div className="mt-3">
              <button type="button" onClick={clear} className="btn-outline">Clear filters</button>
            </div>
          )}
        </form>

        {tab === 'documents' && (
          <div role="tabpanel" id="panel-documents" aria-labelledby="tab-documents">
            <p className="mb-4 text-sm text-slate-600">Result documents published by the school's teachers.</p>

            {results.loading && <p role="status" className="text-slate-600">Loading results…</p>}
            {results.error && <p role="alert" className="text-red-700">{results.error}</p>}

            {!results.loading && !results.error && list.length === 0 && (
              <PendingInfo>No result documents have been published for this selection yet.</PendingInfo>
            )}

            {list.length > 0 && (
              <>
                <p role="status" className="mb-3 text-sm text-slate-600">
                  {list.length} {list.length === 1 ? 'result document' : 'result documents'} found
                </p>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((r) => (
                    <li key={r._id} className="card flex flex-col justify-between gap-4 border-t-4 border-t-forest-700 p-5 transition-shadow hover:shadow-md">
                      <div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {r.className && <span className="rounded bg-forest-100 px-2 py-0.5 font-semibold text-forest-800">{r.className}</span>}
                          {r.exam && <span className="rounded bg-ochre-100 px-2 py-0.5 font-semibold text-ochre-800">{r.exam}</span>}
                          {r.academicYear && <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">AY {r.academicYear}</span>}
                        </div>
                        <h2 className="mt-3 font-serif text-lg font-semibold text-forest-900">{r.title}</h2>
                        {r.subject && <p className="text-sm text-slate-600">{r.subject}</p>}
                        <p className="mt-2 text-xs text-slate-500">Published: {formatDate(r.createdAt)}</p>
                      </div>
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline self-start"
                        aria-label={`View PDF: ${r.title}`}
                      >
                        View PDF
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {tab === 'marks' && (
          <div role="tabpanel" id="panel-marks" aria-labelledby="tab-marks">
            <p className="mb-4 text-sm text-slate-600">
              Overall marks of each student for an examination, published by the school administration.
            </p>
            <MarksLists classFilter={className} examFilter={exam} yearFilter={academicYear} />
          </div>
        )}
      </div>
    </>
  );
}
