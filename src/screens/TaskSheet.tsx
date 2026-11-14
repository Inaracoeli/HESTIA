import { useState } from 'react';
import { IconCheck, IconChevronLeft } from '../components/Icons';
import { dueDate, formatMinutes } from '../data/engine';
import { DOMAIN_LABEL, type Level, type Task } from '../data/types';

const LEVEL_LABEL: Record<Level, string> = { debutant: 'débutant', intermediaire: 'intermédiaire', expert: 'expert' };
const DAY = 24 * 60 * 60 * 1000;

function rhythm(days: number): string {
  if (days < 14) return `${days} j`;
  if (days < 28) return `${Math.round(days / 7)} sem.`;
  if (days < 360) return `${Math.round(days / 30)} mois`;
  const years = Math.round(days / 365);
  return years > 1 ? `${years} ans` : '1 an';
}

type Props = { task: Task; level: Level; today: Date; onBack: () => void; onDone: () => void };

export function TaskSheet({ task, level, today, onBack, onDone }: Props) {
  const steps = task.steps[level];
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  const count = checked.filter(Boolean).length;
  const days = Math.round((dueDate(task).getTime() - today.getTime()) / DAY);
  const dueText = days > 1 ? `Échéance dans ${days} jours` : days >= 0 ? 'À faire maintenant' : `En retard de ${-days} jours`;

  const toggle = (i: number) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="screen">
      <header className={`header header--${task.domain}`} style={{ gap: 18 }}>
        <div className="header__row">
          <button className="icon-btn" aria-label="Retour" onClick={onBack}>
            <IconChevronLeft size={20} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}>{DOMAIN_LABEL[task.domain]}</span>
          <span style={{ width: 44 }} />
        </div>
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
          ].map(([value, label], i) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderRight: i < 3 ? '1px solid var(--divider)' : 'none', padding: '0 4px', textAlign: 'center' }}>
              <span className="num" style={{ fontSize: 15, fontWeight: 700 }}>{value}</span>
              <span className="meta" style={{ fontSize: 11 }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span role="img" aria-label={`Difficulté ${task.difficulty} sur 4`} style={{ display: 'flex', gap: 3, height: 20, alignItems: 'center' }}>
              {[1, 2, 3, 4].map((n) => (
                <span key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: n <= task.difficulty ? `var(--${task.domain})` : 'var(--divider)' }} />
              ))}
            </span>
            <span className="meta" style={{ fontSize: 11 }}>Difficulté</span>
          </div>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 className="title-2">Étapes</h2>
            <span className="num" style={{ fontSize: 13, fontWeight: 600, color: `var(--${task.domain})` }}>
              {count} sur {steps.length}
            </span>
          </div>
          <div className="card card--list" style={{ padding: '4px 16px 4px 6px' }}>
            {steps.map((label, i) => (
              <div key={label} className={`step${checked[i] ? ' step--done' : ''}`}>
                <button className="step__check" role="checkbox" aria-checked={checked[i]} aria-label={label} onClick={() => toggle(i)}>
                  <span
                    className="step__circle"
                    style={checked[i] ? { background: `var(--${task.domain})`, borderColor: `var(--${task.domain})`, color: '#FFFDF7' } : undefined}
                  >
                    {checked[i] && <IconCheck size={14} />}
                  </span>
                </button>
                <span className="step__label">{label}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--link)' }}>Détail adapté à votre niveau : {LEVEL_LABEL[level]}</span>
        </section>

        {task.tools.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 className="title-2">Il vous faut</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {task.tools.map((tool) => (
                <span key={tool} className="card" style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>{tool}</span>
              ))}
            </div>
          </section>
        )}

        <div style={{ display: 'flex', gap: 10, padding: '4px 0 12px 0' }}>
          <button className="btn-secondary" onClick={onBack}>Reporter</button>
          <button className="btn-primary" style={{ flexGrow: 1, background: `var(--${task.domain})` }} onClick={onDone}>
            C'est fait
          </button>
        </div>
      </div>
    </div>
  );
}
