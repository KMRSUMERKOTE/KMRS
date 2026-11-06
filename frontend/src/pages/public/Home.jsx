import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import useFetch from '../../hooks/useFetch';
import { glance, school } from '../../config/school';
import { facilities as staticFacilities, heroImage } from '../../config/content';
import NoticeItem from '../../components/common/NoticeItem';
import SafeImage from '../../components/common/SafeImage';
import { Reveal, Tilt } from '../../components/common/Motion';

const SLIDE_MS = 6000;

/*
 * Hero images: `heroImage` in config/content can be
 *   - null / ''            -> slides use a plain background
 *   - 'url'                -> the same photo behind every slide
 *   - ['url1', 'url2', …]  -> one photo per slide (cycles if fewer than slides)
 */
const heroImages = (Array.isArray(heroImage) ? heroImage : [heroImage])
  .filter(Boolean)
  .map((src) => src.replace(/ /g, '%20'));

// Descriptive alt text for the hero photographs, in the same order as `heroImage` in config/content.
// Update these if you change the hero photographs.
const heroAlts = [
  'Classroom at Kalinga Model Residential School, Umarkot',
  'Sports ground at Kalinga Model Residential School, Umarkot',
  'Computer laboratory at Kalinga Model Residential School, Umarkot',
];

const slides = [
  {
    id: 'welcome',
    title: school.tagline,
    text: 'Welcome to Kalinga Model Residential School, Umarkot — a government educational institution in Nabarangpur, Odisha.',
    cta: { to: '/about', label: 'Explore our school' },
    alt: { to: '/admissions', label: 'Admission information' },
  },
  {
    id: 'admissions',
    title: 'Admission to Class VI',
    text: 'Admission is through the KMRS Selection Test (KMRSST) and official notifications of the Government of Odisha.',
    cta: { to: '/admissions', label: 'See how to apply' },
    alt: { to: '/notices', label: 'Latest notices' },
  },
  {
    id: 'residential',
    title: 'Learning and campus life, together',
    text: 'A residential school brings study and daily life onto one campus, with CBSE-oriented, NCERT-based teaching.',
    cta: { to: '/residential-life', label: 'Residential life' },
    alt: { to: '/academics', label: 'Academics' },
  },
];

const quickLinks = [
  { to: '/admissions', title: 'Admissions', text: 'Class VI entry and KMRSST' },
  { to: '/academics', title: 'Academics', text: 'Classes and subjects' },
  { to: '/notices', title: 'Notices and downloads', text: 'Official announcements' },
  { to: '/contact', title: 'Contact', text: 'Address and directions' },
];

