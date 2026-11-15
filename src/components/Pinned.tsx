import { useEffect, useState, type ReactNode } from 'react';

/** Vrai dès que la page a défilé au-delà de `offset` pixels. */
export function useScrolledPast(offset: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const check = () => setPast(window.scrollY > offset);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [offset]);
  return past;
}

/**
 * Barre de titre épinglée en haut de l'écran : elle apparaît quand le grand
 * en-tête sort de l'écran, pour toujours savoir où l'on est.
 */
export function Pinned({ title, tone, left, offset = 150 }: { title: ReactNode; tone?: string; left?: ReactNode; offset?: number }) {
  const on = useScrolledPast(offset);
  return (
    <div className={`pinned${tone ? ` pinned--${tone}` : ''}${on ? ' pinned--on' : ''}`} aria-hidden={!on}>
      {left && <span className="pinned__side" style={{ left: 12 }}>{left}</span>}
      <span className="pinned__title">{title}</span>
    </div>
  );
}
