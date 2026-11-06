import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import StatusMessage from '../../components/common/StatusMessage';

const PRESETS = {
  standard: ['Monthly Internal', 'Half Yearly', 'Final'],
  board: ['Monthly Internal', 'Preboard 1', 'Preboard 2', 'Board'],
};
const DEFAULT_SUBJECTS = ['Math', 'Science', 'Odia', 'English', 'Social Studies', 'Computer Science'];
const QUICK_CLASSES = ['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'];

const norm = (s) => s.trim().toLowerCase();
const dupe = (list, value, skip = -1) => list.some((x, i) => i !== skip && norm(x) === norm(value));

// Class X and XII (any spelling: "Class X", "10", "xii", "12") get the board pattern.
const suggestPreset = (name) =>
  ['x', '10', 'xii', '12'].includes(name.toLowerCase().replace(/class|\s|-/g, '')) ? 'board' : 'standard';

function ClassCard({ cls, index, total, onChange, onMove, onRemove, onError }) {
  const [newExam, setNewExam] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const label = cls.className || 'this class';

  const setExams = (fn) => onChange(index, { ...cls, examPattern: fn(cls.examPattern) });
  const setSubjects = (fn) => onChange(index, { ...cls, subjects: fn(cls.subjects) });

  const addExam = () => {
    const v = newExam.trim();
    if (!v) return;
    if (dupe(cls.examPattern, v)) return onError(`${label} already has "${v}".`);
    setExams((l) => [...l, v]);
    setNewExam('');
  };
  const renameExam = (i, v) => setExams((l) => l.map((x, k) => (k === i ? v : x)));
  const moveExam = (i, d) =>
    setExams((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const c = [...l];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  const removeExam = (i) => setExams((l) => l.filter((_, k) => k !== i));
  const applyPreset = (key) => setExams(() => [...PRESETS[key]]);

  const addSubject = () => {
    const v = newSubject.trim();
    if (!v) return;
    if (dupe(cls.subjects, v)) return onError(`${label} already has "${v}".`);
    setSubjects((l) => [...l, v]);
    setNewSubject('');
  };
  const removeSubject = (s) => setSubjects((l) => l.filter((x) => x !== s));

  return (
    <li className="card border-l-4 border-l-forest-700 p-4 sm:p-5">
      {/* Class name and ordering */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[160px] flex-1">
          <label htmlFor={`cn-${index}`} className="label">Class name</label>
          <input
            id={`cn-${index}`}
            className="input"
            maxLength={30}
            value={cls.className}
            onChange={(e) => onChange(index, { ...cls, className: e.target.value })}
          />
        </div>
        <button type="button" className="btn-outline" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${label} up`}>↑</button>
        <button type="button" className="btn-outline" onClick={() => onMove(index, 1)} disabled={index === total - 1} aria-label={`Move ${label} down`}>↓</button>
        <button type="button" className="btn-danger" onClick={() => onRemove(index)} aria-label={`Remove ${label}`}>Remove class</button>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {cls.examPattern.length} {cls.examPattern.length === 1 ? 'examination' : 'examinations'} ·{' '}
        {cls.subjects.length} {cls.subjects.length === 1 ? 'subject' : 'subjects'}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Exam pattern for THIS class */}
        <div className="min-w-0 rounded bg-forest-50/60 p-3 sm:p-4">
          <h3 className="font-serif text-base font-semibold">Examination pattern</h3>
          <p className="text-xs text-slate-600">In the order they happen during the year.</p>

          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="btn-outline" onClick={() => applyPreset('standard')}>Use standard pattern</button>
            <button type="button" className="btn-outline" onClick={() => applyPreset('board')}>Use board-class pattern</button>
          </div>

          {cls.examPattern.length === 0 && <p className="mt-3 text-sm italic text-slate-500">No examinations yet.</p>}
          <ol className="mt-3 space-y-2">
            {cls.examPattern.map((x, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-800 text-xs font-bold text-white">{i + 1}</span>
                <label htmlFor={`ex-${index}-${i}`} className="sr-only">Examination {i + 1} of {label}</label>
                <input id={`ex-${index}-${i}`} className="input min-w-[8rem] max-w-[200px] flex-1 basis-0 sm:flex-none sm:basis-auto" maxLength={40} value={x} onChange={(e) => renameExam(i, e.target.value)} />
                <button type="button" className="btn-outline px-3" onClick={() => moveExam(i, -1)} disabled={i === 0} aria-label={`Move ${x || 'exam'} up`}>↑</button>
                <button type="button" className="btn-outline px-3" onClick={() => moveExam(i, 1)} disabled={i === cls.examPattern.length - 1} aria-label={`Move ${x || 'exam'} down`}>↓</button>
                <button type="button" className="btn-danger px-3" onClick={() => removeExam(i)} aria-label={`Remove ${x || 'exam'} from ${label}`}>✕</button>
              </li>
            ))}
          </ol>

          <div className="mt-3 flex flex-wrap gap-2">
            <label htmlFor={`ne-${index}`} className="sr-only">Add an examination to {label}</label>
            <input
              id={`ne-${index}`}
              className="input max-w-[200px]"
              placeholder="New examination"
              maxLength={40}
              value={newExam}
              onChange={(e) => setNewExam(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExam(); } }}
            />
            <button type="button" className="btn-outline" onClick={addExam} disabled={!newExam.trim()}>Add</button>
          </div>
        </div>

        {/* Subjects for THIS class */}
        <div className="min-w-0 rounded bg-forest-50/60 p-3 sm:p-4">
          <h3 className="font-serif text-base font-semibold">Subjects</h3>
          <p className="text-xs text-slate-600">Only the subjects taught in this class.</p>

          {cls.subjects.length === 0 ? (
            <p className="mt-3 text-sm italic text-slate-500">No subjects yet.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {cls.subjects.map((s) => (
                <li key={s} className="flex items-center gap-2 rounded-full border border-forest-200 bg-white py-1 pl-3 pr-1 text-sm">
                  {s}
                  <button type="button" onClick={() => removeSubject(s)} className="rounded-full px-2 hover:bg-forest-100" aria-label={`Remove ${s} from ${label}`}>✕</button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <label htmlFor={`ns-${index}`} className="sr-only">Add a subject to {label}</label>
            <input
              id={`ns-${index}`}
              className="input max-w-[200px]"
              placeholder="New subject"
              maxLength={40}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
            />
            <button type="button" className="btn-outline" onClick={addSubject} disabled={!newSubject.trim()}>Add</button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function AdminAcademics() {
  const { data, loading, error } = useFetch('/academics');
  const [classes, setClasses] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [newClass, setNewClass] = useState('');
  const [newPreset, setNewPreset] = useState('auto');
  const [withSubjects, setWithSubjects] = useState(true);

  useEffect(() => {
    if (data) {
      setClasses(
        (data.classes || []).map((c) => ({
          className: c.className,
          examPattern: [...(c.examPattern || [])],
          subjects: [...(c.subjects || [])],
        }))
      );
      setDirty(false);
    }
  }, [data]);

  const touch = () => { setDirty(true); setStatus({ type: '', text: '' }); };
  const fail = (text) => setStatus({ type: 'error', text });

  const makeClass = (name, preset) => {
    const key = preset === 'auto' ? suggestPreset(name) : preset;
    return {
      className: name,
      examPattern: key === 'none' ? [] : [...PRESETS[key]],
      subjects: withSubjects ? [...DEFAULT_SUBJECTS] : [],
    };
  };

  const addClass = () => {
    const v = newClass.trim();
    if (!v) return;
    if (dupe(classes.map((c) => c.className), v)) return fail(`"${v}" already exists.`);
    setClasses((l) => [...l, makeClass(v, newPreset)]);
    setNewClass('');
    touch();
  };

  const addQuickClasses = () => {
    const existing = classes.map((c) => c.className);
    const missing = QUICK_CLASSES.filter((n) => !dupe(existing, n));
    if (missing.length === 0) return fail('Class VI to Class XII are already added.');
    setClasses((l) => [...l, ...missing.map((n) => makeClass(n, 'auto'))]);
    touch();
  };

  const changeClass = (i, next) => { setClasses((l) => l.map((c, k) => (k === i ? next : c))); touch(); };
  const moveClass = (i, d) => {
    setClasses((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const c = [...l];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
    touch();
  };
  const removeClass = async (i) => {
    const name = classes[i].className || 'this class';
    const ok = await confirmNote({
      title: `Remove ${name}?`,
      message: 'Existing teacher entries and published results are not changed.',
      confirmLabel: 'Yes, remove class',
    });
    if (!ok) return;
    setClasses((l) => l.filter((_, k) => k !== i));
    touch();
  };

  const save = async () => {
    const clean = classes.map((c) => ({
      className: c.className.trim(),
      examPattern: c.examPattern.map((e) => e.trim()),
      subjects: c.subjects.map((s) => s.trim()),
    }));

    if (clean.some((c) => !c.className)) return fail('Class names cannot be empty.');
    if (new Set(clean.map((c) => c.className.toLowerCase())).size !== clean.length) return fail('Class names must be unique.');
    for (const c of clean) {
      if (c.examPattern.length === 0) return fail(`${c.className} needs at least one examination.`);
      if (c.examPattern.some((e) => !e)) return fail(`${c.className} has an empty exam name.`);
      if (new Set(c.examPattern.map((e) => e.toLowerCase())).size !== c.examPattern.length) return fail(`${c.className} has a repeated examination.`);
      if (c.subjects.length === 0) return fail(`${c.className} needs at least one subject.`);
    }

    setSaving(true);
    setStatus({ type: '', text: '' });
    try {
      await api.put('/academics', { classes: clean });
      setClasses(clean);
      setDirty(false);
      notifySuccess(
        'Academic settings saved. The public Academics and Results pages and the teacher forms now use them.',
        'Settings saved'
      );
    } catch (err) {
      fail(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (error) return <p role="alert" className="text-red-700">{error}</p>;

  return (
    <div className="space-y-8">
      <p className="rounded border border-ochre-200 border-l-4 border-l-ochre-500 bg-ochre-50 p-4 text-sm text-slate-800" role="note">
        Each class has its own exam pattern and its own subjects. Renaming or removing an exam, class or subject does{' '}
        <strong>not</strong> change entries teachers already made or results already published; those keep the old
        name. Add only the classes the school has confirmed are running.
      </p>

      <section className="card p-4 sm:p-6" aria-labelledby="add-class-h">
        <h2 id="add-class-h" className="section-title !text-xl">Add classes</h2>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-auto">
            <label htmlFor="new-class" className="label">Class name</label>
            <input
              id="new-class"
              className="input"
              placeholder="e.g. Class VI"
              maxLength={30}
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClass(); } }}
            />
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="new-preset" className="label">Exam pattern</label>
            <select id="new-preset" className="input max-w-full" value={newPreset} onChange={(e) => setNewPreset(e.target.value)}>
              <option value="auto">Automatic (Class X and XII get board pattern)</option>
              <option value="standard">Standard: Monthly Internal, Half Yearly, Final</option>
              <option value="board">Board class: Monthly Internal, Preboard 1, Preboard 2, Board</option>
              <option value="none">Empty (I will add exams myself)</option>
            </select>
          </div>
          <button type="button" className="btn-outline w-full sm:w-auto" onClick={addClass} disabled={!newClass.trim()}>Add class</button>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" className="shrink-0" checked={withSubjects} onChange={(e) => setWithSubjects(e.target.checked)} />
          Start new classes with the default six subjects (Math, Science, Odia, English, Social Studies, Computer Science)
        </label>

        <div className="mt-4 border-t border-forest-100 pt-4">
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={addQuickClasses}>Add Class VI to Class XII</button>
          <p className="mt-2 text-xs text-slate-600">
            Adds seven classes in one click. Classes VI, VII, VIII, IX and XI get the standard pattern; Classes X and XII
            get the board pattern. Class XI and XII subjects usually depend on the stream, so edit those afterwards.
          </p>
        </div>
      </section>

      <section aria-labelledby="classes-h">
        <h2 id="classes-h" className="section-title !text-xl">Classes ({classes.length})</h2>
        {classes.length === 0 ? (
          <p className="mt-3 text-sm italic text-slate-500">No classes yet. Add the classes the school confirms are running.</p>
        ) : (
          <ul className="mt-4 space-y-5">
            {classes.map((c, i) => (
              <ClassCard
                key={i}
                cls={c}
                index={i}
                total={classes.length}
                onChange={changeClass}
                onMove={moveClass}
                onRemove={removeClass}
                onError={fail}
              />
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-0 -mx-1 border-t border-forest-100 bg-ivory/95 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={!dirty || saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {dirty && <span className="text-sm font-medium text-ochre-700">You have unsaved changes.</span>}
        </div>
        <div className="mt-2"><StatusMessage status={status} /></div>
      </div>
    </div>
  );
}
