import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { academicYearOptions } from '../../utils/academicYears';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5; // keep in sync with the backend upload limit
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function AdminClassResults() {
  const academics = useFetch('/academics');
  const lists = useFetch('/class-results');
  const years = useMemo(() => academicYearOptions(), []);

  const [form, setForm] = useState({ className: '', exam: '', academicYear: years[0], title: '' });
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const all = lists.data?.results || [];
  const classNames = useMemo(() => [...new Set(all.map((r) => r.className).filter(Boolean))].sort(), [all]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((r) => (filterClass ? r.className === filterClass : true))
      .filter((r) =>
        q ? [r.title, r.className, r.exam, r.academicYear].some((v) => (v || '').toLowerCase().includes(q)) : true
      );
  }, [all, search, filterClass]);

  const classEntries = academics.data?.classes || [];
  const classOptions = classEntries.map((c) => c.className);
  // The examination category depends on the selected class.
  const examOptions = classEntries.find((c) => c.className === form.className)?.examPattern || [];

  const autoTitle =
    form.className && form.exam ? `${form.className} – ${form.exam} – Marks List (${form.academicYear})` : '';

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [k]: value,
      // Changing the class invalidates the chosen examination.
      ...(k === 'className' ? { exam: '' } : {}),
    }));
  };

  const onFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setErrors((er) => ({ ...er, file: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.className) er.className = 'Select a class.';
    if (!form.exam) er.exam = 'Select the examination.';
    if (!form.academicYear) er.academicYear = 'Select the academic year.';
    if (!file) er.file = 'Choose a PDF file.';
    else if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) er.file = 'Only PDF files are allowed.';
    else if (file.size > MAX_MB * 1024 * 1024) er.file = `The file must be smaller than ${MAX_MB} MB.`;
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    setStatus({ type: '', text: '' });
    if (Object.keys(er).length) return;

    const fd = new FormData();
    fd.append('title', form.title.trim() || autoTitle);
    fd.append('className', form.className);
    fd.append('exam', form.exam);
    fd.append('academicYear', form.academicYear);
    fd.append('file', file);

    setUploading(true);
    setProgress(0);
    try {
      await api.post('/class-results', fd, {
        onUploadProgress: (p) => p.total && setProgress(Math.round((p.loaded * 100) / p.total)),
      });
      setFile(null);
      setFileKey((k) => k + 1);
      setForm((f) => ({ ...f, title: '' }));
      notifySuccess('The marks list is now visible on the public Results page.', 'Marks list published');
      lists.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Upload failed. Nothing was published.') });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (r) => {
    const ok = await confirmNote({
      title: 'Delete this marks list?',
      message: `"${r.title}" will be removed from the public Results page.`,
      confirmLabel: 'Yes, delete it',
      cancelLabel: 'No, keep it',
    });
    if (!ok) return;
    try {
      await api.delete(`/class-results/${r._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The marks list has been removed from the public Results page.', 'Marks list deleted');
      lists.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  if (academics.loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (academics.error) return <p role="alert" className="text-red-700">{academics.error}</p>;

  const select = (id, label, options, value, disabled = false, placeholder = 'Select…') => (
    <div>
      <label htmlFor={`cr-${id}`} className="label">{label}</label>
      <select
        id={`cr-${id}`}
        className="input"
        value={value}
        onChange={set(id)}
        disabled={disabled}
        aria-invalid={errors[id] ? 'true' : 'false'}
        aria-describedby={errors[id] ? `cr-${id}-err` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {errors[id] && <p id={`cr-${id}-err`} className="mt-1 text-sm text-red-700">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="cr-form-h">
        <h2 id="cr-form-h" className="section-title !text-xl">Upload a marks list (PDF)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload the ready-made marks list of a class for one examination. Only administrators can publish marks lists.
        </p>

        <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
          {select('className', 'Class', classOptions, form.className)}
          {select('exam', 'Examination', examOptions, form.exam, !form.className, form.className ? 'Select…' : 'Select a class first')}
          {select('academicYear', 'Academic year', years, form.academicYear)}

          <div>
            <label htmlFor="cr-title" className="label">Title (optional)</label>
            <input
              id="cr-title"
              className="input"
              maxLength={150}
              value={form.title}
              onChange={set('title')}
              placeholder="Leave blank to generate automatically"
            />
          </div>
          {!form.title.trim() && autoTitle && (
            <p className="text-xs text-slate-600 sm:col-span-2">
              It will be published as: <span className="font-medium text-forest-900">{autoTitle}</span>
            </p>
          )}

          <div className="sm:col-span-2">
            <label htmlFor="cr-file" className="label">PDF file (maximum {MAX_MB} MB)</label>
            <input
              key={fileKey}
              id="cr-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={onFile}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
              aria-invalid={errors.file ? 'true' : 'false'}
              aria-describedby={errors.file ? 'cr-file-err' : undefined}
            />
            {file && !errors.file && (
              <p className="mt-2 inline-flex items-center gap-2 rounded bg-forest-50 px-3 py-1 text-sm text-forest-900">
                <span aria-hidden="true">📄</span> {file.name} <span className="text-slate-600">· {formatSize(file.size)}</span>
              </p>
            )}
            {errors.file && <p id="cr-file-err" className="mt-1 text-sm text-red-700">{errors.file}</p>}
          </div>

          <p className="text-xs text-slate-600 sm:col-span-2">
            Marks lists are public. Upload only the documents the school has approved for publication.
          </p>

          <div className="sm:col-span-2">
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? `Uploading… ${progress}%` : 'Upload Marks List'}
            </button>
            {uploading && (
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-forest-100"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-ochre-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </form>

        <div className="mt-3"><StatusMessage status={status} /></div>
      </section>

      <section className="card p-6" aria-labelledby="cr-list-h">
        <h2 id="cr-list-h" className="section-title !text-xl">Published marks lists ({all.length})</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="cr-search" className="label">Search</label>
            <input
              id="cr-search"
              type="search"
              className="input"
              placeholder="Title, class, examination or year…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cr-filter-class" className="label">Class</label>
            <select id="cr-filter-class" className="input" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All classes</option>
              {classNames.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-slate-600">
            {visible.length} {visible.length === 1 ? 'marks list' : 'marks lists'} shown
          </p>
          {(search || filterClass) && (
            <button type="button" onClick={() => { setSearch(''); setFilterClass(''); }} className="btn-outline">
              Clear filters
            </button>
          )}
        </div>

        {lists.loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {lists.error && <p role="alert" className="mt-3 text-red-700">{lists.error}</p>}
        {!lists.loading && !lists.error && visible.length === 0 && (
          <p className="mt-3 text-slate-600">No marks lists found.</p>
        )}

        {visible.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <caption className="sr-only">Published marks lists</caption>
              <thead>
                <tr className="bg-forest-900 text-white">
                  <th scope="col" className="px-4 py-2">Title</th>
                  <th scope="col" className="px-4 py-2">Class</th>
                  <th scope="col" className="px-4 py-2">Examination</th>
                  <th scope="col" className="px-4 py-2">Year</th>
                  <th scope="col" className="px-4 py-2">Uploaded</th>
                  <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r._id} className="border-b border-forest-100 odd:bg-white even:bg-forest-50/50">
                    <th scope="row" className="px-4 py-2 font-semibold text-forest-900">{r.title}</th>
                    <td className="px-4 py-2">
                      <span className="rounded bg-forest-100 px-2 py-0.5 text-xs font-semibold text-forest-800">{r.className}</span>
                    </td>
                    <td className="px-4 py-2">{r.exam}</td>
                    <td className="px-4 py-2">{r.academicYear}</td>
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
    </div>
  );
}
