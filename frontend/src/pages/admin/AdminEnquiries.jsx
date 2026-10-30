import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import StatusMessage from '../../components/common/StatusMessage';

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export default function AdminEnquiries() {
  const { data, loading, error, reload } = useFetch('/contact');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const enquiries = data?.enquiries || [];
  const unreadCount = enquiries.filter((q) => !q.read).length;
  const visible = filter === 'unread' ? enquiries.filter((q) => !q.read) : enquiries;

  const markRead = async (q) => {
    try {
      await api.put(`/contact/${q._id}/read`);
      setStatus({ type: '', text: '' });
      notifySuccess(`The enquiry from ${q.name} is marked as read.`, 'Marked as read');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  const remove = async (q) => {
    const ok = await confirmNote({
      title: 'Delete this enquiry?',
      message: `The enquiry from ${q.name} will be deleted. This cannot be undone.`,
      confirmLabel: 'Yes, delete it',
    });
    if (!ok) return;
    try {
      await api.delete(`/contact/${q._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The enquiry has been deleted.', 'Enquiry deleted');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  const tab = (value, label) => (
    <button
      type="button"
      aria-pressed={filter === value}
      onClick={() => setFilter(value)}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        filter === value
          ? 'border-forest-800 bg-forest-800 text-white'
          : 'border-forest-200 bg-white text-forest-900 hover:bg-forest-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="card p-6" aria-labelledby="enq-h">
      <h2 id="enq-h" className="section-title !text-xl">Contact enquiries ({enquiries.length})</h2>
      <p className="mt-1 text-sm text-slate-600">
        Messages sent through the public Contact page. Delete them once handled; they contain personal details.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter enquiries">
        {tab('all', `All (${enquiries.length})`)}
        {tab('unread', `Unread (${unreadCount})`)}
      </div>

      <div className="mt-3"><StatusMessage status={status} /></div>
      {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {!loading && !error && enquiries.length === 0 && <p className="mt-3 text-slate-600">No enquiries yet.</p>}
      {!loading && !error && enquiries.length > 0 && visible.length === 0 && (
        <p className="mt-3 text-slate-600">No unread enquiries.</p>
      )}

      <ul className="mt-4 space-y-3">
        {visible.map((q) => (
          <li
            key={q._id}
            className={`rounded border border-l-4 p-4 ${
              q.read ? 'border-forest-100 border-l-forest-200 bg-white' : 'border-ochre-300 border-l-ochre-500 bg-ochre-50'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-800 font-serif font-bold text-white"
                >
                  {(q.name || '?').trim().charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-forest-900">
                    {q.name}{' '}
                    {!q.read && <span className="ml-2 rounded bg-ochre-500 px-2 py-0.5 text-xs font-bold text-forest-950">NEW</span>}
                  </p>
                  <p className="text-sm text-slate-700">
                    <a className="underline" href={`mailto:${q.email}`}>{q.email}</a>
                    {q.phone && <> · {q.phone}</>}
                  </p>
                  <p className="text-xs text-slate-600">{formatDateTime(q.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!q.read && <button type="button" className="btn-outline" onClick={() => markRead(q)}>Mark as read</button>}
                <button type="button" className="btn-danger" onClick={() => remove(q)} aria-label={`Delete enquiry from ${q.name}`}>Delete</button>
              </div>
            </div>
            {/* Rendered as plain text, never as HTML. */}
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{q.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
