import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../../components/common/PageHeader';
import { school } from '../../config/school';
import {
  admissionCycle2026,
  admissionProcess,
  admissionDocuments,
  admissionFaqs,
} from '../../config/content';

export default function Admissions() {
  usePageTitle('Admissions');

  return (
    <>
      <PageHeader title="Admissions" subtitle="KMRS Class VI admission through the KMRS Selection Test (KMRSST)" />
      <div className="container-page grid gap-6 py-10">
        {/* Primary official notice */}
        <section
          className="flex flex-col gap-4 rounded border border-ochre-200 border-l-4 border-l-ochre-500 bg-ochre-50 p-6 md:flex-row md:items-center md:justify-between"
          role="note"
        >
          <div className="max-w-2xl">
            <h2 className="font-serif text-xl font-semibold text-forest-900">Please rely on official notifications</h2>
            <p className="mt-2 text-slate-800">
              Admissions, eligibility and deadlines are governed by the current official notifications of the
              Government of Odisha. This website does not announce admission dates.
            </p>
          </div>
          <a
            href={school.links.admissions}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary shrink-0"
          >
            Official Admission Notifications
          </a>
        </section>

        <section className="card p-6">
          <h2 className="section-title !text-xl sm:!text-2xl">Overview</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
            Admission to Class VI in Kalinga Model Residential Schools is conducted through the KMRS Selection
            Test, generally called KMRSST. Eligibility has involved ST, SC and PVTG students, subject to the
            official guidelines of the applicable year.
          </p>
          <p className="mt-3 font-medium text-forest-900">
            Current status: check the official page above for any new announcement.
          </p>
        </section>

        <section className="card p-6" aria-labelledby="process-heading">
          <h2 id="process-heading" className="section-title !text-xl sm:!text-2xl">Admission Process</h2>
          <p className="mt-1 text-sm text-slate-600">
            A general explanatory sequence, not a guaranteed timetable for any year.
          </p>
          <ol className="relative mt-6 ml-4 border-l-2 border-forest-200">
            {admissionProcess.map((s, i) => (
              <li key={s.title} className="relative pb-7 pl-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-forest-800 text-sm font-bold text-white ring-4 ring-white"
                >
                  {i + 1}
                </span>
                <h3 className="font-serif text-lg font-semibold text-forest-900">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-700">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="section-title !text-xl sm:!text-2xl">Documents Usually Required</h2>
            <p className="mt-1 text-sm text-slate-600">
              Check the final list in the applicable year&apos;s official guidelines.
            </p>
            <ul className="mt-4 grid gap-2">
              {admissionDocuments.map((d) => (
                <li key={d} className="flex items-start gap-3 rounded bg-forest-50 px-3 py-2 text-sm">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-forest-700">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card border-dashed bg-slate-50 p-6">
            <h2 className="section-title !text-xl sm:!text-2xl">Previous Cycle: {admissionCycle2026.label}</h2>
            <p className="mt-2 rounded bg-slate-100 p-3 text-sm text-slate-700">
              Historical information only. Do not assume these conditions apply to a later year. Verify against
              the revised official notice.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-800">
              {admissionCycle2026.facts.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="section-title !text-xl sm:!text-2xl">Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-forest-100">
            {admissionFaqs.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-forest-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="text-xl text-ochre-600 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 max-w-3xl text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="section-title !text-xl sm:!text-2xl">Official Contact</h2>
          <p className="mt-3 text-slate-700">{school.address.full}</p>
          {school.phone.verified && <p>Phone: {school.phone.value}</p>}
          {school.email.verified && <p>Email: {school.email.value}</p>}
          <p className="mt-2 text-sm text-slate-600">
            Brochures and notices will be listed under Notices &amp; Downloads once verified official files are
            added.
          </p>
        </section>
      </div>
    </>
  );
}
