// Logo animé + nom « HESTIA » (i minuscule surmonté d'une flamme).

export const FLAME_PATH =
  'M32 6 C44 18 52 28 52 40 A20 20 0 0 1 12 40 C12 33 16 27 21 22 C22 27 25 30 28 30 C26 22 27 13 32 6 Z';

const TOOLS = [
  // Tournevis
  <g key="t1"><path d="M44 8 L56 20 L48 28 L36 16 Z" /><path d="M40 24 L14 50" /><path d="M14 50 L10 54" /></g>,
  // Clé à molette
  <g key="t2"><path d="M50 10 a12 12 0 0 0 -16 15 L12 47 a5 5 0 0 0 7 7 L41 32 a12 12 0 0 0 15 -16 L48 24 L42 22 L40 16 Z" /></g>,
  // Feuille
  <g key="t3"><path d="M12 52 C12 26 26 12 54 10 C54 38 40 52 12 52 Z" /><path d="M12 52 L38 26" /></g>,
  // Spray
  <g key="t4"><rect x="20" y="28" width="24" height="28" rx="5" /><path d="M26 28 V18 H40 V28" /><path d="M40 20 H50" /><path d="M56 14 V14.1 M56 20 V20.1 M56 26 V26.1" /></g>,
];

export function LogoTile({ size = 40 }: { size?: number }) {
  const icon = Math.round(size * 0.62);
  return (
    <span className="logo-tile" aria-hidden="true" style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}>
      <span className="logo-flame">
        <svg width={icon} height={icon} viewBox="0 0 64 64">
          <path d={FLAME_PATH} fill="#D6B462" />
        </svg>
      </span>
      {TOOLS.map((tool, i) => (
        <span key={i} className="logo-tool" style={{ animationDelay: `${2 + i * 4}s` }}>
          <svg width={icon} height={icon} viewBox="0 0 64 64" fill="none" stroke="#D6B462" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
            {tool}
          </svg>
        </span>
      ))}
    </span>
  );
}

export function Wordmark({ size = 30, color = 'var(--on-gold)' }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <LogoTile size={Math.round(size * 1.35)} />
      <span
        role="img"
        aria-label="Hestia"
        style={{
          fontFamily: 'var(--font-name)',
          fontSize: size,
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1,
          color,
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden="true">HEST</span>
        <span
          aria-hidden="true"
          style={{ position: 'relative', display: 'inline-block', fontFamily: 'var(--font-title)', fontWeight: 900, margin: '0 0.04em' }}
        >
          ı
          <svg
            viewBox="0 0 64 64"
            style={{ position: 'absolute', left: '50%', top: '-0.1em', width: '0.38em', height: '0.38em', transform: 'translateX(-50%)', overflow: 'visible' }}
          >
            <path className="flicker" fill="#C2470F" d={FLAME_PATH} />
          </svg>
        </span>
        <span aria-hidden="true">A</span>
      </span>
    </span>
  );
}
