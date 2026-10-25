import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';

const GALLERY_TARGET = 30;

export default function AdminDashboard() {
  const { data, loading, error } = useFetch('/admin/stats');

  if (loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (error) return <p role="alert" className="text-red-700">{error}</p>;

  const unread = data.unreadEnquiries || 0;
  const galleryPct = Math.min(100, Math.round(((data.photos || 0) / GALLERY_TARGET) * 100));

  const cards = [
    { label: 'Teachers', value: data.teachers, to: '/admin/teachers' },
    { label: 'Published results', value: data.results, to: '/admin/results' },
    { label: 'Gallery photos', value: data.photos, to: '/admin/gallery', progress: galleryPct, note: `Target: about ${GALLERY_TARGET}` },
    { label: 'Notices', value: data.notices, to: '/admin/notices' },
    { label: 'Disclosure documents', value: data.disclosures, to: '/admin/disclosures' },
    { label: 'Enquiries', value: data.enquiries, to: '/admin/enquiries', note: `${unread} unread`, highlight: unread > 0 },
  ];

  const quick = [
    { to: '/admin/notices', label: 'Publish a notice' },
    { to: '/admin/gallery', label: 'Upload photographs' },
    { to: '/admin/disclosures', label: 'Add disclosure document' },
    { to: '/', label: 'View public website' },
  ];

  const steps = [
    { to: '/admin/academics', text: 'Set up classes, subjects and the exam pattern under', link: 'Exam Pattern & Subjects' },
    { to: '/admin/teachers', text: 'Create teacher accounts under', link: 'Teachers', suffix: ' and share the temporary passwords privately.', done: data.teachers > 0 },
    { to: '/admin/gallery', text: 'Upload approved photographs under', link: 'Photo Gallery', done: data.photos > 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title">Overview</h2>
          <p className="mt-1 text-slate-700">Manage everything that appears on the school website.</p>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Quick actions">
          {quick.map((q) => (
            <li key={q.to}><Link to={q.to} className="btn-outline">{q.label}</Link></li>
          ))}
        </ul>
      </div>

      {unread > 0 && (
        <p role="status" className="flex flex-wrap items-center justify-between gap-3 rounded border border-ochre-300 border-l-4 border-l-ochre-500 bg-ochre-50 p-4 text-sm text-slate-800">
          <span>You have {unread} unread {unread === 1 ? 'enquiry' : 'enquiries'} from the Contact page.</span>
          <Link to="/admin/enquiries" className="btn-primary">Read enquiries</Link>
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li
            key={c.label}
            className={`card border-t-4 p-5 transition-shadow hover:shadow-md ${c.highlight ? 'border-t-ochre-500' : 'border-t-forest-700'}`}
          >
            <p className="text-sm font-semibold text-slate-600">{c.label}</p>
            <p className="mt-1 font-serif text-4xl font-bold text-forest-900">{c.value}</p>
            {c.progress !== undefined && (
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest-100"
                role="progressbar"
                aria-label="Progress towards the gallery target"
                aria-valuenow={c.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-ochre-500" style={{ width: `${c.progress}%` }} />
              </div>
            )}
            {c.note && <p className={`mt-1 text-sm ${c.highlight ? 'font-semibold text-ochre-700' : 'text-slate-600'}`}>{c.note}</p>}
            <Link to={c.to} className="btn-outline mt-3" aria-label={`Manage ${c.label.toLowerCase()}`}>Manage</Link>
          </li>
        ))}
      </ul>

      <section className="card p-5">
        <h3 className="font-serif text-lg font-semibold">Getting started</h3>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={s.to} className="flex items-start gap-3 text-sm text-slate-700">
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  s.done ? 'bg-forest-700 text-white' : 'bg-forest-100 text-forest-800'
                }`}
              >
                {s.done ? '✓' : i + 1}
              </span>
              <span>
                {s.text} <Link className="font-semibold underline" to={s.to}>{s.link}</Link>
                {s.suffix || '.'}
                {s.done && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
