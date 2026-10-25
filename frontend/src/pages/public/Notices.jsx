import { useMemo, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import { school } from '../../config/school';
import { noticeCategories } from '../../config/options';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isNew = (d) => d && Date.now() - new Date(d).getTime() < 14 * 24 * 60 * 60 * 1000;

function DateBadge({ date }) {
  if (!date) return null;
  const d = new Date(date);
  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded bg-forest-800 text-white"
    >
      <span className="font-serif text-2xl font-bold leading-none">{d.toLocaleDateString('en-IN', { day: '2-digit' })}</span>
      <span className="mt-1 text-xs">{d.toLocaleDateString('en-IN', { month: 'short' })} {String(d.getFullYear()).slice(-2)}</span>
    </div>
  );
}

export default function Notices() {
  usePageTitle('Notices & Downloads');
  const { data, loading, error } = useFetch('/notices');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [order, setOrder] = useState('newest');
  const [showExpired, setShowExpired] = useState(false);

  const notices = data?.notices || [];

  const years = useMemo(
    () => [...new Set(notices.map((n) => n.academicYear).filter(Boolean))].sort().reverse(),
    [notices]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices
      .filter((n) => (q ? n.title.toLowerCase().includes(q) : true))
      .filter((n) => (category ? n.category === category : true))
      .filter((n) => (year ? n.academicYear === year : true))
      .filter((n) => showExpired || !n.expiresAt || new Date(n.expiresAt) >= new Date())
      .sort((a, b) => {
        const diff = new Date(a.publishedAt) - new Date(b.publishedAt);
        return order === 'newest' ? -diff : diff;
      });
  }, [notices, search, category, year, order, showExpired]);

  const reset = () => {
    setSearch('');
    setCategory('');
    setYear('');
    setOrder('newest');
    setShowExpired(false);
  };

  const chip = (value, label) => (
    <button
      key={label}
      type="button"
      aria-pressed={category === value}
      onClick={() => setCategory(value)}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        category === value
          ? 'border-forest-800 bg-forest-800 text-white'
          : 'border-forest-200 bg-white text-forest-900 hover:bg-forest-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <PageHeader title="Notices & Downloads" subtitle="Notices, circulars and documents published by the school" />
      <div className="container-page py-10">
        {/* Filters */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="card no-print mb-6 space-y-4 p-4"
          aria-label="Search and filter notices"
        >
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {chip('', 'All')}
            {noticeCategories.map((c) => chip(c, c))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label htmlFor="n-search" className="label">Search by title</label>
              <input id="n-search" type="search" className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type to search…" />
            </div>
            <div>
              <label htmlFor="n-year" className="label">Academic year</label>
              <select id="n-year" className="input" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All years</option>
                {years.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="n-order" className="label">Sort by date</label>
              <select id="n-order" className="input" value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showExpired} onChange={(e) => setShowExpired(e.target.checked)} />
              Show expired notices
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={reset} className="btn-outline">Clear filters</button>
              <button type="button" onClick={() => window.print()} className="btn-outline">Print list</button>
            </div>
          </div>
        </form>

        {loading && <p role="status" className="text-slate-600">Loading notices…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}

        {!loading && !error && (
          <p role="status" className="mb-3 text-sm text-slate-600">
            {visible.length} {visible.length === 1 ? 'notice' : 'notices'} found
          </p>
        )}

        {!loading && !error && notices.length === 0 && (
          <p className="rounded border border-forest-100 bg-forest-50 p-4 text-slate-700">
            No notices have been published here yet. Please check the{' '}
            <a className="font-semibold underline" href={school.links.admissions} target="_blank" rel="noopener noreferrer">
              official department website
            </a>{' '}
            for current announcements.
          </p>
        )}

        {!loading && !error && notices.length > 0 && visible.length === 0 && (
          <p className="rounded border border-forest-100 bg-forest-50 p-4 text-slate-700">
            No notices match your search. Try clearing the filters.
          </p>
        )}

        <ul className="space-y-3">
          {visible.map((n) => {
            const expired = n.expiresAt && new Date(n.expiresAt) < new Date();
            return (
              <li
                key={n._id}
                className={`card flex flex-col gap-4 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-start ${expired ? 'opacity-75' : ''}`}
              >
                <DateBadge date={n.publishedAt} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-forest-100 px-2 py-0.5 font-semibold text-forest-800">{n.category}</span>
                    {isNew(n.publishedAt) && <span className="rounded bg-ochre-500 px-2 py-0.5 font-bold text-forest-950">NEW</span>}
                    {expired && <span className="rounded bg-slate-200 px-2 py-0.5 font-semibold text-slate-700">Expired</span>}
                    <time dateTime={n.publishedAt} className="text-slate-600">Published: {formatDate(n.publishedAt)}</time>
                    {n.expiresAt && <span className="text-slate-600">Valid till: {formatDate(n.expiresAt)}</span>}
                    {n.academicYear && <span className="text-slate-600">AY {n.academicYear}</span>}
                    {n.refNo && <span className="text-slate-600">Ref: {n.refNo}</span>}
                  </div>
                  <h2 className="mt-2 font-serif text-lg font-semibold text-forest-900">{n.title}</h2>
                  {n.description && <p className="mt-1 text-sm text-slate-700">{n.description}</p>}
                </div>
                {n.fileUrl && (
                  <div className="no-print flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <a href={n.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" aria-label={`View PDF: ${n.title}`}>
                      View / Download
                    </a>
                    <span className="text-xs text-slate-600">
                      {(n.fileType || 'PDF').toUpperCase()}
                      {n.fileSize ? ` · ${formatSize(n.fileSize)}` : ''}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
