import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { noticeCategories } from '../../config/options';
import { academicYearOptions } from '../../utils/academicYears';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5;
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export default function AdminNotices() {
  const { data, loading, error, reload } = useFetch('/notices');
  const years = useMemo(() => academicYearOptions(), []);
  const blank = { title: '', category: noticeCategories[0], academicYear: years[0], refNo: '', description: '', publishedAt: today(), expiresAt: '' };

  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const notices = data?.notices || [];
  const q = search.trim().toLowerCase();
  const visible = q
    ? notices.filter((n) => [n.title, n.category, n.refNo].some((v) => (v || '').toLowerCase().includes(q)))
    : notices;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.title.trim().length < 3) er.title = 'Enter a title (at least 3 characters).';
    if (!form.publishedAt) er.publishedAt = 'Choose the publication date.';
    if (form.expiresAt && form.expiresAt < form.publishedAt) er.expiresAt = 'Expiry date cannot be before the publication date.';
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) er.file = 'Only PDF files are allowed.';
      else if (file.size > MAX_MB * 1024 * 1024) er.file = `The file must be smaller than ${MAX_MB} MB.`;
    }
    setErrors(er);
    setStatus({ type: '', text: '' });
    if (Object.keys(er).length) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, typeof v === 'string' ? v.trim() : v));
    if (file) fd.append('file', file);

    setSaving(true);
    try {
      await api.post('/notices', fd);
      setForm({ ...blank, publishedAt: today() });
      setFile(null);
      setFileKey((k) => k + 1);
      notifySuccess('The notice is now live on the public website.', 'Notice published');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not publish the notice.') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (n) => {
    const ok = await confirmNote({
      title: 'Delete this notice?',
      message: `"${n.title}" will be removed from the website.`,
      confirmLabel: 'Yes, delete it',
    });
    if (!ok) return;
    try {
      await api.delete(`/notices/${n._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The notice has been removed from the website.', 'Notice deleted');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  const text = (id, label, props = {}) => (
    <div>
      <label htmlFor={`n-${id}`} className="label">{label}</label>
      <input id={`n-${id}`} className="input" value={form[id]} onChange={set(id)}
        aria-invalid={errors[id] ? 'true' : 'false'} aria-describedby={errors[id] ? `n-${id}-err` : undefined} {...props} />
      {errors[id] && <p id={`n-${id}-err`} className="mt-1 text-sm text-red-700">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="new-n">
        <h2 id="new-n" className="section-title !text-xl">Publish a notice</h2>
        <p className="mt-1 text-sm text-slate-600">Publish only genuine, approved notices. Notices appear on the public site immediately.</p>

        <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{text('title', 'Title', { maxLength: 150, required: true })}</div>

          <div>
            <label htmlFor="n-category" className="label">Category</label>
            <select id="n-category" className="input" value={form.category} onChange={set('category')}>
              {noticeCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="n-academicYear" className="label">Academic year</label>
            <select id="n-academicYear" className="input" value={form.academicYear} onChange={set('academicYear')}>
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>

          {text('publishedAt', 'Publication date', { type: 'date', required: true })}
          {text('expiresAt', 'Expiry date (optional)', { type: 'date' })}
          {text('refNo', 'Reference number (optional)', { maxLength: 60 })}

          <div className="sm:col-span-2">
            <label htmlFor="n-description" className="label">Short description (optional)</label>
            <textarea id="n-description" rows="3" maxLength={400} className="input" value={form.description} onChange={set('description')} />
            <p className="mt-1 text-right text-xs text-slate-500">{form.description.length} / 400</p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="n-file" className="label">PDF attachment (optional, maximum {MAX_MB} MB)</label>
            <input key={fileKey} id="n-file" type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
              aria-invalid={errors.file ? 'true' : 'false'} aria-describedby={errors.file ? 'n-file-err' : undefined} />
            {errors.file && <p id="n-file-err" className="mt-1 text-sm text-red-700">{errors.file}</p>}
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Publishing…' : 'Publish Notice'}</button>
          </div>
        </form>
      </section>

      <StatusMessage status={status} />

      <section className="card p-6" aria-labelledby="all-n">
        <h2 id="all-n" className="section-title !text-xl">All notices ({notices.length})</h2>

        {notices.length > 0 && (
          <div className="mt-3 max-w-sm">
            <label htmlFor="n-search" className="label">Search</label>
            <input id="n-search" type="search" className="input" placeholder="Title, category or reference…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        )}

        {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {!loading && !error && notices.length === 0 && <p className="mt-3 text-slate-600">No notices yet.</p>}
        {!loading && !error && notices.length > 0 && visible.length === 0 && <p className="mt-3 text-slate-600">No notices match your search.</p>}

        {visible.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">Published notices</caption>
              <thead>
                <tr className="bg-forest-900 text-white">
                  <th scope="col" className="px-4 py-2">Title</th>
                  <th scope="col" className="px-4 py-2">Category</th>
                  <th scope="col" className="px-4 py-2">Published</th>
                  <th scope="col" className="px-4 py-2">Expires</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                  <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((n) => {
                  const expired = n.expiresAt && new Date(n.expiresAt) < new Date();
                  return (
                    <tr key={n._id} className="border-b border-forest-100 odd:bg-white even:bg-forest-50/50">
                      <th scope="row" className="px-4 py-2 font-semibold text-forest-900">{n.title}</th>
                      <td className="px-4 py-2">{n.category}</td>
                      <td className="px-4 py-2">{formatDate(n.publishedAt)}</td>
                      <td className="px-4 py-2">{n.expiresAt ? formatDate(n.expiresAt) : '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${expired ? 'bg-slate-200 text-slate-700' : 'bg-forest-100 text-forest-800'}`}>
                          {expired ? 'Expired' : 'Live'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          {n.fileUrl && <a href={n.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" aria-label={`View PDF: ${n.title}`}>View</a>}
                          <button type="button" className="btn-danger" onClick={() => remove(n)} aria-label={`Delete: ${n.title}`}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
