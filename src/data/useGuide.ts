import { useEffect, useState } from 'react';
import type { Guide } from './types';

/** Contenu enrichi d'une fiche, chargé à la demande (il ne pèse rien au démarrage). */
export function useGuide(templateId?: string | null): Guide | undefined {
  const [guide, setGuide] = useState<Guide | undefined>();
  useEffect(() => {
    let alive = true;
    setGuide(undefined);
    if (templateId) import('./guides').then((m) => alive && setGuide(m.guideFor(templateId)));
    return () => {
      alive = false;
    };
  }, [templateId]);
  return guide;
}
