import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { IconCheck, IconChevronLeft, IconPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { Sheet } from '../components/Sheet';
import { useSwipeBack } from '../components/useSwipeBack';
import {
  addProduit, CATEGORIES, deleteProduit, loadProduits, SUGGESTIONS, updateProduit,
  type Categorie, type Etat, type Produit,
} from '../lib/maison';

type Props = { foyerId: string; onBack: () => void };

const ETATS: { v: Etat; l: string }[] = [
  { v: 'ok', l: 'J’en ai' },
  { v: 'bientot', l: 'Bientôt fini' },
  { v: 'vide', l: 'Fini' },
];
const catLabel = (c: Categorie) => CATEGORIES.find((x) => x.v === c)?.l ?? 'Autre';

/** Produits ménagers et consommables : ce qu'il y a dans le placard, et la liste de courses qui en découle. */
export function Produits({ foyerId, onBack }: Props) {
  const swipe = useSwipeBack(onBack);
  const [list, setList] = useState<Produit[] | null>(null);
  const [view, setView] = useState<'courses' | 'placard'>('courses');
  const [error, setError] = useState('');
  const [quick, setQuick] = useState('');
  const [editing, setEditing] = useState<Produit | 'new' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProduits(foyerId).then(setList).catch((e) => setError((e as Error).message));
  }, [foyerId]);

  const run = async (f: () => Promise<void>) => {
    setError('');
    try {
      await f();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const patch = (id: string, p: Partial<Produit>) => run(async () => {
    setList((l) => (l ?? []).map((x) => (x.id === id ? { ...x, ...p } : x)));
    await updateProduit(id, p);
  });
  const add = (p: Omit<Produit, 'id'>) => run(async () => {
    const created = await addProduit(foyerId, p);
    setList((l) => [...(l ?? []), created].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));
  });
  const remove = (id: string) => run(async () => {
    setList((l) => (l ?? []).filter((x) => x.id !== id));
    await deleteProduit(id);
  });
  /** Coché dans la liste de courses : acheté. Un article ponctuel disparaît, un produit du placard repasse à « J'en ai ». */
  const bought = (p: Produit) => (p.ponctuel ? remove(p.id) : patch(p.id, { etat: 'ok' }));

  const toBuy = (list ?? []).filter((p) => p.etat !== 'ok');
  const placard = (list ?? []).filter((p) => !p.ponctuel);
  const groups = (items: Produit[]) =>
    CATEGORIES.map((c) => ({ ...c, items: items.filter((p) => p.categorie === c.v) })).filter((g) => g.items.length > 0);
  const missingSuggestions = useMemo(() => {
    const names = new Set((list ?? []).map((p) => p.nom.toLowerCase()));
    return SUGGESTIONS.filter((s) => !names.has(s.nom.toLowerCase()));
  }, [list]);

  const quickAdd = (e: FormEvent) => {
    e.preventDefault();
    const nom = quick.trim();
    if (!nom) return;
    setQuick('');
    const known = (list ?? []).find((p) => p.nom.toLowerCase() === nom.toLowerCase());
    if (known) patch(known.id, { etat: 'vide' });
    else add({ nom, categorie: 'autre', etat: 'vide', ponctuel: true, note: null });
  };

  const share = async () => {
    const text = 'Courses :\n' + groups(toBuy).map((g) => g.items.map((p) => `• ${p.nom}${p.note ? ` (${p.note})` : ''}`).join('\n')).join('\n');
    try {
      if (navigator.share) await navigator.share({ title: 'Liste de courses', text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Partage annulé
    }
  };

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour au foyer" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Produits</h1>
        <button className="icon-btn" aria-label="Ajouter un produit" onClick={() => setEditing('new')}>
          <IconPlus size={20} />
        </button>
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub">Ménage, linge, consommables : ce qu’il reste, et ce qu’il faut racheter.</span>
        </header>
        <div className="content" style={{ gap: 18 }}>
          <div className="seg" role="tablist">
            <button aria-pressed={view === 'courses'} onClick={() => setView('courses')}>
              Liste de courses{toBuy.length ? ` · ${toBuy.length}` : ''}
            </button>
            <button aria-pressed={view === 'placard'} onClick={() => setView('placard')}>Placard</button>
          </div>
          {error && <div className="notice notice--error" role="alert">{error}</div>}
          {list === null && !error && <p className="meta">Chargement…</p>}

          {list && view === 'courses' && (
            <>
              <form onSubmit={quickAdd} className="search-field" style={{ paddingLeft: 8 }}>
                <IconPlus size={18} />
                <input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="Ajouter à la liste (pain de savon, ampoule…)" aria-label="Ajouter à la liste" enterKeyHint="done" />
                {quick && <button type="submit" aria-label="Ajouter" style={{ background: 'var(--gold)', color: 'var(--on-gold)' }}>+</button>}
              </form>
              {toBuy.length === 0 ? (
                <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>Rien à racheter.</span>
                  <span className="meta" style={{ lineHeight: 1.45 }}>
                    Ajoutez un article ci-dessus, ou dans le Placard, marquez un produit « Bientôt fini » ou « Fini » : il arrive ici.
                  </span>
                </div>
              ) : (
                <>
                  {groups(toBuy).map((g) => (
                    <section key={g.v} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h2 className="title-2" style={{ fontSize: 16 }}>{g.l}</h2>
                      <div className="card" style={{ padding: '4px 14px' }}>
                        {g.items.map((p, i) => (
                          <div key={p.id} style={{ minHeight: 54, display: 'flex', alignItems: 'center', gap: 12, borderTop: i ? '1px solid var(--divider)' : 0 }}>
                            <button className="check-round" role="checkbox" aria-checked={false} aria-label={`${p.nom} acheté`} onClick={() => bought(p)}>
                              <IconCheck size={16} />
                            </button>
                            <button className="row-btn" style={{ minHeight: 54 }} onClick={() => setEditing(p)}>
                              <span style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontSize: 15, fontWeight: 600 }}>{p.nom}</span>
                                {(p.note || p.etat === 'bientot') && (
                                  <span className="meta" style={{ fontSize: 12 }}>{[p.etat === 'bientot' ? 'bientôt fini' : null, p.note].filter(Boolean).join(' · ')}</span>
                                )}
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                  <button className="btn-secondary" onClick={share}>{copied ? 'Liste copiée' : 'Partager la liste'}</button>
                  <p className="meta" style={{ margin: 0, textAlign: 'center', fontSize: 13 }}>Cochez ce que vous avez acheté.</p>
                </>
              )}
            </>
          )}

          {list && view === 'placard' && (
            <>
              {placard.length === 0 && (
                <p className="meta" style={{ margin: 0, lineHeight: 1.45 }}>
                  Notez les produits que vous utilisez : en un toucher, vous indiquez quand l’un d’eux touche à sa fin, et il s’ajoute à la liste de courses.
                </p>
              )}
              {groups(placard).map((g) => (
                <section key={g.v} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h2 className="title-2" style={{ fontSize: 16 }}>{g.l}</h2>
                  <div className="card" style={{ padding: '4px 14px' }}>
                    {g.items.map((p, i) => (
                      <div key={p.id} style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 8, borderTop: i ? '1px solid var(--divider)' : 0 }}>
                        <button className="row-btn" style={{ minHeight: 28 }} onClick={() => setEditing(p)}>
                          <span style={{ fontSize: 15, fontWeight: 600 }}>{p.nom}</span>
                        </button>
                        <div style={{ display: 'flex', gap: 6 }} role="radiogroup" aria-label={`Stock de ${p.nom}`}>
                          {ETATS.map((e) => (
                            <button key={e.v} className="state-pill" data-etat={e.v} aria-pressed={p.etat === e.v} onClick={() => p.etat !== e.v && patch(p.id, { etat: e.v })}>
                              {e.l}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              <button className="btn-secondary" onClick={() => setEditing('new')}><IconPlus size={18} /> Ajouter un produit</button>
              {missingSuggestions.length > 0 && (
                <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h2 className="title-2" style={{ fontSize: 16 }}>Suggestions</h2>
                  <p className="meta" style={{ margin: 0, fontSize: 13 }}>Touchez pour ajouter au placard.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {missingSuggestions.map((s) => (
                      <button key={s.nom} className="state-pill" style={{ minHeight: 38, fontSize: 13 }} onClick={() => add({ nom: s.nom, categorie: s.categorie, etat: 'ok', ponctuel: false, note: null })}>
                        + {s.nom}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
      {editing && (
        <ProduitEditor
          produit={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            if (editing === 'new') add({ ...p, etat: 'ok', ponctuel: false });
            else patch(editing.id, editing.ponctuel ? { ...p, ponctuel: false } : p);
            setEditing(null);
          }}
          onDelete={editing === 'new' ? undefined : () => { remove(editing.id); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ProduitEditor({ produit, onSave, onDelete, onClose }: {
  produit: Produit | null;
  onSave: (p: { nom: string; categorie: Categorie; note: string | null }) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [nom, setNom] = useState(produit?.nom ?? '');
  const [categorie, setCategorie] = useState<Categorie>(produit?.categorie ?? 'menage');
  const [note, setNote] = useState(produit?.note ?? '');
  return (
    <Sheet title={produit ? 'Modifier le produit' : 'Nouveau produit'} onClose={onClose}>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (nom.trim()) onSave({ nom: nom.trim(), categorie, note: note.trim() || null });
        }}
      >
        <label className="field">
          <span className="field__label">Nom</span>
          <input className="input" required maxLength={80} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Lessive, piles AAA…" />
        </label>
        <label className="field">
          <span className="field__label">Rayon</span>
          <select className="input" value={categorie} onChange={(e) => setCategorie(e.target.value as Categorie)}>
            {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Précision (marque, taille…), facultatif</span>
          <input className="input" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        {produit?.ponctuel && <p className="meta" style={{ margin: 0, fontSize: 13 }}>Enregistrer le garde dans le placard ({catLabel(categorie)}), pour le suivre ensuite.</p>}
        <button className="btn-gold" type="submit">Enregistrer</button>
        {onDelete && <button type="button" className="btn-link" style={{ color: '#B23A1E' }} onClick={onDelete}>Supprimer</button>}
        <button type="button" className="btn-link" onClick={onClose}>Annuler</button>
      </form>
    </Sheet>
  );
}
