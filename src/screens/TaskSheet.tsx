import { useState } from 'react';
import { useSwipeBack } from '../components/useSwipeBack';
import { IconCalendar, IconCheck, IconChevronLeft, IconStar } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { Comprendre, Liens, PlusLoin } from '../components/GuideBlocks';
import { useGuide } from '../data/useGuide';
import { dueDate, formatMinutes } from '../data/engine';
import { DOMAIN_LABEL, resolveSteps, toISODate, type Level, type Task } from '../data/types';
import type { Member } from '../lib/api';
import { shortName } from './Today';

const LEVEL_LABEL: Record<Level, string> = { debutant: 'débutant', intermediaire: 'intermédiaire', expert: 'expert' };
const DAY = 24 * 60 * 60 * 1000;

function rhythm(days: number): string {
  if (days < 14) return `${days} j`;
  if (days < 28) return `${Math.round(days / 7)} sem.`;
  if (days < 360) return `${Math.round(days / 30)} mois`;
  const years = Math.round(days / 365);
  return years > 1 ? `${years} ans` : '1 an';
}

type Props = {
  task: Task;
  level: Level;
  today: Date;
  missing: string[];
  onToggleMissing: (tool: string) => void;
  onSaveChoices: (choices: Record<string, string>) => void;
  onToggleFollow: () => void;
  /** Déjà validée cette semaine : on propose d'annuler */
  doneThisWeek: boolean;
  onUndo: () => Promise<void>;
  onBack: () => void;
  onDone: (cost: number | null, note: string) => Promise<void> | void;
  /** Programme la tâche à une date (elle quitte les semaines d'avant), ou retire la date */
  onPostpone: (day: string | null) => Promise<void>;
  /** Membres du foyer, pour choisir qui s'occupe de la tâche */
  members: Member[];
  onAssign: (userId: string | null) => void;
};

