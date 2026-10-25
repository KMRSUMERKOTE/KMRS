import { useEffect, useRef, useState } from 'react';

// Image with lazy loading, a soft fade-in, and a neutral fallback if it fails or is missing.
export default function SafeImage({ src, alt, className = '', ratio = 'aspect-[4/3]' }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  // A new source starts over; a cached image can finish before React attaches onLoad.
  useEffect(() => {
    setFailed(false);
    setLoaded(!!ref.current?.complete && ref.current?.naturalWidth > 0);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || 'Photograph not available'}
        className={`${ratio} flex items-center justify-center bg-forest-50 px-3 text-center text-xs text-forest-600 ${className}`}
      >
        Photograph not available
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt || ''}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`${ratio} w-full bg-forest-50 object-cover transition-opacity duration-500 motion-reduce:transition-none ${
        loaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    />
  );
}
