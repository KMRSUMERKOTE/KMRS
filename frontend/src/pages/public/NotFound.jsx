import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="container-page py-24 text-center">
      <p className="font-serif text-6xl font-bold text-ochre-500">404</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-slate-700">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  );
}