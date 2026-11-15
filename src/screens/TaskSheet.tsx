import { useRef, useState, type TouchEvent } from 'react';
import { IconCheck, IconChevronLeft } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { dueDate, formatMinutes } from '../data/engine';
import { DOMAIN_LABEL, resolveSteps, type Level, type Task } from '../data/types';

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
  onBack: () => void;
  onDone: () => Promise<void> | void;
};

/** Glisser vers la droite pour fermer la fiche. */
function useSwipeBack(onBack: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef(false);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);

  return {
    style: {
      // Sans déplacement, aucune transformation : la barre épinglée reste bien fixée en haut.
      transform: leaving ? 'translateX(100%)' : dx ? `translateX(${dx}px)` : 'none',
      transition: dragging ? 'none' : 'transform 0.25s ease',
    },
    handlers: {
      onTouchStart: (e: TouchEvent) => {
        start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        horizontal.current = false;
      },
      onTouchMove: (e: TouchEvent) => {
        if (!start.current) return;
        const mx = e.touches[0].clientX - start.current.x;
        const my = e.touches[0].clientY - start.current.y;
        if (!horizontal.current && Math.abs(mx) > 12 && Math.abs(mx) > Math.abs(my) * 1.4) {
          horizontal.current = true;
          setDragging(true);
        }
        if (horizontal.current) setDx(Math.max(0, mx));
      },
      onTouchEnd: () => {
        start.current = null;
        setDragging(false);
        if (horizontal.current && dx > 90) {
          setLeaving(true);
          setTimeout(onBack, 220);
        } else setDx(0);
        horizontal.current = false;
      },
    },
  };
}

export function TaskSheet({ task, level, today, missing, onToggleMissing, onSaveChoices, onBack, onDone }: Props) {
  const [choices, setChoices] = useState<Record<string, string>>(task.choices);
  const steps = resolveSteps(task, level, choices);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const swipe = useSwipeBack(onBack);
  const count = steps.filter((s) => checked[s]).length;
  const unanswered = task.questions.filter((q) => !choices[q.id]);
  const days = Math.round((dueDate(task).getTime() - today.getTime()) / DAY);
  const dueText = days > 1 ? `Échéance dans ${days} jours` : days >= 0 ? 'À faire maintenant' : `En retard de ${-days} jours`;
  const color = `var(--${task.domain})`;

  const choose = (q: string, v: string) => {
    const next = { ...choices, [q]: v };
    setChoices(next);
    onSaveChoices(next);
  };

  const finish = async () => {
    setSaving(true);
    try {
      await onDone();
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
        <span style={{ width: 44 }} />
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
                    <button className="step__check" role="checkbox" aria-checked={on} aria-label={label} onClick={() => setChecked((c) => ({ ...c, [label]: !on }))}>
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

          <div style={{ display: 'flex', gap: 10, padding: '4px 0 12px 0' }}>
            <button className="btn-secondary" onClick={onBack}>Plus tard</button>
            <button className="btn-primary" style={{ flexGrow: 1, background: color }} onClick={finish} disabled={saving}>
              {saving ? 'Enregistrement…' : "C'est fait"}
            </button>
          </div>
          <p className="meta" style={{ textAlign: 'center', margin: 0 }}>Astuce : glissez vers la droite pour fermer.</p>
        </div>
      </div>
    </div>
  );
}
