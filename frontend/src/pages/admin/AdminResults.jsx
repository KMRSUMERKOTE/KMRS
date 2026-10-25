import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import StatusMessage from '../../components/common/StatusMessage';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export default function AdminResults() {
  const { data, loading, error, reload } = useFetch('/results');
  const [search, setSearch] = useState('');
  const [className, setClassName] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });

  const results = data?.results || [];

  const classNames = useMemo(
    () => [...new Set(results.map((r) => r.className).filter(Boolean))].sort(),
    [results]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return results
      .filter((r) => (className ? r.className === className : true))
      .filter((r) =>
        q ? [r.title, r.className, r.exam, r.subject, r.teacherName].some((v) => (v || '').toLowerCase().includes(q)) : true
      );
  }, [results, search, className]);

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.title}"? It will be removed from the public Results page.`)) return;
    try {
      await api.delete(`/results/${r._id}`);
      setStatus({ type: 'ok', text: 'The result has been deleted.' });
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  const clear = () => {
    setSearch('');
    setClassName('');
  };

  return (
    <section className="card p-6" aria-labelledby="res-h">
      <h2 id="res-h" className="section-title !text-xl">All published results ({results.length})</h2>
      <p className="mt-1 text-sm text-slate-600">
        Teachers upload results from their own dashboard. As administrator you can review and remove any of them.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="res-search" className="label">Search</label>
          <input id="res-search" type="search" className="input" placeholder="Title, class, exam, teacher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <label htmlFor="res-class" className="label">Class</label>
          <select id="res-class" className="input" value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="">All classes</option>
            {classNames.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-slate-600">
          {visible.length} {visible.length === 1 ? 'result' : 'results'} shown
        </p>
        {(search || className) && <button type="button" onClick={clear} className="btn-outline">Clear filters</button>}
      </div>

      <div className="mt-3"><StatusMessage status={status} /></div>
      {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {!loading && !error && visible.length === 0 && <p className="mt-3 text-slate-600">No results found.</p>}

      {visible.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">Published results</caption>
            <thead>
              <tr className="bg-forest-900 text-white">
                <th scope="col" className="px-4 py-2">Title</th>
                <th scope="col" className="px-4 py-2">Class</th>
                <th scope="col" className="px-4 py-2">Exam</th>
                <th scope="col" className="px-4 py-2">Year</th>
                <th scope="col" className="px-4 py-2">Uploaded by</th>
                <th scope="col" className="px-4 py-2">Date</th>
                <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r._id} className="border-b border-forest-100 odd:bg-white even:bg-forest-50/50">
                  <th scope="row" className="px-4 py-2 font-semibold text-forest-900">
                    {r.title}
                    {r.subject && <span className="block text-xs font-normal text-slate-600">{r.subject}</span>}
                  </th>
                  <td className="px-4 py-2">
                    <span className="rounded bg-forest-100 px-2 py-0.5 text-xs font-semibold text-forest-800">{r.className}</span>
                  </td>
                  <td className="px-4 py-2">{r.exam}</td>
                  <td className="px-4 py-2">{r.academicYear}</td>
                  <td className="px-4 py-2">{r.teacherName || '—'}</td>
                  <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" aria-label={`View PDF: ${r.title}`}>View</a>
                      <button type="button" className="btn-danger" onClick={() => remove(r)} aria-label={`Delete: ${r.title}`}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
