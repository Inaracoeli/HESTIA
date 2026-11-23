import { useEffect, useState } from 'react';
import { IconChevronLeft, IconPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { EURO, Sheet } from '../components/Sheet';
import { useSwipeBack } from '../components/useSwipeBack';
import type { Domain, Task } from '../data/types';
import {
  deleteEnveloppe, loadDepensesAnnee, loadEnveloppes, MODELES_ENVELOPPES, saveEnveloppe,
  type Enveloppe, type Icone,
} from '../lib/maison';

type Props = { foyerId: string; tasks: Task[]; onBack: () => void };

const ICONES: { v: Icone; l: string; e: string }[] = [
  { v: 'voiture', l: 'Voiture', e: '🚗' },
  { v: 'maison', l: 'Maison', e: '🏠' },
  { v: 'electromenager', l: 'Électroménager', e: '🧺' },
  { v: 'animaux', l: 'Animaux', e: '🐾' },
  { v: 'jardin', l: 'Jardin', e: '🌿' },
  { v: 'sante', l: 'Santé', e: '🩺' },
  { v: 'autre', l: 'Autre', e: '💶' },
];
const emoji = (i: Icone) => ICONES.find((x) => x.v === i)?.e ?? '💶';
/** Domaine des tâches qui alimente une enveloppe, pour aider à fixer l'objectif. */
const DOMAINE: Partial<Record<Icone, Domain>> = { voiture: 'vehicule', maison: 'maison', electromenager: 'maison', jardin: 'exterieur' };

/** Épargne d'auto-assurance : un objectif par usage, et ce qui est déjà mis de côté. */
export function Epargne({ foyerId, tasks, onBack }: Props) {
  const swipe = useSwipeBack(onBack);
  const [list, setList] = useState<Enveloppe[] | null>(null);
  const [spent, setSpent] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Enveloppe | Omit<Enveloppe, 'id'> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEnveloppes(foyerId).then(setList).catch((e) => setError((e as Error).message));
    loadDepensesAnnee(foyerId).then(setSpent).catch(() => setSpent({}));
  }, [foyerId]);

  /** Budget annuel prévu par les tâches actives d'un domaine (budget × fréquence). */
  const planned = (d: Domain) =>
    Math.round(tasks.filter((t) => t.active && t.domain === d).reduce((s, t) => s + (t.budget * 365) / t.intervalDays, 0));

  const total = (list ?? []).reduce((s, e) => s + e.actuel, 0);
  const goal = (list ?? []).reduce((s, e) => s + e.objectif, 0);

  const save = async (e: Enveloppe | Omit<Enveloppe, 'id'>) => {
    setError('');
    try {
      const saved = await saveEnveloppe(foyerId, e);
      setList((l) => ('id' in e ? (l ?? []).map((x) => (x.id === saved.id ? saved : x)) : [...(l ?? []), saved]));
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  const remove = async (id: string) => {
    try {
      await deleteEnveloppe(id);
      setList((l) => (l ?? []).filter((x) => x.id !== id));
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  const blank = (nom = '', icone: Icone = 'autre'): Omit<Enveloppe, 'id'> => ({ nom, icone, objectif: 0, actuel: 0, note: null, ordre: (list ?? []).length });
  const used = new Set((list ?? []).map((e) => e.nom.toLowerCase()));

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour au foyer" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Épargne</h1>
        <button className="icon-btn" aria-label="Nouvel objectif" onClick={() => setEditing(blank())}>
          <IconPlus size={20} />
        </button>
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub">S’assurer soi-même : mettre de côté pour les coups durs, par usage.</span>
        </header>
        <div className="content" style={{ gap: 18 }}>
          {error && <div className="notice notice--error" role="alert">{error}</div>}
          {list === null && !error && <p className="meta">Chargement…</p>}

          {list && list.length > 0 && (
            <div className="card card--raised" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="meta">Mis de côté</span>
              <span className="num" style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
                {EURO.format(total)} <span className="meta" style={{ fontSize: 16, fontWeight: 600 }}>sur {EURO.format(goal)}</span>
              </span>
              <div className="gauge"><span style={{ width: `${goal ? Math.min(100, (total / goal) * 100) : 0}%` }} /></div>
            </div>
          )}

          {list?.map((e) => {
            const pct = e.objectif ? Math.min(100, (e.actuel / e.objectif) * 100) : 0;
            return (
              <button key={e.id} className="card" onClick={() => setEditing(e)} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', color: 'var(--ink)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span aria-hidden="true" style={{ fontSize: 26 }}>{emoji(e.icone)}</span>
                  <span style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{e.nom}</span>
                    {e.note && <span className="meta" style={{ fontSize: 12 }}>{e.note}</span>}
                  </span>
                  <span className="num" style={{ textAlign: 'right', fontWeight: 700 }}>
                    {EURO.format(e.actuel)}
                    <span className="meta" style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>/ {EURO.format(e.objectif)}</span>
                  </span>
                </span>
                <div className="gauge"><span style={{ width: `${pct}%` }} /></div>
                <span className="meta" style={{ fontSize: 12 }}>
                  {e.objectif === 0 ? 'Fixez un objectif' : pct >= 100 ? 'Objectif atteint' : `Encore ${EURO.format(e.objectif - e.actuel)}`}
                </span>
              </button>
            );
          })}

          {list && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 className="title-2" style={{ fontSize: 16 }}>{list.length ? 'Ajouter un objectif' : 'Pour commencer'}</h2>
              {list.length === 0 && (
                <p className="meta" style={{ margin: 0, lineHeight: 1.45 }}>
                  Plutôt que de payer une extension de garantie ou une assurance pour tout, mettez de côté vous-même pour chaque usage. Choisissez un objectif, puis notez ce que vous avez déjà mis de côté.
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                {MODELES_ENVELOPPES.filter((m) => !used.has(m.nom.toLowerCase())).map((m) => (
                  <button key={m.nom} className="choice-btn" onClick={() => setEditing(blank(m.nom, m.icone))}>
                    <span style={{ fontWeight: 700 }}>{emoji(m.icone)} {m.nom}</span>
                    <span className="meta" style={{ fontSize: 12, lineHeight: 1.3 }}>{m.aide}</span>
                  </button>
                ))}
                <button className="choice-btn" onClick={() => setEditing(blank())}>
                  <span style={{ fontWeight: 700 }}>+ Autre</span>
                  <span className="meta" style={{ fontSize: 12 }}>Votre propre objectif</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
      {editing && (
        <EnveloppeEditor
          value={editing}
          hint={(icone) => {
            const d = DOMAINE[icone];
            if (!d) return null;
            const p = planned(d);
            const s = spent[d] ?? 0;
            const parts = [p > 0 ? `vos tâches prévoient environ ${EURO.format(p)} par an` : null, s > 0 ? `le carnet compte ${EURO.format(s)} dépensés sur 12 mois` : null].filter(Boolean);
            return parts.length ? `Repère : ${parts.join(', ')}.` : null;
          }}
          onSave={save}
          onDelete={'id' in editing ? () => remove(editing.id) : undefined}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EnveloppeEditor({ value, hint, onSave, onDelete, onClose }: {
  value: Enveloppe | Omit<Enveloppe, 'id'>;
  hint: (i: Icone) => string | null;
  onSave: (e: Enveloppe | Omit<Enveloppe, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [nom, setNom] = useState(value.nom);
  const [icone, setIcone] = useState<Icone>(value.icone);
  const [objectif, setObjectif] = useState(value.objectif ? String(value.objectif) : '');
  const [actuel, setActuel] = useState(value.actuel ? String(value.actuel) : '');
  const [note, setNote] = useState(value.note ?? '');
  const num = (s: string) => Math.max(0, Number(s.replace(',', '.').replace(/\s/g, '')) || 0);
  const h = hint(icone);
  return (
    <Sheet title={'id' in value ? value.nom : 'Nouvel objectif'} onClose={onClose}>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (nom.trim()) onSave({ ...value, nom: nom.trim(), icone, objectif: num(objectif), actuel: num(actuel), note: note.trim() || null });
        }}
      >
        <label className="field">
          <span className="field__label">Déjà mis de côté (€)</span>
          <input className="input num" inputMode="decimal" value={actuel} onChange={(e) => setActuel(e.target.value)} placeholder="0" style={{ fontSize: 22, fontWeight: 700 }} autoFocus={'id' in value} />
        </label>
        <label className="field">
          <span className="field__label">Objectif (€)</span>
          <input className="input num" inputMode="decimal" value={objectif} onChange={(e) => setObjectif(e.target.value)} placeholder="1 000" />
          {h && <span className="meta" style={{ fontSize: 12, lineHeight: 1.4 }}>{h}</span>}
        </label>
        <label className="field">
          <span className="field__label">Nom</span>
          <input className="input" required maxLength={60} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Voiture, chien…" />
        </label>
        <div className="field">
          <span className="field__label">Icône</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ICONES.map((i) => (
              <button type="button" key={i.v} aria-label={i.l} aria-pressed={icone === i.v} onClick={() => setIcone(i.v)}
                style={{ width: 46, height: 46, borderRadius: 12, fontSize: 22, border: icone === i.v ? '2px solid var(--gold)' : '1px solid var(--line)', background: 'var(--card)' }}>
                {i.e}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span className="field__label">Note (où est rangé cet argent…), facultatif</span>
          <input className="input" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Livret A, compte joint…" />
        </label>
        <button className="btn-gold" type="submit">Enregistrer</button>
        {onDelete && <button type="button" className="btn-link" style={{ color: '#B23A1E' }} onClick={onDelete}>Supprimer cet objectif</button>}
        <button type="button" className="btn-link" onClick={onClose}>Annuler</button>
      </form>
    </Sheet>
  );
}

