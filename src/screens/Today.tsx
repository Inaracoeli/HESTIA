import { useState } from 'react';
import { Wordmark } from '../components/Brand';
import { IconCheck, IconChevronRight, IconPlus } from '../components/Icons';
import { Pinned } from '../components/Pinned';
import { Ring } from '../components/Ring';
import { dueDate, formatMinutes, nextExtraTask, planWeeks, urgency, weekStart } from '../data/engine';
import { DOMAIN_COLOR, DOMAIN_LABEL, toISODate, type Task } from '../data/types';

const DATE_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const SHORT_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const WEEKDAY_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });

type Props = { tasks: Task[]; today: Date; capacity: number; onOpen: (t: Task) => void };

export function Today({ tasks, today, capacity, onOpen }: Props) {
  const monday = toISODate(weekStart(today));
  const todayISO = toISODate(today);
  // Faites cette semaine : elles restent affichées, cochées.
  const doneThisWeek = tasks.filter((t) => t.active && t.lastDone >= monday && t.lastDone <= todayISO);
  const doneIds = new Set(doneThisWeek.map((t) => t.id));
  const [week] = planWeeks(tasks.filter((t) => !doneIds.has(t.id)), today, [capacity]);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const planned = new Set(week.tasks.map((t) => t.id));
  const extra = extraIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => !!t && !doneIds.has(t.id) && !planned.has(t.id));
  const todo = [...week.tasks, ...extra];
  const list = [...todo, ...doneThisWeek];
  const listed = new Set(list.map((t) => t.id));
  const minutes = list.reduce((s, t) => s + t.minutes, 0);

  const upcoming = tasks
    .filter((t) => t.active && !listed.has(t.id))
    .sort((a, b) => dueDate(a).getTime() - dueDate(b).getTime())
    .slice(0, 3);

  const addOne = () => {
    const next = nextExtraTask(tasks, listed, today);
    if (next) setExtraIds((e) => [...e, next.id]);
  };

  return (
    <div className="screen">
      <Pinned title={<Wordmark size={18} />} offset={90} />
      <header className="header">
        <div className="header__row" style={{ alignItems: 'flex-end' }}>
          <Wordmark size={30} />
          <span className="num" style={{ fontSize: 13, fontWeight: 700, paddingBottom: 4 }}>{DATE_FMT.format(today)}</span>
        </div>
        <div className="separator" aria-hidden="true" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 className="title-1 title-home">
            {todo.length === 0 ? 'Semaine bouclée' : `${todo.length} ${todo.length > 1 ? 'tâches' : 'tâche'} cette semaine`}
          </h1>
          <span className="header__sub num" style={{ fontWeight: 500 }}>
            Environ {formatMinutes(minutes)} · {doneThisWeek.length} sur {list.length} {list.length > 1 ? 'faites' : 'faite'}
          </span>
        </div>
      </header>

      <div className="content">
        <div className="card card--raised card--list" style={{ padding: '0 16px' }}>
          {list.length === 0 && <p className="meta" style={{ padding: '20px 0', margin: 0 }}>Rien à faire cette semaine. Profitez-en.</p>}
          {list.map((t) => {
            const done = doneIds.has(t.id);
            return (
              <button key={t.id} className="task-row" onClick={() => onOpen(t)} style={{ opacity: done ? 0.55 : 1 }}>
                {done ? (
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: DOMAIN_COLOR[t.domain], color: '#FFFDF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconCheck size={18} />
                  </span>
                ) : (
                  <Ring progress={urgency(t, today)} color={DOMAIN_COLOR[t.domain]} />
                )}
                <span className="task-row__text">
                  <span className="task-row__title" style={{ textDecoration: done ? 'line-through' : 'none' }}>{t.title}</span>
                  <span className="meta num">
                    {DOMAIN_LABEL[t.domain]} · {formatMinutes(t.minutes)}
                    {t.plannedDay && !done ? ` · prévu ${WEEKDAY_FMT.format(new Date(t.plannedDay + 'T12:00:00'))}` : ''}
                  </span>
                </span>
                {t.importance === 1 && !done ? <span className="chip">Essentiel</span> : <IconChevronRight size={18} />}
              </button>
            );
          })}
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
