import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import ConfirmHost from './components/common/ConfirmHost';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Staff from './pages/public/Staff';
import Academics from './pages/public/Academics';
import Admissions from './pages/public/Admissions';
import ResidentialLife from './pages/public/ResidentialLife';
import Facilities from './pages/public/Facilities';
import StudentLife from './pages/public/StudentLife';
import Gallery from './pages/public/Gallery';
import Achievers from './pages/public/Achievers';
import Notices from './pages/public/Notices';
import Results from './pages/public/Results';
import PublicDisclosure from './pages/public/PublicDisclosure';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

// Auth
import Login from './pages/auth/Login';

// Teacher
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherResults from './pages/teacher/TeacherResults';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminAcademics from './pages/admin/AdminAcademics';
import AdminResults from './pages/admin/AdminResults';
import AdminClassResults from './pages/admin/AdminClassResults';
import AdminGallery from './pages/admin/AdminGallery';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminAchievers from './pages/admin/AdminAchievers';
import AdminActivities from './pages/admin/AdminActivities';
import AdminNotices from './pages/admin/AdminNotices';
import AdminDisclosures from './pages/admin/AdminDisclosures';
import AdminEnquiries from './pages/admin/AdminEnquiries';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          {/* Public: no login needed */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/residential-life" element={<ResidentialLife />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/student-life" element={<StudentLife />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/achievers" element={<Achievers />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/public-disclosure" element={<PublicDisclosure />} />
          <Route path="/contact" element={<Contact />} />

          {/* Login pages */}
          <Route path="/login" element={<Login role="teacher" />} />
          <Route path="/admin/login" element={<Login role="admin" />} />

          {/* Teacher area */}
          <Route element={<ProtectedRoute role="teacher" />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="classes" element={<TeacherClasses />} />
              <Route path="results" element={<TeacherResults />} />
            </Route>
          </Route>

          {/* Admin area */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="academics" element={<AdminAcademics />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="marks-lists" element={<AdminClassResults />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="facilities" element={<AdminFacilities />} />
              <Route path="achievers" element={<AdminAchievers />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="disclosures" element={<AdminDisclosures />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Sticky-note success messages (see utils/notify.jsx) */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        pauseOnHover
        closeButton
        limit={3}
      />
      <ConfirmHost />
    </>
  );
}
