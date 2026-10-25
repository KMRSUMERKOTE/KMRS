import { school } from '../../config/school';

// Slim information bar. Only verified contact details are shown.
export default function TopBar() {
  const phone = school.phone.verified ? school.phone.value : null;
  const email = school.email.verified ? school.email.value : null;

  return (
    <div className="bg-forest-950 text-xs text-forest-100">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5">
        <p>Government of Odisha · ST &amp; SC Development Department</p>
        <p className="flex flex-wrap gap-x-4">
          {phone && (
            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hover:text-white hover:underline">
              Phone: {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="hover:text-white hover:underline">
              {email}
            </a>
          )}
          <span>CBSE Affiliation No. {school.affiliationNo}</span>
        </p>
      </div>
    </div>
  );
}