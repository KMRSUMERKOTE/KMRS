import { Link } from 'react-router-dom';
import { school } from '../../config/school';

// Highlighter-pen swipe on hover/focus (defined in index.css), same feel as the nav links.
const linkClass = 'marker-link';

function Column({ title, children }) {
  return (
    <div>
      <h2 className="font-serif text-lg font-semibold !text-white">{title}</h2>
      <div className="mt-2 h-0.5 w-8 bg-ochre-500" aria-hidden="true" />
      {children}
    </div>
  );
}

export default function Footer() {
  const phone = school.phone.verified ? school.phone.value : null;
  const email = school.email.verified ? school.email.value : null;

  const backToTop = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <footer className="mt-16 bg-forest-950 text-forest-100">
      <div className="motif-strip" aria-hidden="true" />
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <h2 className="font-serif text-lg font-semibold !text-white">{school.name}</h2>
          <div className="mt-2 h-0.5 w-8 bg-ochre-500" aria-hidden="true" />
          <address className="mt-3 text-sm not-italic leading-relaxed">
            {school.address.line}
            <br />
            {school.address.state} – {school.address.pin}
          </address>
          <p className="mt-3 text-sm">CBSE Affiliation No. {school.affiliationNo}</p>
        </div>

        <Column title="Quick Links">
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className={linkClass} to="/about">About Us</Link></li>
            <li><Link className={linkClass} to="/academics">Academics</Link></li>
            <li><Link className={linkClass} to="/admissions">Admissions</Link></li>
            <li><Link className={linkClass} to="/notices">Notices &amp; Downloads</Link></li>
            <li><Link className={linkClass} to="/public-disclosure">Mandatory Public Disclosure</Link></li>
            <li><Link className={linkClass} to="/gallery">Gallery</Link></li>
          </ul>
        </Column>

        <Column title="Official Resources">
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className={linkClass} href={school.links.admissions} target="_blank" rel="noopener noreferrer">
                Odisha Govt. Admission Notifications
              </a>
            </li>
            <li>
              <a className={linkClass} href={school.links.cbseRecord} target="_blank" rel="noopener noreferrer">
                CBSE Affiliation Record
              </a>
            </li>
            <li>
              <a className={linkClass} href={school.links.disclosureRules} target="_blank" rel="noopener noreferrer">
                CBSE Public Disclosure Guidelines
              </a>
            </li>
          </ul>
        </Column>

        <Column title="Contact">
          <ul className="mt-3 space-y-2 text-sm">
            {phone && (
              <li>
                <a className={linkClass} href={`tel:${phone.replace(/[^\+\d]/g, '')}`}>{phone}</a>
              </li>
            )}
            {email && (
              <li>
                <a className={linkClass} href={`mailto:${email}`}>{email}</a>
              </li>
            )}
            {!phone && !email && (
              <li>Contact details will be published after confirmation by the school.</li>
            )}
            <li>
              <a className={linkClass} href={school.mapUrl} target="_blank" rel="noopener noreferrer">
                Find us on Google Maps
              </a>
            </li>
            <li><Link className={linkClass} to="/contact">Contact page</Link></li>
          </ul>
        </Column>
      </div>

      <div className="border-t border-forest-800">
        <div className="container-page flex flex-col gap-4 py-5 text-xs text-forest-200 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-2">
            <p>
              <strong>Disclaimer:</strong> Admissions, eligibility and deadlines are governed by the current official
              notifications of the Government of Odisha. Please refer to the official admission page before applying.
            </p>
            <p>
              © {new Date().getFullYear()} {school.fullName}. Last updated: {school.lastUpdated}.
            </p>
          </div>
          <button
            type="button"
            onClick={backToTop}
            className="btn shrink-0 self-start border border-forest-200/50 text-forest-100 hover:border-ochre-500 hover:bg-ochre-500 hover:text-forest-950 sm:self-auto"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}