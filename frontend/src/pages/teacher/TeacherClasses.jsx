import { useEffect, useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';

export default function TeacherClasses() {
  const me = useFetch('/teachers/me');
  const academics = useFetch('/academics');

  const [assignments, setAssignments] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [cls, setCls] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me.data?.teacher) {
      setAssignments(me.data.teacher.assignments || []);
      setDirty(false);
    }
  }, [me.data]);

  const classes = academics.data?.classes || [];
  const subjectsFor = (cn) => classes.find((c) => c.className === cn)?.subjects || [];
  const has = (className, subject) => assignments.some((a) => a.className === className && a.subject === subject);

  // Group by class, in the school's class order.
  const grouped = useMemo(() => {
    const order = classes.map((c) => c.className);
    const map = new Map();
    assignments.forEach((a) => {
      if (!map.has(a.className)) map.set(a.className, []);
      map.get(a.className).push(a.subject);
    });
    return [...map.entries()].sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [assignments, classes]);

  const toggle = (subject) => {
    setStatus({ type: '', text: '' });
    setAssignments((list) =>
      has(cls, subject)
        ? list.filter((a) => !(a.className === cls && a.subject === subject))
        : [...list, { className: cls, subject }]
    );
    setDirty(true);
  };

  const remove = (className, subject) => {
    setAssignments((list) => list.filter((a) => !(a.className === className && a.subject === subject)));
    setDirty(true);
    setStatus({ type: '', text: '' });
  };

  const save = async () => {
    setSaving(true);
    setStatus({ type: '', text: '' });
    try {
      await api.put('/teachers/me/classes', { assignments });
      setDirty(false);
      setStatus({ type: 'ok', text: 'Your classes and subjects have been saved.' });
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (me.loading || academics.loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (me.error) return <p role="alert" className="text-red-700">{me.error}</p>;
  if (academics.error) return <p role="alert" className="text-red-700">{academics.error}</p>;

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="section-title !text-xl">Add classes and subjects</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pick a class, then tap each subject you teach in it. Tap again to remove it. For example: Class 6 – English,
          Class 8 – Math.
        </p>

        {classes.length === 0 ? (
          <p className="mt-4 rounded border border-dashed border-ochre-400 bg-ochre-50 p-3 text-sm text-ochre-700">
            The school has not set up its classes yet. Please ask the administrator.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="cls" className="label">Class</label>
              <select id="cls" className="input max-w-xs" value={cls} onChange={(e) => setCls(e.target.value)}>
                <option value="">Select class…</option>
                {classes.map((c) => <option key={c.className}>{c.className}</option>)}
              </select>
            </div>

            {cls && (
              <div role="group" aria-label={`Subjects in ${cls}`}>
                <p className="label">Subjects you teach in {cls}</p>
                <ul className="flex flex-wrap gap-2">
                  {subjectsFor(cls).map((s) => {
                    const on = has(cls, s);
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(s)}
                          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                            on
                              ? 'border-forest-800 bg-forest-800 text-white'
                              : 'border-forest-200 bg-white text-forest-900 hover:bg-forest-50'
                          }`}
                        >
                          <span aria-hidden="true">{on ? '✓' : '+'}</span>
                          {s}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card p-6" aria-labelledby="current-h">
        <h2 id="current-h" className="section-title !text-xl">Classes I teach</h2>

        {grouped.length === 0 ? (
          <p className="mt-3 text-slate-600">You have not added any classes yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {grouped.map(([className, subjects]) => (
              <li key={className} className="rounded border border-l-4 border-forest-100 border-l-forest-700 bg-white p-4">
                <h3 className="font-serif text-lg font-semibold text-forest-900">{className}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {subjects.map((s) => {
                    const stale = !subjectsFor(className).includes(s);
                    return (
                      <li key={s} className="flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 py-1 pl-3 pr-1 text-sm">
                        <span>{s}</span>
                        {stale && <span className="badge-pending">Not in school list</span>}
                        <button
                          type="button"
                          onClick={() => remove(className, s)}
                          className="rounded-full px-2 text-forest-800 hover:bg-forest-100"
                          aria-label={`Remove ${s} from ${className}`}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={!dirty || saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {dirty && <span className="text-sm font-medium text-ochre-700">You have unsaved changes.</span>}
        </div>

        <div role="status" aria-live="polite" className="mt-3">
          {status.type === 'ok' && <p className="rounded bg-forest-50 p-3 text-sm font-medium text-forest-800">{status.text}</p>}
        </div>
        <div role="alert" className="mt-3">
          {status.type === 'error' && <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{status.text}</p>}
        </div>
      </section>
    </div>
  );
}
