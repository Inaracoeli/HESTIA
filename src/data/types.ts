export type Domain = 'maison' | 'exterieur' | 'vehicule';

/** 1 = sécurité ou obligation légale, 2 = évite des dégâts coûteux, 3 = confort, 4 = esthétique */
export type Importance = 1 | 2 | 3 | 4;

export type Level = 'debutant' | 'intermediaire' | 'expert';

/** Une étape : texte simple, ou texte affiché seulement pour certaines réponses. */
export type Step = string | { t: string; si: Record<string, string[]> };

/** Question posée une fois pour adapter les étapes (type de haie, emplacement des filtres…). */
export type Question = { id: string; label: string; options: { v: string; l: string }[] };

export type Task = {
  id: string;
  title: string;
  domain: Domain;
  importance: Importance;
  intervalDays: number;
  periodLabel: string;
  minutes: number;
  budget: number;
  difficulty: 1 | 2 | 3 | 4;
  /** true = mieux vaut faire appel à un professionnel */
  pro: boolean;
  lastDone: string; // date ISO (AAAA-MM-JJ)
  active: boolean;
  tools: string[];
  /** Solution de remplacement pour chaque outil, si on ne l'a pas */
  alternatives: Record<string, string>;
  steps: Record<Level, Step[]>;
  questions: Question[];
  choices: Record<string, string>;
  /** Affichée dans l'échéancier même si elle n'est pas prioritaire */
  inSchedule: boolean;
  /** Jour choisi par l'utilisateur (AAAA-MM-JJ), facultatif */
  plannedDay?: string;
};

export const DOMAIN_LABEL: Record<Domain, string> = {
  maison: 'Maison',
  exterieur: 'Extérieurs',
  vehicule: 'Véhicules',
};

export const DOMAIN_COLOR: Record<Domain, string> = {
  maison: 'var(--maison)',
  exterieur: 'var(--exterieur)',
  vehicule: 'var(--vehicule)',
};

/** Suivie dans l'échéancier : d'office si elle est essentielle ou évite des dégâts coûteux, sinon si on l'a étoilée. */
export function isFollowed(t: Task): boolean {
  return t.active && (t.importance <= 2 || t.inSchedule);
}

/** Étapes à afficher pour un niveau et des réponses données. */
export function resolveSteps(task: Task, level: Level, choices: Record<string, string>): string[] {
  return task.steps[level]
    .filter((s) => {
      if (typeof s === 'string') return true;
      return Object.entries(s.si).every(([q, values]) => choices[q] !== undefined && values.includes(choices[q]));
    })
    .map((s) => (typeof s === 'string' ? s : s.t));
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
