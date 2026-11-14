import { IconCalendar, IconCalendarPlus } from '../components/Icons';
import { Ring } from '../components/Ring';
import { formatMinutes, planWeeks, urgency } from '../data/engine';
import { DOMAIN_COLOR, type Task } from '../data/types';

const RANGE_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
const WEEK_TITLES = ['Cette semaine', 'Semaine prochaine', 'Dans deux semaines'];
const DAY = 24 * 60 * 60 * 1000;

type Props = { tasks: Task[]; today: Date; capacity: number; onOpen: (t: Task) => void };

export function Planning({ tasks, today, capacity, onOpen }: Props) {
  const weeks = planWeeks(tasks, today, [capacity, capacity, capacity]);
  const placed = new Set(weeks.flatMap((w) => w.tasks.map((t) => t.id)));
  const later = tasks.filter((t) => t.active && !placed.has(t.id));

  return (
    <div className="screen">
      <header className="header">
        <div className="header__row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="title-icon" aria-hidden="true">
              <IconCalendar size={22} className="anim-bounce" />
            </span>
            <h1 className="title-1">Planning</h1>
          </div>
          <button className="pill-btn" aria-label="Ouvrir l'échéancier de l'année" disabled title="Bientôt">
            <IconCalendar size={18} />
            Échéancier
          </button>
        </div>
        <span className="header__sub">Semaine par semaine. Le jour, c'est vous qui voyez.</span>
      </header>

      <div className="content">
        {weeks.map((w, i) => {
          const end = new Date(w.start.getTime() + 6 * DAY);
          const fill = Math.min(100, Math.round((w.minutes / Math.max(1, w.capacity)) * 100));
          return (
            <section key={i} className="card card--raised" style={{ padding: '14px 16px 4px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <h2 className="title-2" style={{ fontSize: 18 }}>{WEEK_TITLES[i]}</h2>
                  <span className="meta num">{RANGE_FMT.format(w.start)} – {RANGE_FMT.format(end)}</span>
                </div>
                <span className="chip num" style={{ fontSize: 13, padding: '8px 12px' }}>
                  {formatMinutes(w.minutes)} sur {formatMinutes(w.capacity)}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--divider)', margin: '10px 0 6px 0' }}>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--gold)', width: `${fill}%` }} />
              </div>
              {w.tasks.length === 0 && <p className="meta" style={{ margin: '10px 0 14px 0' }}>Semaine libre.</p>}
              {w.tasks.map((t) => (
                <div key={t.id} style={{ minHeight: 64, display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--divider)' }}>
                  <Ring progress={urgency(t, today)} color={DOMAIN_COLOR[t.domain]} size={30} />
                  <button className="task-row" style={{ minHeight: 0, padding: '10px 0' }} onClick={() => onOpen(t)}>
                    <span className="task-row__text">
                      <span className="task-row__title" style={{ fontSize: 15 }}>{t.title}</span>
                      <span className="meta num" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {formatMinutes(t.minutes)} · {t.periodLabel.toLowerCase()}
                        {t.importance === 1 && <span className="chip">Essentiel</span>}
                      </span>
                    </span>
                  </button>
                  <button
                    aria-label={`Choisir un jour pour ${t.title}`}
                    style={{ flexShrink: 0, width: 44, height: 44, border: '1.5px dashed #B9AC9C', borderRadius: 12, background: 'transparent', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <IconCalendarPlus size={20} />
                  </button>
                </div>
              ))}
            </section>
          );
        })}

        {later.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 className="title-2" style={{ marginTop: 4 }}>Plus tard</h2>
            <div className="card card--list">
              {later.map((t) => (
                <button key={t.id} className="task-row" style={{ minHeight: 60 }} onClick={() => onOpen(t)}>
                  <span className="dot" style={{ background: DOMAIN_COLOR[t.domain] }} />
                  <span className="task-row__text">
                    <span className="task-row__title" style={{ fontSize: 15 }}>{t.title}</span>
                    <span className="meta">{t.pro ? 'À faire faire' : t.periodLabel}</span>
                  </span>
                  {t.importance === 1 && <span className="chip">Essentiel</span>}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
