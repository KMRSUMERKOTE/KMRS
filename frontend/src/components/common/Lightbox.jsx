import { useEffect, useRef } from 'react';
import SafeImage from './SafeImage';

const SWIPE_PX = 50;

export default function Lightbox({ photos, index, onClose, onChange }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const photo = photos[index];
  const hasMany = photos.length > 1;

  const prev = () => onChange((index - 1 + photos.length) % photos.length);
  const next = () => onChange((index + 1) % photos.length);

  useEffect(() => {
    closeRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && hasMany) {
      prev();
    } else if (e.key === 'ArrowRight' && hasMany) {
      next();
    } else if (e.key === 'Tab') {
      // Keep keyboard focus inside the dialog.
      const items = dialogRef.current.querySelectorAll('button:not([disabled])');
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Clicking the dark area (not the photo or buttons) closes the viewer.
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null || !hasMany) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (dx > SWIPE_PX) prev();
    else if (dx < -SWIPE_PX) next();
  };

  if (!photo) return null;

  const navBtn =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-2xl text-forest-900 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ochre-400';

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photograph viewer"
      onKeyDown={onKeyDown}
      onClick={onBackdrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between text-sm text-white" onClick={onBackdrop}>
        <span aria-hidden="true" className="rounded-full bg-white/10 px-3 py-1">
          {index + 1} / {photos.length}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="btn bg-white text-forest-900 hover:bg-ivory">
          Close
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center gap-3" onClick={onBackdrop}>
        {hasMany && (
          <button type="button" onClick={prev} aria-label="Previous photograph" className={navBtn}>
            <span aria-hidden="true">‹</span>
          </button>
        )}
        <figure className="flex max-h-full max-w-4xl flex-col items-center">
          <SafeImage
            key={photo._id || photo.url}
            src={photo.url}
            alt={photo.alt || photo.caption}
            ratio="max-h-[70vh]"
            className="max-h-[70vh] w-auto rounded object-contain shadow-2xl"
          />
          <figcaption className="mt-3 text-center text-sm text-white" aria-live="polite">
            {photo.caption && <span className="block font-medium">{photo.caption}</span>}
            <span className="text-forest-200">
              {index + 1} of {photos.length}
            </span>
          </figcaption>
        </figure>
        {hasMany && (
          <button type="button" onClick={next} aria-label="Next photograph" className={navBtn}>
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>
    </div>
  );
}
