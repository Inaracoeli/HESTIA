import { useState } from 'react';
import { IconCalendar, IconCalendarPlus } from '../components/Icons';
import { Topbar } from '../components/Pinned';
import { Ring } from '../components/Ring';
import { formatMinutes, planWeeks, urgency, weekStart } from '../data/engine';
import { DOMAIN_COLOR, toISODate, type Task } from '../data/types';

const RANGE_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
const DAY_SHORT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const DAY_LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const WEEK_TITLES = ['Cette semaine', 'Semaine prochaine', 'Dans deux semaines'];
const DAY = 24 * 60 * 60 * 1000;

type Props = {
  tasks: Task[];
  today: Date;
  capacity: number;
  onOpen: (t: Task) => void;
  onPlan: (t: Task, day: string | null) => Promise<void>;
  onSchedule: () => void;
};

export function Planning({ tasks, today, capacity, onOpen, onPlan, onSchedule }: Props) {
  const todayISO = toISODate(today);
  const monday = toISODate(weekStart(today));
  const pending = tasks.filter((t) => !(t.lastDone >= monday && t.lastDone <= todayISO));
  const weeks = planWeeks(pending, today, [capacity, capacity, capacity]);
  const placed = new Set(weeks.flatMap((w) => w.tasks.map((t) => t.id)));
  const later = pending.filter((t) => t.active && !placed.has(t.id));
  const [picking, setPicking] = useState<{ task: Task; start: Date } | null>(null);
  const [busy, setBusy] = useState(false);

  const choose = async (day: string | null) => {
    if (!picking) return;
    setBusy(true);
    try {
      await onPlan(picking.task, day);
      setPicking(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <Topbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="title-icon" aria-hidden="true">
            <IconCalendar size={22} className="anim-bounce" />
          </span>
          <h1 className="title-1">Planning</h1>
        </div>
        <button className="pill-btn" onClick={onSchedule} aria-label="Ouvrir l'échéancier de l'année">
          <IconCalendar size={18} />
          Échéancier
        </button>
      </Topbar>
      <header className="header">
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
                  {t.plannedDay ? (
                    <button
                      aria-label={`Prévu ${DAY_LONG.format(new Date(t.plannedDay + 'T12:00:00'))}, changer le jour`}
                      onClick={() => setPicking({ task: t, start: w.start })}
                      style={{ flexShrink: 0, height: 44, padding: '0 12px', border: 0, borderRadius: 12, background: 'var(--ink)', color: 'var(--bg)', fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}
                    >
                      {DAY_SHORT.format(new Date(t.plannedDay + 'T12:00:00'))}
                    </button>
                  ) : (
                    <button
                      aria-label={`Choisir un jour pour ${t.title}`}
                      onClick={() => setPicking({ task: t, start: w.start })}
                      style={{ flexShrink: 0, width: 44, height: 44, border: '1.5px dashed #B9AC9C', borderRadius: 12, background: 'transparent', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <IconCalendarPlus size={20} />
                    </button>
                  )}
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

      {picking && (
        <div className="sheet-backdrop" onClick={() => !busy && setPicking(null)}>
          <div className="sheet" role="dialog" aria-label={`Choisir un jour pour ${picking.task.title}`} onClick={(e) => e.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <h2 className="title-2">Quel jour pour « {picking.task.title} » ?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
              {Array.from({ length: 7 }, (_, k) => new Date(picking.start.getTime() + k * DAY)).map((d) => {
                const iso = toISODate(d);
                const past = iso < todayISO;
                const on = picking.task.plannedDay === iso;
                return (
                  <button
                    key={iso}
                    disabled={past || busy}
                    aria-pressed={on}
                    aria-label={DAY_LONG.format(d)}
                    onClick={() => choose(iso)}
                    style={{
                      minHeight: 64, borderRadius: 14, border: on ? 0 : '1px solid var(--line)',
                      background: on ? 'var(--gold)' : 'var(--card)', color: on ? 'var(--on-gold)' : 'var(--ink)',
                      opacity: past ? 0.35 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{DAY_SHORT.format(d).replace('.', '')}</span>
                    <span className="num" style={{ fontSize: 17, fontWeight: 700 }}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            {picking.task.plannedDay && (
              <button className="btn-secondary" disabled={busy} onClick={() => choose(null)}>Pas de jour précis</button>
            )}
            <button className="btn-link" onClick={() => setPicking(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
