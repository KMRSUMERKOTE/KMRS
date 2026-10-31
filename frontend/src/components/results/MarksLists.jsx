import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import PendingInfo from '../common/PendingInfo';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const percent = (secured, total) => (total > 0 ? `${Math.round((secured / total) * 10000) / 100}%` : '—');

// Public view of the marks lists the administrator has published.
// The class / examination / year filters come from the Results page.
export default function MarksLists({ classFilter, examFilter, yearFilter }) {
  const { data, loading, error } = useFetch('/class-results', {
    className: classFilter,
    exam: examFilter,
    academicYear: yearFilter,
  });
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();

  // With a name typed in, keep only the matching students (and the lists that contain them).
  const lists = useMemo(() => {
    const all = data?.results || [];
    return all
      .map((l) => ({
        ...l,
        rows: (l.students || [])
          .map((s, i) => ({ ...s, no: i + 1 }))
          .filter((s) => !q || s.name.toLowerCase().includes(q)),
      }))
      .filter((l) => l.rows.length > 0);
  }, [data, q]);

  return (
    <>
      <div className="mb-4 max-w-md">
        <label htmlFor="ml-search" className="label">Search a student</label>
        <input
          id="ml-search"
          type="search"
          className="input"
          placeholder="Type a student's name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p role="status" className="text-slate-600">Loading marks lists…</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}

      {!loading && !error && lists.length === 0 && (
        <PendingInfo>
          {q
            ? 'No student with that name was found in the marks lists for this selection.'
            : 'No marks lists have been published for this selection yet.'}
        </PendingInfo>
      )}

      {lists.length > 0 && (
        <>
          <p role="status" className="mb-3 text-sm text-slate-600">
            {lists.length} {lists.length === 1 ? 'marks list' : 'marks lists'} found
          </p>
          <ul className="space-y-4">
            {lists.map((l) => (
              <li key={l._id} className="card border-t-4 border-t-forest-700 p-5">
                <details open={Boolean(q)}>
                  <summary className="cursor-pointer">
                    <span className="font-serif text-lg font-semibold text-forest-900">{l.title}</span>
                    <span className="ml-2 text-sm text-slate-600">
                      ({q ? `${l.rows.length} of ${l.students.length}` : l.students.length}{' '}
                      {l.students.length === 1 ? 'student' : 'students'})
                    </span>
                  </summary>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-forest-100 px-2 py-0.5 font-semibold text-forest-800">{l.className}</span>
                    <span className="rounded bg-ochre-100 px-2 py-0.5 font-semibold text-ochre-800">{l.exam}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">AY {l.academicYear}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Published: {formatDate(l.createdAt)}</p>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                      <caption className="sr-only">{l.title}</caption>
                      <thead>
                        <tr className="bg-forest-900 text-white">
                          <th scope="col" className="px-4 py-2">No.</th>
                          <th scope="col" className="px-4 py-2">Student name</th>
                          <th scope="col" className="px-4 py-2">Marks secured</th>
                          <th scope="col" className="px-4 py-2">Total marks</th>
                          <th scope="col" className="px-4 py-2">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {l.rows.map((s) => (
                          <tr key={s.no} className="border-b border-forest-100 odd:bg-white even:bg-forest-50/50">
                            <td className="px-4 py-2 text-slate-600">{s.no}</td>
                            <th scope="row" className="px-4 py-2 font-semibold text-forest-900">{s.name}</th>
                            <td className="px-4 py-2">{s.marksSecured}</td>
                            <td className="px-4 py-2">{s.totalMarks}</td>
                            <td className="px-4 py-2">{percent(s.marksSecured, s.totalMarks)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
