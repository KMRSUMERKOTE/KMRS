// Announces success / error messages to screen readers and shows them visually.
export default function StatusMessage({ status }) {
  return (
    <>
      <div role="status" aria-live="polite">
        {status?.type === 'ok' && (
          <p className="rounded bg-forest-50 p-3 text-sm font-medium text-forest-800">{status.text}</p>
        )}
      </div>
      <div role="alert">
        {status?.type === 'error' && (
          <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{status.text}</p>
        )}
      </div>
    </>
  );
}