import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconChevronLeft, IconChevronRight, IconPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { EURO, Sheet } from '../components/Sheet';
import { useSwipeBack } from '../components/useSwipeBack';
import { toISODate } from '../data/types';
import {
  CATEGORIES_APPAREILS, deleteAppareil, deleteDoc, docUrl, finGarantie, loadAppareils, loadDocs, saveAppareil, uploadDoc,
  type Appareil, type CategorieAppareil, type Doc, type DocType,
} from '../lib/maison';

type Props = { foyerId: string; today: Date; onBack: () => void };

const DATE_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const DOC_LABEL: Record<DocType, string> = { facture: 'Facture', notice: 'Notice', photo: 'Photo', autre: 'Document' };

/** État de la garantie : en cours, bientôt finie (2 mois), finie, ou inconnue. */
function garantie(a: Appareil, today: Date): { label: string; tone: 'ok' | 'warn' | 'off' } | null {
  const fin = finGarantie(a);
  if (!fin) return null;
  const days = (fin.getTime() - today.getTime()) / 86400000;
  if (days < 0) return { label: `Garantie finie le ${DATE_FMT.format(fin)}`, tone: 'off' };
  if (days <= 60) return { label: `Garantie jusqu’au ${DATE_FMT.format(fin)}`, tone: 'warn' };
  return { label: `Garantie jusqu’au ${DATE_FMT.format(fin)}`, tone: 'ok' };
}
const TONE: Record<'ok' | 'warn' | 'off', string> = { ok: '#2C7A3F', warn: '#C98A1B', off: 'var(--ink-soft)' };

const blank = (): Omit<Appareil, 'id'> => ({
  nom: '', categorie: 'electromenager', marque: null, modele: null, dateAchat: null, garantieMois: 24, prix: null, vendeur: null, noticeUrl: null, note: null,
});

