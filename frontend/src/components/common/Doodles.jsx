// Decorative stationery SVGs. All are aria-hidden; size them with className (e.g. "w-40").

export function Pencil({ className = '' }) {
  return (
    <svg viewBox="0 0 180 22" className={className} aria-hidden="true">
      <rect x="2" y="3" width="12" height="16" rx="2" fill="#6459b3" />
      <rect x="12" y="3" width="4" height="16" fill="#cfcbed" />
      <rect x="16" y="3" width="122" height="16" fill="#e0b232" />
      <rect x="16" y="3" width="122" height="5" fill="#f4e09a" />
      <path d="M138 3l30 8-30 8z" fill="#f2d9a8" />
      <path d="M158 8.5l10 2.5-10 2.5z" fill="#1a1640" />
    </svg>
  );
}

export function Ruler({ className = '' }) {
  return (
    <svg viewBox="0 0 200 28" className={className} aria-hidden="true">
      <rect width="200" height="28" rx="3" fill="#f4e09a" stroke="#c99a14" />
      {Array.from({ length: 19 }, (_, i) => (
        <line key={i} x1={10 + i * 10} x2={10 + i * 10} y1="0" y2={i % 5 === 4 ? 14 : 8} stroke="#7d5d11" />
      ))}
    </svg>
  );
}

export function Star({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.3 5.8 21l1.6-7L2 9.3l7.1-.7z" fill="#e0b232" stroke="#a37a10" strokeLinejoin="round" />
    </svg>
  );
}

// `draw` makes the line animatable (the hero's "pencil draws it" effect via the .kmrs-draw class).
export function Squiggle({ className = '', draw = false }) {
  return (
    <svg viewBox="0 0 120 12" className={className} aria-hidden="true" fill="none">
      <path
        d="M2 6Q12 0 22 6T42 6T62 6T82 6T102 6T118 6"
        stroke={draw ? '#e0b232' : '#c99a14'}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={draw ? 1 : undefined}
        className={draw ? 'kmrs-draw' : undefined}
      />
    </svg>
  );
}

