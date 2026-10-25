import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../utils/api';
import { school } from '../../config/school';

export default function Login({ role }) {
  const isAdmin = role === 'admin';
  usePageTitle(isAdmin ? 'Admin Login' : 'Teacher Login');

  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in: go straight to the right dashboard.
  if (user && !busy) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/teacher'} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      if (u.role !== role) {
        logout();
        setError(
          isAdmin
            ? 'This account is not an administrator account.'
            : 'This is not a teacher account. Administrators should use the admin login.'
        );
        setBusy(false);
        return;
      }
      navigate(location.state?.from?.pathname || (isAdmin ? '/admin' : '/teacher'), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed. Please check your details and try again.'));
      setBusy(false);
    }
  };

  const checkCaps = (e) => setCapsOn(!!e.getModifierState?.('CapsLock'));

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Administrator Login' : 'Teacher Login'}
        subtitle={isAdmin ? 'For authorised school administrators only' : 'For teachers of the school'}
      />
      <div className="container-page py-10">
        <div className="mx-auto grid max-w-3xl overflow-hidden rounded border border-forest-100 bg-white shadow-lg md:grid-cols-5">
          {/* Side panel */}
          <aside className="flex flex-col justify-between bg-forest-900 p-6 text-white md:col-span-2">
            <div>
              <p className="border-l-4 border-ochre-500 pl-3 font-serif text-xl font-semibold leading-snug">
                {school.name}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-forest-100">
                {isAdmin
                  ? 'Manage notices, photographs, disclosures, teachers and enquiries for the school website.'
                  : 'Update your profile, add the classes you teach and publish examination results.'}
              </p>
            </div>
            <p className="mt-6 hidden text-xs text-forest-200 md:block">
              Signing in is only for school staff. Visitors do not need an account.
            </p>
          </aside>

          {/* Form */}
          <div className="p-6 md:col-span-3 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-forest-900">Sign in</h2>

            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="flex gap-2">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={checkCaps}
                    onKeyDown={checkCaps}
                    onBlur={() => setCapsOn(false)}
                    aria-describedby={capsOn ? 'caps-hint' : undefined}
                    required
                  />
                  <button
                    type="button"
                    className="btn-outline shrink-0"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {capsOn && (
                  <p id="caps-hint" className="mt-1 text-sm font-medium text-ochre-700">
                    Caps Lock is on.
                  </p>
                )}
              </div>

              <div role="alert">
                {error && <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p>}
              </div>

              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 border-t border-forest-100 pt-4 text-sm text-slate-600">
              {isAdmin
                ? 'Teacher? '
                : 'Accounts are created by the school administrator. If you have forgotten your password, please contact the administrator. Administrator? '}
              <Link className="font-semibold underline" to={isAdmin ? '/login' : '/admin/login'}>
                {isAdmin ? 'Teacher login' : 'Admin login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
