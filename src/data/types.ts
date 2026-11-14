export type Domain = 'maison' | 'exterieur' | 'vehicule';

/** 1 = sécurité ou obligation légale, 2 = évite des dégâts coûteux, 3 = confort, 4 = esthétique */
export type Importance = 1 | 2 | 3 | 4;

export type Level = 'debutant' | 'intermediaire' | 'expert';

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
  steps: Record<Level, string[]>;
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
