import { useState } from 'react';
import { Wordmark } from '../components/Brand';
import { IconChevronRight, IconPlus } from '../components/Icons';
import { Ring } from '../components/Ring';
import { formatMinutes, nextExtraTask, planWeeks, urgency, dueDate } from '../data/engine';
import { DOMAIN_COLOR, DOMAIN_LABEL, type Task } from '../data/types';

const DATE_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const SHORT_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

type Props = {
  tasks: Task[];
  today: Date;
  capacity: number;
  done: Set<string>;
  onOpen: (t: Task) => void;
};

export function Today({ tasks, today, capacity, done, onOpen }: Props) {
  const [week] = planWeeks(tasks, today, [capacity]);
  const [extra, setExtra] = useState<Task[]>([]);
  const list = [...week.tasks, ...extra];
  const listed = new Set(list.map((t) => t.id));
  const minutes = list.reduce((s, t) => s + t.minutes, 0);
  const doneCount = list.filter((t) => done.has(t.id)).length;

  const upcoming = tasks
    .filter((t) => t.active && !listed.has(t.id))
    .sort((a, b) => dueDate(a).getTime() - dueDate(b).getTime())
    .slice(0, 3);

  const addOne = () => {
    const next = nextExtraTask(tasks, listed, today);
    if (next) setExtra((e) => [...e, next]);
  };

  return (
    <div className="screen">
      <header className="header">
        <div className="header__row" style={{ alignItems: 'flex-end' }}>
          <Wordmark size={30} />
          <span className="num" style={{ fontSize: 13, fontWeight: 700, paddingBottom: 4 }}>
            {DATE_FMT.format(today)}
          </span>
        </div>
        <div className="separator" aria-hidden="true" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 className="title-1 title-home">
            {list.length} {list.length > 1 ? 'tâches' : 'tâche'} cette semaine
          </h1>
          <span className="header__sub num" style={{ fontWeight: 500 }}>
            Environ {formatMinutes(minutes)} · {doneCount} sur {list.length} {list.length > 1 ? 'faites' : 'faite'}
          </span>
        </div>
      </header>

      <div className="content">
        <div className="card card--raised card--list" style={{ padding: '0 16px' }}>
          {list.length === 0 && <p className="meta" style={{ padding: '20px 0' }}>Rien à faire cette semaine. Profitez-en.</p>}
          {list.map((t) => (
            <button key={t.id} className="task-row" onClick={() => onOpen(t)} style={{ opacity: done.has(t.id) ? 0.5 : 1 }}>
              <Ring progress={urgency(t, today)} color={DOMAIN_COLOR[t.domain]} />
              <span className="task-row__text">
                <span className="task-row__title" style={{ textDecoration: done.has(t.id) ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
                <span className="meta num">
                  {DOMAIN_LABEL[t.domain]} · {formatMinutes(t.minutes)}
                </span>
              </span>
              {t.importance === 1 ? <span className="chip">Essentiel</span> : <IconChevronRight size={18} />}
            </button>
          ))}
        </div>

        <button className="btn-outline" onClick={addOne}>
          <IconPlus size={18} />
          Une tâche de plus
        </button>

        {upcoming.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <h2 className="title-2">Bientôt</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {upcoming.map((t) => (
                <button key={t.id} className="card" onClick={() => onOpen(t)} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', color: 'var(--ink)' }}>
                  <span className="dot" style={{ background: DOMAIN_COLOR[t.domain] }} />
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{t.title}</span>
                  <span className="meta num">{SHORT_FMT.format(dueDate(t))}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="card" style={{ background: 'var(--chip-bg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--chip-ink)' }}>Conseil du jour</span>
          <span style={{ fontSize: 14, lineHeight: 1.4 }}>
            Après la pluie, secouez les tapis de la voiture et rangez le parapluie dans un sac : moins de buée demain matin.
          </span>
        </div>
      </div>
    </div>
  );
}
