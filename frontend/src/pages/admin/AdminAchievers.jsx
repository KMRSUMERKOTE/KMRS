import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import SafeImage from '../../components/common/SafeImage';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const NAME_MAX = 80;
const TEXT_MAX = 600;

function AchieverCard({ item, onChanged, setStatus }) {
  const [name, setName] = useState(item.name || '');
  const [achievement, setAchievement] = useState(item.achievement || '');
  const [busy, setBusy] = useState(false);

  const changed = name !== (item.name || '') || achievement !== (item.achievement || '');

  const save = async () => {
    if (name.trim().length < 2) return setStatus({ type: 'error', text: "Please enter the student's name." });
    if (achievement.trim().length < 5) return setStatus({ type: 'error', text: 'Please describe the achievement.' });
    setBusy(true);
    try {
      await api.put(`/achievers/${item._id}`, { name: name.trim(), achievement: achievement.trim() });
      setStatus({ type: '', text: '' });
      notifySuccess('The details have been saved.', 'Achiever updated');
      onChanged();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirmNote({
      title: 'Delete this achiever?',
      message: 'The photograph and details will be removed from the website.',
      confirmLabel: 'Yes, delete',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await api.delete(`/achievers/${item._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The achiever has been removed.', 'Achiever deleted');
      onChanged();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
      setBusy(false);
    }
  };

  return (
    <li className="card overflow-hidden">
      <SafeImage src={item.url} alt={`Photograph of ${item.name}`} />
      <div className="space-y-2 p-3">
        <div>
          <label htmlFor={`an-${item._id}`} className="label">Student name</label>
          <input id={`an-${item._id}`} className="input" maxLength={NAME_MAX} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`aa-${item._id}`} className="label">Achievement</label>
          <textarea id={`aa-${item._id}`} rows="4" className="input" maxLength={TEXT_MAX} value={achievement} onChange={(e) => setAchievement(e.target.value)} />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-primary" onClick={save} disabled={!changed || busy}>Save</button>
          <button type="button" className="btn-danger" onClick={remove} disabled={busy}>Delete</button>
        </div>
      </div>
    </li>
  );
}

export default function AdminAchievers() {
  const { data, loading, error, reload } = useFetch('/achievers');
  const [name, setName] = useState('');
  const [achievement, setAchievement] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [fileKey, setFileKey] = useState(0);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const items = data?.achievers || [];

  // Thumbnail of the chosen file; the object URL is released when the selection changes.
  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    if (name.trim().length < 2) return setStatus({ type: 'error', text: "Please enter the student's name." });
    if (achievement.trim().length < 5) return setStatus({ type: 'error', text: 'Please describe the achievement.' });
    if (!file) return setStatus({ type: 'error', text: 'Please choose a photograph.' });
    if (!ALLOWED.includes(file.type)) return setStatus({ type: 'error', text: 'Only JPG, PNG or WebP images are allowed.' });
    if (file.size > MAX_MB * 1024 * 1024) return setStatus({ type: 'error', text: `The photograph is larger than ${MAX_MB} MB.` });
    if (!consent) return setStatus({ type: 'error', text: 'Please confirm the permission statement before publishing.' });

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('achievement', achievement.trim());
      fd.append('photo', file);
      await api.post('/achievers', fd);
      setName('');
      setAchievement('');
      setFile(null);
      setFileKey((k) => k + 1);
      setConsent(false);
      notifySuccess('The achiever has been added to the website.', 'Achiever published');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'The upload failed. Please try again.') });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="ach-up">
        <h2 id="ach-up" className="section-title !text-xl">Add an achiever</h2>
        <p className="mt-1 text-sm text-slate-600">
          The photograph, name and achievement appear on the public &quot;Our Achievers&quot; page (JPG, PNG or WebP,
          up to {MAX_MB} MB).
        </p>

        <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ach-name" className="label">Student name</label>
            <input id="ach-name" className="input" maxLength={NAME_MAX} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="ach-photo" className="label">Photograph</label>
            <input
              key={fileKey}
              id="ach-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="ach-text" className="label">Achievement</label>
            <textarea
              id="ach-text"
              rows="5"
              className="input"
              maxLength={TEXT_MAX}
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
            />
            <p className="mt-1 text-right text-xs text-slate-500">{achievement.length} / {TEXT_MAX}</p>
          </div>

          {preview && (
            <div className="sm:col-span-2">
              <p className="label">Preview</p>
              <img src={preview} alt="Selected photograph preview" className="h-32 w-32 rounded border border-forest-200 object-cover" />
            </div>
          )}

          <label className="flex items-start gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I confirm that the student and their parent or guardian have given permission to publish this
              photograph, name and achievement on the school website, and that the achievement is accurate.
            </span>
          </label>

          <div className="sm:col-span-2">
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? 'Publishing…' : 'Publish achiever'}
            </button>
          </div>
        </form>

        <div className="mt-3"><StatusMessage status={status} /></div>
      </section>

      <section aria-labelledby="ach-list">
        <h2 id="ach-list" className="section-title !text-xl">Published achievers ({items.length})</h2>
        {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="mt-3 text-slate-600">No achievers published yet.</p>}

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <AchieverCard key={a._id} item={a} onChanged={reload} setStatus={setStatus} />
          ))}
        </ul>
      </section>
    </div>
  );
}
