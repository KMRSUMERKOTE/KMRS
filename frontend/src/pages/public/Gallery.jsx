import { useMemo, useRef, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import SafeImage from '../../components/common/SafeImage';
import Lightbox from '../../components/common/Lightbox';
import { galleryCategories } from '../../config/options';

export default function Gallery() {
  usePageTitle('Photo Gallery');
  const { data, loading, error } = useFetch('/gallery');
  const [category, setCategory] = useState('All');
  const [active, setActive] = useState(null); // index within the filtered list
  const openerRef = useRef(null);

  const photos = data?.photos || [];

  const categories = useMemo(
    () => ['All', ...galleryCategories.filter((c) => photos.some((p) => p.category === c))],
    [photos]
  );

  const filtered = category === 'All' ? photos : photos.filter((p) => p.category === category);

  const countFor = (c) => (c === 'All' ? photos.length : photos.filter((p) => p.category === c).length);

  const closeLightbox = () => {
    setActive(null);
    // Return focus to the thumbnail that opened the viewer.
    setTimeout(() => openerRef.current?.focus(), 0);
  };

  return (
    <>
      <PageHeader title="Photo Gallery" subtitle="Photographs approved by the school" />
      <div className="container-page py-10">
        {loading && <p role="status" className="text-slate-600">Loading photographs…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}

        {!loading && !error && photos.length === 0 && (
          <PendingInfo>
            Photographs will appear here once approved images of the school are added. Only genuine photographs
            of KMRS Umerkote are published.
          </PendingInfo>
        )}

        {photos.length > 0 && (
          <>
            <div role="group" aria-label="Filter photographs by category" className="mb-6 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    category === c
                      ? 'border-forest-800 bg-forest-800 text-white'
                      : 'border-forest-200 bg-white text-forest-900 hover:bg-forest-50'
                  }`}
                >
                  {c}
                  <span
                    className={`rounded-full px-2 text-xs ${
                      category === c ? 'bg-white/20 text-white' : 'bg-forest-100 text-forest-800'
                    }`}
                  >
                    {countFor(c)}
                  </span>
                </button>
              ))}
            </div>

            <p className="mb-3 text-sm text-slate-600" role="status">
              Showing {filtered.length} {filtered.length === 1 ? 'photograph' : 'photographs'}
            </p>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p, i) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={(e) => {
                      openerRef.current = e.currentTarget;
                      setActive(i);
                    }}
                    className="group relative block w-full overflow-hidden rounded border border-forest-100 bg-white text-left shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
                    aria-label={`Open photograph: ${p.caption || p.alt || 'School photograph'}`}
                  >
                    <SafeImage
                      src={p.url}
                      alt={p.alt || p.caption}
                      className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                    {p.caption && (
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 to-transparent p-3 pt-8 text-xs text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                        {p.caption}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {active !== null && (
        <Lightbox photos={filtered} index={active} onClose={closeLightbox} onChange={setActive} />
      )}
    </>
  );
}
