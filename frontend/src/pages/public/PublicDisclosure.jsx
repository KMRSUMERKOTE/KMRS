import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import { school } from '../../config/school';
import { disclosureSections } from '../../config/options';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const NOT_PUBLISHED = 'Not yet published on this website.';
const AWAITING = 'Awaiting confirmation by the school.';

function DocRow({ item }) {
  return (
    <li className="flex flex-col gap-2 rounded border border-forest-100 bg-white p-3 transition-colors hover:bg-forest-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm">
        <p className="font-semibold text-forest-900">{item.title}</p>
        <p className="text-xs text-slate-600">
          {item.documentDate && <>Document date: {formatDate(item.documentDate)} · </>}
          {item.academicYear && <>AY {item.academicYear} · </>}
          {(item.fileType || 'PDF').toUpperCase()}
          {item.updatedAt && <> · Updated: {formatDate(item.updatedAt)}</>}
          {item.validUntil && <> · Valid until: {formatDate(item.validUntil)}</>}
        </p>
      </div>
      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline shrink-0" aria-label={`View document: ${item.title}`}>
        View / Download
      </a>
    </li>
  );
}

export default function PublicDisclosure() {
  usePageTitle('Mandatory Public Disclosure');
  const { data, loading, error } = useFetch('/disclosures');
  const items = data?.items || [];

  const general = [
    ['School name', school.fullName],
    ['Affiliation number', school.affiliationNo],
    ['School code', 17471],
    ['Complete postal address', school.address.full],
    ["Principal's name", school.principal.verified ? school.principal.name : null],
    ["Principal's qualification", school.principal.verified ? school.principal.qualifications : null],
    ['Official email', school.email.verified ? school.email.value : null],
    ['Official contact number', school.phone.verified ? school.phone.value : null],
    ['Website address', school.websiteAddress ? school.websiteAddress : null],
  ];

  return (
    <>
      <PageHeader
        title="Mandatory Public Disclosure"
        subtitle="Information and documents disclosed as required for CBSE-affiliated schools"
      />
      <div className="container-page grid gap-6 py-10">
        <p className="rounded border border-ochre-200 border-l-4 border-l-ochre-500 bg-ochre-50 p-4 text-sm text-slate-800" role="note">
          Documents appear here only after they have been verified and uploaded by the school. Requirements are
          set by CBSE; see the{' '}
          <a className="font-semibold underline" href={school.links.disclosureRules} target="_blank" rel="noopener noreferrer">
            official CBSE guidelines
          </a>
          .
        </p>

        <section className="card p-6" aria-labelledby="sec-a">
          <h2 id="sec-a" className="section-title !text-xl sm:!text-2xl">A. General Information</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {general.map(([k, v]) => (
              <div key={k} className="rounded bg-forest-50 p-3">
                <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                <dd className={v ? 'mt-0.5 font-medium text-forest-900' : 'mt-0.5 text-sm italic text-slate-500'}>{v || AWAITING}</dd>
              </div>
            ))}
          </dl>
        </section>

        {loading && <p role="status" className="text-slate-600">Loading documents…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}

        {!loading && !error && disclosureSections.map((sec) => {
          const known = new Set(sec.expected.map((e) => e.key));
          const extras = items.filter((i) => i.section === sec.id && !known.has(i.docType));
          const publishedCount = sec.expected.filter((exp) =>
            items.some((i) => i.section === sec.id && i.docType === exp.key)
          ).length;

          return (
            <details key={sec.id} className="card group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
                <span>
                  <span id={`sec-${sec.id}`} className="section-title !text-xl sm:!text-2xl">
                    {sec.id}. {sec.title}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    {publishedCount} of {sec.expected.length} expected documents published
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-2xl text-ochre-600 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>

              <div className="space-y-5 border-t border-forest-100 p-6 pt-5">
                {sec.expected.map((exp) => {
                  const found = items.filter((i) => i.section === sec.id && i.docType === exp.key);
                  return (
                    <div key={exp.key}>
                      <h3 className="font-serif text-base font-semibold text-forest-900">{exp.label}</h3>
                      {found.length ? (
                        <ul className="mt-2 space-y-2">{found.map((i) => <DocRow key={i._id} item={i} />)}</ul>
                      ) : (
                        <p className="mt-1 text-sm italic text-slate-500">{NOT_PUBLISHED}</p>
                      )}
                    </div>
                  );
                })}
                {extras.length > 0 && (
                  <div>
                    <h3 className="font-serif text-base font-semibold text-forest-900">Other documents</h3>
                    <ul className="mt-2 space-y-2">{extras.map((i) => <DocRow key={i._id} item={i} />)}</ul>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
