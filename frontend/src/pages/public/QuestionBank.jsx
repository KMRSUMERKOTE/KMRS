import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';

const KINDS = ['Question Bank', 'Previous Year Questions'];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export default function QuestionBank() {
  usePageTitle('Question Bank');

  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [kind, setKind] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  // Classes and their subjects come from the admin-managed academics settings.
  const academics = useFetch('/academics');
  // The server also returns papers made for "All Classes" / "All Subjects" that match the selection.
  const papers = useFetch('/question-bank', { className, subject, kind, academicYear });

  const classEntries = academics.data?.classes || [];
  const classes = classEntries.map((c) => c.className);

  // With a class selected, offer only that class's subjects. Otherwise offer every subject once.
  const subjects = className
    ? classEntries.find((c) => c.className === className)?.subjects || []
    : [...new Set(classEntries.flatMap((c) => c.subjects || []))];

  const list = papers.data?.items || [];

  // Academic year choices: last 8 years, e.g. "2026-27". Older papers are useful for practice.
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => {
    const y = thisYear - i;
    return `${y}-${String(y + 1).slice(-2)}`;
  });

  const changeClass = (e) => {
    setClassName(e.target.value);
    setSubject(''); // the chosen subject may not exist in the new class
  };

  const hasFilters = className || subject || kind || academicYear;
  const clear = () => {
    setClassName('');
    setSubject('');
    setKind('');
    setAcademicYear('');
  };

  return (
    <>
      <PageHeader
        title="Question Bank"
        subtitle="Practice papers and previous year questions published by the school"
        crumbs={[{ label: 'Academics', to: '/academics' }]}
      />
      <div className="container-page py-10">
        <form onSubmit={(e) => e.preventDefault()} className="card mb-6 p-4" aria-label="Filter question papers">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="q-class" className="label">Class</label>
              <select id="q-class" className="input" value={className} onChange={changeClass}>
                <option value="">All classes</option>
                {classes.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="q-subject" className="label">Subject</label>
              <select id="q-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">All subjects</option>
                {subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="q-kind" className="label">Type</label>
              <select id="q-kind" className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="">All types</option>
                {KINDS.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="q-year" className="label">Academic year</label>
              <select id="q-year" className="input" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
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

        {papers.loading && <p role="status" className="text-slate-600">Loading papers…</p>}
        {papers.error && <p role="alert" className="text-red-700">{papers.error}</p>}

        {!papers.loading && !papers.error && list.length === 0 && (
          <PendingInfo>No question papers have been published for this selection yet.</PendingInfo>
        )}

        {list.length > 0 && (
          <>
            <p role="status" className="mb-3 text-sm text-slate-600">
              {list.length} {list.length === 1 ? 'paper' : 'papers'} found
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => (
                <li key={r._id} className="card flex flex-col justify-between gap-4 border-t-4 border-t-forest-700 p-5 transition-shadow hover:shadow-md">
                  <div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {r.className && <span className="rounded bg-forest-100 px-2 py-0.5 font-semibold text-forest-800">{r.className}</span>}
                      {r.subject && <span className="rounded bg-ochre-100 px-2 py-0.5 font-semibold text-ochre-800">{r.subject}</span>}
                      {r.academicYear && <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">AY {r.academicYear}</span>}
                    </div>
                    <h2 className="mt-3 font-serif text-lg font-semibold text-forest-900">{r.title}</h2>
                    {r.kind && <p className="text-sm text-slate-600">{r.kind}</p>}
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
    </>
  );
}
