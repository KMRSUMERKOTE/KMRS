import { useEffect, useState } from 'react';
import { school } from '../../config/school';
import { Pencil, Squiggle } from './Doodles';

const KEY = 'kmrs-splash-seen';
const SHOW_MS = 1500;
const LEAVE_MS = 700;

// Plays once per browser session, only when the site is opened at the homepage,
// and never for visitors who prefer reduced motion.
function shouldShow() {
  try {
    if (window.location.pathname !== '/') return false;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    return !sessionStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export default function Splash() {
  const [phase, setPhase] = useState(() => (shouldShow() ? 'show' : 'done'));

  useEffect(() => {
    if (phase === 'done') return undefined;
    document.body.style.overflow = 'hidden';

    if (phase === 'show') {
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {
        /* storage unavailable: the splash may play again, which is harmless */
      }
      const timer = setTimeout(() => setPhase('leave'), SHOW_MS);
      const onKey = (e) => e.key === 'Escape' && setPhase('leave');
      window.addEventListener('keydown', onKey);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', onKey);
      };
    }

    const timer = setTimeout(() => setPhase('done'), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Always give scrolling back, whether the splash finished or the page was left early.
  useEffect(() => {
    if (phase === 'done') document.body.style.overflow = '';
    return undefined;
  }, [phase]);
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden="true"
      onClick={() => setPhase('leave')}
      className={`ruled no-print fixed inset-0 z-[70] flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
        phase === 'leave' ? '-translate-y-full' : ''
      }`}
    >
      <div className="px-6 text-center">
        <img src="/images/KMRS-logo.png" alt="" className="splash-logo mx-auto h-24 w-auto" />
        <p className="splash-name mt-5 font-serif text-2xl font-bold text-forest-900 sm:text-3xl">{school.name}</p>
        <p className="splash-name mt-1 text-sm text-slate-600">Umerkote, Nabarangpur, Odisha</p>

        {/* A pencil writes the underline */}
        <div className="relative mx-auto mt-6 h-6 w-56">
          <div className="splash-line">
            <Squiggle className="w-56" />
          </div>
          <div className="splash-pencil">
            <div style={{ transform: 'rotate(135deg)' }}>
              <div className="w-14" style={{ transform: 'translate(-93.3%, -50%)' }}>
                <Pencil className="block w-full drop-shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="motif-strip absolute inset-x-0 bottom-0" />
    </div>
  );
}
