import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import SafeImage from '../../components/common/SafeImage';
import { Reveal } from '../../components/common/Motion';

export default function Achievers() {
  usePageTitle('Our Achievers');
  const { data, loading, error } = useFetch('/achievers');
  const achievers = data?.achievers || [];

  return (
    <>
      <PageHeader title="Our Achievers" subtitle="Students who have made the school proud" />
      <div className="container-page py-10">
        {loading && <p role="status" className="text-slate-600">Loading achievers…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}

        {!loading && !error && achievers.length === 0 && (
          <PendingInfo>
            The achievements of our students will be shown here once the school publishes them.
          </PendingInfo>
        )}

        {achievers.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievers.map((a, i) => (
              <Reveal as="li" key={a._id} delay={(i % 3) * 80}>
                <article className="card-lift paper flex h-full flex-col overflow-hidden">
                  <SafeImage src={a.url} alt={`Photograph of ${a.name}, student of Kalinga Model Residential School`} />
                  <div className="flex flex-1 flex-col border-t-4 border-t-ochre-500 p-5">
                    <h2 className="font-serif text-xl font-semibold text-forest-900">{a.name}</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{a.achievement}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
