import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import { Reveal } from '../../components/common/Motion';
import { school, proposedContent } from '../../config/school';

function Block({ id, title, children }) {
  return (
    <Reveal as="section" id={id} className="card paper scroll-mt-24 border-l-4 border-l-forest-700 p-6">
      <h2 className="section-title !text-xl sm:!text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-slate-700">{children}</div>
    </Reveal>
  );
}

// Polaroid-style photo: white print, a little tilt, a strip of yellow tape and a handwritten-feel caption.
// Photo path: set school.principal.photo in config/school, or drop the file at public/images/principal.jpg.
// If the image can't load, a neutral placeholder is shown instead of a broken icon.
const PRINCIPAL_PHOTO_FALLBACK = '/images/principal-image.jpeg';

function PrincipalPhoto({ name }) {
  const [failed, setFailed] = useState(false);
  const src = school.principal?.photo || PRINCIPAL_PHOTO_FALLBACK;
  const caption = name?.trim() || 'Principal';

  return (
    <figure className="relative mx-auto w-56 shrink-0 rotate-[-2deg] transition-transform duration-300 ease-out hover:rotate-0 motion-reduce:transition-none md:mx-0 md:w-60">
      {/* Tape */}
      <div
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-[3deg] border border-ochre-500/30 bg-[#f4e09a]/90 shadow-sm"
      />
      <div className="border border-forest-100 bg-white p-3 pb-4 shadow-md">
        {failed ? (
          <div
            role="img"
            aria-label={`Photo of ${caption} (not available)`}
            className="flex aspect-[4/5] w-full items-center justify-center bg-forest-50 font-serif text-5xl font-semibold text-forest-700"
          >
            {caption.charAt(0).toUpperCase()}
          </div>
        ) : (
          <img
            src={src}
            alt={`Portrait of ${caption}, Principal of ${school.shortName || school.name}`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="aspect-[4/5] w-full bg-forest-50 object-cover object-top"
          />
        )}
        <figcaption className="mt-3 text-center">
          <p className="font-serif text-base font-semibold text-forest-900">{caption}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Principal</p>
          <div className="mx-auto mt-2 h-0.5 w-8 bg-ochre-500" aria-hidden="true" />
        </figcaption>
      </div>
    </figure>
  );
}

// Magazine cover: same taped-print treatment as the principal's photo, tilted the other way.
// Photo path: drop the file at public/images/meghasini-magazine.jpeg.
const MAGAZINE_COVER = '/images/meghasini-magazine.jpeg';

function MagazineCover() {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="relative mx-auto w-56 shrink-0 rotate-[2deg] transition-transform duration-300 ease-out hover:rotate-0 motion-reduce:transition-none md:mx-0 md:w-60">
      {/* Tape */}
      <div
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-[-3deg] border border-ochre-500/30 bg-[#f4e09a]/90 shadow-sm"
      />
      <div className="border border-forest-100 bg-white p-3 pb-4 shadow-md">
        {failed ? (
          <div
            role="img"
            aria-label="Cover of Meghasini (not available)"
            className="flex aspect-[4/5] w-full flex-col items-center justify-center bg-forest-50 text-center font-serif font-semibold text-forest-700"
          >
            <span className="text-3xl">Meghasini</span>
            <span className="mt-1 text-xs uppercase tracking-wide text-slate-500">Annual Magazine</span>
          </div>
        ) : (
          <img
            src={MAGAZINE_COVER}
            alt="Cover of Meghasini, the first edition of the annual magazine of Kalinga Model Residential School, Umerkote, Nabarangpur"
            loading="lazy"
            onError={() => setFailed(true)}
            className="aspect-[4/5] w-full bg-forest-50 object-cover object-top"
          />
        )}
        <figcaption className="mt-3 text-center">
          <p className="font-serif text-base font-semibold text-forest-900">Meghasini</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">First edition</p>
          <div className="mx-auto mt-2 h-0.5 w-8 bg-ochre-500" aria-hidden="true" />
        </figcaption>
      </div>
    </figure>
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
  ['magazine', 'Annual magazine'],
  ['location', 'Location'],
];

// Highlights the side-nav entry for the section currently near the top of the viewport.
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-15% 0px -70% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const ids = sections.map(([id]) => id);
const noteTilts = ['-2deg', '1.5deg', '1deg', '-1.5deg'];

export default function About() {
  usePageTitle('About Us');
  const active = useActiveSection(ids);

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

  const hasMessage = school.principal.verified && school.principal.message?.trim();

  return (
    <>
      <PageHeader title="About Us" subtitle="Kalinga Model Residential School, Umarkot (Umarkot), Nabarangpur" />

      {/* Key facts */}
      <div className="paper border-b border-forest-100">
        <div className="container-page py-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-forest-100 bg-forest-100 lg:grid-cols-4">
            {keyFacts.map(([k, v]) => (
              <div key={k} className="paper p-4">
                <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                <dd className="mt-1 font-serif text-lg font-semibold text-forest-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
        {/* In-page navigation: follows the reader */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-32 space-y-1 border-l-2 border-dashed border-forest-200">
            {sections.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'location' : undefined}
                  className={`-ml-0.5 block border-l-4 py-1.5 pl-4 text-sm transition-all hover:border-ochre-500 hover:text-forest-900 focus-visible:border-ochre-500 focus-visible:text-forest-900 ${
                    active === id
                      ? 'border-ochre-500 bg-ochre-50 font-semibold text-forest-900'
                      : 'border-transparent text-slate-600'
                  }`}
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
              Kalinga Model Residential School, Umarkot, is a government-managed residential
              educational institution in Nabarangpur district, Odisha. The school forms part of Odisha&apos;s Kalinga
              Model Residential School initiative, which aims to expand access to quality education for eligible
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
              <div className="rounded-lg bg-forest-50 p-4">
                <h3 className="font-serif text-lg font-semibold text-forest-900">Vision</h3>
                <p className="mt-1">{proposedContent.vision}</p>
              </div>
              <div className="rounded-lg bg-forest-50 p-4">
                <h3 className="font-serif text-lg font-semibold text-forest-900">Mission</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {proposedContent.mission.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </div>
            </div>
          </Block>

          <Block id="values" title="Educational Values">
            <ul className="grid gap-6 pt-2 sm:grid-cols-2">
              {values.map(([v, d], i) => (
                <li key={v} className="sticky-note !text-lg" style={{ '--r': noteTilts[i % noteTilts.length] }}>
                  <p className="text-xl font-bold">{v}</p>
                  <p className="mt-1">{d}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="principal" title="Principal's Message">
            <div className="grid items-start gap-8 pt-2 md:grid-cols-[15rem_1fr]">
              <PrincipalPhoto name={school.principal.name} />
              <div className="relative">
                {hasMessage ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute -left-1 -top-6 select-none font-serif text-6xl leading-none text-ochre-500"
                    >
                      &ldquo;
                    </span>
                    <p className="relative whitespace-pre-line leading-relaxed text-forest-800">
                      {school.principal.message}
                    </p>
                    {school.principal.name?.trim() && (
                      <p className="mt-4 font-semibold text-forest-900">
                        Principal / Head of Institution: {school.principal.name}
                      </p>
                    )}
                  </>
                ) : (
                  <PendingInfo>
                    The Principal&apos;s message will be published once an approved message is provided by the
                    school.
                  </PendingInfo>
                )}
              </div>
            </div>
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
                <div key={k} className="border-b border-dashed border-forest-200 pb-2">
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

          <Block id="magazine" title="Our Annual Magazine: Meghasini">
            <div className="grid items-start gap-8 pt-2 md:grid-cols-[1fr_15rem]">
              <div className="space-y-3 md:order-1">
                <p>
                  <span className="inline-block rounded-full border border-ochre-500/40 bg-ochre-50 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-forest-900">
                    First edition
                  </span>
                </p>
                <p>
                  <span className="font-serif text-xl font-semibold text-forest-900">
                    <span lang="or">ମେଘାସିନୀ</span> &middot; Meghasini
                  </span>
                </p>
                <p>
                  <em>Meghasini</em> is the annual magazine of Kalinga Model Residential School, Umerkote,
                  Nabarangpur. Its first edition marks the beginning of a yearly tradition: a place where the
                  school&apos;s year is gathered, remembered and shared with students, parents, teachers and the
                  wider community.
                </p>
                <p>
                  A school magazine is more than a printed keepsake. It gives students a voice and a space to
                  express themselves, and it records the everyday life of the campus for the years ahead. We hope
                  each new edition of Meghasini will grow along with the school.
                </p>
              </div>
              <div className="md:order-2">
                <MagazineCover />
              </div>
            </div>
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
