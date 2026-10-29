// Shown wherever the school has not yet confirmed information.
// Keeps the page structurally complete without inventing content.
export default function PendingInfo({ children }) {
  return (
    <div role="note" className="sticky-note !text-lg" style={{ '--r': '-1deg' }}>
      {children || 'This information will be updated after confirmation by the school.'}
    </div>
  );
}
