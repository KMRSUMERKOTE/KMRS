import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { Pencil, Squiggle } from '../../components/common/Doodles';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="container-page py-20 text-center">
      <div className="ruled mx-auto max-w-xl rounded-lg border border-forest-100 px-6 py-12 shadow-card sm:pl-16">
        <p className="font-hand text-8xl font-bold leading-none text-ochre-500">404</p>
        <Squiggle className="mx-auto mt-2 w-28" />
        <h1 className="mt-4 font-serif text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-slate-700">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="btn-primary mt-6">Back to Home</Link>
        <Pencil className="mx-auto mt-8 w-32 -rotate-6 opacity-90" />
      </div>
    </div>
  );
}
