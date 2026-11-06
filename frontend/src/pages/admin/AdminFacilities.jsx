import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import SafeImage from '../../components/common/SafeImage';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const TITLE_MAX = 80;
const TEXT_MAX = 600;
const ALT_MAX = 200;

const fileProblem = (file) => {
  if (!ALLOWED.includes(file.type)) return 'Only JPG, PNG or WebP images are allowed.';
  if (file.size > MAX_MB * 1024 * 1024) return `The photograph is larger than ${MAX_MB} MB.`;
  return '';
};

// Object URL for a chosen file; released when the file changes.
function useFilePreview(file) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) {
      setUrl('');
      return undefined;
    }
    const made = URL.createObjectURL(file);
    setUrl(made);
    return () => URL.revokeObjectURL(made);
  }, [file]);
  return url;
}

function FacilityCard({ item, index, total, onChanged, setStatus }) {
  const [title, setTitle] = useState(item.title || '');
  const [description, setDescription] = useState(item.description || '');
  const [photoAlt, setPhotoAlt] = useState(item.photoAlt || '');
  const [visible, setVisible] = useState(item.visible !== false);
  const [newFile, setNewFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const preview = useFilePreview(newFile);

  const changed =
    title !== (item.title || '') ||
    description !== (item.description || '') ||
    photoAlt !== (item.photoAlt || '') ||
    visible !== (item.visible !== false) ||
    !!newFile ||
    removePhoto;

  const save = async () => {
    setStatus({ type: '', text: '' });
    if (title.trim().length < 2) return setStatus({ type: 'error', text: 'Please enter the facility name.' });
    if (description.trim().length < 10) return setStatus({ type: 'error', text: 'Please write a short description.' });
    if (newFile) {
      const problem = fileProblem(newFile);
      if (problem) return setStatus({ type: 'error', text: problem });
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('photoAlt', photoAlt.trim());
      fd.append('visible', String(visible));
      if (removePhoto && !newFile) fd.append('removePhoto', 'true');
      if (newFile) fd.append('photo', newFile);
      await api.put(`/facilities/${item._id}`, fd);
      setNewFile(null);
      setFileKey((k) => k + 1);
      setRemovePhoto(false);
      notifySuccess('The facility details have been saved.', 'Facility updated');
      onChanged();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const move = async (direction) => {
    setBusy(true);
    try {
      await api.put(`/facilities/${item._id}/move`, { direction });
      setStatus({ type: '', text: '' });
      onChanged();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirmNote({
      title: 'Delete this facility?',
      message: 'It will be removed from the website and its uploaded photograph (if any) will be deleted.',
      confirmLabel: 'Yes, delete it',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await api.delete(`/facilities/${item._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The facility has been removed.', 'Facility deleted');
      onChanged();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
      setBusy(false);
    }
  };

  const shownPhoto = preview || (!removePhoto ? item.url : '');

  return (
    <li className="card overflow-hidden">
      <div className="relative">
        {shownPhoto ? (
          <SafeImage src={shownPhoto} alt={photoAlt || title} />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-forest-50 text-sm text-slate-500">No photograph</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-forest-900/85 px-3 py-0.5 text-xs font-medium text-white">
          #{index + 1}
        </span>
        {!visible && (
          <span className="absolute right-2 top-2 rounded-full bg-ochre-500 px-3 py-0.5 text-xs font-bold text-forest-950">
            Hidden
          </span>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div>
          <label htmlFor={`ft-${item._id}`} className="label">Facility name</label>
          <input id={`ft-${item._id}`} className="input" maxLength={TITLE_MAX} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`fd-${item._id}`} className="label">Description</label>
          <textarea id={`fd-${item._id}`} rows="4" className="input" maxLength={TEXT_MAX} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`fa-${item._id}`} className="label">Photo alt text (describe the photo)</label>
          <input id={`fa-${item._id}`} className="input" maxLength={ALT_MAX} value={photoAlt} onChange={(e) => setPhotoAlt(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`fp-${item._id}`} className="label">{item.url ? 'Replace photograph' : 'Add photograph'}</label>
          <input
            key={fileKey}
            id={`fp-${item._id}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setNewFile(e.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
          />
        </div>
        {item.url && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={removePhoto} disabled={!!newFile} onChange={(e) => setRemovePhoto(e.target.checked)} />
            Remove the current photograph
          </label>
        )}
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Show on the website
        </label>

        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" className="btn-primary" onClick={save} disabled={!changed || busy}>Save</button>
          <button type="button" className="btn-outline" onClick={() => move('up')} disabled={busy || index === 0} aria-label={`Move ${item.title} up`}>↑ Up</button>
          <button type="button" className="btn-outline" onClick={() => move('down')} disabled={busy || index === total - 1} aria-label={`Move ${item.title} down`}>↓ Down</button>
          <button type="button" className="btn-danger" onClick={remove} disabled={busy}>Delete</button>
        </div>
      </div>
    </li>
  );
}

export default function AdminFacilities() {
  const { data, loading, error, reload } = useFetch('/facilities/manage');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoAlt, setPhotoAlt] = useState('');
  const [visible, setVisible] = useState(true);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const preview = useFilePreview(file);

  const items = data?.facilities || [];

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    if (title.trim().length < 2) return setStatus({ type: 'error', text: 'Please enter the facility name.' });
    if (description.trim().length < 10) return setStatus({ type: 'error', text: 'Please write a short description.' });
    if (file) {
      const problem = fileProblem(file);
      if (problem) return setStatus({ type: 'error', text: problem });
      if (!consent) return setStatus({ type: 'error', text: 'Please confirm the photograph statement before publishing.' });
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('photoAlt', photoAlt.trim());
      fd.append('visible', String(visible));
      if (file) fd.append('photo', file);
      await api.post('/facilities', fd);
      setTitle('');
      setDescription('');
      setPhotoAlt('');
      setVisible(true);
      setFile(null);
      setFileKey((k) => k + 1);
      setConsent(false);
      notifySuccess('The facility has been added.', 'Facility saved');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'The facility could not be saved. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="fac-add">
        <h2 id="fac-add" className="section-title !text-xl">Add a facility</h2>
        <p className="mt-1 text-sm text-slate-600">
          Facilities appear on the public Facilities page (and the first six on the home page). A photograph is
          optional (JPG, PNG or WebP, up to {MAX_MB} MB).
        </p>

        <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fac-title" className="label">Facility name</label>
            <input id="fac-title" className="input" maxLength={TITLE_MAX} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label htmlFor="fac-photo" className="label">Photograph (optional)</label>
            <input
              key={fileKey}
              id="fac-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="fac-desc" className="label">Description</label>
            <textarea id="fac-desc" rows="4" className="input" maxLength={TEXT_MAX} value={description} onChange={(e) => setDescription(e.target.value)} />
            <p className="mt-1 text-right text-xs text-slate-500">{description.length} / {TEXT_MAX}</p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="fac-alt" className="label">Photo alt text (describe the photo)</label>
            <input id="fac-alt" className="input" maxLength={ALT_MAX} value={photoAlt} onChange={(e) => setPhotoAlt(e.target.value)} />
          </div>

          {preview && (
            <div className="sm:col-span-2">
              <p className="label">Preview</p>
              <img src={preview} alt="Selected photograph preview" className="h-32 w-44 rounded border border-forest-200 object-cover" />
            </div>
          )}

          {file && (
            <label className="flex items-start gap-2 text-sm sm:col-span-2">
              <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I confirm this is a genuine photograph of Kalinga Model Residential School, Umarkot, and that the
                school has permission to publish any identifiable students shown.
              </span>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
            Show on the website
          </label>

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Add facility'}
            </button>
          </div>
        </form>

        <div className="mt-3"><StatusMessage status={status} /></div>
      </section>

      <section aria-labelledby="fac-list">
        <h2 id="fac-list" className="section-title !text-xl">Facilities ({items.length})</h2>
        <p className="mt-1 text-sm text-slate-600">
          Use the Up and Down buttons to change the order shown on the website. Untick &quot;Show on the website&quot;
          to hide a facility without deleting it.
        </p>
        {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="mt-3 text-slate-600">No facilities yet.</p>}

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((f, i) => (
            <FacilityCard key={f._id} item={f} index={i} total={items.length} onChanged={reload} setStatus={setStatus} />
          ))}
        </ul>
      </section>
    </div>
  );
}
