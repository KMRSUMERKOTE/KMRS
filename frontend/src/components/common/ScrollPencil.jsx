import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Pencil } from './Doodles';

/*
 * Reading-progress line: a gold line draws itself across the very top of the page as you scroll,
 * with a small pencil at the tip. Works on phones too (where normal scrollbars are hidden).
 * Purely decorative (aria-hidden) and ignored by the mouse. Updates are done directly on the elements,
 * so scrolling never re-renders React.
 */
export default function ScrollPencil() {
  const wrap = useRef(null);
  const bar = useRef(null);
  const pen = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (pen.current) pen.current.style.left = `${p * 100}%`;
      if (wrap.current) wrap.current.style.opacity = max > 0 && y > 4 ? '1' : '0';
    };

    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);

    // Pages grow as content loads (notices, gallery...), so watch the page height too.
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(onChange);
      observer.observe(document.body);
    }

    return () => {
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-x-0 top-0 z-[45] h-2 overflow-hidden opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
    >
      <div ref={bar} className="h-1 origin-left scale-x-0 bg-gradient-to-r from-ochre-500 to-ochre-300" />
      <div ref={pen} className="absolute top-0 left-0 w-16 -translate-x-[93%]">
        <Pencil className="block w-full" />
      </div>
    </div>
  );
}
