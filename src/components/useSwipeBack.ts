import { useRef, useState, type TouchEvent } from 'react';

/** Glisser vers la droite pour fermer la fiche. */
export function useSwipeBack(onBack: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef(false);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);

  return {
    style: {
      // Sans déplacement, aucune transformation : la barre épinglée reste bien fixée en haut.
      transform: leaving ? 'translateX(100%)' : dx ? `translateX(${dx}px)` : 'none',
      transition: dragging ? 'none' : 'transform 0.25s ease',
    },
    handlers: {
      onTouchStart: (e: TouchEvent) => {
        start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        horizontal.current = false;
      },
      onTouchMove: (e: TouchEvent) => {
        if (!start.current) return;
        const mx = e.touches[0].clientX - start.current.x;
        const my = e.touches[0].clientY - start.current.y;
        if (!horizontal.current && Math.abs(mx) > 12 && Math.abs(mx) > Math.abs(my) * 1.4) {
          horizontal.current = true;
          setDragging(true);
        }
        if (horizontal.current) setDx(Math.max(0, mx));
      },
      onTouchEnd: () => {
        start.current = null;
        setDragging(false);
        if (horizontal.current && dx > 90) {
          setLeaving(true);
          setTimeout(onBack, 220);
        } else setDx(0);
        horizontal.current = false;
      },
    },
  };
}

