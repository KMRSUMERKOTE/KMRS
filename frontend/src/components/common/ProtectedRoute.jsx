import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// <ProtectedRoute role="teacher" /> or role="admin". Public pages never use this.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-slate-600" role="status">
        Loading…
      </div>
    );
  }

  if (!user) {
    const loginPath = role === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/teacher'} replace />;
  }

  return <Outlet />;
}