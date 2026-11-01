import { useRef, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { activityCategories } from '../../config/options';
import SafeImage from '../../components/common/SafeImage';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';

const blank = () => ({
  title: '',
  date: today(),
  category: activityCategories[0],
  description: '',
  link: '',
  photoAlt: '',
});

export default function AdminActivities() {
  const { data, loading, error, reload } = useFetch('/activities');
  const activities = data?.activities || [];

  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null); // the activity being edited, or null
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm(blank());
    setEditing(null);
    setFile(null);
    setFileKey((k) => k + 1);
    setRemovePhoto(false);
    setConsent(false);
    setErrors({});
  };

  const startEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title,
      date: (a.date || '').slice(0, 10),
      category: a.category,
      description: a.description,
      link: a.link || '',
      photoAlt: a.photoAlt || '',
    });
    setFile(null);
    setFileKey((k) => k + 1);
    setRemovePhoto(false);
    setConsent(false);
    setErrors({});
    setStatus({ type: '', text: '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasPhotoAfterSave = Boolean(file) || (Boolean(editing?.photoUrl) && !removePhoto);

  const validate = () => {
    const er = {};
    if (form.title.trim().length < 3) er.title = 'Enter a title (at least 3 characters).';
    if (!form.date) er.date = 'Choose the date of the activity.';
    if (form.description.trim().length < 10) er.description = 'Write a short description (at least 10 characters).';
    if (form.link.trim()) {
      let ok = false;
      try {
        ok = ['http:', 'https:'].includes(new URL(form.link.trim()).protocol);
      } catch {
        ok = false;
      }
      if (!ok) er.link = 'The link must start with http:// or https://.';
    }
    if (file) {
      if (!IMAGE_TYPES.includes(file.type)) er.file = 'Only JPG, PNG or WebP images are allowed.';
      else if (file.size > MAX_MB * 1024 * 1024) er.file = `The photograph must be smaller than ${MAX_MB} MB.`;
      else if (!consent) er.consent = 'Please confirm the photograph statement.';
    }
    if (hasPhotoAfterSave && form.photoAlt.trim().length < 5) {
      er.photoAlt = 'Describe the photograph in a short sentence.';
    }
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    setStatus({ type: '', text: '' });
    if (Object.keys(er).length) return;

    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('date', form.date);
    fd.append('category', form.category);
    fd.append('description', form.description.trim());
    fd.append('link', form.link.trim());
    fd.append('photoAlt', form.photoAlt.trim());
    if (file) fd.append('photo', file);
    if (editing && removePhoto && !file) fd.append('removePhoto', 'true');

    setSaving(true);
    try {
      const wasEditing = Boolean(editing);
      if (editing) await api.put(`/activities/${editing._id}`, fd);
      else await api.post('/activities', fd);
      notifySuccess(
        wasEditing ? 'The activity has been updated.' : 'The activity is now live on the Student Life page.',
        wasEditing ? 'Activity updated' : 'Activity published'
      );
      reset();
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not save the activity.') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    const ok = await confirmNote({
      title: 'Delete this activity?',
      message: `"${a.title}" will be removed from the public Student Life page.`,
      confirmLabel: 'Yes, delete it',
    });
    if (!ok) return;
    try {
      await api.delete(`/activities/${a._id}`);
      if (editing?._id === a._id) reset();
      setStatus({ type: '', text: '' });
      notifySuccess('The activity has been removed from the Student Life page.', 'Activity deleted');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  const text = (id, label, props = {}) => (
    <div>
      <label htmlFor={`a-${id}`} className="label">{label}</label>
      <input
        id={`a-${id}`}
        className="input"
        value={form[id]}
        onChange={set(id)}
        aria-invalid={errors[id] ? 'true' : 'false'}
        aria-describedby={errors[id] ? `a-${id}-err` : undefined}
        {...props}
      />
      {errors[id] && <p id={`a-${id}-err`} className="mt-1 text-sm text-red-700">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <p className="rounded border-l-4 border-ochre-500 bg-ochre-50 p-4 text-sm text-slate-800" role="note">
        Publish only genuine, school-approved activities. Do not add invented events, awards or participants. Activities
        appear on the public Student Life page immediately.
      </p>

      <section ref={formRef} className="card p-6" aria-labelledby="act-form-h">
        <h2 id="act-form-h" className="section-title !text-xl">
          {editing ? `Edit activity: ${editing.title}` : 'Add an activity'}
        </h2>

        <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{text('title', 'Title', { maxLength: 120, required: true })}</div>

          {text('date', 'Date of the activity', { type: 'date', required: true })}
          <div>
            <label htmlFor="a-category" className="label">Category</label>
            <select id="a-category" className="input" value={form.category} onChange={set('category')}>
              {activityCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="a-description" className="label">Description (1–2 factual sentences)</label>
            <textarea
              id="a-description"
              rows="4"
              maxLength={600}
              className="input"
              value={form.description}
              onChange={set('description')}
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-describedby={errors.description ? 'a-description-err' : undefined}
              required
            />
            {errors.description && <p id="a-description-err" className="mt-1 text-sm text-red-700">{errors.description}</p>}
          </div>

          <div className="sm:col-span-2">
            {text('link', 'More-information link (optional)', { type: 'url', maxLength: 300, placeholder: 'https://…' })}
          </div>

          {/* Photograph */}
          <fieldset className="rounded border border-forest-100 p-4 sm:col-span-2">
            <legend className="px-2 text-sm font-semibold text-forest-900">Photograph (optional)</legend>

            {editing?.photoUrl && (
              <div className="mb-4 flex flex-wrap items-start gap-4">
                <div className="w-40">
                  <SafeImage src={editing.photoUrl} alt={editing.photoAlt} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} disabled={Boolean(file)} />
                  Remove the current photograph
                </label>
              </div>
            )}

            <label htmlFor="a-file" className="label">
              {editing?.photoUrl ? 'Replace with a new photograph' : 'Choose a photograph'} (JPG, PNG or WebP, up to {MAX_MB} MB)
            </label>
            <input
              key={fileKey}
              id="a-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => { setFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setRemovePhoto(false); }}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
              aria-invalid={errors.file ? 'true' : 'false'}
              aria-describedby={errors.file ? 'a-file-err' : undefined}
            />
            {errors.file && <p id="a-file-err" className="mt-1 text-sm text-red-700">{errors.file}</p>}

            {hasPhotoAfterSave && (
              <div className="mt-4">
                {text('photoAlt', 'Describe the photograph (alt text)', {
                  maxLength: 200,
                  placeholder: 'e.g. Students taking part in a relay race on the school ground',
                })}
              </div>
            )}

            {file && (
              <div className="mt-3">
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-describedby={errors.consent ? 'a-consent-err' : undefined} />
                  <span>
                    I confirm this is a genuine photograph from Kalinga Model Residential School, Umarkot, and that the
                    school has permission to publish any identifiable students shown.
                  </span>
                </label>
                {errors.consent && <p id="a-consent-err" className="mt-1 text-sm text-red-700">{errors.consent}</p>}
              </div>
            )}
          </fieldset>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Publish Activity'}
            </button>
            {editing && <button type="button" onClick={reset} className="btn-outline">Cancel editing</button>}
          </div>
        </form>

        <div className="mt-3"><StatusMessage status={status} /></div>
      </section>

      <section aria-labelledby="act-list-h">
        <h2 id="act-list-h" className="section-title !text-xl">Published activities ({activities.length})</h2>
        {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {!loading && !error && activities.length === 0 && <p className="mt-3 text-slate-600">No activities yet.</p>}

        <ul className="mt-4 space-y-3">
          {activities.map((a) => (
            <li key={a._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
              {a.photoUrl ? (
                <div className="w-full shrink-0 sm:w-40">
                  <SafeImage src={a.photoUrl} alt={a.photoAlt} />
                </div>
              ) : (
                <div className="flex w-full shrink-0 items-center justify-center rounded bg-forest-50 p-4 text-xs text-forest-600 sm:w-40">
                  No photograph
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded bg-ochre-100 px-2 py-0.5 font-semibold text-ochre-800">{a.category}</span>
                  <span className="text-slate-600">{formatDate(a.date)}</span>
                </p>
                <h3 className="mt-1 font-serif text-lg font-semibold text-forest-900">{a.title}</h3>
                <p className="mt-1 text-sm text-slate-700">{a.description}</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <button type="button" className="btn-outline" onClick={() => startEdit(a)} aria-label={`Edit: ${a.title}`}>Edit</button>
                <button type="button" className="btn-danger" onClick={() => remove(a)} aria-label={`Delete: ${a.title}`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
