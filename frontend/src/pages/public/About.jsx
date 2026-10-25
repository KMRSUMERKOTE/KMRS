import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import { school, proposedContent } from '../../config/school';

function Block({ id, title, children }) {
  return (
    <section id={id} className="card scroll-mt-24 border-l-4 border-l-forest-700 p-6">
      <h2 className="section-title !text-xl sm:!text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

const sections = [
  ['intro', 'Introduction'],
  ['background', 'Background'],
  ['programme', 'Kalinga Model programme'],
  ['purpose', 'Educational purpose'],
  ['vision', 'Vision and mission'],
  ['values', 'Educational values'],
  ['principal', "Principal's message"],
  ['governance', 'Governance'],
  ['info', 'Institutional information'],
  ['location', 'Location'],
];

export default function About() {
  usePageTitle('About Us');

  const keyFacts = [
    ['Founded', String(school.established)],
    ['Board', school.board],
    ['CBSE affiliation no.', school.affiliationNo],
    ['Affiliation level', school.affiliationLevel],
  ];

  const info = [
    ['Full name', school.fullName],
    ['Short name', school.shortName],
    ['Category', school.category],
    ['Board', school.board],
    ['CBSE affiliation no.', school.affiliationNo],
    ['Affiliation level', school.affiliationLevel],
    ['Affiliation period', school.affiliationPeriod],
    ['Year of foundation', String(school.established)],
    ['Date first opened', school.firstOpened],
    ['Managing department', school.department],
    ['Address', school.address.full],
  ];

  const values = [
    ['Accessible education', 'Quality schooling within reach of eligible students.'],
    ['Learning and curiosity', 'A structured, CBSE-affiliated education that encourages asking questions.'],
    ['Inclusion and respect', 'A campus where every student is treated with dignity.'],
    ['Responsible citizenship', 'Preparing students to take part in their communities.'],
  ];

  return (
    <>
      <PageHeader title="About Us" subtitle="Kalinga Model Residential School, Umerkote, Nabarangpur" />

      {/* Key facts */}
      <div className="border-b border-forest-100 bg-white">
        <div className="container-page py-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded border border-forest-100 bg-forest-100 lg:grid-cols-4">
            {keyFacts.map(([k, v]) => (
              <div key={k} className="bg-white p-4">
                <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                <dd className="mt-1 font-serif text-lg font-semibold text-forest-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
        {/* In-page navigation */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 border-l-2 border-forest-100">
            {sections.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="-ml-0.5 block border-l-2 border-transparent py-1.5 pl-4 text-sm text-slate-600 hover:border-ochre-500 hover:text-forest-900 focus-visible:border-ochre-500 focus-visible:text-forest-900"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-6">
          <Block id="intro" title="Introduction">
            <p>
              Kalinga Model Residential School, Umerkote, is a government-managed residential educational
              institution in Nabarangpur district, Odisha. The school forms part of Odisha&apos;s Kalinga Model
              Residential School initiative, which aims to expand access to quality education for eligible
              students from tribal and other specified communities. The school&apos;s CBSE affiliation and
              residential-school model support its educational role within the state.
            </p>
          </Block>

          <Block id="background" title="Background and Establishment">
            <p>
              According to the CBSE affiliation record, the school was founded in {school.established} and first
              opened on {school.firstOpened}. A detailed history of the campus will be added when the school
              provides approved information.
            </p>
          </Block>

          <Block id="programme" title="Role in Odisha's Kalinga Model Residential School Programme">
            <p>
              The ST &amp; SC Development Department, Government of Odisha, established the Kalinga Model
              Residential School initiative to widen access to quality education, particularly for Scheduled Tribe
              (ST), Scheduled Caste (SC) and Particularly Vulnerable Tribal Group (PVTG) students.
            </p>
            <p>
              The programme describes a model educational environment using modern teaching aids, activity-based
              learning, CBSE affiliation and English-medium instruction. These are programme-level objectives;
              school-specific arrangements are described only where the school has confirmed them.
            </p>
          </Block>

          <Block id="purpose" title="Educational Purpose">
            <p>
              The school exists to give eligible students access to a structured, CBSE-affiliated education in a
              residential setting.
            </p>
          </Block>

          <Block id="vision" title="Vision and Mission">
            {!proposedContent.approved && (
              <p><span className="badge-pending">Proposed — pending approval by school administration</span></p>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded bg-forest-50 p-4">
                <h3 className="font-serif text-lg font-semibold text-forest-900">Vision</h3>
                <p className="mt-1">{proposedContent.vision}</p>
              </div>
              <div className="rounded bg-forest-50 p-4">
                <h3 className="font-serif text-lg font-semibold text-forest-900">Mission</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {proposedContent.mission.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </div>
            </div>
          </Block>

          <Block id="values" title="Educational Values">
            <ul className="grid gap-3 sm:grid-cols-2">
              {values.map(([v, d]) => (
                <li key={v} className="border-l-4 border-ochre-500 bg-forest-50 px-4 py-3">
                  <p className="font-semibold text-forest-900">{v}</p>
                  <p className="mt-0.5 text-sm text-slate-700">{d}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="principal" title="Principal's Message">
            {school.principal.verified && school.principal.message?.trim() ? (
              <>
                <p className="leading-relaxed text-forest-800">{school.principal.message}</p>
                {school.principal.name?.trim() && (
                  <p className="mt-4 font-semibold text-forest-900">
                    Principal / Head of Institution: {school.principal.name}
                  </p>
                )}
              </>
            ) : (
              <PendingInfo>
                The Principal&apos;s message will be published once an approved message is provided by the school.
              </PendingInfo>
            )}
          </Block>

          <Block id="governance" title="Governance and Managing Department">
            <p>
              The school is managed by the {school.department}. Details of the school management committee and
              other governance bodies will be listed on the{' '}
              <Link className="font-semibold underline" to="/public-disclosure">Mandatory Public Disclosure</Link>{' '}
              page once verified.
            </p>
          </Block>

          <Block id="info" title="Institutional Information">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {info.map(([k, v]) => (
                <div key={k} className="border-b border-forest-100 pb-2">
                  <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                  <dd className="font-medium text-forest-900">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm">
              Source:{' '}
              <a className="underline" href={school.links.cbseRecord} target="_blank" rel="noopener noreferrer">
                CBSE affiliation record
              </a>
            </p>
          </Block>

          <Block id="location" title="Location and Contact">
            <address className="not-italic">{school.address.full}</address>
            <p>
              <a className="btn-outline" href={school.mapUrl} target="_blank" rel="noopener noreferrer">
                Find us on Google Maps
              </a>
            </p>
          </Block>
        </div>
      </div>
    </>
  );
}
