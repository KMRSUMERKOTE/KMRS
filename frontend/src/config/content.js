// Editable static content. Nothing here is shown as a fact unless confirmed.

// Homepage hero slider photographs (put files in frontend/public/images).
// One photo per slide, in order: welcome, admissions, residential life.
// A single string ('/images/campus-hero.jpg') also works and is used for every slide.
// Leave as [] until genuine KMRS Umerkote photographs are supplied.
export const heroImage = [
  '/images/classrooms/classroom-1.jpeg',
  '/images/sports/sports-2.jpeg',
  '/images/computer lab/cslab-1.jpeg', // same file name as in the Facilities list below; change if the real file is .jpg
];

// ---------- FACILITIES ----------
// status: 'confirmed' shows on the public site. 'pending' stays hidden.
// photos: array of { src, alt } once approved photographs exist.
export const facilities = [
  { id: 'classrooms', title: 'Classrooms', description: '', status: 'confirmed', photos: [ {
        src: '/images/classrooms/classroom-1.jpeg',
        alt: 'Classroom at Kalinga Model Residential School',
      },] },

  { id: 'computer-lab', title: 'Computer Laboratory', description: '', status: 'confirmed', photos: [{
        src: '/images/computer lab/cslab-1.jpeg',
        alt: 'Computer Lab at Kalinga Model Residential School',
      },] },
  { id: 'sports', title: 'Sports and Playground', description: '', status: 'confirmed', photos: [{
        src: '/images/sports/sports-1.jpg',
        alt: 'Sports Ground at Kalinga Model Residential School',
      }] },
 
  { id: 'dining', title: 'Dining Area', description: '', status: 'confirmed', photos: [{
        src: '/images/dining/dining-1.jpg',
        alt: 'Dining at Kalinga Model Residential School',
      }] },

  { id: 'assembly', title: 'Assembly and Multipurpose Spaces', description: '', status: 'confirmed', photos: [{
        src: '/images/assembly/assembly-2.jpg',
        alt: 'Assembly at Kalinga Model Residential School',
      }] },
  { id: 'library', title: 'Library', description: '', status: 'pending', photos: [] },
  { id: 'science-labs', title: 'Science Laboratories', description: '', status: 'confirmed', photos: [] },
  { id: 'hostel', title: 'Hostel Accommodation', description: '', status: 'confirmed', photos: [] },
  { id: 'sanitation', title: 'Sanitation and Drinking Water', description: '', status: 'confirmed', photos: [] },
  { id: 'health', title: 'Health Facilities', description: '', status: 'confirmed', photos: [] },
  { id: 'accessibility', title: 'Accessibility Facilities', description: '', status: 'confirmed', photos: [] },
];

// ---------- RESIDENTIAL LIFE ----------
// General residential-life descriptions.
// Verify actual facilities and policies with the school before publishing.

