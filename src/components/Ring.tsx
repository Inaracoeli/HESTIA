// Anneau d'échéance : se remplit à mesure que la date approche.
// progress : 0 (vient d'être fait) → 1 (à faire maintenant).
const CIRC = 2 * Math.PI * 11;

export function Ring({ progress, color, size = 36 }: { progress: number; color: string; size?: number }) {
  const filled = Math.max(0.04, Math.min(1, progress)) * CIRC;
  return (
    <svg className="ring" width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" style={{ flexShrink: 0, color }}>
      <circle cx="14" cy="14" r="11" fill="none" stroke="var(--ring-track)" strokeWidth="4" />
      <circle
        cx="14"
        cy="14"
        r="11"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${CIRC}`}
        transform="rotate(-90 14 14)"
      />
    </svg>
  );
}
