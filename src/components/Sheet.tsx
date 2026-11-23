import type { ReactNode } from 'react';

/** Feuille qui monte du bas, pour un formulaire court. Toucher le fond la ferme. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet sheet--scroll" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <span className="sheet__grip" aria-hidden="true" />
        <h2 className="title-2">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** Montants en euros, sans centimes. */
export const EURO = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