const LONG_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Même jour, N mois plus tard (fin de mois respectée). */
function addMonths(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
  x.setDate(Math.min(d.getDate(), new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
  return x;
}

export function TaskSheet({ task, level, today, missing, onToggleMissing, onSaveChoices, onToggleFollow, doneThisWeek, onUndo, onBack, onDone, onPostpone, members, onAssign }: Props) {
  const automatic = task.importance <= 2;
  const followed = automatic || task.inSchedule;
  const [choices, setChoices] = useState<Record<string, string>>(task.choices);
  const steps = resolveSteps(task, level, choices);
  const guide = useGuide(task.templateId);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const swipe = useSwipeBack(onBack);
  const count = steps.filter((s) => checked[s]).length;
  const unanswered = task.questions.filter((q) => !choices[q.id]);
  const days = Math.round((dueDate(task, today).getTime() - today.getTime()) / DAY);
  const dueText = days > 1 ? `Échéance dans ${days} jours` : days >= 0 ? 'À faire maintenant' : 'À faire dès que possible';
  const color = `var(--${task.domain})`;

  const choose = (q: string, v: string) => {
    const next = { ...choices, [q]: v };
    setChoices(next);
    onSaveChoices(next);
  };

  const [closing, setClosing] = useState(false);
  const [later, setLater] = useState(false);
  const [otherDate, setOtherDate] = useState('');
  /** Cocher la dernière étape vaut « C'est fait » : on passe directement à l'enregistrement. */
  const toggleStep = (label: string, on: boolean) => {
    const next = { ...checked, [label]: on };
    setChecked(next);
    if (on && steps.length > 0 && steps.every((x) => next[x])) setClosing(true);
  };
  const postpone = async (day: string | null) => {
    setSaving(true);
    try {
      await onPostpone(day);
    } finally {
      setSaving(false);
    }
  };
  const [cost, setCost] = useState(task.budget > 0 ? String(task.budget) : '');
  const [note, setNote] = useState('');
  const finish = async () => {
    setSaving(true);
    try {
      await onDone(cost.trim() === '' ? null : Math.max(0, Number(cost.replace(',', '.')) || 0), note);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="swipe-sheet" style={swipe.style} {...swipe.handlers}>
      <Topbar tone={task.domain}>
        <button className="icon-btn" aria-label="Retour" onClick={onBack}>
          <IconChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}>{DOMAIN_LABEL[task.domain]}</span>
        <button
          className="icon-btn star-btn"
          aria-pressed={followed}
          aria-label={automatic ? 'Suivie d’office dans l’échéancier' : followed ? 'Ne plus suivre dans l’échéancier' : 'Suivre dans l’échéancier'}
          title={automatic ? 'Tâche importante : toujours dans l’échéancier' : undefined}
          onClick={automatic ? undefined : onToggleFollow}
          style={{ opacity: automatic ? 0.8 : 1 }}
        >
          <IconStar size={22} filled={followed} />
        </button>
      </Topbar>
      <div className="screen" style={{ paddingBottom: 24 }}>
        <header className={`header header--${task.domain}`} style={{ gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 className="title-1 title-sheet">{task.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ background: '#FFFDF7', color: '#241E19', borderRadius: 999, padding: '5px 11px', fontSize: 12, fontWeight: 700 }}>
                {task.pro ? 'À faire faire' : 'À faire soi-même'}
              </span>
              <span className="num" style={{ fontSize: 13, fontWeight: 500 }}>{dueText}</span>
            </div>
          </div>
        </header>

        <div className="content" style={{ gap: 22 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" style={{ flexShrink: 0, padding: '0 18px' }} onClick={() => setLater(true)}>Plus tard</button>
            <button className="btn-primary" style={{ flexGrow: 1, background: color }} onClick={() => setClosing(true)} disabled={saving}>
              <IconCheck size={18} /> C'est fait
            </button>
          </div>
          {task.plannedDay && task.plannedDay >= toISODate(today) && (
            <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconCalendar size={18} />
              <span style={{ flexGrow: 1 }}>Programmée le {LONG_FMT.format(new Date(task.plannedDay + 'T12:00:00'))}.</span>
            </div>
          )}
          {members.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="meta" style={{ fontSize: 13, fontWeight: 700 }}>Qui s’en occupe ?</span>
              {[{ id: null as string | null, l: 'Personne en particulier' }, ...members.map((m) => ({ id: m.userId as string | null, l: shortName(members, m.userId) ?? 'Membre' }))].map((o) => (
                <button key={o.id ?? 'x'} className="state-pill" aria-pressed={(task.assignee ?? null) === o.id} data-etat="ok" onClick={() => onAssign(o.id)}>
                  {o.l}
                </button>
              ))}
            </div>
          )}
          <div className="card card--raised" style={{ padding: '14px 6px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
            {[
              [formatMinutes(task.minutes), 'Durée'],
              [`${task.budget} €`, 'Budget'],
              [rhythm(task.intervalDays), 'Rythme'],
            ].map(([value, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderRight: '1px solid var(--divider)', padding: '0 4px', textAlign: 'center' }}>
                <span className="num" style={{ fontSize: 15, fontWeight: 700 }}>{value}</span>
                <span className="meta" style={{ fontSize: 11 }}>{label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span role="img" aria-label={`Difficulté ${task.difficulty} sur 4`} style={{ display: 'flex', gap: 3, height: 20, alignItems: 'center' }}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: n <= task.difficulty ? color : 'var(--divider)' }} />
                ))}
              </span>
              <span className="meta" style={{ fontSize: 11 }}>Difficulté</span>
            </div>
          </div>

          <Comprendre guide={guide} />

          {task.questions.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 className="title-2">Votre cas</h2>
              {unanswered.length > 0 && (
                <p className="meta" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                  Répondez une fois : les étapes s'adaptent, et la réponse est gardée pour la prochaine fois.
                </p>
              )}
              {task.questions.map((q) => (
                <div key={q.id} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{q.label}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {q.options.map((o) => {
                      const on = choices[q.id] === o.v;
                      return (
                        <button
                          key={o.v}
                          aria-pressed={on}
                          onClick={() => choose(q.id, o.v)}
                          style={{
                            minHeight: 44, padding: '8px 14px', borderRadius: 14, textAlign: 'left',
                            border: on ? `2px solid ${color}` : '1px solid var(--line)',
                            background: on ? 'var(--chip-bg)' : 'var(--card)', color: 'var(--ink)',
                            fontSize: 14, fontWeight: on ? 700 : 500,
                          }}
                        >
                          {o.l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          )}

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="title-2">Étapes</h2>
              <span className="num" style={{ fontSize: 13, fontWeight: 600, color }}>{count} sur {steps.length}</span>
            </div>
            <div className="card card--list" style={{ padding: '4px 16px 4px 6px' }}>
              {steps.map((label) => {
                const on = !!checked[label];
                return (
                  <div key={label} className={`step${on ? ' step--done' : ''}`}>
                    <button className="step__check" role="checkbox" aria-checked={on} aria-label={label} onClick={() => toggleStep(label, !on)}>
                      <span className="step__circle" style={on ? { background: color, borderColor: color, color: '#FFFDF7' } : undefined}>
                        {on && <IconCheck size={14} />}
                      </span>
                    </button>
                    <span className="step__label">{label}</span>
                  </div>
                );
              })}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--link)' }}>Détail adapté à votre niveau : {LEVEL_LABEL[level]}</span>
          </section>

          <PlusLoin guide={guide} level={level} />

          {task.tools.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 className="title-2">Il vous faut</h2>
              <p className="meta" style={{ margin: 0, fontSize: 13 }}>Indiquez ce que vous n'avez pas : Hestia propose une autre solution.</p>
              <div className="card card--list">
                {task.tools.map((tool) => {
                  const absent = missing.includes(tool);
                  const alt = task.alternatives[tool];
                  return (
                    <div key={tool} style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ flexGrow: 1, fontSize: 15, fontWeight: 600, textDecoration: absent ? 'line-through' : 'none', color: absent ? 'var(--ink-soft)' : 'var(--ink)' }}>
                          {tool}
                        </span>
                        <button
                          onClick={() => onToggleMissing(tool)}
                          aria-pressed={absent}
                          style={{
                            minHeight: 36, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                            border: absent ? 0 : '1px solid var(--line)',
                            background: absent ? 'var(--ink)' : 'transparent', color: absent ? 'var(--bg)' : 'var(--ink-soft)',
                          }}
                        >
                          {absent ? 'Je ne l’ai pas' : 'Je l’ai'}
                        </button>
                      </div>
                      {absent && (
                        <div className="notice" style={{ background: 'var(--chip-bg)', color: 'var(--ink)', padding: '10px 12px' }}>
                          {alt ?? 'Pas encore de solution de remplacement pour cet élément : il faudra l’emprunter ou l’acheter.'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <Liens guide={guide} />

          {doneThisWeek && (
            <div className="notice notice--ok" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flexGrow: 1 }}>Faite le {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(task.lastDone + 'T12:00:00'))}.</span>
              <button
                onClick={async () => { setSaving(true); try { await onUndo(); } finally { setSaving(false); } }}
                disabled={saving}
                style={{ flexShrink: 0, minHeight: 40, padding: '0 12px', border: '1px solid #2C5420', borderRadius: 12, background: 'transparent', color: '#2C5420', fontSize: 13, fontWeight: 700 }}
              >
                Annuler « C'est fait »
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, padding: '4px 0 12px 0' }}>
            <button className="btn-secondary" onClick={() => setLater(true)}>Plus tard</button>
            <button className="btn-primary" style={{ flexGrow: 1, background: color }} onClick={() => setClosing(true)} disabled={saving}>
              C'est fait
            </button>
          </div>
          <p className="meta" style={{ textAlign: 'center', margin: 0 }}>Astuce : glissez vers la droite pour fermer.</p>
        </div>
      </div>
      {later && (
        <div className="sheet-backdrop" onClick={() => !saving && setLater(false)}>
          <div className="sheet" role="dialog" aria-label="Reporter ou programmer" onClick={(e) => e.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <h2 className="title-2">Pas maintenant ?</h2>
            <p className="meta" style={{ margin: 0, fontSize: 14, lineHeight: 1.45 }}>
              Choisissez quand la refaire : elle quitte vos semaines d’ici là, et une autre tâche prend sa place.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              {([
                ['La semaine prochaine', new Date(today.getTime() + 7 * DAY)],
                ['Dans un mois', addMonths(today, 1)],
                ['Dans 3 mois', addMonths(today, 3)],
                ['Dans 6 mois', addMonths(today, 6)],
                ['Dans un an', addMonths(today, 12)],
              ] as const).map(([label, d]) => (
                <button key={label} className="choice-btn" disabled={saving} onClick={() => postpone(toISODate(d))}>
                  <span style={{ fontWeight: 700 }}>{label}</span>
                  <span className="meta num" style={{ fontSize: 12 }}>{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined }).format(d)}</span>
                </button>
              ))}
              <label className="choice-btn" style={{ position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontWeight: 700 }}>Une date précise</span>
                <span className="meta num" style={{ fontSize: 12 }}>{otherDate ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(otherDate + 'T12:00:00')) : 'Choisir…'}</span>
                <input
                  type="date"
                  aria-label="Choisir une date"
                  min={toISODate(today)}
                  value={otherDate}
                  disabled={saving}
                  onChange={(e) => setOtherDate(e.target.value)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, fontSize: 16 }}
                />
              </label>
            </div>
            {otherDate && (
              <button className="btn-gold" disabled={saving || otherDate < toISODate(today)} onClick={() => postpone(otherDate)}>
                Programmer le {LONG_FMT.format(new Date(otherDate + 'T12:00:00'))}
              </button>
            )}
            {task.plannedDay && (
              <button className="btn-secondary" disabled={saving} onClick={() => postpone(null)}>Retirer la date programmée</button>
            )}
            <button className="btn-link" onClick={() => setLater(false)} disabled={saving}>Annuler</button>
          </div>
        </div>
      )}
      {closing && (
        <div className="sheet-backdrop" onClick={() => !saving && setClosing(false)}>
          <div className="sheet" role="dialog" aria-label="Noter dans le carnet" onClick={(e) => e.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <h2 className="title-2">Bravo ! On le note au carnet ?</h2>
            <label className="field">
              <span className="field__label">Coût réel en € (facultatif)</span>
              <input className="input" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
            </label>
            <label className="field">
              <span className="field__label">Note (facultatif)</span>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. : filtre à remplacer bientôt" />
            </label>
            <button className="btn-primary" style={{ background: color }} onClick={finish} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button className="btn-link" onClick={() => setClosing(false)} disabled={saving}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
