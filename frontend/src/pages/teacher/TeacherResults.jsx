import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { academicYearOptions } from '../../utils/academicYears';

const MAX_MB = 5; // keep in sync with the backend upload limit
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function TeacherResults() {
  const me = useFetch('/teachers/me');
  const academics = useFetch('/academics');
  const mine = useFetch('/results/mine');

  const years = useMemo(() => academicYearOptions(), []);
  const [form, setForm] = useState({ className: '', subject: '', exam: '', academicYear: years[0], title: '' });
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const assignments = me.data?.teacher?.assignments || [];
  const classOptions = [...new Set(assignments.map((a) => a.className))];
  const subjectOptions = assignments.filter((a) => a.className === form.className).map((a) => a.subject);
  // Exams depend on the selected class.
  const exams = academics.data?.classes?.find((c) => c.className === form.className)?.examPattern || [];
  const list = mine.data?.results || [];

  const autoTitle =
    form.className && form.exam && form.subject
      ? `${form.className} – ${form.exam} – ${form.subject} (${form.academicYear})`
      : '';

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
      // Changing the class invalidates the chosen subject and exam.
      ...(k === 'className' ? { subject: '', exam: '' } : {}),
    }));

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setErrors((er) => ({ ...er, file: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.className) er.className = 'Select a class.';
    if (!form.subject) er.subject = 'Select a subject.';
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

    const title =
      form.title.trim() || `${form.className} – ${form.exam} – ${form.subject} (${form.academicYear})`;

    const fd = new FormData();
    fd.append('title', title);
    fd.append('className', form.className);
    fd.append('subject', form.subject);
    fd.append('exam', form.exam);
    fd.append('academicYear', form.academicYear);
    fd.append('file', file);

    setUploading(true);
    setProgress(0);
    try {
      await api.post('/results', fd, {
        onUploadProgress: (p) => p.total && setProgress(Math.round((p.loaded * 100) / p.total)),
      });
      setFile(null);
      setFileKey((k) => k + 1);
      setForm((f) => ({ ...f, title: '' }));
      notifySuccess('The result is now visible on the public Results page.', 'Result posted');
      mine.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Upload failed. Nothing was published.') });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (r) => {
    const ok = await confirmNote({
      title: 'Delete this result?',
      message: `"${r.title}" will be removed from the public Results page.`,
      confirmLabel: 'Yes, delete it',
      cancelLabel: 'No, keep it',
    });
    if (!ok) return;
    try {
      await api.delete(`/results/${r._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The result has been removed from the public Results page.', 'Result deleted');
      mine.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  if (me.loading || academics.loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (me.error) return <p role="alert" className="text-red-700">{me.error}</p>;
  if (academics.error) return <p role="alert" className="text-red-700">{academics.error}</p>;

  const select = (id, label, options, value, extra = {}) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select
        id={id}
        className="input"
        value={value}
        onChange={set(id)}
        aria-invalid={errors[id] ? 'true' : 'false'}
        aria-describedby={errors[id] ? `${id}-err` : undefined}
        {...extra}
      >
        <option value="">{extra.disabled ? 'Select a class first' : 'Select…'}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {errors[id] && <p id={`${id}-err`} className="mt-1 text-sm text-red-700">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="up-h">
        <h2 id="up-h" className="section-title !text-xl">Upload a result (PDF)</h2>

        {assignments.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-ochre-400 bg-ochre-50 p-3 text-sm text-ochre-700">
            Please add the classes and subjects you teach first on the{' '}
            <Link to="/teacher/classes" className="font-semibold underline">My Classes &amp; Subjects</Link> page.
            You can upload results only for those.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
            {select('className', 'Class', classOptions, form.className)}
            {select('subject', 'Subject', subjectOptions, form.subject, { disabled: !form.className })}
            {select('exam', 'Examination', exams, form.exam, { disabled: !form.className })}
            {select('academicYear', 'Academic year', years, form.academicYear)}

            <div className="sm:col-span-2">
              <label htmlFor="title" className="label">Title (optional)</label>
              <input id="title" className="input" maxLength={120} value={form.title} onChange={set('title')} placeholder="Leave blank to generate automatically" />
              {!form.title.trim() && autoTitle && (
                <p className="mt-1 text-xs text-slate-600">It will be published as: <span className="font-medium text-forest-900">{autoTitle}</span></p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="file" className="label">PDF file (maximum {MAX_MB} MB)</label>
              <input
                key={fileKey}
                id="file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={onFile}
                className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
                aria-invalid={errors.file ? 'true' : 'false'}
                aria-describedby={errors.file ? 'file-err' : undefined}
              />
              {file && !errors.file && (
                <p className="mt-2 inline-flex items-center gap-2 rounded bg-forest-50 px-3 py-1 text-sm text-forest-900">
                  <span aria-hidden="true">📄</span> {file.name} <span className="text-slate-600">· {formatSize(file.size)}</span>
                </p>
              )}
              {errors.file && <p id="file-err" className="mt-1 text-sm text-red-700">{errors.file}</p>}
            </div>

            <p className="text-xs text-slate-600 sm:col-span-2">
              Results are public. Upload only the documents the school has approved for publication.
            </p>

            <div className="sm:col-span-2">
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? `Uploading… ${progress}%` : 'Upload Result'}
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
        )}

        <div role="alert" className="mt-3">
          {status.type === 'error' && <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{status.text}</p>}
        </div>
      </section>

      <section className="card p-6" aria-labelledby="mine-h">
        <h2 id="mine-h" className="section-title !text-xl">My uploaded results ({list.length})</h2>
        {mine.loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {mine.error && <p role="alert" className="mt-3 text-red-700">{mine.error}</p>}
        {!mine.loading && !mine.error && list.length === 0 && (
          <p className="mt-3 text-slate-600">You have not uploaded any results yet.</p>
        )}
        {list.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Results you have uploaded</caption>
              <thead>
                <tr className="bg-forest-900 text-white">
                  <th scope="col" className="px-4 py-2">Title</th>
                  <th scope="col" className="px-4 py-2">Class</th>
                  <th scope="col" className="px-4 py-2">Exam</th>
                  <th scope="col" className="px-4 py-2">Year</th>
                  <th scope="col" className="px-4 py-2">Uploaded</th>
                  <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
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
                    <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" aria-label={`View PDF: ${r.title}`}>View</a>
                        <button type="button" onClick={() => remove(r)} className="btn-danger" aria-label={`Delete: ${r.title}`}>Delete</button>
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