const polaroidTilt = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg'];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reduced = useReducedMotion();

  const count = slides.length;
  const playing = !userPaused && !hovering && !reduced;

  const go = useCallback((i) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, playing, count]);

  const ctrl =
    'flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

  return (
    <section
      className="relative overflow-hidden bg-forest-900 text-white"
      aria-roledescription="carousel"
      aria-label="Welcome to Kalinga Model Residential School"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={(e) => {
        setHovering(false);
        ['--px', '--py', '--tx', '--ty'].forEach((v) => e.currentTarget.style.setProperty(v, '0px'));
      }}
      onMouseMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.setProperty('--px', `${x * -28}px`);
        e.currentTarget.style.setProperty('--py', `${y * -18}px`);
        e.currentTarget.style.setProperty('--tx', `${x * 10}px`);
        e.currentTarget.style.setProperty('--ty', `${y * 6}px`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        if (e.key === 'ArrowRight') go(index + 1);
      }}
    >
      <style>{`
        @keyframes kmrs-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      <div className="relative min-h-[460px] sm:min-h-[540px] lg:min-h-[600px]">
        {slides.map((s, i) => {
          const active = i === index;
          const img = heroImages.length ? heroImages[i % heroImages.length] : null;
          return (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
                active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
              }`}
            >
              {img ? (
                <div
                  className="absolute -inset-8 transition-transform duration-300 ease-out motion-reduce:transform-none"
                  style={{ transform: 'translate3d(var(--px, 0px), var(--py, 0px), 0)' }}
                >
                  <img
                    src={img}
                    alt={heroAlts[i % heroAlts.length]}
                    fetchPriority={i === 0 ? 'high' : undefined}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className={`h-full w-full object-cover transition-transform duration-[8000ms] ease-out motion-reduce:transition-none ${
                      active ? 'scale-110' : 'scale-100'
                    }`}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/75 to-forest-900/30" />
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, #fff 35px, #fff 36px)' }}
              />

              <div className="container-page relative flex h-full min-h-[460px] items-center py-16 sm:min-h-[540px] lg:min-h-[600px]">
                <div
                  className="max-w-2xl transition-transform duration-300 ease-out motion-reduce:transform-none"
                  style={{ transform: 'translate3d(var(--tx, 0px), var(--ty, 0px), 0)' }}
                >
                  <p className="mb-4 inline-block border-l-4 border-ochre-500 pl-3 text-sm font-semibold text-ochre-300">
                    {school.category}
                  </p>
                  {/* h2 (not h1): the page's single H1 is the school name, placed above the slider in Home() */}
                  <h2 className="font-serif text-4xl font-bold leading-tight !text-white sm:text-5xl lg:text-6xl">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-lg text-forest-100">{s.text}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={s.cta.to} className="btn-accent" tabIndex={active ? 0 : -1}>
                      {s.cta.label}
                    </Link>
                    <Link
                      to={s.alt.to}
                      className="btn border-2 border-white/60 text-white hover:bg-white/10"
                      tabIndex={active ? 0 : -1}
                    >
                      {s.alt.label}
                    </Link>
                  </div>
                  {i === 0 && (
                    <p className="mt-6 text-sm text-forest-200">
                      CBSE Affiliation No. {school.affiliationNo} · Established {school.established}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="container-page flex items-center gap-4 pb-6">
          <ol className="flex flex-1 gap-2" aria-label="Choose slide">
            {slides.map((s, i) => (
              <li key={s.id} className="max-w-[88px] flex-1">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className="group block h-6 w-full focus:outline-none"
                >
                  <span className="relative block h-1 w-full overflow-hidden rounded-full bg-white/30 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-forest-900">
                    {i < index && <span className="absolute inset-0 bg-white" />}
                    {i === index && (
                      <span
                        key={`${index}-${playing}`}
                        className="absolute inset-0 origin-left bg-ochre-400"
                        style={
                          playing
                            ? { animation: `kmrs-progress ${SLIDE_MS}ms linear forwards` }
                            : { transform: 'scaleX(1)' }
                        }
                      />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className={`${ctrl} text-lg`}>
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
              className={`${ctrl} text-xs`}
            >
              <span aria-hidden="true">{userPaused ? '▶' : '❚❚'}</span>
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className={`${ctrl} text-lg`}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
        <div className="motif-strip" aria-hidden="true" />
      </div>

      <p className="sr-only" aria-live={playing ? 'off' : 'polite'}>
        Slide {index + 1} of {count}: {slides[index].title}
      </p>
    </section>
  );
}

function Section({ title, children, action, tone = 'ivory' }) {
  return (
    <section className={tone === 'white' ? 'paper py-14' : 'py-14'}>
      <Reveal className="container-page">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">{title}</h2>
          {action}
        </div>
        {children}
      </Reveal>
    </section>
  );
}

export default function Home() {
  usePageTitle('');
  const notices = useFetch('/notices', { limit: 4 });
  const gallery = useFetch('/gallery', { limit: 6 });
  const facilitiesData = useFetch('/facilities', { limit: 6 });
  // Backup used only when the server cannot be reached; an empty list from the server stays empty.
  const fallbackFacilities = staticFacilities
    .filter((f) => f.status === 'confirmed')
    .slice(0, 6)
    .map((f) => ({ _id: f.id, title: f.title, description: f.description }));
  const shownFacilities = facilitiesData.error ? fallbackFacilities : facilitiesData.data?.facilities || [];

  return (
    <>
      {/* The page's single H1 (visually hidden so the design is unchanged). */}
      <h1 className="sr-only">Kalinga Model Residential School, Umarkot, Nabarangpur, Odisha</h1>
      <HeroSlider />

      {/* Quick links: raised cards overlapping the hero */}
      <nav aria-label="Quick links" className="relative z-30 -mt-1">
        <div className="container-page">
          <ul className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((q) => (
              <li key={q.to + q.title}>
                <Tilt max={5} className="h-full">
                <Link
                  to={q.to}
                  className="card-lift paper group flex h-full items-center justify-between gap-3 border-t-4 border-t-ochre-500 p-5 focus-visible:bg-forest-50"
                >
                  <span>
                    <span className="block font-serif text-lg font-semibold text-forest-900">{q.title}</span>
                    <span className="block text-sm text-slate-600">{q.text}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xl text-ochre-600 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                  >
                    ›
                  </span>
                </Link>
                </Tilt>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* At a glance */}
      <section aria-labelledby="glance-heading">
        <div className="container-page py-10">
          <h2 id="glance-heading" className="sr-only">School at a glance</h2>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-forest-100 bg-forest-100 md:grid-cols-3 lg:grid-cols-6">
            {glance.map((g) => (
              <div key={g.label} className="paper p-4">
                <dt className="text-xs font-semibold text-slate-500">{g.label}</dt>
                <dd className="mt-1 font-serif text-lg font-semibold text-forest-900">{g.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* About + Academics */}
      <Section title="About the School">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="leading-relaxed text-slate-700">
              Kalinga Model Residential School, Umarkot, is a government-managed educational institution in
              Nabarangpur district, Odisha, affiliated with the Central Board of Secondary Education. The school
              is part of Odisha&apos;s Kalinga Model Residential School initiative, which seeks to expand access to
              quality education for eligible students.
            </p>
            <Link to="/about" className="btn-primary mt-5">Read More About Us</Link>
          </div>
          <div className="card-lift paper p-5">
            <h3 className="font-serif text-xl font-semibold">Academics</h3>
            <p className="mt-2 text-slate-700">
              The school is affiliated to CBSE at the senior secondary level. The Kalinga Model programme describes
              an English-medium, CBSE-oriented, NCERT-based framework. Current classes and subjects are listed on
              the Academics page.
            </p>
            <Link to="/academics" className="btn-outline mt-4">View Academics</Link>
          </div>
        </div>
      </Section>

      {/* Admissions + Residential */}
      <Section title="Admissions and Residential Life" tone="white">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-lift paper p-5">
            <h3 className="font-serif text-xl font-semibold">Admissions</h3>
            <p className="mt-2 text-slate-700">
              Admission to Class VI is conducted through the KMRS Selection Test (KMRSST) and official admission
              notifications of the Government of Odisha. Please rely on the current official notice.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/admissions" className="btn-primary">Admission Information</Link>
              <a href={school.links.admissions} target="_blank" rel="noopener noreferrer" className="btn-outline">
                Official Admission Notifications
              </a>
            </div>
          </div>
          <div className="card-lift paper p-5">
            <h3 className="font-serif text-xl font-semibold">Residential Life</h3>
            <p className="mt-2 text-slate-700">
              A residential school brings learning, study and daily life together on one campus. Details of
              hostel and student life arrangements will be published as the school confirms them.
            </p>
            <Link to="/residential-life" className="btn-outline mt-4">Residential Life</Link>
          </div>
        </div>
      </Section>

      {/* Facilities (only confirmed) */}
      {shownFacilities.length > 0 && (
        <Section title="Facilities" action={<Link to="/facilities" className="btn-outline">All Facilities</Link>}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shownFacilities.map((f) => (
              <li key={f._id} className="card-lift paper border-l-4 border-l-ochre-500 p-4">
                <h3 className="font-serif text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-700">{f.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Notices */}
      <Section
        title="Latest Notices"
        tone="white"
        action={
          <div className="flex gap-2">
            <Link to="/notices" className="btn-outline">View All Notices</Link>
            <Link to="/notices" className="btn-outline">Downloads</Link>
          </div>
        }
      >
        {notices.loading && <p role="status" className="text-slate-600">Loading notices…</p>}
        {notices.error && <p role="alert" className="text-red-700">{notices.error}</p>}
        {!notices.loading && !notices.error && (notices.data?.notices?.length ? (
          <ul className="space-y-3">
            {notices.data.notices.map((n) => <NoticeItem key={n._id} notice={n} />)}
          </ul>
        ) : (
          <p className="rounded-lg border border-forest-100 bg-forest-50 p-4 text-slate-700">
            No notices have been published here yet. Please check the{' '}
            <a className="font-semibold underline" href={school.links.admissions} target="_blank" rel="noopener noreferrer">
              official department website
            </a>{' '}
            for current announcements.
          </p>
        ))}
      </Section>

      {/* Gallery preview: pinned prints */}
      <Section title="Photo Gallery" action={<Link to="/gallery" className="btn-outline">Open Gallery</Link>}>
        {gallery.loading && <p role="status" className="text-slate-600">Loading photographs…</p>}
        {gallery.error && <p role="alert" className="text-red-700">{gallery.error}</p>}
        {!gallery.loading && !gallery.error && (gallery.data?.photos?.length ? (
          <ul className="grid grid-cols-2 gap-5 md:grid-cols-3">
            {gallery.data.photos.map((p, i) => (
              <li
                key={p._id}
                className="paper rotate-[var(--r)] border border-forest-100 p-2 pb-3 shadow-card transition duration-300 hover:z-10 hover:rotate-0 hover:shadow-lift motion-reduce:transition-none motion-reduce:rotate-0"
                style={{ '--r': polaroidTilt[i % polaroidTilt.length] }}
              >
                <SafeImage src={p.url} alt={p.alt || p.caption} />
                {p.caption && <p className="mt-2 text-center font-hand text-lg leading-tight text-forest-900">{p.caption}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-forest-100 bg-forest-50 p-4 text-slate-700">
            Photographs will appear here once approved images are added by the school.
          </p>
        ))}
      </Section>

      {/* Contact */}
      <Section title="Find Us" tone="white">
        <div className="grid gap-6 md:grid-cols-2">
          <address className="card paper p-5 not-italic leading-relaxed">
            <p className="font-semibold text-forest-900">{school.fullName}</p>
            <p>{school.address.line}</p>
            <p>{school.address.state} – {school.address.pin}</p>
            {school.phone.verified && <p className="mt-2">Phone: {school.phone.value}</p>}
            {school.email.verified && <p>Email: {school.email.value}</p>}
          </address>
          <div className="card paper flex flex-col items-start justify-center gap-3 p-5">
            <p className="text-slate-700">Open the school&apos;s address in Google Maps for directions.</p>
            <div className="flex flex-wrap gap-3">
              <a href={school.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Find us on Google Maps
              </a>
              <Link to="/contact" className="btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
