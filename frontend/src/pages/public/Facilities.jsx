import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import SafeImage from '../../components/common/SafeImage';
import { Reveal } from '../../components/common/Motion';
import { facilities } from '../../config/content';

export default function Facilities() {
  usePageTitle('Facilities');
  const confirmed = facilities.filter((f) => f.status === 'confirmed');

  return (
    <>
      <PageHeader title="Facilities" subtitle="Campus facilities confirmed by the school" />
      <div className="container-page py-10">
        {confirmed.length === 0 ? (
          <PendingInfo>
            Facility information will be published after confirmation by the school. No facility is listed until
            it has been verified.
          </PendingInfo>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {confirmed.map((f, i) => {
              const photo = f.photos?.[0];
              return (
                <Reveal as="li" key={f.id} delay={(i % 3) * 90}>
                  <div className="card-lift paper group h-full overflow-hidden">
                    {photo ? (
                      <div className="overflow-hidden">
                        <div className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none">
                          <SafeImage src={photo.src} alt={photo.alt} />
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
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