/** Coffre des appareils : date d'achat, garantie, facture et notice, à portée de main le jour d'une panne. */
export function Appareils({ foyerId, today, onBack }: Props) {
  const swipe = useSwipeBack(onBack);
  const [list, setList] = useState<Appareil[] | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [open, setOpen] = useState<Appareil | null>(null);
  const [editing, setEditing] = useState<Appareil | Omit<Appareil, 'id'> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAppareils(foyerId).then(setList).catch((e) => setError((e as Error).message));
    loadDocs(foyerId).then(setDocs).catch(() => setDocs([]));
  }, [foyerId]);

  const save = async (a: Appareil | Omit<Appareil, 'id'>) => {
    setError('');
    try {
      const saved = await saveAppareil(foyerId, a);
      setList((l) => ('id' in a ? (l ?? []).map((x) => (x.id === saved.id ? saved : x)) : [...(l ?? []), saved].sort((x, y) => x.nom.localeCompare(y.nom, 'fr'))));
      setEditing(null);
      setOpen(saved);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const soon = (list ?? []).filter((a) => garantie(a, today)?.tone === 'warn');
  const groups = CATEGORIES_APPAREILS.map((c) => ({ ...c, items: (list ?? []).filter((a) => a.categorie === c.v) })).filter((g) => g.items.length);

  if (open) {
    return (
      <Fiche
        foyerId={foyerId}
        appareil={open}
        today={today}
        docs={docs.filter((d) => d.appareilId === open.id)}
        onDocs={(f) => setDocs(f)}
        allDocs={docs}
        onBack={() => setOpen(null)}
        onEdit={() => setEditing(open)}
        onDelete={async () => {
          try {
            await deleteAppareil(foyerId, open.id);
            setList((l) => (l ?? []).filter((x) => x.id !== open.id));
            setDocs((d) => d.filter((x) => x.appareilId !== open.id));
            setOpen(null);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
        editor={editing && <AppareilEditor value={editing} onSave={save} onClose={() => setEditing(null)} />}
      />
    );
  }

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour au foyer" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Appareils</h1>
        <button className="icon-btn" aria-label="Ajouter un appareil" onClick={() => setEditing(blank())}>
          <IconPlus size={20} />
        </button>
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub">Factures, garanties et notices, retrouvées en un instant le jour d’une panne.</span>
        </header>
        <div className="content" style={{ gap: 18 }}>
          {error && <div className="notice notice--error" role="alert">{error}</div>}
          {list === null && !error && <p className="meta">Chargement…</p>}
          {soon.length > 0 && (
            <div className="notice" style={{ background: 'rgba(201, 138, 27, 0.16)', color: 'var(--ink)', lineHeight: 1.45 }}>
              <strong>Garantie bientôt finie</strong> : {soon.map((a) => a.nom).join(', ')}. Un défaut à signaler ? C’est le moment.
            </div>
          )}
          {list?.length === 0 && (
            <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>Commencez par les gros appareils</span>
              <span className="meta" style={{ lineHeight: 1.45 }}>
                Lave-linge, réfrigérateur, chaudière ou pompe à chaleur, télévision… Prenez la facture en photo : en cas de panne, la date d’achat et la garantie sont là.
              </span>
              <span className="meta" style={{ lineHeight: 1.45, fontSize: 13 }}>
                Bon à savoir : la garantie légale de conformité dure 2 ans pour un appareil neuf, et 6 mois de plus après une réparation sous garantie.
              </span>
            </div>
          )}
          {groups.map((g) => (
            <section key={g.v} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 className="title-2" style={{ fontSize: 16 }}>{g.l}</h2>
              <div className="card card--list" style={{ padding: '0 14px' }}>
                {g.items.map((a) => {
                  const gar = garantie(a, today);
                  const n = docs.filter((d) => d.appareilId === a.id).length;
                  return (
                    <button key={a.id} className="row-btn" style={{ minHeight: 64 }} onClick={() => setOpen(a)}>
                      <span style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0' }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{a.nom}</span>
                        <span className="meta" style={{ fontSize: 12 }}>
                          {[a.marque, a.modele].filter(Boolean).join(' ') || 'Marque et modèle à compléter'}
                          {n ? ` · ${n} document${n > 1 ? 's' : ''}` : ''}
                        </span>
                        {gar && <span style={{ fontSize: 12, fontWeight: 700, color: TONE[gar.tone] }}>{gar.label}</span>}
                      </span>
                      <IconChevronRight size={18} />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          <button className="btn-secondary" onClick={() => setEditing(blank())}><IconPlus size={18} /> Ajouter un appareil</button>
        </div>
      </div>
      {editing && <AppareilEditor value={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Fiche({ foyerId, appareil: a, today, docs, allDocs, onDocs, onBack, onEdit, onDelete, editor }: {
  foyerId: string; appareil: Appareil; today: Date; docs: Doc[]; allDocs: Doc[]; onDocs: (d: Doc[]) => void;
  onBack: () => void; onEdit: () => void; onDelete: () => void; editor: ReactNode;
}) {
  const swipe = useSwipeBack(onBack);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [kind, setKind] = useState<DocType>('facture');
  const photo = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const gar = garantie(a, today);
  const search = `https://www.google.com/search?q=${encodeURIComponent(`notice ${[a.marque, a.modele].filter(Boolean).join(' ') || a.nom} pdf`)}`;

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    let all = allDocs;
    try {
      for (const f of Array.from(files)) {
        setBusy(`Envoi de ${f.name || 'la photo'}…`);
        const d = await uploadDoc(foyerId, a.id, f, kind);
        all = [...all, d];
        onDocs(all);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy('');
      if (photo.current) photo.current.value = '';
      if (file.current) file.current.value = '';
    }
  };
  const openDoc = async (d: Doc) => {
    // La fenêtre s'ouvre tout de suite (sinon Safari la bloque), puis reçoit le lien.
    const w = window.open('', '_blank');
    try {
      const url = await docUrl(d.chemin);
      if (w) w.location.href = url;
      else location.href = url;
    } catch (err) {
      w?.close();
      setError((err as Error).message);
    }
  };
  const removeDoc = async (d: Doc) => {
    try {
      await deleteDoc(d);
      onDocs(allDocs.filter((x) => x.id !== d.id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const rows: [string, string | null][] = [
    ['Marque', a.marque],
    ['Modèle', a.modele],
    ['Acheté le', a.dateAchat ? DATE_FMT.format(new Date(a.dateAchat + 'T12:00:00')) : null],
    ['Prix', a.prix !== null ? EURO.format(a.prix) : null],
    ['Vendeur', a.vendeur],
    ['Garantie', a.garantieMois ? `${a.garantieMois} mois` : null],
  ];

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour aux appareils" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nom}</h1>
        <button className="btn-link" onClick={onEdit} style={{ minWidth: 44 }}>Modifier</button>
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub" style={{ color: gar ? TONE[gar.tone] : undefined, fontWeight: gar ? 700 : undefined }}>
            {gar ? gar.label : 'Ajoutez la date d’achat pour suivre la garantie.'}
          </span>
        </header>
        <div className="content" style={{ gap: 18 }}>
          {error && <div className="notice notice--error" role="alert">{error}</div>}
          <div className="card card--list" style={{ padding: '0 16px' }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{ minHeight: 46, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="meta" style={{ width: 92, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: v ? 'var(--ink)' : 'var(--ink-soft)' }}>{v ?? '—'}</span>
              </div>
            ))}
            {a.note && (
              <div style={{ padding: '12px 0', fontSize: 14, lineHeight: 1.45 }}>{a.note}</div>
            )}
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 className="title-2" style={{ fontSize: 16 }}>Documents</h2>
            {docs.length === 0 && <p className="meta" style={{ margin: 0 }}>Aucun document pour l’instant.</p>}
            {docs.length > 0 && (
              <div className="card card--list" style={{ padding: '0 14px' }}>
                {docs.map((d) => (
                  <div key={d.id} style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="chip" style={{ flexShrink: 0 }}>{DOC_LABEL[d.type]}</span>
                    <button className="row-btn" style={{ minHeight: 56, flexGrow: 1, minWidth: 0 }} onClick={() => openDoc(d)}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 600 }}>{d.nom}</span>
                    </button>
                    <button className="icon-btn" aria-label={`Supprimer ${d.nom}`} onClick={() => removeDoc(d)} style={{ fontSize: 20 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="seg" role="radiogroup" aria-label="Type de document">
              {(['facture', 'notice', 'photo'] as const).map((t) => (
                <button key={t} aria-pressed={kind === t} onClick={() => setKind(t)}>{DOC_LABEL[t]}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn-gold" disabled={!!busy} onClick={() => photo.current?.click()}>Prendre en photo</button>
              <button className="btn-secondary" disabled={!!busy} onClick={() => file.current?.click()}>Joindre un fichier</button>
            </div>
            <input ref={photo} type="file" accept="image/*" capture="environment" hidden onChange={(e) => upload(e.target.files)} />
            <input ref={file} type="file" accept="image/*,application/pdf" multiple hidden onChange={(e) => upload(e.target.files)} />
            {busy && <p className="meta" style={{ margin: 0 }} role="status">{busy}</p>}
            <p className="meta" style={{ margin: 0, fontSize: 12 }}>Photos et PDF, 15 Mo au plus. Seul votre foyer y a accès.</p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 className="title-2" style={{ fontSize: 16 }}>Notice en ligne</h2>
            {a.noticeUrl ? (
              <a className="btn-secondary" href={a.noticeUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Ouvrir la notice</a>
            ) : (
              <a className="btn-secondary" href={search} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Chercher la notice</a>
            )}
            <p className="meta" style={{ margin: 0, fontSize: 12, lineHeight: 1.4 }}>
              Trouvée ? Copiez son adresse dans « Modifier », ou enregistrez le PDF et joignez-le ici.
            </p>
          </section>

          <button className="btn-link" style={{ color: '#B23A1E' }} onClick={() => setConfirm(true)}>Supprimer cet appareil</button>
        </div>
      </div>
      {confirm && (
        <Sheet title={`Supprimer « ${a.nom} » ?`} onClose={() => setConfirm(false)}>
          <p className="meta" style={{ margin: 0 }}>L’appareil et ses {docs.length} document{docs.length > 1 ? 's' : ''} seront supprimés.</p>
          <button className="btn-gold" style={{ background: '#B23A1E', color: '#fff' }} onClick={() => { setConfirm(false); onDelete(); }}>Supprimer</button>
          <button className="btn-link" onClick={() => setConfirm(false)}>Annuler</button>
        </Sheet>
      )}
      {editor}
    </div>
  );
}

function AppareilEditor({ value, onSave, onClose }: { value: Appareil | Omit<Appareil, 'id'>; onSave: (a: Appareil | Omit<Appareil, 'id'>) => void; onClose: () => void }) {
  const [v, setV] = useState(value);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Appareil>(k: K, x: Appareil[K]) => setV((o) => ({ ...o, [k]: x }));
  const text = (k: 'marque' | 'modele' | 'vendeur' | 'noticeUrl' | 'note') => ({
    value: v[k] ?? '',
    onChange: (e: { target: { value: string } }) => set(k, e.target.value || null),
  });
  return (
    <Sheet title={'id' in value ? 'Modifier l’appareil' : 'Nouvel appareil'} onClose={onClose}>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!v.nom.trim()) return;
          setSaving(true);
          await onSave({ ...v, nom: v.nom.trim() });
          setSaving(false);
        }}
      >
        <label className="field">
          <span className="field__label">Appareil</span>
          <input className="input" required maxLength={80} value={v.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Lave-linge, télévision du salon…" />
        </label>
        <label className="field">
          <span className="field__label">Catégorie</span>
          <select className="input" value={v.categorie} onChange={(e) => set('categorie', e.target.value as CategorieAppareil)}>
            {CATEGORIES_APPAREILS.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="field">
            <span className="field__label">Marque</span>
            <input className="input" maxLength={60} {...text('marque')} />
          </label>
          <label className="field">
            <span className="field__label">Modèle</span>
            <input className="input" maxLength={80} {...text('modele')} placeholder="Sur l’étiquette" />
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="field">
            <span className="field__label">Date d’achat</span>
            <input className="input" type="date" max={toISODate(new Date())} value={v.dateAchat ?? ''} onChange={(e) => set('dateAchat', e.target.value || null)} />
          </label>
          <label className="field">
            <span className="field__label">Garantie</span>
            <select className="input" value={v.garantieMois ?? 0} onChange={(e) => set('garantieMois', Number(e.target.value) || null)}>
              {[0, 6, 12, 24, 36, 48, 60, 84, 120].map((m) => (
                <option key={m} value={m}>{m === 0 ? 'Inconnue' : m % 12 === 0 ? `${m / 12} an${m > 12 ? 's' : ''}` : `${m} mois`}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="field">
            <span className="field__label">Prix (€)</span>
            <input className="input num" inputMode="decimal" value={v.prix ?? ''} onChange={(e) => set('prix', e.target.value === '' ? null : Math.max(0, Number(e.target.value.replace(',', '.')) || 0))} />
          </label>
          <label className="field">
            <span className="field__label">Vendeur</span>
            <input className="input" maxLength={80} {...text('vendeur')} />
          </label>
        </div>
        <label className="field">
          <span className="field__label">Adresse de la notice en ligne, facultatif</span>
          <input className="input" type="url" maxLength={500} {...text('noticeUrl')} placeholder="https://…" />
        </label>
        <label className="field">
          <span className="field__label">Note (n° de série, contrat d’entretien…)</span>
          <textarea className="input" maxLength={500} rows={3} {...text('note')} style={{ height: 'auto', paddingTop: 10 }} />
        </label>
        <button className="btn-gold" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        <button type="button" className="btn-link" onClick={onClose}>Annuler</button>
      </form>
    </Sheet>
  );
}
