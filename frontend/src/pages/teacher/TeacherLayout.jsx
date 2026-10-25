import DashboardShell from '../../components/common/DashboardShell';
import usePageTitle from '../../hooks/usePageTitle';

const links = [
  { to: '/teacher', label: 'Dashboard', end: true },
  { to: '/teacher/profile', label: 'My Profile' },
  { to: '/teacher/classes', label: 'My Classes & Subjects' },
  { to: '/teacher/results', label: 'Upload Results' },
];

export default function TeacherLayout() {
  usePageTitle('Teacher Dashboard');
  return <DashboardShell title="Teacher Dashboard" links={links} />;
}