export const residentialTopics = [
  {
    id: 'hostel',
    title: 'Hostel Accommodation',
    content:
      'Residential life at Kalinga Model Residential School, Umerkote, is intended to provide students with an environment that supports learning, discipline, personal growth, and a sense of community. Hostel arrangements, accommodation facilities, and residential guidelines should be followed as prescribed by the school administration.',
  },
  {
    id: 'routine',
    title: 'Student Daily Routine',
    content:
      'A structured daily routine helps students balance academic learning, personal responsibilities, physical activities, and rest. Students are encouraged to develop punctuality, self-discipline, good habits, and respect for others while following the daily schedule established by the school.',
  },
  {
    id: 'meals',
    title: 'Meals and Dining',
    content:
      'Nutritious food and healthy eating habits are important parts of student life in a residential school. Students are encouraged to maintain cleanliness, follow dining guidelines, avoid food wastage, and practise good personal hygiene. Details regarding menus, meal timings, and dietary arrangements are governed by the school administration.',
  },
  {
    id: 'study',
    title: 'Supervised Study',
    content:
      'Residential education provides opportunities for students to strengthen their learning beyond regular classroom hours. A focused study environment encourages revision, completion of assignments, independent learning, and preparation for examinations. Students are encouraged to seek guidance from teachers whenever they need academic support.',
  },
  {
    id: 'health',
    title: 'Health and Medical Support',
    content:
      'The health and well-being of students are essential to a positive residential experience. Students should promptly inform the designated school authorities about illness, injury, or other health concerns. Parents and guardians should provide relevant medical information and follow the school’s established procedures for medical assistance and emergencies.',
  },
  {
    id: 'welfare',
    title: 'Student Welfare',
    content:
      'Kalinga Model Residential School, Umerkote, aims to foster an environment where students can develop academically, socially, and emotionally. Respect, inclusion, cooperation, and responsible behaviour are important values in residential life. Students should feel encouraged to approach the appropriate school authorities when they need guidance or support.',
  },
  {
    id: 'safety',
    title: 'Safety and Supervision',
    content:
      'A safe and supportive residential environment requires responsible conduct, respect for school rules, and cooperation among students and school authorities. Students are expected to follow the prescribed hostel guidelines, respect the privacy and belongings of others, and report safety concerns to the appropriate school authorities.',
  },
  {
    id: 'recreation',
    title: 'Recreation and Sports',
    content:
      'Sports, recreational activities, and opportunities for creative expression contribute to students’ overall development. Participation in physical activities helps develop teamwork, discipline, confidence, leadership, and a healthy competitive spirit. Students are encouraged to participate in activities organized by the school, subject to the facilities and programmes available.',
  },
  {
    id: 'leave',
    title: 'Leave and Visitor Policy',
    content:
      'Students must follow the school’s prescribed procedures for leave, parent or guardian visits, and movement outside the residential campus. Requests should be submitted to the appropriate school authority and are subject to the applicable school rules and approval procedures. Parents and guardians should contact the school administration for current guidelines.',
  },
  {
    id: 'communication',
    title: 'Parent-School Communication',
    content:
      'Constructive communication between parents, guardians, teachers, and school authorities plays an important role in student development. Parents are encouraged to stay informed about their child’s academic progress, attendance, conduct, and general well-being through the communication channels and meeting arrangements provided by the school.',
  },
];

// ---------- STUDENT ACTIVITIES ----------
// Add approved items: { id, title, date: '2026-01-26', category, description, photos: [{src, alt}], link }
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
export const activities = [];

// ---------- ADMISSIONS ----------
export const admissionCycle2026 = {
  label: '2026–27 cycle (closed)',
  facts: [
    'Applicants must be studying in Class V in a school in Odisha.',
    'Age limit: 10–13 years as of 31 March 2026, with a two-year relaxation for eligible children with disabilities.',
    'Published intake at Umerkote: 30 boys and 30 girls.',
    'Published seats for each gender: 25 ST, 3 SC and 2 PVTG.',
    'Final application dates: 10 February 2026 (online) and 12 February 2026 (offline). These dates have passed.',
  ],
};

export const admissionProcess = [
  { title: 'Read the official admission notice', text: 'Find the current notice and brochure on the official Odisha Government page.' },
  { title: 'Check eligibility', text: 'Confirm class, age, category and residence conditions for the applicable year.' },
  { title: 'Submit the application as instructed', text: 'Apply through the mode and by the dates given in the official notice.' },
  { title: 'Prepare for the selection test', text: 'The Class VI admission is through the KMRS Selection Test (KMRSST).' },
  { title: 'Check the official merit list', text: 'Results and merit lists are published through official channels.' },
  { title: 'Complete document verification and admission', text: 'Bring the required original documents when called for verification.' },
];

export const admissionDocuments = [
  'Student Aadhaar card or accepted identity/residence proof, as required by the current notice',
  'Domicile or residential certificate',
  'Applicable ST, SC or PVTG certificate',
  'Date-of-birth certificate',
  'Class V pass certificate or report card',
  'Bonafide certificate from the current school',
  'Transfer certificate, where required',
  'Disability certificate, where applicable',
];

export const admissionFaqs = [
  {
    q: 'Is admission open right now?',
    a: 'This website does not announce admission dates. Please check the official Odisha Government admission page for the current announcement.',
  },
  {
    q: 'Which class does the KMRS Selection Test cover?',
    a: 'Admission to Class VI is conducted through the KMRS Selection Test (KMRSST), as per the official guidelines.',
  },
  {
    q: 'Are the 2026–27 age limits and seat numbers valid for the next year?',
    a: 'Not automatically. Conditions can change every year. Always use the notice for the year you are applying for.',
  },
  {
    q: 'Where can I get the application form and brochure?',
    a: 'Only from the official Odisha Government admission page linked on this website.',
  },
];
