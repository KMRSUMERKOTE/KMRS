import DashboardShell from '../../components/common/DashboardShell';
import usePageTitle from '../../hooks/usePageTitle';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/teachers', label: 'Teachers' },
  { to: '/admin/academics', label: 'Exam Pattern & Subjects' },
  { to: '/admin/results', label: 'Results' },
  { to: '/admin/marks-lists', label: 'Marks Lists' },
  { to: '/admin/question-bank', label: 'Question Bank' },
  { to: '/admin/gallery', label: 'Photo Gallery' },
  { to: '/admin/facilities', label: 'Facilities' },
  { to: '/admin/achievers', label: 'Our Achievers' },
  { to: '/admin/activities', label: 'Student Activities' },
  { to: '/admin/notices', label: 'Notices' },
  { to: '/admin/disclosures', label: 'Public Disclosure' },
  { to: '/admin/enquiries', label: 'Enquiries' },
];

export default function AdminLayout() {
  usePageTitle('Admin Dashboard');
  return <DashboardShell title="Administrator Dashboard" links={links} />;
}
