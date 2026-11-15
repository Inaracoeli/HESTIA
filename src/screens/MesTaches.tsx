import { useRef, useState, type FormEvent, type ReactNode, type TouchEvent } from 'react';
import { IconChevronLeft, IconPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { useSwipeBack } from '../components/useSwipeBack';
import { formatMinutes } from '../data/engine';
import { DOMAIN_COLOR, DOMAIN_LABEL, resolveSteps, type Domain, type Task } from '../data/types';
import type { TaskEdit } from '../lib/api';

const DOMAINS: Domain[] = ['maison', 'exterieur', 'vehicule'];
const RHYTHMS: [number, string][] = [
  [7, '1 sem.'], [14, '2 sem.'], [30, '1 mois'], [60, '2 mois'], [90, '3 mois'], [180, '6 mois'], [365, '1 an'], [730, '2 ans'],
];
const IMPORTANCE: [Task['importance'], string, string][] = [
  [1, 'Essentielle', 'Sécurité ou obligation'],
  [2, 'Importante', 'Évite des dégâts coûteux'],
  [3, 'Confort', 'Plus agréable au quotidien'],
  [4, 'Esthétique', 'Pour que ce soit beau'],
];

type Props = {
  tasks: Task[];
  onBack: () => void;
  onToggleActive: (t: Task) => void;
  onSave: (t: Task | null, edit: TaskEdit) => Promise<void>;
  onDelete: (t: Task) => Promise<void>;
};

/* ---------- Ligne glissable : glisser à gauche révèle « Régler » et « Supprimer » ---------- */
function SwipeRow({ children, onEdit, onDelete }: { children: ReactNode; onEdit: () => void; onDelete: () => void }) {
  const start = useRef<{ x: number; y: number; base: number } | null>(null);
  const horizontal = useRef(false);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const OPEN = -164;

  const handlers = {
    onTouchStart: (e: TouchEvent) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, base: dx };
      horizontal.current = false;
    },
    onTouchMove: (e: TouchEvent) => {
      if (!start.current) return;
      const mx = e.touches[0].clientX - start.current.x;
      const my = e.touches[0].clientY - start.current.y;
      if (!horizontal.current && Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my) * 1.4) {
        horizontal.current = true;
        setDragging(true);
      }
      if (horizontal.current) {
        e.stopPropagation();
        setDx(Math.min(0, Math.max(OPEN - 30, start.current.base + mx)));
      }
    },
    onTouchEnd: (e: TouchEvent) => {
      if (horizontal.current) e.stopPropagation();
      start.current = null;
      setDragging(false);
      setDx((v) => (v < OPEN / 2 ? OPEN : 0));
      horizontal.current = false;
    },
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, display: 'flex' }} aria-hidden={dx === 0}>
        <button onClick={() => { setDx(0); onEdit(); }} style={{ width: 78, border: 0, background: 'var(--divider)', color: 'var(--ink)', fontSize: 12, fontWeight: 700 }}>Régler</button>
        <button onClick={() => { setDx(0); onDelete(); }} style={{ width: 86, border: 0, background: '#9B2C1F', color: '#FFFFFF', fontSize: 12, fontWeight: 700 }}>Supprimer</button>
      </div>
      <div
        {...handlers}
        style={{ position: 'relative', background: 'var(--card)', transform: dx ? `translateX(${dx}px)` : 'none', transition: dragging ? 'none' : 'transform 0.22s ease', boxShadow: dx ? '4px 0 12px rgba(42,36,32,0.14)' : 'none' }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Formulaire de réglage / création ---------- */
function Editor({ task, onClose, onSave, onDelete }: { task: Task | null; onClose: () => void; onSave: (e: TaskEdit) => Promise<void>; onDelete?: () => Promise<void> }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [domain, setDomain] = useState<Domain>(task?.domain ?? 'maison');
  const [importance, setImportance] = useState<Task['importance']>(task?.importance ?? 3);
  const [interval, setRhythm] = useState(task?.intervalDays ?? 30);
  const [minutes, setMinutes] = useState(task?.minutes ?? 15);
  const [budget, setBudget] = useState(task?.budget ?? 0);
  const [difficulty, setDifficulty] = useState<Task['difficulty']>(task?.difficulty ?? 1);
  const [pro, setPro] = useState(task?.pro ?? false);
  const [tools, setTools] = useState((task?.tools ?? []).join(', '));
  const editableSteps = !task || task.custom;
  const [steps, setSteps] = useState(task ? resolveSteps(task, 'intermediaire', task.choices).join('\n') : '');
  const [lastDone, setLastDone] = useState<string>(task ? task.lastDone : '');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Donnez un nom à la tâche.');
    setBusy(true);
    setError('');
    try {
      await onSave({
        title, domain, importance, intervalDays: interval, minutes, budget, difficulty, pro,
        tools: tools.split(',').map((t) => t.trim()).filter(Boolean),
        steps: editableSteps ? steps.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
        lastDone: lastDone || null,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const chip = (on: boolean) => ({
    minHeight: 44, padding: '0 12px', borderRadius: 12, fontSize: 14, fontWeight: on ? 700 : 500,
    border: on ? '2px solid var(--gold-2)' : '1px solid var(--line)', background: on ? 'var(--chip-bg)' : 'var(--card)', color: 'var(--ink)',
  });

  return (
    <div className="sheet-backdrop" onClick={() => !busy && onClose()}>
      <form className="sheet" role="dialog" aria-label={task ? `Régler ${task.title}` : 'Nouvelle tâche'} onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ maxHeight: '88dvh', overflowY: 'auto' }}>
        <span className="sheet__grip" aria-hidden="true" />
        <h2 className="title-2">{task ? 'Régler la tâche' : 'Nouvelle tâche'}</h2>

        <label className="field">
          <span className="field__label">Nom</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. : détartrer la bouilloire" />
        </label>

        <div className="field">
          <span className="field__label">Domaine</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DOMAINS.map((d) => (
              <button type="button" key={d} aria-pressed={domain === d} onClick={() => setDomain(d)} style={{ ...chip(domain === d), display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className="dot" style={{ width: 9, height: 9, background: DOMAIN_COLOR[d] }} />{DOMAIN_LABEL[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">Importance</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {IMPORTANCE.map(([v, label, hint]) => (
              <button type="button" key={v} aria-pressed={importance === v} onClick={() => setImportance(v)} style={{ ...chip(importance === v), padding: '8px 12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-soft)' }}>{hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">Rythme</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RHYTHMS.map(([d, label]) => (
              <button type="button" key={d} aria-pressed={interval === d} onClick={() => setRhythm(d)} style={chip(interval === d)}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <label className="field">
            <span className="field__label">Durée (minutes)</span>
            <input className="input" type="number" inputMode="numeric" min={0} value={minutes} onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="field">
            <span className="field__label">Budget (€)</span>
            <input className="input" type="number" inputMode="decimal" min={0} value={budget} onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))} />
          </label>
        </div>

        <div className="field">
          <span className="field__label">Difficulté</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
            {([1, 2, 3, 4] as const).map((n) => (
              <button type="button" key={n} aria-label={`Difficulté ${n} sur 4`} aria-pressed={difficulty === n} onClick={() => setDifficulty(n)} style={{ height: 44, border: 0, padding: 0, background: 'transparent', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '100%', height: 12, borderRadius: 6, background: n <= difficulty ? 'var(--gold-2)' : 'var(--divider)' }} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ minHeight: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flexGrow: 1, fontSize: 15, fontWeight: 600 }}>À faire faire par un professionnel</span>
          <button type="button" className="switch" role="switch" aria-checked={pro} aria-label="À faire faire par un professionnel" onClick={() => setPro(!pro)}>
            <span className="switch__track"><span className="switch__knob" /></span>
          </button>
        </div>

        <label className="field">
          <span className="field__label">Matériel (séparé par des virgules)</span>
          <input className="input" value={tools} onChange={(e) => setTools(e.target.value)} placeholder="Ex. : vinaigre blanc, éponge" />
        </label>

        {editableSteps ? (
          <label className="field">
            <span className="field__label">Étapes (une par ligne)</span>
            <textarea className="input" value={steps} onChange={(e) => setSteps(e.target.value)} rows={5} style={{ height: 'auto', padding: 12, lineHeight: 1.4, resize: 'vertical' }} />
          </label>
        ) : (
          <p className="meta" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>Les étapes de cette tâche viennent du guide Hestia et s'adaptent à votre niveau : elles ne se modifient pas ici.</p>
        )}

        <label className="field">
          <span className="field__label">Dernière fois (laisser vide si jamais ou inconnu)</span>
          <input className="input" type="date" value={lastDone} onChange={(e) => setLastDone(e.target.value)} />
        </label>

        {error && <div className="notice notice--error" role="alert">{error}</div>}

        <button className="btn-gold" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : task ? 'Enregistrer' : 'Ajouter la tâche'}</button>
        {task && onDelete && (
          confirmDelete ? (
            <div className="notice notice--error" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span>Supprimer « {task.title} » et son historique ? Pour l'arrêter sans la perdre, mettez-la plutôt en pause.</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-secondary" style={{ flexGrow: 1, height: 44 }} onClick={() => setConfirmDelete(false)}>Annuler</button>
                <button type="button" style={{ flexGrow: 1, height: 44, border: 0, borderRadius: 14, background: '#9B2C1F', color: '#FFFFFF', fontWeight: 700 }} disabled={busy}
                  onClick={async () => { setBusy(true); try { await onDelete(); onClose(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }}>
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn-link" style={{ color: '#9B2C1F' }} onClick={() => setConfirmDelete(true)}>Supprimer la tâche</button>
          )
        )}
        <button type="button" className="btn-link" onClick={onClose}>Fermer</button>
      </form>
    </div>
  );
}

/* ---------- Écran ---------- */
export function MesTaches({ tasks, onBack, onToggleActive, onSave, onDelete }: Props) {
  const swipe = useSwipeBack(onBack);
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const active = tasks.filter((t) => t.active).length;

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar>
        <button className="icon-btn" aria-label="Retour au foyer" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <h1 className="title-1" style={{ fontSize: 22 }}>Mes tâches</h1>
        <span style={{ width: 44 }} />
      </Topbar>
      <div className="screen">
        <header className="header" style={{ paddingBottom: 62 }}>
          <span className="header__sub num">{active} actives · {tasks.length - active} en pause</span>
        </header>

        <div className="content" style={{ gap: 18 }}>
          <button
            onClick={() => setEditing('new')}
            style={{ height: 56, border: 0, borderRadius: 18, background: 'var(--ink)', color: 'var(--bg)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: 'var(--shadow)' }}
          >
            <span style={{ color: 'var(--gold-1)', display: 'flex' }}><IconPlus size={20} /></span>
            Nouvelle tâche
          </button>

          {DOMAINS.map((d) => {
            const list = tasks.filter((t) => t.domain === d);
            if (list.length === 0) return null;
            return (
              <section key={d} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="dot" style={{ width: 12, height: 12, background: DOMAIN_COLOR[d] }} />
                  <h2 className="title-2">{DOMAIN_LABEL[d]}</h2>
                  <span className="meta num" style={{ flexGrow: 1, textAlign: 'right', fontSize: 13 }}>
                    {list.filter((t) => t.active).length} sur {list.length} actives
                  </span>
                </div>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {list.map((t, i) => (
                    <div key={t.id} style={{ borderTop: i ? '1px solid var(--divider)' : 'none' }}>
                      <SwipeRow onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)}>
                        <div style={{ minHeight: 64, padding: '0 12px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button onClick={() => setEditing(t)} style={{ flexGrow: 1, minWidth: 0, border: 0, background: 'none', padding: '10px 0', textAlign: 'left', color: 'var(--ink)', opacity: t.active ? 1 : 0.55, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>{t.title}</span>
                            <span className="meta num">{t.active ? `${t.periodLabel} · ${formatMinutes(t.minutes)}` : 'En pause'}</span>
                          </button>
                          <button className="switch" role="switch" aria-checked={t.active} aria-label={`${t.title} : ${t.active ? 'active' : 'en pause'}`} onClick={() => onToggleActive(t)}>
                            <span className="switch__track"><span className="switch__knob" /></span>
                          </button>
                        </div>
                      </SwipeRow>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          <p className="meta" style={{ margin: 0, textAlign: 'center', fontSize: 13 }}>Glissez une tâche vers la gauche pour la régler ou la supprimer.</p>
        </div>
      </div>

      {editing && (
        <Editor
          task={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(e) => onSave(editing === 'new' ? null : editing, e)}
          onDelete={editing === 'new' ? undefined : () => onDelete(editing)}
        />
      )}

      {deleting && (
        <div className="sheet-backdrop" onClick={() => setDeleting(null)}>
          <div className="sheet" role="dialog" aria-label="Supprimer la tâche" onClick={(e) => e.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <h2 className="title-2">Supprimer « {deleting.title} » ?</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>Son historique sera effacé aussi. Pour l'arrêter sans la perdre, mettez-la plutôt en pause.</p>
            <button
              style={{ height: 54, border: 0, borderRadius: 18, background: '#9B2C1F', color: '#FFFFFF', fontSize: 16, fontWeight: 700 }}
              onClick={async () => { await onDelete(deleting); setDeleting(null); }}
            >
              Supprimer
            </button>
            <button className="btn-secondary" onClick={() => setDeleting(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
