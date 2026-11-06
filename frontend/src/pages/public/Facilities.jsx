import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import SafeImage from '../../components/common/SafeImage';
import { Reveal } from '../../components/common/Motion';
import { facilities as staticFacilities } from '../../config/content';

// Backup used only when the server cannot be reached (for example while it is waking up).
// An empty list from the server is NOT replaced by this, so deleting facilities in the admin area works.
const fallback = staticFacilities
  .filter((f) => f.status === 'confirmed')
  .map((f) => ({
    _id: f.id,
    title: f.title,
    description: f.description,
    url: f.photos?.[0]?.src,
    photoAlt: f.photos?.[0]?.alt,
  }));

export default function Facilities() {
  usePageTitle('Facilities');
  const { data, loading, error } = useFetch('/facilities');

  const confirmed = error ? fallback : data?.facilities || [];

  return (
    <>
      <PageHeader title="Facilities" subtitle="Campus facilities confirmed by the school" />
      <div className="container-page py-10">
        {loading && <p role="status" className="text-slate-600">Loading facilities…</p>}

        {!loading && confirmed.length === 0 && (
          <PendingInfo>
            Facility information will be published after confirmation by the school. No facility is listed until
            it has been verified.
          </PendingInfo>
        )}

        {!loading && confirmed.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {confirmed.map((f, i) => (
              <Reveal as="li" key={f._id} delay={(i % 3) * 90}>
                <div className="card-lift paper group h-full overflow-hidden">
                  {f.url ? (
                    <div className="overflow-hidden">
                      <div className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none">
                        <SafeImage src={f.url} alt={f.photoAlt || `${f.title} at Kalinga Model Residential School`} />
                      </div>
                    </div>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-forest-800 to-forest-600 font-serif text-5xl font-bold text-white/80"
                      style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(255,255,255,.1) 31px, rgba(255,255,255,.1) 32px)' }}
                    >
                      {f.title.charAt(0)}
                    </div>
                  )}
                  <div className="border-t-4 border-t-ochre-500 p-5">
                    <h2 className="font-serif text-xl font-semibold text-forest-900">{f.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
