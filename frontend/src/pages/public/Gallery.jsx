import { useMemo, useRef, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import SafeImage from '../../components/common/SafeImage';
import Lightbox from '../../components/common/Lightbox';
import { Reveal } from '../../components/common/Motion';
import { galleryCategories } from '../../config/options';

const tilt = ['-1.5deg', '1deg', '-0.5deg', '1.5deg', '-1deg', '0.5deg'];

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
            of KMRS Umarkot are published.
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
                  className={`flex items-center gap-2 rounded-md border-2 px-4 py-1.5 text-sm font-medium transition ${
                    category === c
                      ? 'border-forest-800 bg-forest-800 text-white shadow-[0_3px_0_#1a1640]'
                      : 'border-forest-200 bg-white text-forest-900 hover:bg-ochre-50'
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

            <p className="mb-4 text-sm text-slate-600" role="status">
              Showing {filtered.length} {filtered.length === 1 ? 'photograph' : 'photographs'}
            </p>

            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p, i) => (
                <Reveal as="li" key={p._id} delay={(i % 4) * 70}>
                  <button
                    type="button"
                    onClick={(e) => {
                      openerRef.current = e.currentTarget;
                      setActive(i);
                    }}
                    style={{ '--r': tilt[i % tilt.length] }}
                    className="paper group block w-full rotate-[var(--r)] border border-forest-100 p-2 pb-3 text-left shadow-card transition duration-300 hover:z-10 hover:rotate-0 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 motion-reduce:rotate-0 motion-reduce:transition-none"
                    aria-label={`Open photograph: ${p.caption || p.alt || 'School photograph'}`}
                  >
                    <div className="overflow-hidden">
                      <SafeImage
                        src={p.url}
                        alt={p.alt || p.caption}
                        className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      />
                    </div>
                    {p.caption && (
                      <span className="mt-2 block text-center font-hand text-lg leading-tight text-forest-900">
                        {p.caption}
                      </span>
                    )}
                  </button>
                </Reveal>
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
