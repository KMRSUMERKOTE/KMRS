import { useEffect, useRef } from 'react';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Fades/slides children in once when scrolled into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window) || reduced()) {
      el.classList.add('is-visible');
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add('is-visible');
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/** Wraps children in a card that tilts toward the pointer (mouse/pen only). */
export function Tilt({ max = 6, className = '', children }) {
  const ref = useRef(null);
  const set = (rx, ry) => {
    ref.current?.style.setProperty('--rx', `${rx}deg`);
    ref.current?.style.setProperty('--ry', `${ry}deg`);
  };
  const onMove = (e) => {
    if (e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    set(-((e.clientY - r.top) / r.height - 0.5) * max * 2, ((e.clientX - r.left) / r.width - 0.5) * max * 2);
  };
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={() => set(0, 0)}>
      {children}
    </div>
  );
}
