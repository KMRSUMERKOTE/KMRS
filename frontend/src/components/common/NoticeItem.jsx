const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

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

export default function NoticeItem({ notice }) {
  const expired = notice.expiresAt && new Date(notice.expiresAt) < new Date();

  return (
    <li className={`card flex flex-col gap-4 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-start ${expired ? 'opacity-75' : ''}`}>
      <DateBadge date={notice.publishedAt} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-forest-100 px-2 py-0.5 font-semibold text-forest-800">
            {notice.category}
          </span>
          {isNew(notice.publishedAt) && (
            <span className="rounded bg-ochre-500 px-2 py-0.5 font-bold text-forest-950">NEW</span>
          )}
          {expired && <span className="rounded bg-slate-200 px-2 py-0.5 font-semibold text-slate-700">Expired</span>}
          <time dateTime={notice.publishedAt} className="text-slate-600">
            {formatDate(notice.publishedAt)}
          </time>
          {notice.refNo && <span className="text-slate-600">Ref: {notice.refNo}</span>}
        </div>
        <h3 className="mt-2 font-serif text-lg font-semibold text-forest-900">{notice.title}</h3>
        {notice.description && <p className="mt-1 text-sm text-slate-700">{notice.description}</p>}
      </div>
      {notice.fileUrl && (
        <a
          href={notice.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline shrink-0 self-start"
          aria-label={`Download PDF: ${notice.title}`}
        >
          Download PDF
        </a>
      )}
    </li>
  );
}
