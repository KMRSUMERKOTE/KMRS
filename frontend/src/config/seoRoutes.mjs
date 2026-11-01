// Single source of truth for SEO. Used by the app (usePageTitle.js) AND by scripts/seo-postbuild.mjs.
// The school's spelling "Umarkot" is primary; "Umerkote" (the spelling in official records) is kept as an alternate
// so searches for either spelling can find the site.
// To change the production domain, set VITE_SITE_URL (overrides the default below). Do not hardcode the domain elsewhere.
export const DEFAULT_SITE_URL = 'https://kmrsumarkot.in';
export const SITE_NAME = 'Kalinga Model Residential School, Umarkot (Umerkote)';
export const OG_IMAGE_PATH = '/images/KMRS-logo.png';

// Only real public routes. Any path NOT listed here is treated as noindex (login, dashboards, 404).
export const routes = {
  '/': {
    label: 'Home',
    title: 'Kalinga Model Residential School, Umarkot (Umerkote) | KMRS',
    description:
      'Official website of Kalinga Model Residential School (KMRS), Umarkot (Umerkote), Nabarangpur, Odisha. Admissions, academics, notices and examination results.',
  },
  '/about': {
    label: 'About Us',
    title: 'About KMRS Umarkot (Umerkote) | Kalinga Model Residential School',
    description:
      'About Kalinga Model Residential School, Umarkot (Umerkote), Nabarangpur: a CBSE-affiliated government residential school under the ST & SC Development Department, Odisha.',
  },
  '/staff': {
    label: 'Our Staff',
    title: 'Principal and Staff | KMRS Umarkot (Umerkote)',
    description:
      'Meet the principal and the teaching and non-teaching staff of Kalinga Model Residential School (KMRS), Umarkot (Umerkote), Nabarangpur, Odisha.',
  },
  '/academics': {
    label: 'Academics',
    title: 'Academics, Classes and Subjects | KMRS Umarkot (Umerkote)',
    description:
      'CBSE affiliation details, examination pattern, classes and subjects at Kalinga Model Residential School, Umarkot (Umerkote), Nabarangpur, Odisha.',
  },
  '/results': {
    label: 'Examination Results',
    title: 'Examination Results | KMRS Umarkot (Umerkote)',
    description:
      'KMRS Umarkot (Umerkote) examination results: result documents and class-wise marks lists published by Kalinga Model Residential School, Nabarangpur.',
  },
  '/admissions': {
    label: 'Admissions',
    title: 'KMRS Admission, Class VI (KMRSST) | Umarkot (Umerkote)',
    description:
      'Admission information for Kalinga Model Residential School, Umarkot (Umerkote): Class VI entry through the KMRS Selection Test (KMRSST) and official Government of Odisha notifications.',
  },
  '/residential-life': {
    label: 'Residential Life',
    title: 'Residential Life | KMRS Umarkot (Umerkote)',
    description:
      'Learn about residential life at Kalinga Model Residential School, Umarkot (Umerkote), a government residential school in Nabarangpur district, Odisha.',
  },
  '/facilities': {
    label: 'Facilities',
    title: 'Campus Facilities | KMRS Umarkot (Umerkote)',
    description:
      'Campus facilities at Kalinga Model Residential School (KMRS), Umarkot (Umerkote), Nabarangpur: classrooms, computer laboratory, hostel, dining area, sports and more.',
  },
  '/student-life': {
    label: 'Student Life',
    title: 'Student Life and Activities | KMRS Umarkot (Umerkote)',
    description:
      'Academic, cultural and extracurricular activities of students at Kalinga Model Residential School, Umarkot (Umerkote), Nabarangpur, Odisha.',
  },
  '/gallery': {
    label: 'Photo Gallery',
    title: 'Photo Gallery | KMRS Umarkot (Umerkote)',
    description:
      'Photographs from Kalinga Model Residential School (KMRS), Umarkot (Umerkote), Nabarangpur, Odisha: campus, events and student life.',
  },
  '/notices': {
    label: 'Notices and Downloads',
    title: 'School Notices and Downloads | KMRS Umarkot (Umerkote)',
    description:
      'Official notices and downloadable documents from Kalinga Model Residential School, Umarkot (Umerkote), Nabarangpur, Odisha.',
  },
  '/public-disclosure': {
    label: 'Mandatory Public Disclosure',
    title: 'Mandatory Public Disclosure (CBSE) | KMRS Umarkot (Umerkote)',
    description:
      'CBSE mandatory public disclosure for Kalinga Model Residential School, Umarkot (Umerkote): general information, affiliation details and published documents.',
  },
  '/contact': {
    label: 'Contact Us',
    title: 'Contact | KMRS Umarkot (Umerkote)',
    description:
      'Address, directions and enquiry form for Kalinga Model Residential School (KMRS), Umarkot (Umerkote), Nabarangpur, Odisha.',
  },
};
