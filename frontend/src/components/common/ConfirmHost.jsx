import { useCallback, useEffect, useRef, useState } from 'react';
import { registerConfirm } from '../../utils/confirmNote';

export default function ConfirmHost() {
  const [req, setReq] = useState(null);
  const resolver = useRef(null);
  const noRef = useRef(null);
  const yesRef = useRef(null);
  const lastFocus = useRef(null);

  const close = useCallback((answer) => {
    resolver.current?.(answer);
    resolver.current = null;
    setReq(null);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(
    () =>
      registerConfirm(
        (options) =>
          new Promise((resolve) => {
            resolver.current?.(false); // a newer question replaces an unanswered one
            lastFocus.current = document.activeElement;
            resolver.current = resolve;
            setReq(options);
          })
      ),
    []
  );

  useEffect(() => {
    if (!req) return undefined;
    noRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'Tab') {
        const first = noRef.current;
        const last = yesRef.current;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [req, close]);

  if (!req) return null;

  const {
    title = 'Please confirm',
    message = '',
    confirmLabel = 'Yes, go ahead',
    cancelLabel = 'No, keep it',
    danger = true,
  } = req;

  return (
    <div className="confirm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(false); }}>
      <div
        className="confirm-note"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
      >
        <h2 id="confirm-title" className="confirm-title">{title}</h2>
        {message && <p id="confirm-text" className="confirm-text">{message}</p>}
        <div className="confirm-actions">
          <button ref={noRef} type="button" className="btn-outline" onClick={() => close(false)}>
            {cancelLabel}
          </button>
          <button ref={yesRef} type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => close(true)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}