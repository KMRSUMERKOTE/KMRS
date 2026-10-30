import { Link } from 'react-router-dom';
import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import PendingInfo from '../../components/common/PendingInfo';
import { Reveal } from '../../components/common/Motion';
import { school } from '../../config/school';

// Display order within each group; anything not listed goes after these.
const TEACHING_ORDER = [
  'PGT Physics',
  'PGT Chemistry',
  'PGT Biology',
  'PGT Comp Science',
  'TGT Arts',
  'Assistant Teacher',
  'Sanskrit Teacher',
  'Odia Teacher',
  'Hindi Teacher',
  'English Teacher',
  'Guest Teacher',
  'Guest Teacher (TGT Science)',
  'Guest Teacher (MCT)',
  'Others',
];
const NON_TEACHING_ORDER = ['Matron', 'CCA', 'Others'];

const sortStaff = (list, order) => {
  const rank = (s) => {
    const i = order.indexOf(s.designation);
    return i === -1 ? order.length : i;
  };
  return [...list].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
};

const experienceText = (n) => {
  if (n === undefined || n === null || n === '') return '';
  const years = Number(n);
  if (!Number.isFinite(years)) return '';
  if (years < 1) return 'Less than a year of experience';
  return `${years} ${years === 1 ? 'year' : 'years'} of experience`;
};

// Photo with a lettered placeholder when there is no photo or it fails to load.
function Portrait({ src, name, className = '', letterClass = 'text-5xl' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${name} (no photo available)`}
        className={`flex items-center justify-center bg-forest-50 font-serif font-semibold text-forest-700 ${letterClass} ${className}`}
      >
        {name.trim().charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`Portrait of ${name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`bg-forest-50 object-cover object-top ${className}`}
    />
  );
}

function PrincipalBanner({ principal }) {
  const exp = experienceText(principal.experience);
  return (
    <Reveal
      as="section"
      aria-labelledby="principal-h"
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-forest-900 via-forest-900 to-forest-800 text-white shadow-lift"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #fff 35px, #fff 36px)' }}
      />
      <div className="relative grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[16rem_1fr]">
        <figure className="relative mx-auto w-56 rotate-[-2deg] transition-transform duration-300 ease-out hover:rotate-0 motion-reduce:transition-none md:mx-0 md:w-64">
          <div
            aria-hidden="true"
            className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-[3deg] border border-ochre-500/30 bg-[#f4e09a]/90 shadow-sm"
          />
          <div className="border border-forest-100 bg-white p-3 shadow-md">
            <Portrait src={principal.photo} name={principal.name} className="aspect-[4/5] w-full" />
          </div>
        </figure>

        <div>
          <p className="inline-block rounded-full border border-ochre-500/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ochre-500">
            Principal · Head of Institution
          </p>
          <h2 id="principal-h" className="mt-3 font-serif text-3xl font-semibold !text-white sm:text-4xl">
            {principal.name}
          </h2>
          <div className="mt-3 h-0.5 w-12 bg-ochre-500" aria-hidden="true" />

          {principal.qualifications.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-200">Qualifications</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {principal.qualifications.map((q) => (
                  <li key={q} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exp && <p className="mt-4 text-forest-100">{exp}</p>}

          <p className="mt-6">
            <Link
              to="/about#principal"
              className="font-semibold text-ochre-500 underline underline-offset-4 hover:text-white focus-visible:text-white"
            >
              Read the Principal&apos;s message →
            </Link>
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function StaffCard({ person, index }) {
  const exp = experienceText(person.experienceYears);
  return (
    <Reveal as="li" delay={(index % 4) * 70}>
      <article className="card paper h-full overflow-hidden text-center transition duration-300 hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <Portrait src={person.photo} name={person.name} className="aspect-[4/5] w-full" />
        <div className="border-t-4 border-t-ochre-500 p-4">
          <h3 className="font-serif text-lg font-semibold leading-snug text-forest-900">{person.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{person.title}</p>
          {person.qualifications.length > 0 && (
            <ul className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="Qualifications">
              {person.qualifications.map((q) => (
                <li key={q} className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-medium text-forest-800">
                  {q}
                </li>
              ))}
            </ul>
          )}
          {exp && <p className="mt-3 text-sm text-slate-600">{exp}</p>}
        </div>
      </article>
    </Reveal>
  );
}

function StaffGroup({ id, title, people }) {
  if (!people.length) return null;
  return (
    <section aria-labelledby={id}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 id={id} className="section-title !text-xl sm:!text-2xl">{title}</h2>
        <span className="rounded-full bg-forest-100 px-3 py-0.5 text-sm font-semibold text-forest-800">
          {people.length}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {people.map((p, i) => (
          <StaffCard key={p._id} person={p} index={i} />
        ))}
      </ul>
    </section>
  );
}

export default function Staff() {
  usePageTitle('Our Staff');
  const { data, loading, error } = useFetch('/staff');
  const staff = data?.staff || [];

  // The Principal's own profile wins; the school config is the fallback.
  const principalDb = staff.find((s) => s.designation === 'Principal');
  const cfg = school.principal;
  const cfgQuals = String(cfg?.qualifications || '')
    .split(',')
    .map((q) => q.trim())
    .filter(Boolean);

  let principal = null;
  if (principalDb) {
    principal = {
      name: principalDb.name,
      photo: principalDb.photo || cfg?.photo || '',
      qualifications: principalDb.qualifications.length ? principalDb.qualifications : cfgQuals,
      experience: principalDb.experienceYears ?? cfg?.experience,
    };
  } else if (cfg?.verified && cfg?.name?.trim()) {
    principal = {
      name: cfg.name.trim(),
      photo: cfg.photo || '',
      qualifications: cfgQuals,
      experience: cfg.experience,
    };
  }

  const others = staff.filter((s) => s.designation !== 'Principal');
  const teaching = sortStaff(others.filter((s) => s.staffType === 'teaching'), TEACHING_ORDER);
  const nonTeaching = sortStaff(others.filter((s) => s.staffType === 'non-teaching'), NON_TEACHING_ORDER);

  return (
    <>
      <PageHeader
        title="Our Staff"
        subtitle="The people who teach, guide and care for our students"
        crumbs={[{ label: 'About Us', to: '/about' }]}
      />
      <div className="container-page space-y-12 py-10">
        {loading && !data && <p role="status" className="text-slate-600">Loading staff details…</p>}
        {error && !data && <p role="alert" className="text-red-700">{error}</p>}

        {principal && <PrincipalBanner principal={principal} />}

        {!loading && !error && !principal && !teaching.length && !nonTeaching.length && (
          <PendingInfo>
            Staff details will appear here once staff members complete their profiles.
          </PendingInfo>
        )}

        <StaffGroup id="teaching-h" title="Teaching Staff" people={teaching} />
        <StaffGroup id="nonteaching-h" title="Non-Teaching Staff" people={nonTeaching} />

        {(teaching.length > 0 || nonTeaching.length > 0) && (
          <p className="text-sm text-slate-600">
            Only each staff member&apos;s name, photograph, designation, qualifications and years of experience are
            shown on this page.
          </p>
        )}
      </div>
    </>
  );
}