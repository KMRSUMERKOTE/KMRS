// Central school configuration. Edit here; do not scatter these details in components.

export const school = {
  name: 'Kalinga Model Residential School',
  // fullName follows the official records (CBSE / Government of Odisha) and is used on the Public Disclosure page.
  fullName: 'Kalinga Model Residential School, Umarkot, Nabarangpur',
  shortName: 'KMRS Umarkot',
  // Spelling variants of the place name, for search and display. "Umarkot" is the commonly used spelling;
  // "Umarkot" is the spelling in official records and the postal address.
  alsoKnownAs: ['Kalinga Model Residential School, Umarkot', 'KMRS Umarkot', 'KMRS Umerkote'],
  tagline: 'Learning Today. Building Tomorrow.',
  category: 'Government Residential School',
  board: 'Central Board of Secondary Education (CBSE)',
  affiliationNo: '1520301',
  affiliationLevel: 'Senior Secondary',
  affiliationPeriod: '1 April 2025 to 31 March 2030',
  established: 2018,
  firstOpened: '1 April 2018',
  department: 'ST & SC Development Department, Government of Odisha',
  state: 'Odisha',
  district: 'Nabarangpur',
  websiteAddress: 'https://kmrsumarkot.in',
  address: {
    line: 'AT/PO/PS-Umarkot, District Nabarangpur',
    state: 'Odisha',
    pin: '764073',
    full: 'Kalinga Model Residential School, Umarkot, Nabarangpur, Odisha 764073',
  },
  // Address-based search until exact coordinates are confirmed.
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Kalinga Model Residential School, Umarkot, Nabarangpur, Odisha 764073'),

  // Official contact details confirmed by the school.
  phone: { value: '+91 6370472684', verified: true },
  email: { value: '17471@cbseshiksha.in', verified: true },
  officeHours: { value: '10am-4pm (Mon-Fri), 6:30am-12:30pm(Sat)', verified: true },

  // Principal details confirmed by the school.
  principal: {
    name: 'Asit Kumar Mahanty',
    photo: '/images/principal-image.jpeg',
    qualifications: 'MSc, BEd',
    experience: '25',
    message:
      'We are committed to providing quality education in a supportive environment that encourages academic excellence, discipline, and the all-round development of every student. Our aim is to nurture responsible, confident, and compassionate individuals prepared to contribute positively to society.\n\n' +
      'We believe every child has the potential to grow, and it is our responsibility to help them discover it. Through dedicated teaching, guidance, and a culture of mutual respect, we encourage our students to stay curious, work hard, and take pride in their achievements. We also value the support of parents and the community, whose trust and partnership are essential to every student\u2019s journey.',
    verified: true,
  },

  links: {
    cbseRecord: 'https://saras.cbse.gov.in/saras/AffiliatedList/AfflicationDetails/1520301',
    admissions: 'https://stsc.odisha.gov.in/en/node/202779',
    disclosureRules: 'https://saras.cbse.gov.in/SARAS/Mandatory_public_disclosure.pdf',
  },

  lastUpdated: 'October 2026',
};

// Facts shown in "School at a glance". All verified from the CBSE record.
export const glance = [
  { label: 'Established', value: String(school.established) },
  { label: 'Management', value: 'Government of Odisha' },
  { label: 'CBSE Affiliation No.', value: school.affiliationNo },
  { label: 'Location', value: 'Umarkot (Umarkot), Nabarangpur' },
  { label: 'School Model', value: 'Residential' },
  { label: 'Department', value: 'ST & SC Development' },
];

// Navigation. Items with `children` render as dropdowns.
export const navigation = [
  { label: 'Home', to: '/' },
  {
    label: 'About Us',
    to: '/about',
    children: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Staff', to: '/staff' },
    ],
  },
  {
    label: 'Academics',
    to: '/academics',
    children: [
      { label: 'Academics Overview', to: '/academics' },
      { label: 'Examination Results', to: '/results' },
      { label: 'Question Bank', to: '/question-bank' },
    ],
  },
  { label: 'Admissions', to: '/admissions' },
  {
    label: 'Campus Life',
    to: '/residential-life',
    children: [
      { label: 'Residential Life', to: '/residential-life' },
      { label: 'Facilities', to: '/facilities' },
      { label: 'Student Life', to: '/student-life' },
      { label: 'Gallery', to: '/gallery' },
    ],
  },
  { label: 'Notices & Downloads', to: '/notices' },
  { label: 'Public Disclosure', to: '/public-disclosure' },
  { label: 'Our Achievers', to: '/achievers' },
  { label: 'Contact Us', to: '/contact' },
];

// Content that needs school approval before it is treated as final.
export const proposedContent = {
  vision:
    'To be a school where every student, regardless of background, has access to quality education and the confidence to grow into a responsible citizen.',
  mission: [
    'Provide accessible, quality education in a supportive residential environment.',
    'Encourage learning, curiosity and personal development in every student.',
    'Promote inclusion, respect and responsible citizenship.',
  ],
  approved: true,
};
