import { useEffect, useState } from 'react';
import { formatMinutes, planWeeks } from '../data/engine';
import { DOMAIN_COLOR, type Task } from '../data/types';
import { finGarantie, loadAppareils, loadEnveloppes, loadProduits, type Appareil, type Enveloppe, type Produit } from '../lib/maison';
import { EURO } from './Sheet';

const RANGE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Vrai sur un grand écran (PC, tablette à l'horizontale). */
export function useWide(): boolean {
  const q = '(min-width: 900px)';
  const [wide, setWide] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}

type Props = {
  foyerId: string;
  tasks: Task[];
  today: Date;
  capacity: number;
  onOpen: (t: Task) => void;
  onOpenModule: (m: 'produits' | 'epargne' | 'appareils') => void;
};

/** Tableau de bord sur grand écran : les semaines suivantes, les courses, l'épargne et les garanties. */
export function Tableau({ foyerId, tasks, today, capacity, onOpen, onOpenModule }: Props) {
  const [produits, setProduits] = useState<Produit[] | null>(null);
  const [env, setEnv] = useState<Enveloppe[] | null>(null);
  const [app, setApp] = useState<Appareil[] | null>(null);

  useEffect(() => {
    loadProduits(foyerId).then(setProduits).catch(() => setProduits([]));
    loadEnveloppes(foyerId).then(setEnv).catch(() => setEnv([]));
    loadAppareils(foyerId).then(setApp).catch(() => setApp([]));
  }, [foyerId]);

  const [, w1, w2] = planWeeks(tasks, today, [capacity, capacity, capacity]);
  const toBuy = (produits ?? []).filter((p) => p.etat !== 'ok');
  const total = (env ?? []).reduce((s, e) => s + e.actuel, 0);
  const goal = (env ?? []).reduce((s, e) => s + e.objectif, 0);
  const soon = (app ?? [])
    .map((a) => ({ a, fin: finGarantie(a) }))
    .filter((x): x is { a: Appareil; fin: Date } => !!x.fin && x.fin >= today)
    .sort((x, y) => x.fin.getTime() - y.fin.getTime())
    .slice(0, 3);

  return (
    <aside className="tableau" aria-label="Tableau de bord">
      {[w1, w2].map((w) => (
        <section key={w.start.toISOString()} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="title-2" style={{ fontSize: 15 }}>
            Semaine du {RANGE.format(w.start)} <span className="meta num" style={{ fontWeight: 600 }}>· {formatMinutes(w.minutes)}</span>
          </h2>
          {w.tasks.length === 0 && <span className="meta">Rien de prévu.</span>}
          {w.tasks.map((t) => (
            <button key={t.id} className="row-btn" style={{ minHeight: 34 }} onClick={() => onOpen(t)}>
              <span className="dot" style={{ background: DOMAIN_COLOR[t.domain], flexShrink: 0 }} />
              <span style={{ fontSize: 14, flexGrow: 1 }}>{t.title}</span>
              <span className="meta num" style={{ fontSize: 12 }}>{formatMinutes(t.minutes)}</span>
            </button>
          ))}
        </section>
      ))}

      <button className="card" onClick={() => onOpenModule('produits')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', color: 'var(--ink)' }}>
        <h2 className="title-2" style={{ fontSize: 15 }}>À racheter {toBuy.length ? <span className="meta">· {toBuy.length}</span> : null}</h2>
        <span className="meta" style={{ lineHeight: 1.45 }}>
          {produits === null ? '…' : toBuy.length ? toBuy.slice(0, 8).map((p) => p.nom).join(', ') + (toBuy.length > 8 ? '…' : '') : 'Rien pour l’instant.'}
        </span>
      </button>

      <button className="card" onClick={() => onOpenModule('epargne')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', color: 'var(--ink)' }}>
        <h2 className="title-2" style={{ fontSize: 15 }}>Épargne</h2>
        {env && env.length > 0 ? (
          <>
            <span className="num" style={{ fontSize: 20, fontWeight: 700 }}>{EURO.format(total)} <span className="meta" style={{ fontSize: 13 }}>sur {EURO.format(goal)}</span></span>
            <div className="gauge"><span style={{ width: `${goal ? Math.min(100, (total / goal) * 100) : 0}%` }} /></div>
          </>
        ) : (
          <span className="meta">Aucun objectif pour l’instant.</span>
        )}
      </button>

      <button className="card" onClick={() => onOpenModule('appareils')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', color: 'var(--ink)' }}>
        <h2 className="title-2" style={{ fontSize: 15 }}>Prochaines fins de garantie</h2>
        {soon.length === 0 && <span className="meta">{app?.length ? 'Aucune garantie en cours connue.' : 'Aucun appareil enregistré.'}</span>}
        {soon.map(({ a, fin }) => (
          <span key={a.id} style={{ display: 'flex', gap: 8, fontSize: 14 }}>
            <span style={{ flexGrow: 1 }}>{a.nom}</span>
            <span className="meta num">{RANGE.format(fin)} {fin.getFullYear()}</span>
          </span>
        ))}
      </button>
    </aside>
  );
}
