import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import { galleryCategories } from '../../config/options';
import SafeImage from '../../components/common/SafeImage';
import StatusMessage from '../../components/common/StatusMessage';

const MAX_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PREVIEWS = 12;

function PhotoCard({ photo, onChanged, setStatus }) {
  const [caption, setCaption] = useState(photo.caption || '');
  const [alt, setAlt] = useState(photo.alt || '');
  const [category, setCategory] = useState(photo.category || galleryCategories[0]);
  const [busy, setBusy] = useState(false);

  const changed = caption !== (photo.caption || '') || alt !== (photo.alt || '') || category !== photo.category;

  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/gallery/${photo._id}`, { caption: caption.trim(), alt: alt.trim(), category });
      setStatus({ type: '', text: '' });
      notifySuccess('The photograph details have been saved.', 'Photo updated');
      onChanged();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirmNote({
      title: 'Delete this photograph?',
      message: 'It will be removed from the website.',
      confirmLabel: 'Yes, delete it',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await api.delete(`/gallery/${photo._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess('The photograph has been removed from the gallery.', 'Photo deleted');
      onChanged();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
      setBusy(false);
    }
  };

  return (
    <li className="card overflow-hidden">
      <div className="relative">
        <SafeImage src={photo.url} alt={alt || caption} />
        <span className="absolute left-2 top-2 rounded-full bg-forest-900/85 px-3 py-0.5 text-xs font-medium text-white">
          {category}
        </span>
        {!photo.alt && (
          <span className="absolute right-2 top-2 rounded-full bg-ochre-500 px-3 py-0.5 text-xs font-bold text-forest-950">
            Alt text missing
          </span>
        )}
      </div>
      <div className="space-y-2 p-3">
        <div>
          <label htmlFor={`cap-${photo._id}`} className="label">Caption</label>
          <input id={`cap-${photo._id}`} className="input" maxLength={120} value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`alt-${photo._id}`} className="label">Alt text (describe the photo)</label>
          <input id={`alt-${photo._id}`} className="input" maxLength={200} value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`cat-${photo._id}`} className="label">Category</label>
          <select id={`cat-${photo._id}`} className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {galleryCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-primary" onClick={save} disabled={!changed || busy}>Save</button>
          <button type="button" className="btn-danger" onClick={remove} disabled={busy}>Delete</button>
        </div>
      </div>
    </li>
  );
}

export default function AdminGallery() {
  const { data, loading, error, reload } = useFetch('/gallery');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [fileKey, setFileKey] = useState(0);
  const [category, setCategory] = useState(galleryCategories[0]);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [problems, setProblems] = useState([]);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [onlyMissingAlt, setOnlyMissingAlt] = useState(false);

  const photos = data?.photos || [];
  const missingAlt = photos.filter((p) => !p.alt).length;
  const shown = onlyMissingAlt ? photos.filter((p) => !p.alt) : photos;

  // Thumbnails of the files chosen for upload; the object URLs are released when the selection changes.
  useEffect(() => {
    const made = files.slice(0, MAX_PREVIEWS).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPreviews(made);
    return () => made.forEach((m) => URL.revokeObjectURL(m.url));
  }, [files]);

  const upload = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    setProblems([]);
    if (files.length === 0) return setStatus({ type: 'error', text: 'Choose at least one photograph.' });
    if (!consent) return setStatus({ type: 'error', text: 'Please confirm the photograph statement before uploading.' });

    setUploading(true);
    setProgress({ done: 0, total: files.length });
    const failed = [];
    let ok = 0;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!ALLOWED.includes(f.type)) {
        failed.push(`${f.name}: only JPG, PNG or WebP images are allowed.`);
      } else if (f.size > MAX_MB * 1024 * 1024) {
        failed.push(`${f.name}: larger than ${MAX_MB} MB.`);
      } else {
        try {
          const fd = new FormData();
          fd.append('category', category);
          fd.append('photo', f);
          await api.post('/gallery', fd);
          ok += 1;
        } catch (err) {
          failed.push(`${f.name}: ${errorMessage(err, 'upload failed')}`);
        }
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setUploading(false);
    setProblems(failed);
    setFiles([]);
    setFileKey((k) => k + 1);
    if (ok > 0) {
      notifySuccess(
        `${ok} photograph${ok === 1 ? '' : 's'} uploaded. Add a caption and alt text for each below.`,
        'Upload complete'
      );
    } else {
      setStatus({ type: 'error', text: 'No photographs were uploaded.' });
    }
    reload();
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="gal-up">
        <h2 id="gal-up" className="section-title !text-xl">Upload photographs</h2>
        <p className="mt-1 text-sm text-slate-600">
          You can select many files at once (JPG, PNG or WebP, up to {MAX_MB} MB each). All files in one upload share
          the category you choose; you can change each photo&apos;s category afterwards.
        </p>

        <form onSubmit={upload} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="g-cat" className="label">Category</label>
            <select id="g-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {galleryCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="g-files" className="label">Photographs</label>
            <input
              key={fileKey}
              id="g-files"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-forest-900"
            />
            {files.length > 0 && <p className="mt-1 text-xs text-slate-600">{files.length} file{files.length === 1 ? '' : 's'} selected</p>}
          </div>

          {previews.length > 0 && (
            <ul className="flex flex-wrap gap-2 sm:col-span-2" aria-label="Selected photographs">
              {previews.map((p) => (
                <li key={p.url} className="h-16 w-16 overflow-hidden rounded border border-forest-200">
                  <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                </li>
              ))}
              {files.length > MAX_PREVIEWS && (
                <li className="flex h-16 items-center px-2 text-sm text-slate-600">+{files.length - MAX_PREVIEWS} more</li>
              )}
            </ul>
          )}

          <label className="flex items-start gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I confirm these are genuine photographs of Kalinga Model Residential School, Umarkot, and that the school
              has permission to publish any identifiable students shown.
            </span>
          </label>

          <div className="sm:col-span-2">
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? `Uploading ${progress.done} of ${progress.total}…` : 'Upload Photographs'}
            </button>
            {uploading && (
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-forest-100"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-ochre-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        </form>

        <div className="mt-3"><StatusMessage status={status} /></div>
        {problems.length > 0 && (
          <div role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Some files were not uploaded:</p>
            <ul className="list-disc pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        )}
      </section>

      <section aria-labelledby="gal-list">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="gal-list" className="section-title !text-xl">Gallery ({photos.length} photographs)</h2>
          {missingAlt > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyMissingAlt} onChange={(e) => setOnlyMissingAlt(e.target.checked)} />
              Show only photos without alt text ({missingAlt})
            </label>
          )}
        </div>
        {missingAlt > 0 && (
          <p className="mt-2 text-sm text-ochre-700">{missingAlt} photograph{missingAlt === 1 ? ' has' : 's have'} no alt text yet. Alt text helps visitors who use screen readers.</p>
        )}
        {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {!loading && !error && photos.length === 0 && <p className="mt-3 text-slate-600">No photographs yet.</p>}

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <PhotoCard key={p._id} photo={p} onChanged={reload} setStatus={setStatus} />
          ))}
        </ul>
      </section>
    </div>
  );
}
