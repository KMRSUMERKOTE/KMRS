import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import { residentialTopics } from '../../config/content';

export default function ResidentialLife() {
  usePageTitle('Residential Life');

  return (
    <>
      <PageHeader title="Residential Life" subtitle="Living and learning on one campus" />
      <div className="container-page py-10">
        <section className="mb-8 overflow-hidden rounded bg-forest-900 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-semibold !text-white sm:text-3xl">Why residential schooling?</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-forest-100">
                In a residential school, students study, live and take part in activities in the same community.
                This can give children from distant areas steady access to schooling. The sections below will be
                filled in with school-approved information.
              </p>
            </div>
            <ul className="grid grid-cols-3 gap-3 text-center text-sm lg:grid-cols-1 lg:text-left">
              {['Study', 'Live', 'Take part'].map((w) => (
                <li key={w} className="border-l-4 border-ochre-500 bg-white/10 px-3 py-2 font-medium">{w}</li>
              ))}
            </ul>
          </div>
          <div className="motif-strip" aria-hidden="true" />
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {residentialTopics.map((t, i) => (
            <section
              key={t.id}
              className={`card p-5 transition-shadow hover:shadow-md ${
                t.content ? 'border-l-4 border-l-forest-700' : 'border-dashed'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-100 font-serif font-bold text-forest-800"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-xl font-semibold text-forest-900">{t.title}</h2>
                  <div className="mt-3">
                    {t.content ? <p className="leading-relaxed text-slate-700">{t.content}</p> : <PendingInfo />}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
