import { GUIDES_DEHORS } from './guides-dehors';
import { GUIDES_MAISON } from './guides-maison';
import { VIDEOS } from './guides-videos';
import type { Guide } from './types';

const ALL: Record<string, Guide> = { ...GUIDES_MAISON, ...GUIDES_DEHORS };

/** Contenu enrichi d'une fiche du catalogue, avec ses vidéos. */
export function guideFor(templateId?: string | null): Guide | undefined {
  if (!templateId) return undefined;
  const g = ALL[templateId];
  const videos = VIDEOS[templateId];
  if (!g && !videos) return undefined;
  return { ...(g ?? { comprendre: '' }), videos };
}
