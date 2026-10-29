import { useEffect, useRef } from 'react';
import { Pencil } from './Doodles';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/*
 * A small decorative pencil that trails the mouse pointer. The real cursor is never hidden.
 * Only runs for fine pointers (mouse/trackpad) and when reduced motion is not requested.
 */
export default function PencilCursor() {
  const anchor = useRef(null);
  const roll = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia?.('(pointer: fine)').matches;
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const a = anchor.current;
    const r = roll.current;
    if (!fine || calm || !a || !r) return undefined;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;
    let started = false;

    const show = (on) => {
      a.style.opacity = on ? '1' : '0';
    };

    const tick = () => {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      pos.x += dx * 0.22;
      pos.y += dy * 0.22;
      const speed = Math.hypot(dx, dy);
      // Tip points up-left toward the pointer; the body sways with horizontal speed.
      a.style.transform = `translate3d(${pos.x + 12}px, ${pos.y + 12}px, 0) rotate(${225 + clamp(dx * 0.3, -18, 18)}deg)`;
      // Rolling around its own length when moving fast gives a 3D feel.
      r.style.transform = `translate(-93.3%, -50%) rotateX(${clamp(speed * 1.5, 0, 70)}deg)`;
      raf = speed > 0.3 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        pos.x = target.x;
        pos.y = target.y;
        started = true;
      }
      const typing = !!e.target.closest?.('input, textarea, select, [contenteditable="true"]');
      show(!typing);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => show(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={anchor}
      aria-hidden="true"
      className="no-print pointer-events-none fixed left-0 top-0 z-[60] opacity-0 transition-opacity duration-200"
    >
      <div ref={roll} className="w-14 drop-shadow-lg" style={{ transform: 'translate(-93.3%, -50%)' }}>
        <Pencil className="block w-full" />
      </div>
    </div>
  );
}
