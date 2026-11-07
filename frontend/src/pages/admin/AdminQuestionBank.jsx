import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { academicYearOptions } from '../../utils/academicYears';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5; // keep in sync with the backend upload limit
const ALL_CLASSES = 'All Classes'; // keep in sync with backend/models/QuestionBank.js
const ALL_SUBJECTS = 'All Subjects';
const KINDS = ['Question Bank', 'Previous Year Questions'];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function AdminQuestionBank() {
  const academics = useFetch('/academics');
  const lists = useFetch('/question-bank');
  const years = useMemo(() => academicYearOptions(), []);

  const [form, setForm] = useState({ kind: KINDS[0], className: '', subject: '', academicYear: years[0], title: '' });
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const all = lists.data?.items || [];
  const classNames = useMemo(() => [...new Set(all.map((r) => r.className).filter(Boolean))].sort(), [all]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((r) => (filterClass ? r.className === filterClass : true))
      .filter((r) =>
        q
          ? [r.title, r.kind, r.className, r.subject, r.academicYear].some((v) => (v || '').toLowerCase().includes(q))
          : true
      );
  }, [all, search, filterClass]);

  const classEntries = academics.data?.classes || [];
  const classOptions = [ALL_CLASSES, ...classEntries.map((c) => c.className)];

  // Subjects depend on the selected class. "All Classes" offers every subject taught anywhere.
  const subjectList =
    form.className === ALL_CLASSES
      ? [...new Set(classEntries.flatMap((c) => c.subjects || []))]
      : classEntries.find((c) => c.className === form.className)?.subjects || [];
  const subjectOptions = form.className ? [ALL_SUBJECTS, ...subjectList] : [];

  const autoTitle =
    form.className && form.subject ? `${form.kind} – ${form.className} – ${form.subject} (${form.academicYear})` : '';

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [k]: value,
      // Changing the class invalidates the chosen subject.
      ...(k === 'className' ? { subject: '' } : {}),
    }));
  };

  const onFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setErrors((er) => ({ ...er, file: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.kind) er.kind = 'Select the type.';
    if (!form.className) er.className = 'Select a class.';
    if (!form.subject) er.subject = 'Select a subject.';
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
    fd.append('kind', form.kind);
    fd.append('className', form.className);
    fd.append('subject', form.subject);
    fd.append('academicYear', form.academicYear);
    fd.append('file', file);

    setUploading(true);
    setProgress(0);
    try {
      await api.post('/question-bank', fd, {
        onUploadProgress: (p) => p.total && setProgress(Math.round((p.loaded * 100) / p.total)),
      });
      setFile(null);
      setFileKey((k) => k + 1);
      setForm((f) => ({ ...f, title: '' }));
      notifySuccess('The paper is now visible on the public Question Bank page.', 'Question bank published');
      lists.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Upload failed. Nothing was published.') });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (r) => {
    const ok = await confirmNote({
      title: 'Delete this paper?',
      message: `"${r.title}" will be removed from the public Question Bank page.`,
      confirmLabel: 'Yes, delete it',
      cancelLabel: 'No, keep it',
    });
    if (!ok) return;
    try {
      await api.delete(`/question-bank/${r._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The paper has been removed from the public Question Bank page.', 'Paper deleted');
      lists.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  if (academics.loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (academics.error) return <p role="alert" className="text-red-700">{academics.error}</p>;

  const select = (id, label, options, value, disabled = false, placeholder = 'Select…') => (
    <div>
      <label htmlFor={`qb-${id}`} className="label">{label}</label>
      <select
        id={`qb-${id}`}
        className="input"
        value={value}
        onChange={set(id)}
        disabled={disabled}
        aria-invalid={errors[id] ? 'true' : 'false'}
        aria-describedby={errors[id] ? `qb-${id}-err` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {errors[id] && <p id={`qb-${id}-err`} className="mt-1 text-sm text-red-700">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="card p-4 sm:p-6" aria-labelledby="qb-form-h">
        <h2 id="qb-form-h" className="section-title !text-xl">Upload a question bank / previous year paper (PDF)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose the class, then the subject. Pick &ldquo;{ALL_CLASSES}&rdquo; or &ldquo;{ALL_SUBJECTS}&rdquo; when one
          PDF covers several classes or subjects together. Only administrators can publish these papers.
        </p>

        <form onSubmit={submit} noValidate className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {select('kind', 'Type', KINDS, form.kind, false, 'Select type…')}
          {select('academicYear', 'Academic year', years, form.academicYear)}
          {select('className', 'Class', classOptions, form.className)}
          {select('subject', 'Subject', subjectOptions, form.subject, !form.className, form.className ? 'Select…' : 'Select a class first')}

          <div className="sm:col-span-2">
            <label htmlFor="qb-title" className="label">Title (optional)</label>
            <input
              id="qb-title"
              className="input"
              maxLength={150}
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. PYQs of Monthly Internal 2025"
            />
          </div>
          {!form.title.trim() && autoTitle && (
            <p className="break-words text-xs text-slate-600 sm:col-span-2">
              It will be published as: <span className="font-medium text-forest-900">{autoTitle}</span>
            </p>
          )}

          <div className="sm:col-span-2">
            <label htmlFor="qb-file" className="label">PDF file (maximum {MAX_MB} MB)</label>
            <input
              key={fileKey}
              id="qb-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={onFile}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
              aria-invalid={errors.file ? 'true' : 'false'}
              aria-describedby={errors.file ? 'qb-file-err' : undefined}
            />
            {file && !errors.file && (
              <p className="mt-2 inline-flex max-w-full items-center gap-2 break-all rounded bg-forest-50 px-3 py-1 text-sm text-forest-900">
                <span aria-hidden="true">📄</span> {file.name} <span className="text-slate-600">· {formatSize(file.size)}</span>
              </p>
            )}
            {errors.file && <p id="qb-file-err" className="mt-1 text-sm text-red-700">{errors.file}</p>}
          </div>

          <p className="text-xs text-slate-600 sm:col-span-2">
            These papers are public. Upload only the documents the school has approved for publication.
          </p>

          <div className="sm:col-span-2">
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? `Uploading… ${progress}%` : 'Upload Paper'}
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

      <section className="card p-4 sm:p-6" aria-labelledby="qb-list-h">
        <h2 id="qb-list-h" className="section-title !text-xl">Published papers ({all.length})</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="qb-search" className="label">Search</label>
            <input
              id="qb-search"
              type="search"
              className="input"
              placeholder="Title, class, subject or year…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="qb-filter-class" className="label">Class</label>
            <select id="qb-filter-class" className="input" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All classes</option>
              {classNames.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-slate-600">
            {visible.length} {visible.length === 1 ? 'paper' : 'papers'} shown
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
          <p className="mt-3 text-slate-600">No papers found.</p>
        )}

        {visible.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <caption className="sr-only">Published question bank papers</caption>
              <thead>
                <tr className="bg-forest-900 text-white">
                  <th scope="col" className="px-4 py-2">Title</th>
                  <th scope="col" className="px-4 py-2">Type</th>
                  <th scope="col" className="px-4 py-2">Class</th>
                  <th scope="col" className="px-4 py-2">Subject</th>
                  <th scope="col" className="px-4 py-2">Year</th>
                  <th scope="col" className="px-4 py-2">Uploaded</th>
                  <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r._id} className="border-b border-forest-100 odd:bg-white even:bg-forest-50/50">
                    <th scope="row" className="px-4 py-2 font-semibold text-forest-900">{r.title}</th>
                    <td className="px-4 py-2">{r.kind}</td>
                    <td className="px-4 py-2">
                      <span className="rounded bg-forest-100 px-2 py-0.5 text-xs font-semibold text-forest-800">{r.className}</span>
                    </td>
                    <td className="px-4 py-2">{r.subject}</td>
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