export function Sparkle({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1c.8 6.2 4.8 10.2 11 11-6.2.8-10.2 4.8-11 11-.8-6.2-4.8-10.2-11-11 6.2-.8 10.2-4.8 11-11z" fill="#f4e09a" stroke="#c99a14" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export function Eraser({ className = '' }) {
  return (
    <svg viewBox="0 0 92 44" className={className} aria-hidden="true">
      <rect x="2" y="4" width="88" height="36" rx="7" fill="#f6a8b8" />
      <path d="M2 11a7 7 0 017-7h41v36H9a7 7 0 01-7-7z" fill="#463d9b" />
      <rect x="50" y="4" width="4" height="36" fill="#1a1640" opacity=".25" />
      <path d="M12 15h28M12 22h28M12 29h18" stroke="#cfcbed" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sharpener({ className = '' }) {
  return (
    <svg viewBox="0 0 70 50" className={className} aria-hidden="true">
      <rect x="2" y="6" width="66" height="38" rx="8" fill="#e0b232" stroke="#a37a10" strokeWidth="2" />
      <rect x="4" y="8" width="62" height="10" rx="6" fill="#f4e09a" />
      <circle cx="22" cy="28" r="9" fill="#1a1640" />
      <circle cx="22" cy="28" r="5" fill="#463d9b" />
      <rect x="38" y="24" width="22" height="3" rx="1.5" fill="#7d5d11" />
      <circle cx="52" cy="36" r="2" fill="#7d5d11" />
    </svg>
  );
}

export function BookStack({ className = '' }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
      <g transform="rotate(-3 62 28)">
        <rect x="22" y="14" width="80" height="22" rx="3" fill="#f8f7fb" stroke="#cfcbed" strokeWidth="2" />
        <rect x="30" y="14" width="5" height="22" fill="#6459b3" />
        <rect x="40" y="14" width="2.5" height="22" fill="#6459b3" />
        <rect x="88" y="22" width="8" height="6" rx="1" fill="#e0b232" />
      </g>
      <rect x="12" y="38" width="94" height="24" rx="3" fill="#e0b232" stroke="#a37a10" strokeWidth="2" />
      <rect x="20" y="38" width="5" height="24" fill="#7d5d11" />
      <rect x="30" y="38" width="2.5" height="24" fill="#7d5d11" />
      <path d="M60 46h30M60 54h20" stroke="#7d5d11" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="4" y="64" width="108" height="24" rx="3" fill="#6459b3" stroke="#2d2768" strokeWidth="2" />
      <rect x="12" y="64" width="5" height="24" fill="#f4e09a" />
      <rect x="22" y="64" width="2.5" height="24" fill="#f4e09a" />
      <path d="M60 72h34M60 80h22" stroke="#cfcbed" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function PaperPlane({ className = '' }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden="true">
      <path d="M4 57c14-2 10-18 24-16" stroke="#e0b232" strokeWidth="2.5" strokeDasharray="3 5" strokeLinecap="round" fill="none" />
      <path d="M2 30L98 4 46 36z" fill="#f8f7fb" stroke="#cfcbed" strokeWidth="2" strokeLinejoin="round" />
      <path d="M98 4L46 36l16 20z" fill="#cfcbed" stroke="#aca6df" strokeWidth="2" strokeLinejoin="round" />
      <path d="M46 36l-6 16 22 4z" fill="#aca6df" />
    </svg>
  );
}

export function GradCap({ className = '' }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <path d="M28 40v20c0 8 64 8 64 0V40L60 52z" fill="#3d348b" stroke="#cfcbed" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 6L116 28 60 50 4 28z" fill="#463d9b" stroke="#cfcbed" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 28l44 6v28" stroke="#e0b232" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="100" y="60" width="8" height="14" rx="2" fill="#e0b232" />
      <circle cx="60" cy="28" r="4" fill="#e0b232" />
    </svg>
  );
}

export function Compass({ className = '' }) {
  return (
    <svg viewBox="0 0 80 110" className={className} aria-hidden="true">
      <path d="M40 18L14 100" stroke="#cfcbed" strokeWidth="6" strokeLinecap="round" />
      <path d="M14 100l-2 8" stroke="#7d5d11" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 18L66 94" stroke="#cfcbed" strokeWidth="6" strokeLinecap="round" />
      <path d="M66 94l3 12-8-6z" fill="#e0b232" />
      <path d="M25 66h30" stroke="#aca6df" strokeWidth="3" strokeLinecap="round" />
      <rect x="36" y="0" width="8" height="8" rx="2" fill="#a37a10" />
      <circle cx="40" cy="16" r="7" fill="#e0b232" stroke="#a37a10" strokeWidth="2" />
    </svg>
  );
}

export function Apple({ className = '' }) {
  return (
    <svg viewBox="0 0 60 64" className={className} aria-hidden="true">
      <path d="M30 16c-8-6-24-2-24 20 0 14 10 26 18 26 4 0 4-2 6-2s2 2 6 2c8 0 18-12 18-26 0-22-16-26-24-20z" fill="#e4584f" />
      <path d="M14 30c0-6 3-9 7-10" stroke="#fff" opacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M30 16c0-4 0-7-2-10" stroke="#7d5d11" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M30 16c0-8 4-12 12-13-1 8-4 12-12 13z" fill="#6bbf7a" />
    </svg>
  );
}

// Answer sheet with filled bubbles (nods to the KMRS selection test).
export function OmrSheet({ className = '' }) {
  const picks = [1, 3, 0, 2, 1];
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true">
      <rect x="2" y="2" width="116" height="146" rx="6" fill="#f8f7fb" stroke="#cfcbed" strokeWidth="2" />
      <rect x="2" y="2" width="116" height="26" rx="6" fill="#3d348b" />
      <rect x="2" y="20" width="116" height="8" fill="#3d348b" />
      <text x="60" y="20" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill="#f4e09a">
        ANSWER SHEET
      </text>
      {picks.map((p, r) => (
        <g key={r}>
          <text x="12" y={53 + r * 20} fontSize="9" fill="#3d348b" fontFamily="sans-serif">{r + 1}.</text>
          {[0, 1, 2, 3].map((c) => (
            <circle
              key={c}
              cx={38 + c * 20}
              cy={49 + r * 20}
              r="6.5"
              fill={c === p ? '#2d2768' : 'none'}
              stroke="#6459b3"
              strokeWidth="1.5"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

// Residential building at night.
export function Hostel({ className = '' }) {
  const lit = '#f4e09a';
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
      <path d="M176 14a16 16 0 1 0 14 22 13 13 0 0 1-14-22z" fill="#f4e09a" />
      <path d="M100 20V4" stroke="#cfcbed" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 4l16 5-16 5z" fill="#e0b232" />
      <rect x="30" y="60" width="140" height="80" fill="#3d348b" stroke="#cfcbed" strokeWidth="2" />
      <path d="M22 62L100 20 178 62z" fill="#2d2768" stroke="#cfcbed" strokeWidth="2" strokeLinejoin="round" />
      {[44, 78, 112, 146].map((x, i) => (
        <rect key={x} x={x} y="74" width="20" height="18" fill={i === 2 ? '#6459b3' : lit} stroke="#1a1640" strokeWidth="1.5" />
      ))}
      {[44, 64, 120, 140].map((x, i) => (
        <rect key={x} x={x} y="100" width="16" height="16" fill={i === 1 ? '#6459b3' : lit} stroke="#1a1640" strokeWidth="1.5" />
      ))}
      <path d="M88 140v-16a12 12 0 0124 0v16z" fill="#1a1640" />
      <path d="M0 140h200" stroke="#cfcbed" strokeWidth="2" />
    </svg>
  );
}

// Hand-drawn arrow, curves right then points down.
export function ArrowDoodle({ className = '' }) {
  return (
    <svg viewBox="0 0 80 60" className={className} aria-hidden="true" fill="none">
      <path d="M4 8C30 4 56 14 62 46" stroke="#ecca5f" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 38l12 10 8-14" stroke="#ecca5f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}