// Academic years run April to March, e.g. "2026-27".
export function academicYearOptions(count = 5) {
  const now = new Date();
  const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => {
    const y = start - i;
    return `${y}-${String(y + 1).slice(-2)}`;
  });
}