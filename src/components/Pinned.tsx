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
 * Barre du haut, toujours fixée en haut de l'écran avec ses coins arrondis :
 * le contenu défile dessous, on sait toujours où l'on est.
 */
export function Topbar({ children, tone }: { children: ReactNode; tone?: string }) {
  const scrolled = useScrolledPast(4);
  return <div className={`topbar${tone ? ` topbar--${tone}` : ''}${scrolled ? ' topbar--scrolled' : ''}`}>{children}</div>;
}
