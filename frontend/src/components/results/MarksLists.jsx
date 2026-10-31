import useFetch from '../../hooks/useFetch';
import PendingInfo from '../common/PendingInfo';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

// Public view of the marks list PDFs the administrator has published.
// The class / examination / year filters come from the Results page.
export default function MarksLists({ classFilter, examFilter, yearFilter }) {
  const { data, loading, error } = useFetch('/class-results', {
    className: classFilter,
    exam: examFilter,
    academicYear: yearFilter,
  });

  const list = data?.results || [];

  return (
    <>
      {loading && <p role="status" className="text-slate-600">Loading marks lists…</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}

      {!loading && !error && list.length === 0 && (
        <PendingInfo>No marks lists have been published for this selection yet.</PendingInfo>
      )}

      {list.length > 0 && (
        <>
          <p role="status" className="mb-3 text-sm text-slate-600">
            {list.length} {list.length === 1 ? 'marks list' : 'marks lists'} found
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
                  <h3 className="mt-3 font-serif text-lg font-semibold text-forest-900">{r.title}</h3>
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
    </>
  );
}
