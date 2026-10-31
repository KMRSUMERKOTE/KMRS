import { useMemo, useRef, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { academicYearOptions } from '../../utils/academicYears';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_STUDENTS = 300; // keep in sync with the backend limit

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

let rowCounter = 0;
const newRow = (name = '', totalMarks = '', marksSecured = '') => ({
  key: ++rowCounter,
  name,
  totalMarks,
  marksSecured,
});

const toNum = (v) => (String(v ?? '').trim() === '' ? NaN : Number(v));
// A row with no name and no marks secured is treated as an empty spare row and ignored.
const isBlank = (r) => !r.name.trim() && String(r.marksSecured).trim() === '';

const percent = (secured, total) => {
  const s = toNum(secured);
  const t = toNum(total);
  return Number.isFinite(s) && Number.isFinite(t) && t > 0 ? `${Math.round((s / t) * 10000) / 100}%` : '—';
};

export default function AdminClassResults() {
  const academics = useFetch('/academics');
  const lists = useFetch('/class-results');
  const years = useMemo(() => academicYearOptions(), []);

  const emptyForm = () => ({ className: '', exam: '', academicYear: years[0], title: '' });
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState(() => [newRow()]);
  const [defaultTotal, setDefaultTotal] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const formRef = useRef(null);

  const all = lists.data?.results || [];
  const classNames = useMemo(() => [...new Set(all.map((r) => r.className).filter(Boolean))].sort(), [all]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((r) => (filterClass ? r.className === filterClass : true))
      .filter((r) => {
        if (!q) return true;
        const fields = [r.title, r.className, r.exam, r.academicYear];
        return (
          fields.some((v) => (v || '').toLowerCase().includes(q)) ||
          (r.students || []).some((s) => s.name.toLowerCase().includes(q))
        );
      });
  }, [all, search, filterClass]);

  const classEntries = academics.data?.classes || [];
  const classOptions = classEntries.map((c) => c.className);
  if (form.className && !classOptions.includes(form.className)) classOptions.unshift(form.className);

  const examPattern = classEntries.find((c) => c.className === form.className)?.examPattern || [];
  // When editing an old list, keep its category selectable even if the pattern has changed since.
  const examOptions = form.exam && !examPattern.includes(form.exam) ? [form.exam, ...examPattern] : examPattern;
  const yearOptions = years.includes(form.academicYear) ? years : [form.academicYear, ...years];

  const setField = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [k]: value,
      // The category depends on the class, so it is cleared when the class changes.
      ...(k === 'className' ? { exam: '' } : {}),
    }));
  };

  const updateRow = (key, field, value) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const addRow = () => setRows((rs) => (rs.length >= MAX_STUDENTS ? rs : [...rs, newRow('', defaultTotal)]));

  const removeRow = (key) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : [newRow('', defaultTotal)]));

  const applyTotal = () => {
    if (!defaultTotal.trim()) return;
    setRows((rs) => rs.map((r) => ({ ...r, totalMarks: defaultTotal })));
  };

  // Accepts lines of "Name, Total, Secured" (comma or tab separated, as copied from a spreadsheet).
  // With a total filled in above, "Name, Secured" lines work too.
  const addPasted = () => {
    const lines = pasteText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const added = [];
    const skipped = [];

    lines.forEach((line, i) => {
      const parts = (line.includes('\t') ? line.split('\t') : line.split(',')).map((p) => p.trim());
      let name;
      let total;
      let secured;
      if (parts.length >= 3) {
        [name, total, secured] = parts;
      } else if (parts.length === 2 && defaultTotal.trim() !== '') {
        [name, secured] = parts;
        total = defaultTotal;
      }

      // Ignore a header line such as "Name, Total, Secured".
      if (i === 0 && /name/i.test(parts[0]) && !Number.isFinite(toNum(parts[1]))) return;

      if (name && Number.isFinite(toNum(total)) && Number.isFinite(toNum(secured))) {
        added.push(newRow(name, String(total), String(secured)));
      } else {
        skipped.push(i + 1);
      }
    });

    if (added.length === 0) {
      setStatus({
        type: 'error',
        text: 'No students could be read. Use one student per line: name, total marks, marks secured.',
      });
      return;
    }

    setRows((rs) => [...rs.filter((r) => !isBlank(r)), ...added].slice(0, MAX_STUDENTS));
    setPasteText('');
    setStatus({
      type: 'ok',
      text:
        `Added ${added.length} ${added.length === 1 ? 'student' : 'students'}.` +
        (skipped.length ? ` Skipped line${skipped.length > 1 ? 's' : ''} ${skipped.slice(0, 10).join(', ')} (could not be read).` : ''),
    });
  };

  const resetForm = () => {
    setForm(emptyForm());
    setRows([newRow()]);
    setDefaultTotal('');
    setPasteText('');
    setEditingId(null);
    setErrors({});
    setRowErrors({});
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({ className: r.className, exam: r.exam, academicYear: r.academicYear, title: r.title });
    setRows((r.students || []).map((s) => newRow(s.name, String(s.totalMarks), String(s.marksSecured))));
    setDefaultTotal('');
    setPasteText('');
    setErrors({});
    setRowErrors({});
    setStatus({ type: '', text: '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = () => {
    const er = {};
    if (!form.className) er.className = 'Select a class.';
    if (!form.exam) er.exam = 'Select the examination category.';
    if (!form.academicYear) er.academicYear = 'Select the academic year.';

    const used = rows.filter((r) => !isBlank(r));
    if (used.length === 0) er.students = 'Add at least one student.';

    const re = {};
    used.forEach((r) => {
      const t = toNum(r.totalMarks);
      const s = toNum(r.marksSecured);
      if (!r.name.trim()) re[r.key] = 'Enter the student name.';
      else if (!Number.isFinite(t) || t <= 0) re[r.key] = 'Enter valid total marks.';
      else if (!Number.isFinite(s) || s < 0) re[r.key] = 'Enter valid marks secured.';
      else if (s > t) re[r.key] = 'Marks secured cannot exceed total marks.';
    });
    return { er, re, used };
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    const { er, re, used } = validate();
    setErrors(er);
    setRowErrors(re);
    if (Object.keys(er).length || Object.keys(re).length) return;

    const payload = {
      title: form.title.trim(),
      className: form.className,
      exam: form.exam,
      academicYear: form.academicYear,
      students: used.map((r) => ({
        name: r.name.trim(),
        totalMarks: toNum(r.totalMarks),
        marksSecured: toNum(r.marksSecured),
      })),
    };

    setSaving(true);
    try {
      if (editingId) await api.put(`/class-results/${editingId}`, payload);
      else await api.post('/class-results', payload);
      notifySuccess(
        editingId
          ? 'The marks list has been updated on the public Results page.'
          : 'The marks list is now visible on the public Results page.',
        editingId ? 'Marks list updated' : 'Marks list published'
      );
      resetForm();
      lists.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not save the marks list. Nothing was changed.') });
    } finally {
      setSaving(false);
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
      if (editingId === r._id) resetForm();
      setStatus({ type: '', text: '' });
      notifySuccess('The marks list has been removed from the public Results page.', 'Marks list deleted');
      lists.reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  if (academics.loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (academics.error) return <p role="alert" className="text-red-700">{academics.error}</p>;

  const renderSelect = (id, label, options, value, disabled = false, placeholder = 'Select…') => (
    <div>
      <label htmlFor={`cr-${id}`} className="label">{label}</label>
      <select
        id={`cr-${id}`}
        className="input"
        value={value}
        onChange={setField(id)}
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
      <section ref={formRef} className="card scroll-mt-4 p-6" aria-labelledby="cr-form-h">
        <h2 id="cr-form-h" className="section-title !text-xl">
          {editingId ? 'Edit marks list' : 'Publish a marks list'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          A marks list shows each student's name, total marks and marks secured for one examination, without
          subject-wise marks. Only administrators can publish or change it.
        </p>

        <form onSubmit={submit} noValidate className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderSelect('className', 'Class', classOptions, form.className)}
            {renderSelect('exam', 'Examination category', examOptions, form.exam, !form.className, form.className ? 'Select…' : 'Select a class first')}
            {renderSelect('academicYear', 'Academic year', yearOptions, form.academicYear)}
          </div>

          <div>
            <label htmlFor="cr-title" className="label">Title (optional)</label>
            <input
              id="cr-title"
              className="input"
              maxLength={150}
              value={form.title}
              onChange={setField('title')}
              placeholder="Leave blank to generate automatically"
            />
            {!form.title.trim() && form.className && form.exam && (
              <p className="mt-1 text-xs text-slate-600">
                It will be published as:{' '}
                <span className="font-medium text-forest-900">
                  {form.className} – {form.exam} – Marks List ({form.academicYear})
                </span>
              </p>
            )}
          </div>

          <div className="rounded border border-forest-100 bg-forest-50/50 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="cr-default-total" className="label">Total marks (shortcut)</label>
                <input
                  id="cr-default-total"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="any"
                  className="input"
                  value={defaultTotal}
                  onChange={(e) => setDefaultTotal(e.target.value)}
                  placeholder="e.g. 500"
                />
                <p className="mt-1 text-xs text-slate-600">New and pasted rows use this value.</p>
                <button type="button" onClick={applyTotal} disabled={!defaultTotal.trim()} className="btn-outline mt-2">
                  Apply to all rows
                </button>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cr-paste" className="label">Paste from Excel or Google Sheets (optional)</label>
                <textarea
                  id="cr-paste"
                  rows={4}
                  className="input"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  aria-describedby="cr-paste-help"
                  placeholder={'Aarav Das, 500, 432\nMita Sahu, 500, 468'}
                />
                <p id="cr-paste-help" className="mt-1 text-xs text-slate-600">
                  One student per line: name, total marks, marks secured. If you filled in the total marks
                  shortcut, you may paste just name and marks secured.
                </p>
                <button type="button" onClick={addPasted} disabled={!pasteText.trim()} className="btn-outline mt-2">
                  Add pasted students
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-lg font-semibold text-forest-900">
                Students ({rows.filter((r) => !isBlank(r)).length})
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={addRow} disabled={rows.length >= MAX_STUDENTS} className="btn-outline">
                  Add a row
                </button>
                <button type="button" onClick={() => setRows([newRow('', defaultTotal)])} className="btn-outline">
                  Clear all rows
                </button>
              </div>
            </div>
            {errors.students && <p role="alert" className="mt-2 text-sm text-red-700">{errors.students}</p>}

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <caption className="sr-only">Students and their marks</caption>
                <thead>
                  <tr className="bg-forest-900 text-white">
                    <th scope="col" className="px-3 py-2">No.</th>
                    <th scope="col" className="px-3 py-2">Student name</th>
                    <th scope="col" className="px-3 py-2">Total marks</th>
                    <th scope="col" className="px-3 py-2">Marks secured</th>
                    <th scope="col" className="px-3 py-2">Percentage</th>
                    <th scope="col" className="px-3 py-2"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const err = rowErrors[r.key];
                    const errId = `cr-row-${r.key}-err`;
                    return (
                      <tr key={r.key} className="border-b border-forest-100 align-top odd:bg-white even:bg-forest-50/50">
                        <td className="px-3 py-2 text-slate-600">{i + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            className="input"
                            maxLength={80}
                            value={r.name}
                            onChange={(e) => updateRow(r.key, 'name', e.target.value)}
                            aria-label={`Student name, row ${i + 1}`}
                            aria-invalid={err ? 'true' : 'false'}
                            aria-describedby={err ? errId : undefined}
                          />
                          {err && <p id={errId} className="mt-1 text-xs text-red-700">{err}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="1"
                            step="any"
                            className="input"
                            value={r.totalMarks}
                            onChange={(e) => updateRow(r.key, 'totalMarks', e.target.value)}
                            aria-label={`Total marks, row ${i + 1}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="any"
                            className="input"
                            value={r.marksSecured}
                            onChange={(e) => updateRow(r.key, 'marksSecured', e.target.value)}
                            aria-label={`Marks secured, row ${i + 1}`}
                          />
                        </td>
                        <td className="px-3 py-2 pt-4 text-slate-700">{percent(r.marksSecured, r.totalMarks)}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => removeRow(r.key)}
                            aria-label={`Remove row ${i + 1}${r.name.trim() ? `: ${r.name.trim()}` : ''}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Marks lists are public: student names and marks appear on the school website. Publish only what the
            school has approved.
          </p>

          <StatusMessage status={status} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish marks list'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} disabled={saving} className="btn-outline">
                Cancel editing
              </button>
            )}
          </div>
        </form>
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
              placeholder="Title, class, category or student name…"
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
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">Published marks lists</caption>
              <thead>
                <tr className="bg-forest-900 text-white">
                  <th scope="col" className="px-4 py-2">Title</th>
                  <th scope="col" className="px-4 py-2">Class</th>
                  <th scope="col" className="px-4 py-2">Category</th>
                  <th scope="col" className="px-4 py-2">Year</th>
                  <th scope="col" className="px-4 py-2">Students</th>
                  <th scope="col" className="px-4 py-2">Published</th>
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
                    <td className="px-4 py-2">{r.students?.length || 0}</td>
                    <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button type="button" className="btn-outline" onClick={() => startEdit(r)} aria-label={`Edit: ${r.title}`}>Edit</button>
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
