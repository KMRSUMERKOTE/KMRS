// Shown wherever the school has not yet confirmed information.
// Keeps the page structurally complete without inventing content.
export default function PendingInfo({ children }) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded border border-dashed border-ochre-400 bg-ochre-50 px-4 py-3 text-sm text-ochre-700"
    >
      <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ochre-500" />
      <span>{children || 'This information will be updated after confirmation by the school.'}</span>
    </div>
  );
}
