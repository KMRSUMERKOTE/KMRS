export const noticeCategories = [
  'Admissions',
  'Examinations',
  'Academic Calendar',
  'General Notices',
  'Events',
  'Results',
  'Recruitment',
  'Government Orders',
  'Circulars',
  'Holidays',
];

export const galleryCategories = [
  'School Campus',
  'Academic Activities',
  'Cultural Activities',
  'Sports',
  'Events',
  'Hostel and Residential Life',
];

export const activityCategories = [
  'Classroom Activities',
  'Cultural Programmes',
  'Sports',
  'Art and Creativity',
  'Environmental Awareness',
  'Community Participation',
  'Competitions',
  'Celebrations',
  'Student Projects',
];

// Mandatory Public Disclosure structure (Section A, general information, comes from config/school.js).
// `docType` keys are what the admin picks when uploading a disclosure document.
export const disclosureSections = [
  {
    id: 'B',
    title: 'Documents and Certificates',
    expected: [
      { key: 'affiliation-letter', label: 'Affiliation letter and extension' },
      { key: 'society-registration', label: 'Society or managing-body registration information' },
      { key: 'recognition', label: 'Applicable recognition documents' },
      { key: 'noc', label: 'No Objection Certificate, where applicable' },
      { key: 'building-safety', label: 'Building safety certificate' },
      { key: 'fire-safety', label: 'Fire safety certificate' },
      { key: 'deo-certificate', label: 'DEO certificate or applicable self-certification' },
      { key: 'water-health-sanitation', label: 'Water, health and sanitation certificates' },
      { key: 'other-mandatory', label: 'Other mandatory documents prescribed by CBSE' },
    ],
  },
  {
    id: 'C',
    title: 'Results and Academic Information',
    expected: [{ key: 'results', label: 'Approved examination results and statistics' }],
  },
  {
    id: 'D',
    title: 'Staff and Governance Information',
    expected: [
      { key: 'staff-list', label: 'Teaching and non-teaching staff list' },
      { key: 'smc', label: 'School Management Committee' },
      { key: 'governance', label: 'Other governance disclosures' },
    ],
  },
  {
    id: 'E',
    title: 'Infrastructure and Academic Information',
    expected: [
      { key: 'infrastructure', label: 'Infrastructure information' },
      { key: 'academic-calendar', label: 'Academic calendar' },
      { key: 'institutional-records', label: 'Other required institutional records' },
    ],
  },
];