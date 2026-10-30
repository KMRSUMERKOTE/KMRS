import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { disclosureSections } from '../../config/options';
import { academicYearOptions } from '../../utils/academicYears';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5;
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export default function AdminDisclosures() {
  const { data, loading, error, reload } = useFetch('/disclosures');
  const years = useMemo(() => academicYearOptions(), []);
  const first = disclosureSections[0];
  const blank = {
    section: first.id,
    docType: first.expected[0].key,
    title: '',
    documentDate: '',
    academicYear: '',
    validUntil: '',
  };

  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [sectionFilter, setSectionFilter] = useState('');

  const items = data?.items || [];
  const section = disclosureSections.find((s) => s.id === form.section);
  const labelFor = (sec, key) =>
    disclosureSections.find((s) => s.id === sec)?.expected.find((e) => e.key === key)?.label || key;

  const visibleItems = sectionFilter ? items.filter((i) => i.section === sectionFilter) : items;

  const progress = disclosureSections.map((s) => {
    const done = s.expected.filter((e) => items.some((i) => i.section === s.id && i.docType === e.key)).length;
    return { id: s.id, title: s.title, done, total: s.expected.length };
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const changeSection = (e) => {
    const sec = disclosureSections.find((s) => s.id === e.target.value);
    setForm((f) => ({ ...f, section: sec.id, docType: sec.expected[0].key }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.title.trim().length < 3) er.title = 'Enter a document title.';
    if (form.validUntil && form.documentDate && form.validUntil < form.documentDate) er.validUntil = 'Validity cannot end before the document date.';
    if (!file) er.file = 'Choose the PDF document.';
    else if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) er.file = 'Only PDF files are allowed.';
    else if (file.size > MAX_MB * 1024 * 1024) er.file = `The file must be smaller than ${MAX_MB} MB.`;
    setErrors(er);
    setStatus({ type: '', text: '' });
    if (Object.keys(er).length) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v.trim ? v.trim() : v));
    fd.append('file', file);

    setSaving(true);
    try {
      await api.post('/disclosures', fd);
      setForm({ ...blank, section: form.section, docType: form.docType });
      setFile(null);
      setFileKey((k) => k + 1);
      notifySuccess(
        'The document has been added to the Mandatory Public Disclosure page.',
        'Document added'
      );
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not add the document.') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (i) => {
    const ok = await confirmNote({
      title: 'Remove this document?',
      message: `"${i.title}" will be removed from the public disclosure page.`,
      confirmLabel: 'Yes, remove it',
    });
    if (!ok) return;
    try {
      await api.delete(`/disclosures/${i._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The document has been removed from the disclosure page.', 'Document removed');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  return (
    <div className="space-y-8">
      <p className="rounded border border-ochre-200 border-l-4 border-l-ochre-500 bg-ochre-50 p-4 text-sm text-slate-800" role="note">
        Upload only genuine, verified documents (certificates, affiliation letters, staff lists and so on). Check the
        current CBSE Mandatory Public Disclosure guidelines for what is required.
      </p>

      {/* Progress per section */}
      {!loading && !error && (
        <section aria-labelledby="d-progress">
          <h2 id="d-progress" className="section-title !text-xl">Documents published</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {progress.map((p) => {
              const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <li key={p.id} className="card p-4">
                  <p className="text-sm font-semibold text-forest-900">{p.id}. {p.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{p.done} of {p.total} expected types</p>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest-100"
                    role="progressbar"
                    aria-label={`${p.title} progress`}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full bg-forest-700" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="card p-6" aria-labelledby="d-add">
        <h2 id="d-add" className="section-title !text-xl">Add a disclosure document</h2>
        <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="d-section" className="label">Section</label>
            <select id="d-section" className="input" value={form.section} onChange={changeSection}>
              {disclosureSections.map((s) => <option key={s.id} value={s.id}>{s.id}. {s.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="d-type" className="label">Document type</label>
            <select id="d-type" className="input" value={form.docType} onChange={set('docType')}>
              {section.expected.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="d-title" className="label">Document title</label>
            <input id="d-title" className="input" maxLength={150} value={form.title} onChange={set('title')}
              aria-invalid={errors.title ? 'true' : 'false'} aria-describedby={errors.title ? 'd-title-err' : undefined} />
            {errors.title && <p id="d-title-err" className="mt-1 text-sm text-red-700">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="d-date" className="label">Document date (optional)</label>
            <input id="d-date" type="date" className="input" value={form.documentDate} onChange={set('documentDate')} />
          </div>
          <div>
            <label htmlFor="d-year" className="label">Academic year (optional)</label>
            <select id="d-year" className="input" value={form.academicYear} onChange={set('academicYear')}>
              <option value="">Not applicable</option>
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="d-valid" className="label">Valid until (optional)</label>
            <input id="d-valid" type="date" className="input" value={form.validUntil} onChange={set('validUntil')}
              aria-invalid={errors.validUntil ? 'true' : 'false'} aria-describedby={errors.validUntil ? 'd-valid-err' : undefined} />
            {errors.validUntil && <p id="d-valid-err" className="mt-1 text-sm text-red-700">{errors.validUntil}</p>}
          </div>

          <div>
            <label htmlFor="d-file" className="label">PDF (maximum {MAX_MB} MB)</label>
            <input key={fileKey} id="d-file" type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
              aria-invalid={errors.file ? 'true' : 'false'} aria-describedby={errors.file ? 'd-file-err' : undefined} />
            {errors.file && <p id="d-file-err" className="mt-1 text-sm text-red-700">{errors.file}</p>}
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Uploading…' : 'Add Document'}</button>
          </div>
        </form>
      </section>

      <StatusMessage status={status} />

      <section className="card p-6" aria-labelledby="d-all">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="d-all" className="section-title !text-xl">Published documents ({visibleItems.length})</h2>
          <div>
            <label htmlFor="d-filter" className="label">Show section</label>
            <select id="d-filter" className="input" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
              <option value="">All sections</option>
              {disclosureSections.map((s) => <option key={s.id} value={s.id}>{s.id}. {s.title}</option>)}
            </select>
          </div>
        </div>
        {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {!loading && !error && visibleItems.length === 0 && <p className="mt-3 text-slate-600">No documents yet.</p>}

        {visibleItems.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Published disclosure documents</caption>
              <thead>
                <tr className="bg-forest-900 text-white">
                  <th scope="col" className="px-4 py-2">Title</th>
                  <th scope="col" className="px-4 py-2">Section / type</th>
                  <th scope="col" className="px-4 py-2">Document date</th>
                  <th scope="col" className="px-4 py-2">Valid until</th>
                  <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((i) => {
                  const expired = i.validUntil && new Date(i.validUntil) < new Date();
                  return (
                    <tr key={i._id} className="border-b border-forest-100 odd:bg-white even:bg-forest-50/50">
                      <th scope="row" className="px-4 py-2 font-semibold text-forest-900">{i.title}</th>
                      <td className="px-4 py-2">{i.section}. {labelFor(i.section, i.docType)}</td>
                      <td className="px-4 py-2">{i.documentDate ? formatDate(i.documentDate) : '—'}</td>
                      <td className="px-4 py-2">
                        {i.validUntil ? formatDate(i.validUntil) : '—'}
                        {expired && <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">Expired</span>}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <a href={i.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" aria-label={`View PDF: ${i.title}`}>View</a>
                          <button type="button" className="btn-danger" onClick={() => remove(i)} aria-label={`Remove: ${i.title}`}>Remove</button>
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
